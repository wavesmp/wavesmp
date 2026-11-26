import type { S3Opts } from "src/config/configTypes";
import type { Track, TrackSource } from "src/types/trackTypes";

import { FilePlayer } from "./file";
import type {
  DeleteResult,
  MediaListener,
  OnToastErr,
  OnUploadProgress,
  SourcePlayer,
} from "./playerTypes";
import { S3Player } from "./s3";

/* The sources to play from, and the default source for uploads */
interface PlayerOpts {
  s3?: S3Opts;
  file?: undefined;
  defaultTrackSource?: TrackSource;
}

/* Plays tracks from their source (see SourcePlayer) */
class Player {
  defaultTrackSource: TrackSource | undefined;
  players: Partial<Record<TrackSource, SourcePlayer>>;
  track: Track | null;

  constructor({ defaultTrackSource, ...sourceTypes }: PlayerOpts) {
    this.defaultTrackSource = defaultTrackSource;
    this.players = {};
    this.track = null;
    if (sourceTypes.s3) {
      this.players.s3 = new S3Player(sourceTypes.s3);
    }
    if ("file" in sourceTypes) {
      this.players.file = new FilePlayer();
    }
  }

  get allPlayers(): SourcePlayer[] {
    return Object.values(this.players);
  }

  getPlayer(source: TrackSource): SourcePlayer {
    const player = this.players[source];
    if (!player) {
      throw new Error(`No player for source: ${source}`);
    }
    return player;
  }

  // Must be called to initialize player
  // Need for auth or adding user info to tracks
  login(idp: string, idpId: string, token: string): void {
    for (const player of this.allPlayers) {
      player.login(idp, idpId, token);
    }
  }

  setOnTrackEnded(onTrackEnded: () => void): void {
    for (const player of this.allPlayers) {
      player.setOnTrackEnded(onTrackEnded);
    }
  }

  setOnUploadProgress(onUploadProgress: OnUploadProgress): void {
    for (const player of this.allPlayers) {
      player.setOnUploadProgress(onUploadProgress);
    }
  }

  addOnTimeUpdate(onTimeUpdate: MediaListener): void {
    for (const player of this.allPlayers) {
      player.addOnTimeUpdate(onTimeUpdate);
    }
  }

  removeOnTimeUpdate(onTimeUpdate: MediaListener): void {
    for (const player of this.allPlayers) {
      player.removeOnTimeUpdate(onTimeUpdate);
    }
  }

  addOnVolumeChange(onVolumeChange: MediaListener): void {
    for (const player of this.allPlayers) {
      player.addOnVolumeChange(onVolumeChange);
    }
  }

  removeOnVolumeChange(onVolumeChange: MediaListener): void {
    for (const player of this.allPlayers) {
      player.removeOnVolumeChange(onVolumeChange);
    }
  }

  getVolume(): number | null {
    /* Player vol should be in sync. Return the first one */
    const [player] = this.allPlayers;
    return player ? player.getVolume() : null;
  }

  setVolume(volume: number): void {
    for (const player of this.allPlayers) {
      player.setVolume(volume);
    }
  }

  setOnToastErr(onToastErr: OnToastErr): void {
    for (const player of this.allPlayers) {
      player.setOnToastErr(onToastErr);
    }
  }

  async trackNext(track: Track, isPlaying: boolean): Promise<void> {
    this.pause();
    this.track = track;
    await this.getPlayer(track.source).trackNext(track, isPlaying);
  }

  async trackToggle(track: Track): Promise<void> {
    void this.trackNext(track, true);
    return Promise.resolve();
  }

  /* The player of the current track */
  getTrackPlayer(): SourcePlayer {
    if (!this.track) {
      throw new Error("No track is playing");
    }
    return this.getPlayer(this.track.source);
  }

  pause(): void {
    if (!this.track) {
      return;
    }
    this.getPlayer(this.track.source).pause();
  }

  async repeat(): Promise<void> {
    await this.seek(0);
    void this.play();
  }

  async seek(elapsed: number): Promise<void> {
    this.getTrackPlayer().seek(elapsed);
    return Promise.resolve();
  }

  async play(): Promise<void> {
    void this.getTrackPlayer().play();
    return Promise.resolve();
  }

  async download(track: Track): Promise<void> {
    const player = this.getPlayer(track.source);
    if (!player.download) {
      throw new Error(`Download not supported for source: ${track.source}`);
    }
    await player.download(track);
  }

  upload(
    trackSource: TrackSource | undefined,
    uploads: Track[],
  ): Promise<Track>[] {
    const source = trackSource ?? this.defaultTrackSource;
    if (!source) {
      throw new Error("No source to upload to");
    }
    const player = this.getPlayer(source);
    if (!player.upload) {
      throw new Error(`Upload not supported for source: ${source}`);
    }
    return player.upload(uploads);
  }

  /* Delete the tracks. Does not return items in the given order.
   * Does not throw or block. */
  async deleteTracks(tracks: Track[]): Promise<Promise<DeleteResult>[]> {
    const tracksBySource = new Map<TrackSource, Track[]>();
    for (const track of tracks) {
      const sourceTracks = tracksBySource.get(track.source);
      if (sourceTracks) {
        sourceTracks.push(track);
      } else {
        tracksBySource.set(track.source, [track]);
      }
    }
    const promises: Promise<DeleteResult>[] = [];
    for (const [source, sourceTracks] of tracksBySource) {
      const player = this.getPlayer(source);
      if (!player.deleteTracks) {
        throw new Error(`Delete not supported for source: ${source}`);
      }
      promises.push(player.deleteTracks(sourceTracks));
    }
    return Promise.resolve(promises);
  }
}

export { Player };
export type { PlayerOpts };
