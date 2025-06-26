use crate::config::WavesServerConfigDB;
use crate::database::types::WavesDatabaseError;
use crate::database::types::WavesPlaylistDB;
use crate::database::types::WavesTrackDB;
use crate::database::types::WavesUserDB;
use anyhow::Result;
use sqlx::mysql::MySqlPoolOptions;
use sqlx::types::Json;
use sqlx::MySql;
use sqlx::Pool;
use sqlx::QueryBuilder;
use std::collections::HashMap;

pub mod types;

const BULK_INSERT_LIMIT: usize = 100;

pub async fn get_waves_database(config: &WavesServerConfigDB) -> Result<Database> {
    // get the database connection pool
    let pool = MySqlPoolOptions::new()
        .max_connections(config.max_connections)
        .connect(&config.url)
        .await?;

    // run migrations
    sqlx::migrate!().run(&pool).await?;

    Ok(Database::new(pool))
}

type MySqlPool = Pool<MySql>;

#[derive(Clone)]
pub struct Database {
    pool: MySqlPool,
}

impl Database {
    fn new(pool: MySqlPool) -> Self {
        Database { pool }
    }

    pub async fn get_user(&self, idp: &str, idp_id: &str) -> Result<Option<WavesUserDB>> {
        let user = sqlx::query_as!(
            WavesUserDB,
            r#"
                SELECT idp, idp_id, name, email
                FROM users
                WHERE idp = ? AND idp_id = ?
            "#,
            idp,
            idp_id,
        )
        .fetch_optional(&self.pool)
        .await?;
        Ok(user)
    }

