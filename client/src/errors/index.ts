import type { Track } from "src/types/trackTypes";

const MESSAGE = "Failed to upload track";

interface CaptureStackTrace {
  captureStackTrace?: (target: object, constructorOpt?: unknown) => void;
}

class UploadError extends Error {
  track: Track;

  constructor(track: Track, cause: unknown) {
    super(MESSAGE, { cause });
    this.message = MESSAGE;
    this.name = this.constructor.name;
    this.track = track;

    /* V8 only. Leaves the constructor out of the stack */
    (Error as CaptureStackTrace).captureStackTrace?.(this, UploadError);
  }
}

export { UploadError };
