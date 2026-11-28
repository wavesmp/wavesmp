import type { Track } from "src/types/trackTypes";

type MediaListener = (ev: Event) => void;
type OnUploadProgress = (trackId: string, progress: number) => void;
type OnToastErr = (msg: string) => void;

/* A track that failed to delete */
interface DeleteErr {
  track: Track;
  code: string;
  message: string;
}

interface DeleteResult {
  deleted: Track[];
  deleteErrs: DeleteErr[];
}

/* Plays tracks from one source. Only some sources support downloads,
 * uploads and deletes */
interface SourcePlayer {
  login(idp: string, idpId: string, token: string): void;
  setOnTrackEnded(onTrackEnded: () => void): void;
  setOnUploadProgress(onUploadProgress: OnUploadProgress): void;
  setOnToastErr(onToastErr: OnToastErr): void;
  addOnTimeUpdate(onTimeUpdate: MediaListener): void;
  removeOnTimeUpdate(onTimeUpdate: MediaListener): void;
  addOnVolumeChange(onVolumeChange: MediaListener): void;
  removeOnVolumeChange(onVolumeChange: MediaListener): void;
  getVolume(): number;
  setVolume(volume: number): void;
  trackNext(track: Track, isPlaying: boolean): Promise<void>;
  play(): Promise<void>;
  pause(): void;
  seek(pos: number): void;
  download?(track: Track): Promise<void>;
  upload?(uploads: Track[]): Promise<Track>[];
  deleteTracks?(tracks: Track[]): Promise<DeleteResult>;
}

export type {
  DeleteErr,
  DeleteResult,
  MediaListener,
  OnToastErr,
  OnUploadProgress,
  SourcePlayer,
};