    pub async fn create_or_update_user(&self, user: &WavesUserDB) -> Result<()> {
        sqlx::query!(
            r#"
                INSERT INTO users (idp, idp_id, name, email)
                VALUES (?, ?, ?, ?) AS new
                ON DUPLICATE KEY UPDATE name = new.name, email = new.email
            "#,
            &user.idp,
            &user.idp_id,
            &user.name,
            &user.email,
        )
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    pub async fn delete_user(&self, idp: &str, idp_id: &str) -> Result<()> {
        let result = sqlx::query!(
            r#"
                DELETE FROM users
                WHERE idp = ? AND idp_id = ?
            "#,
            idp,
            idp_id,
        )
        .execute(&self.pool)
        .await?;

        if result.rows_affected() != 1 {
            return Err(WavesDatabaseError::UserNotFound(idp_id.to_owned()).into());
        }

        Ok(())
    }

    pub async fn get_tracks(&self, idp: &str, idp_id: &str) -> Result<Vec<WavesTrackDB>> {
        let tracks = sqlx::query_as!(
            WavesTrackDB,
            r#"
                SELECT *
                FROM tracks
                WHERE idp = ? AND idp_id = ?
            "#,
            idp,
            idp_id,
        )
        .fetch_all(&self.pool)
        .await?;
        Ok(tracks)
    }

    pub async fn insert_tracks(&self, tracks: Vec<WavesTrackDB>) -> Result<()> {
        self.validate_num_items(tracks.len())?;

        let mut query_builder: QueryBuilder<MySql> = QueryBuilder::new(
            // Note the trailing space; most calls to `QueryBuilder` don't automatically insert
            // spaces as that might interfere with identifiers or quoted strings where exact
            // values may matter.
            r#"INSERT INTO tracks(uid, idp, idp_id, source, title, artist, genre, duration) "#,
        );
        query_builder.push_values(tracks.into_iter(), |mut b, track| {
            // If you wanted to bind these by-reference instead of by-value,
            // you'd need an iterator that yields references that live as long as `query_builder`,
            // e.g. collect it to a `Vec` first.
            b.push_bind(track.uid)
                .push_bind(track.idp)
                .push_bind(track.idp_id)
                .push_bind(track.source)
                .push_bind(track.title)
                .push_bind(track.artist)
                .push_bind(track.genre)
                .push_bind(track.duration);
        });

        query_builder.build().execute(&self.pool).await?;

        Ok(())
    }

    pub async fn update_track(
        &self,
        idp: &str,
        idp_id: &str,
        uid: &str,
        key: &str,
        value: &str,
    ) -> Result<()> {
        let result;
        if key == "title" {
            result = sqlx::query!(
                r#"
                    UPDATE tracks
                    SET title = ?
                    WHERE idp = ? AND idp_id = ? AND uid = ?
                "#,
                value,
                idp,
                idp_id,
                uid,
            )
            .execute(&self.pool)
            .await?;
        } else if key == "artist" {
            result = sqlx::query!(
                r#"
                    UPDATE tracks
                    SET artist = ?
                    WHERE idp = ? AND idp_id = ? AND uid = ?
                "#,
                value,
                idp,
                idp_id,
                uid,
            )
            .execute(&self.pool)
            .await?;
        } else if key == "genre" {
            result = sqlx::query!(
                r#"
                    UPDATE tracks
                    SET genre = ?
                    WHERE idp = ? AND idp_id = ? AND uid = ?
                "#,
                value,
                idp,
                idp_id,
                uid,
            )
            .execute(&self.pool)
            .await?;
        } else {
            return Err(WavesDatabaseError::InvalidTrackUpdateKey(key.to_owned()).into());
        }

        if result.rows_affected() != 1 {
            return Err(WavesDatabaseError::TrackUnchanged(key.to_owned()).into());
        }

        Ok(())
    }

    pub async fn delete_tracks(
        &self,
        idp: &str,
        idp_id: &str,
        track_uids: &[String],
    ) -> Result<()> {
        self.validate_num_items(track_uids.len())?;

        let mut transaction = self.pool.begin().await?;

        // delete from playlists table
        let mut playlists_query_builder: QueryBuilder<MySql> = QueryBuilder::new(
            r#"
                    UPDATE playlists
                    SET playlists.tracks = (
                        SELECT JSON_ARRAYAGG(t.track)
                        FROM JSON_TABLE(
                            playlists.tracks,
                            '$[*]' COLUMNS (track VARCHAR(24) PATH '$')
                        ) AS t
                        WHERE t.track NOT IN (
                "#,
        );
        let mut playlists_separated = playlists_query_builder.separated(", ");
        for track_uid in track_uids.iter() {
            playlists_separated.push_bind(track_uid);
        }
        playlists_separated.push_unseparated(")) WHERE idp = ");
        playlists_separated.push_bind_unseparated(idp);
        playlists_separated.push_unseparated(" AND idp_id = ");
        playlists_separated.push_bind_unseparated(idp_id);

        playlists_query_builder
            .build()
            .execute(&mut *transaction)
            .await?;

        // delete from tracks table
        let mut tracks_query_builder: QueryBuilder<MySql> =
            QueryBuilder::new("DELETE from tracks where idp = ");
        tracks_query_builder.push_bind(idp);
        tracks_query_builder.push(" AND idp_id = ");
        tracks_query_builder.push_bind(idp_id);
        tracks_query_builder.push(" AND uid IN (");

        // One element vector is handled correctly but an empty vector
        // would cause a sql syntax error
        let mut tracks_separated = tracks_query_builder.separated(", ");
        for track_uid in track_uids.iter() {
            tracks_separated.push_bind(track_uid);
        }
        tracks_separated.push_unseparated(")");

        let result = tracks_query_builder
            .build()
            .execute(&mut *transaction)
            .await?;

        let num_tracks = u64::try_from(track_uids.len()).expect("failed converting track_uids len");
        if result.rows_affected() != num_tracks {
            return Err(WavesDatabaseError::TracksNotFound(track_uids.to_vec()).into());
        }

        transaction.commit().await?;

        Ok(())
    }

    pub async fn get_playlists(&self, idp: &str, idp_id: &str) -> Result<Vec<WavesPlaylistDB>> {
        let playlists = sqlx::query_as!(
            WavesPlaylistDB,
            r#"
                SELECT idp, idp_id, name, tracks as "tracks: Json<Vec<String>>"
                FROM playlists
                WHERE idp = ? AND idp_id = ?
            "#,
            idp,
            idp_id,
        )
        .fetch_all(&self.pool)
        .await?;
        Ok(playlists)
    }

    pub async fn create_or_update_playlist(
        &self,
        idp: &str,
        idp_id: &str,
        name: &str,
        track_uids: &[String],
    ) -> Result<()> {
        self.validate_num_items(track_uids.len())?;

        let result = sqlx::query!(
            r#"
                INSERT INTO playlists (idp, idp_id, name, tracks)
                VALUES (?, ?, ?, ?) AS new
                ON DUPLICATE KEY UPDATE playlists.tracks = JSON_MERGE_PRESERVE(playlists.tracks, new.tracks)
            "#,
            idp,
            idp_id,
            name,
            Json(track_uids),
        )
        .execute(&self.pool)
        .await?;

        if result.rows_affected() != 1 {
            return Err(WavesDatabaseError::PlaylistUnchanged(name.to_owned()).into());
        }

        Ok(())
    }

    pub async fn copy_playlist(
        &self,
        idp: &str,
        idp_id: &str,
        src: &str,
        dest: &str,
    ) -> Result<()> {
        sqlx::query!(
            r#"
                INSERT INTO playlists (idp, idp_id, name, tracks)
                SELECT idp, idp_id, ?, tracks
                FROM playlists
                WHERE idp = ? AND idp_id = ? AND name = ?
            "#,
            dest,
            idp,
            idp_id,
            src,
        )
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    pub async fn move_playlist(
        &self,
        idp: &str,
        idp_id: &str,
        src: &str,
        dest: &str,
    ) -> Result<()> {
        let result = sqlx::query!(
            r#"
                UPDATE playlists
                SET name = ?
                WHERE idp = ? AND idp_id = ? AND name = ?
            "#,
            dest,
            idp,
            idp_id,
            src,
        )
        .execute(&self.pool)
        .await?;
        if result.rows_affected() != 1 {
            return Err(WavesDatabaseError::PlaylistUnchanged(src.to_owned()).into());
        }
        Ok(())
    }

    pub async fn remove_from_playlist(
        &self,
        idp: &str,
        idp_id: &str,
        playlist_name: &str,
        selection: &[(usize, String)],
    ) -> Result<()> {
        self.validate_num_items(selection.len())?;

        let mut transaction = self.pool.begin().await?;

        let playlist = sqlx::query_as!(
            WavesPlaylistDB,
            r#"
                SELECT idp, idp_id, name, tracks as "tracks: Json<Vec<String>>"
                FROM playlists
                WHERE idp = ? AND idp_id = ? AND name = ?
            "#,
            idp,
            idp_id,
            playlist_name,
        )
        .fetch_one(&mut *transaction)
        .await?;

        let playlist_tracks: Vec<String> = playlist.tracks.to_vec();
        let index_to_id = self.validate_selection(&playlist_tracks, selection)?;

        // filter out the specified indexes
        let filtered_tracks: Vec<&String> = playlist
            .tracks
            .iter()
            .enumerate()
            .filter(|&(i, _)| !index_to_id.contains_key(&i))
            .map(|(_, e)| e)
            .collect();

        sqlx::query!(
            r#"
                UPDATE playlists
                SET tracks = ?
                WHERE idp = ? AND idp_id = ? AND name = ?
            "#,
            Json(filtered_tracks),
            idp,
            idp_id,
            playlist_name,
        )
        .execute(&mut *transaction)
        .await?;

        transaction.commit().await?;
        Ok(())
    }

    pub async fn reorder_playlist(
        &self,
        idp: &str,
        idp_id: &str,
        playlist_name: &str,
        selection: &[(usize, String)],
        insert_at: &usize,
    ) -> Result<()> {
        self.validate_num_items(selection.len())?;

        let mut transaction = self.pool.begin().await?;

        let playlist = sqlx::query_as!(
            WavesPlaylistDB,
            r#"
                SELECT idp, idp_id, name, tracks as "tracks: Json<Vec<String>>"
                FROM playlists
                WHERE idp = ? AND idp_id = ? AND name = ?
            "#,
            idp,
            idp_id,
            playlist_name,
        )
        .fetch_one(&mut *transaction)
        .await?;

        let playlist_tracks: Vec<String> = playlist.tracks.to_vec();
        let index_to_id = self.validate_selection(&playlist_tracks, selection)?;
        let reordered_tracks: Vec<&String> =
            self.reorder(&playlist_tracks, &index_to_id, insert_at)?;

        sqlx::query!(
            r#"
                UPDATE playlists
                SET tracks = ?
                WHERE idp = ? AND idp_id = ? AND name = ?
            "#,
            Json(reordered_tracks),
            idp,
            idp_id,
            playlist_name,
        )
        .execute(&mut *transaction)
        .await?;

        transaction.commit().await?;
        Ok(())
    }

    pub async fn delete_playlist(&self, idp: &str, idp_id: &str, name: &str) -> Result<()> {
        let result = sqlx::query!(
            r#"
                DELETE FROM playlists
                WHERE idp = ? AND idp_id = ? AND name = ?
            "#,
            idp,
            idp_id,
            name,
        )
        .execute(&self.pool)
        .await?;

        if result.rows_affected() != 1 {
            return Err(WavesDatabaseError::PlaylistNotFound(name.to_owned()).into());
        }
        Ok(())
    }

    fn validate_num_items(&self, n: usize) -> Result<()> {
        if n == 0 {
            return Err(WavesDatabaseError::NoItems().into());
        }
        if n > BULK_INSERT_LIMIT {
            return Err(WavesDatabaseError::TooManyItems(BULK_INSERT_LIMIT).into());
        }
        Ok(())
    }

    // Performs the following validation on the selection:
    // - Ensures the indexes are within bounds
    // - Ensures there are no duplicate indexes
    // - Ensures the indicies and value match the tracks
    // Returns a map of index to track id
    fn validate_selection<'a>(
        &'a self,
        tracks: &[String],
        selection: &'a [(usize, String)],
    ) -> Result<HashMap<&'a usize, &'a String>> {
        let tracks_n = tracks.len();
        let selection_n = selection.len();
        let mut index_to_id = HashMap::with_capacity(selection_n);

        for (selection_i, selection_track_id) in selection.iter() {
            if selection_i >= &tracks_n {
                return Err(WavesDatabaseError::PlaylistSelectionOutOfBounds(*selection_i).into());
            }
            if index_to_id.contains_key(selection_i) {
                return Err(WavesDatabaseError::PlaylistSelectionDuplicate(*selection_i).into());
            }
            if &tracks[*selection_i] != selection_track_id {
                return Err(WavesDatabaseError::PlaylistSelectionMismatch(
                    *selection_i,
                    selection_track_id.clone(),
                )
                .into());
            }
            index_to_id.insert(selection_i, selection_track_id);
        }

        Ok(index_to_id)
    }

    fn reorder<'a>(
        &'a self,
        tracks: &'a [String],
        index_to_id: &HashMap<&usize, &String>,
        insert_at_i: &usize,
    ) -> Result<Vec<&'a String>> {
        let n = tracks.len();
        if insert_at_i > &n {
            return Err(WavesDatabaseError::PlaylistReorderOutOfBounds(*insert_at_i).into());
        }

        let mut sorted_indexes: Vec<&&usize> = index_to_id.keys().collect();
        sorted_indexes.sort_unstable();
        let mut reordered_tracks: Vec<&String> = Vec::with_capacity(n);

        for (i, track) in tracks.iter().enumerate() {
            if &i == insert_at_i {
                for sorted_index in sorted_indexes.iter() {
                    reordered_tracks.push(&tracks[***sorted_index]);
                }
            }
            if !index_to_id.contains_key(&i) {
                reordered_tracks.push(track);
            }
        }

        Ok(reordered_tracks)
    }
}
