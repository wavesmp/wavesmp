/* Where a track's audio is stored */
type TrackSource = "s3" | "file";

/* State shown while a track is changing (see the State column) */
type TrackState = "preview" | "pending" | "uploading";

/*
 * A track as received from the server.
 * SOT: server/src/ws_server/waves_message_types.rs (WavesTrackExternal)
 */
interface ServerTrack {
  id: string;
  source: TrackSource;
  title?: string | null;
  artist?: string | null;
  album?: string | null;
  genre?: string | null;
  duration: number;
}

/* A track in a library. Missing tags are filled in, and the creation time
 * comes from the id (see tracksAdd) */
interface Track {
  id: string;
  source: TrackSource;
  title: string;
  artist: string;
  album?: string | null;
  genre: string;
  duration: number;
  createdAt?: number;
  createdAtPretty?: string;
  state?: TrackState;
  uploadProgress?: number;
  /* Local file, for tracks that are not uploaded yet */
  file?: File;
}

/* A track to display: its formatted time and index in the playlist */
interface NormalizedTrack extends Track {
  time: string;
  index: number;
}

/* Maps track ids to tracks */
type Library = Record<string, Track>;

/* Maps library names to libraries. A library is null until loaded */
type Libraries = Record<string, Library | null | undefined>;

export type {
  Libraries,
  Library,
  NormalizedTrack,
  ServerTrack,
  Track,
  TrackSource,
  TrackState,
};
