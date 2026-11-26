import { UploadError } from "src/errors";
import type { Track } from "src/types/trackTypes";

import type {
  DeleteResult,
  MediaListener,
  OnToastErr,
  OnUploadProgress,
  SourcePlayer,
} from "../playerTypes";
import { S3Client } from "./client";

const STREAM_ERROR_RETRIES = 1;

class S3Player implements SourcePlayer {
  stream: HTMLAudioElement;
  streamErrorRetries: number;
  client: S3Client;
  track: Track | null;
  loaded: boolean;
  onToastErr: OnToastErr | null;

  constructor(opts: ConstructorParameters<typeof S3Client>[0]) {
    this.stream = new Audio();
    this.stream.onerror = (): void => {
      void this.onStreamError();
    };
    this.streamErrorRetries = STREAM_ERROR_RETRIES;
    this.client = new S3Client(opts);
    this.track = null;
    this.loaded = false;
    this.onToastErr = null;
  }

  // Must be called to initialize
  login(idp: string, idpId: string, token: string): void {
    this.client.login(idp, idpId, token);
  }

  setOnTrackEnded(onTrackEnded: () => void): void {
    this.stream.addEventListener("ended", onTrackEnded);
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

  setOnUploadProgress(onUploadProgress: OnUploadProgress): void {
    this.client.setOnUploadProgress(onUploadProgress);
  }

  setOnToastErr(onToastErr: OnToastErr): void {
    this.onToastErr = onToastErr;
  }

  async trackNext(track: Track, isPlaying: boolean): Promise<void> {
    this.track = track;
    this.loaded = false;
    if (isPlaying) {
      await this.play();
    }
  }

  /* Audio source URLs may expire, which can lead to a 403 Forbidden
   * http code. This results in a stream error code MEDIA_ERR_NETWORK.
   * Catch these errors and retry. Update this code if there is a way
   * to check underlying http code. */
  async onStreamError(): Promise<void> {
    const err = this.stream.error;
    if (this.streamErrorRetries && err?.code === MediaError.MEDIA_ERR_NETWORK) {
      console.log("Got stream network error. Retrying");
      this.streamErrorRetries -= 1;
      const { currentTime } = this.stream;
      console.log(`Retrying playback at time ${currentTime.toString()}`);
      try {
        await this.load();
        this.seek(currentTime);
        await this.stream.play();
        return;
      } catch (retryErr) {
        this.onToastErr?.(`Stream error: ${String(retryErr)}`);
        console.log("Error attempting to reload and play");
        console.log(retryErr);
      }
    }
    this.onToastErr?.(`Stream error: ${err?.message ?? "unknown"}`);
    console.log("Unexpected stream error");
    console.log(`message: ${err?.message ?? "unknown"}`);
    console.log(`code: ${err?.code.toString() ?? "unknown"}`);
  }

  async play(isRetry = false): Promise<void> {
    if (!this.loaded) {
      await this.load();
    }
    if (!isRetry) {
      this.streamErrorRetries = STREAM_ERROR_RETRIES;
    }
    await this.stream.play();
  }

  pause(): void {
    this.stream.pause();
  }

  seek(pos: number): void {
    this.stream.currentTime = pos;
  }

  async load(): Promise<void> {
    if (!this.track) {
      throw new Error("No track to load");
    }
    // Ideally, we could call bucket.getObject directly, but it's simpler
    // to get the url and stream it using <Audio>.src = <url>
    const url = await this.client.getSignedUrl(this.track.id);
    this.stream.src = url;
    this.stream.currentTime = 0;
    this.loaded = true;
  }

  async download(track: Track): Promise<void> {
    // Fetch the link for the track and download it programmatically
    const url = await this.client.getSignedUrl(track.id);
    downloadFile(url);
  }

  /* Return array of promises, so caller can handle
   * errors as they arrive */
  upload(uploads: Track[]): Promise<Track>[] {
    return uploads.map((track) => this.uploadTrack(track));
  }

  /* Upload to s3. Convert tracks to s3 track. */
  async uploadTrack(fileTrack: Track): Promise<Track> {
    /* Make a copy. In upload failure case, original
     * 'file' track remains intact */
    const track: Track = { ...fileTrack, source: "s3" };
    try {
      if (!track.file) {
        throw new Error("No file to upload");
      }
      await this.client.putTrack(track.id, track.file);
      return track;
    } catch (err) {
      throw new UploadError(track, err);
    }
  }

  async deleteTracks(tracks: Track[]): Promise<DeleteResult> {
    return this.client.deleteTracks(tracks);
  }
}

// Taken from https://github.com/PixelsCommander/Download-File-JS
function downloadFile(url: string): void {
  // Creating new link node.
  const link = document.createElement("a");
  link.href = url;
  // Dispatching click event.
  const e = new MouseEvent("click", { bubbles: true, cancelable: true });
  link.dispatchEvent(e);
}

export { S3Player };
