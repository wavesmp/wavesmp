/* Maps playlist indexes to track ids */
type Selection = Map<number, string>;

/*
 * A playlist as received from the server.
 * SOT: server/src/ws_server/waves_message_types.rs (WavesPlaylistExternal)
 */
interface ServerPlaylist {
  name: string;
  tracks: string[];
}

interface Playlist {
  name: string;
  /* Track ids */
  tracks: string[];
  selection: Selection;
  /* React router url query params */
  search: string;
  /* Index of the playing track, if it is in this playlist */
  index: number | null;
  /* Only library playlists support sorting */
  sortKey?: string;
  ascending?: boolean;
}

/* Maps playlist names to playlists. null until loaded */
type Playlists = Record<string, Playlist | undefined> | null;

export type { Playlist, Playlists, Selection, ServerPlaylist };
