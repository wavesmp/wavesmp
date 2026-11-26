import type { S3Opts } from "src/config/configTypes";
import type { Track } from "src/types/trackTypes";

import type { DeleteErr, DeleteResult, OnUploadProgress } from "../playerTypes";

const MAX_DELETE_KEYS = 1000;

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
  bucket: AWS.S3 | null;
  baseUrl: string;
  onUploadProgress: OnUploadProgress | null;

  constructor({ regionName, bucketName, roleArn, providerId }: S3Opts) {
    this.regionName = regionName;
    this.bucketName = bucketName;
    this.roleArn = roleArn;
    this.providerId = providerId;
    this.bucket = null;
    this.baseUrl = "";
    this.onUploadProgress = null;
  }

  setOnUploadProgress(onUploadProgress: OnUploadProgress): void {
    this.onUploadProgress = onUploadProgress;
  }

  login(idp: string, idpId: string, token: string): void {
    AWS.config.region = this.regionName;
    this.bucket = new AWS.S3({ params: { Bucket: this.bucketName } });
    this.bucket.config.credentials = new AWS.WebIdentityCredentials({
      ProviderId: this.providerId,
      RoleArn: this.roleArn,
      WebIdentityToken: token,
    });
    this.baseUrl = `${idp}/${idpId}/`;
  }

  /* The bucket, which is available after login */
  getBucket(): AWS.S3 {
    if (!this.bucket) {
      throw new Error("Not logged in to S3");
    }
    return this.bucket;
  }

  getTrackKey(trackId: string): string {
    return `${this.baseUrl}${trackId}.mp3`;
  }

  getSignedUrl(trackId: string): Promise<string> {
    const objKey = this.getTrackKey(trackId);
    const params = {
      Key: objKey,
      // TODO these are probably used for put...
      // ContentType: file.type,
      // Body: file,
      // ACL: 'public-read'
    };
    const bucket = this.getBucket();
    // AWS.getSignedUrl does not support promise:
    // https://github.com/aws/aws-sdk-js/issues/1008
    return new Promise((resolve, reject) => {
      bucket.getSignedUrl("getObject", params, (err, url) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(url);
      });
    });
  }

  // TODO support multiple file types
  putTrack(trackId: string, file: File): Promise<unknown> {
    const objKey = this.getTrackKey(trackId);
    const params = {
      Key: objKey,
      Body: file,
      ContentType: file.type,
    };
    const req = this.getBucket().putObject(params);
    req.on("httpUploadProgress", (progress) => {
      const { loaded, total } = progress;
      const percentage = Math.round((loaded / total) * 100);
      this.onUploadProgress?.(trackId, percentage);
    });
    return req.promise();
  }

  // TODO not used at the moment
  putImage(trackId: string, picture: Picture): Promise<unknown> {
    const { data, format } = picture;
    const objKey = `${this.baseUrl}${trackId}.${format}`;
    const bucket = this.getBucket();
    // AWS.putObject does not support promise:
    // https://github.com/aws/aws-sdk-js/issues/1008
    return new Promise((resolve, reject) => {
      let mime = format;
      if (mime === "jpg") {
        mime = "jpeg";
      } else {
        // TODO fail fast for now... Need to see where the mime (format) comes from
        reject(new Error(`Error uploading image: Unknown format: ${mime}`));
        return;
      }
      // TODO look into setting ContentDisposition for settings download file name
      const params = {
        Key: objKey,
        Body: data,
        ContentType: `image/${mime}`,
      };
      bucket.putObject(params, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  }

  async deleteTracks(tracks: Track[]): Promise<DeleteResult> {
    if (tracks.length > MAX_DELETE_KEYS) {
      /* According to aws-sdk-js docs, there is an upper limit */
      throw new Error(
        `Cannot delete more than ${MAX_DELETE_KEYS.toString()} at a time`,
      );
    }
    const keyToTrack = new Map<string, Track>();
    for (const track of tracks) {
      keyToTrack.set(this.getTrackKey(track.id), track);
    }
    const params = {
      Delete: {
        Objects: Array.from(keyToTrack.keys(), (Key) => ({ Key })),
      },
    };
    const data = await this.getBucket().deleteObjects(params).promise();
    function getTrack(key: string): Track {
      const track = keyToTrack.get(key);
      if (!track) {
        throw new Error(`Unexpected deleted key: ${key}`);
      }
      return track;
    }
    const deleteErrs: DeleteErr[] = data.Errors.map((err) => ({
      ...err,
      track: getTrack(err.Key),
      code: err.Code,
      message: err.Message,
    }));
    return {
      deleted: data.Deleted.map(({ Key }) => getTrack(Key)),
      deleteErrs,
    };
  }
}

export { S3Client };
