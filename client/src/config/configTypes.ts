import type { TrackSource } from "src/types/trackTypes";

/* Options for S3 storage of tracks */
interface S3Opts {
  /* Role ARN for storing tracks in S3 */
  roleArn: string;
  /* Bucket for storing tracks */
  bucketName: string;
  /* AWS region */
  regionName: string;
  /* null for google */
  providerId: string | null;
}

/* Auth opts are passed into google.accounts.id.initialize */
type GoogleAuthOpts = Omit<google.accounts.id.IdConfiguration, "callback">;

/* The shape of src/config/config.ts (see config.example.ts) */
interface Config {
  googleAuthOpts: GoogleAuthOpts;
  s3Opts: S3Opts;
  defaultTrackSource: TrackSource;
  /* Waves websocket server url */
  server: string;
}

export type { Config, GoogleAuthOpts, S3Opts };
