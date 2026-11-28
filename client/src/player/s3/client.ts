import type { S3Opts } from "src/config/configTypes";
import type { Track } from "src/types/trackTypes";

import {
  S3Client as AwsS3Client,
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { fromWebToken } from "@aws-sdk/credential-providers";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { XhrHttpHandler } from "@aws-sdk/xhr-http-handler";
import type { DeleteErr, DeleteResult, OnUploadProgress } from "../playerTypes";

const MAX_DELETE_KEYS = 1000;

const SIGNED_URL_EXPIRES_IN_SECONDS = 3600;

/* A cover picture, as read from the track's tags */
interface Picture {
  format: string;
  data: Uint8Array;
}

class S3Client {
  regionName: string;
  bucketName: string;
  roleArn: string;
  providerId: string | null;
  client: AwsS3Client | null;
  baseUrl: string;
  onUploadProgress: OnUploadProgress | null;
  uploadsByPath: Map<string, string>;

  constructor({ regionName, bucketName, roleArn, providerId }: S3Opts) {
    this.regionName = regionName;
    this.bucketName = bucketName;
    this.roleArn = roleArn;
    this.providerId = providerId;
    this.client = null;
    this.baseUrl = "";
    this.onUploadProgress = null;
    this.uploadsByPath = new Map();
  }

  setOnUploadProgress(onUploadProgress: OnUploadProgress): void {
    this.onUploadProgress = onUploadProgress;
  }

  login(idp: string, idpId: string, token: string): void {
    const { regionName, roleArn, providerId } = this;
    const requestHandler = new XhrHttpHandler();
    requestHandler.on(
      XhrHttpHandler.EVENTS.UPLOAD_PROGRESS,
      (event: ProgressEvent, request: { path: string }) => {
        this.handleUploadProgress(event, request.path);
      },
    );
    const client = new AwsS3Client({
      region: regionName,
      credentials: fromWebToken({
        roleArn,
        webIdentityToken: token,
        providerId: providerId ?? undefined,
        clientConfig: { region: regionName },
      }),
      requestHandler,
      /* Only send checksums when S3 requires them (e.g. deletes). The
       * checksum headers must be allowed by the bucket's CORS config */
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });

    this.client = client;
    this.baseUrl = `${idp}/${idpId}/`;
  }

  getAwsS3Client(): AwsS3Client {
    if (!this.client) {
      throw new Error("Not logged in to S3");
    }
    return this.client;
  }

  getTrackKey(trackId: string): string {
    return `${this.baseUrl}${trackId}.mp3`;
  }

  getSignedUrl(trackId: string): Promise<string> {
    const objKey = this.getTrackKey(trackId);
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: objKey,
    });
    return getSignedUrl(this.getAwsS3Client(), command, {
      expiresIn: SIGNED_URL_EXPIRES_IN_SECONDS,
    });
  }

  handleUploadProgress(event: ProgressEvent, path: string): void {
    const trackId = this.uploadsByPath.get(path);
    if (trackId === undefined || !event.lengthComputable) {
      return;
    }
    const percentage = Math.round((event.loaded / event.total) * 100);
    this.onUploadProgress?.(trackId, percentage);
  }

  // TODO support multiple file types
  async putTrack(trackId: string, file: File): Promise<unknown> {
    const objKey = this.getTrackKey(trackId);
    const objPath = `/${objKey}`;
    this.uploadsByPath.set(objPath, trackId);
    try {
      return await this.getAwsS3Client().send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: objKey,
          Body: file,
          ContentType: file.type,
        }),
      );
    } finally {
      this.uploadsByPath.delete(objPath);
    }
  }

  // TODO not used at the moment
  putImage(trackId: string, picture: Picture): Promise<unknown> {
    const { data, format } = picture;
    let mime = format;
    if (mime === "jpg") {
      mime = "jpeg";
    } else {
      // TODO fail fast for now... Need to see where the mime (format) comes from
      throw new Error(`Error uploading image: Unknown format: ${mime}`);
    }
    // TODO look into setting ContentDisposition for settings download file name
    const key = `${this.baseUrl}${trackId}.${format}`;
    return this.getAwsS3Client().send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: data,
        ContentType: `image/${mime}`,
      }),
    );
  }

  async deleteTracks(tracks: Track[]): Promise<DeleteResult> {
    if (tracks.length > MAX_DELETE_KEYS) {
      /* S3 deletes at most 1000 keys per request */
      throw new Error(
        `Cannot delete more than ${MAX_DELETE_KEYS.toString()} at a time`,
      );
    }
    const keyToTrack = new Map<string, Track>();
    for (const track of tracks) {
      keyToTrack.set(this.getTrackKey(track.id), track);
    }

    const data = await this.getAwsS3Client().send(
      new DeleteObjectsCommand({
        Bucket: this.bucketName,
        Delete: { Objects: [...keyToTrack.keys()].map((Key) => ({ Key })) },
      }),
    );

    const deletedKeys = (data.Deleted ?? []).map(({ Key }) => Key);
    const errors = (data.Errors ?? []).map((err) => ({
      key: err.Key,
      code: err.Code ?? "",
      message: err.Message ?? "",
    }));

    function getTrack(key: string | undefined): Track {
      const track = key === undefined ? undefined : keyToTrack.get(key);
      if (!track) {
        throw new Error(`Unexpected deleted key: ${String(key)}`);
      }
      return track;
    }
    const deleteErrs: DeleteErr[] = errors.map(({ key, code, message }) => ({
      track: getTrack(key),
      code,
      message,
    }));
    return { deleted: deletedKeys.map(getTrack), deleteErrs };
  }
}

export { S3Client };
