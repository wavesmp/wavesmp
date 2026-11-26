import type { Track } from "src/types/trackTypes";

import type { MediaListener, SourcePlayer } from "../playerTypes";

/* Plays local files, e.g. before they are uploaded */
class FilePlayer implements SourcePlayer {
  stream: HTMLAudioElement;
  track: Track | null;
  trackUrl: string | null;
  loaded: boolean;

  constructor() {
    this.stream = new Audio();
    this.track = null;
    this.trackUrl = null;
    this.loaded = false;
  }

  // Must be called to initialize
  login(): void {
    // No auth needed
  }

  setOnTrackEnded(onTrackEnded: () => void): void {
    this.stream.addEventListener("ended", onTrackEnded);
  }

  setOnUploadProgress(): void {
    // No local upload supported
  }

  setOnToastErr(): void {
    // No use case for this currently
  }

  addOnTimeUpdate(onTimeUpdate: MediaListener): void {
    this.stream.addEventListener("timeupdate", onTimeUpdate);
  }

  removeOnTimeUpdate(onTimeUpdate: MediaListener): void {
    this.stream.removeEventListener("timeupdate", onTimeUpdate);
  }

  addOnVolumeChange(onVolumeChange: MediaListener): void {
    this.stream.addEventListener("volumechange", onVolumeChange);
  }

  removeOnVolumeChange(onVolumeChange: MediaListener): void {
    this.stream.removeEventListener("volumechange", onVolumeChange);
  }

  getVolume(): number {
    return this.stream.volume;
  }

  setVolume(volume: number): void {
    this.stream.volume = volume;
  }

  async trackNext(track: Track, isPlaying: boolean): Promise<void> {
    if (this.trackUrl) {
      URL.revokeObjectURL(this.trackUrl);
      this.trackUrl = null;
    }
    this.track = track;
    this.loaded = false;
    if (isPlaying) {
      await this.play();
    }
  }

  async play(): Promise<void> {
    if (!this.loaded) {
      this.load();
    }
    void this.stream.play();
    return Promise.resolve();
  }

  pause(): void {
    this.stream.pause();
  }

  seek(pos: number): void {
    this.stream.currentTime = pos;
  }

  load(): void {
    if (!this.trackUrl) {
      const file = this.track?.file;
      if (!file) {
        throw new Error("No local file to play");
      }
      this.trackUrl = URL.createObjectURL(file);
    }
    this.stream.src = this.trackUrl;
    this.stream.currentTime = 0;
    this.loaded = true;
  }
}

export { FilePlayer };
