const MAX_DELETE_KEYS = 1000;

class S3Client {
  constructor({ regionName, bucketName, roleArn, providerId }) {
    this.regionName = regionName;
    this.bucketName = bucketName;
    this.roleArn = roleArn;
    this.providerId = providerId;
  }

  setOnUploadProgress(onUploadProgress) {
    this.onUploadProgress = onUploadProgress;
  }

  login(idp, idpId, token) {
    AWS.config.region = this.regionName;
    this.bucket = new AWS.S3({ params: { Bucket: this.bucketName } });

    this.bucket.config.credentials = new AWS.WebIdentityCredentials({
      ProviderId: this.providerId,
      RoleArn: this.roleArn,
      WebIdentityToken: token,
    });

    this.baseUrl = `${idp}/${idpId}/`;
  }

  getTrackKey(trackId) {
    return `${this.baseUrl}${trackId}.mp3`;
  }

  getSignedUrl(trackId) {
    const objKey = this.getTrackKey(trackId);
    const params = {
      Key: objKey,
      // TODO these are probably used for put...
      // ContentType: file.type,
      // Body: file,
      // ACL: 'public-read'
    };

    // AWS.getSignedUrl does not support promise:
    // https://github.com/aws/aws-sdk-js/issues/1008
    return new Promise((resolve, reject) => {
      this.bucket.getSignedUrl("getObject", params, (err, url) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(url);
      });
    });
  }

  // TODO support multiple file types
  putTrack(trackId, file) {
    const objKey = this.getTrackKey(trackId);
    const params = {
      Key: objKey,
      Body: file,
      ContentType: file.type,
    };
    const req = this.bucket.putObject(params);

    req.on("httpUploadProgress", (progress) => {
      const { loaded, total } = progress;
      const percentage = Math.round((loaded / total) * 100);
      this.onUploadProgress(trackId, percentage);
    });

    return req.promise();
  }

  // picture has format (string) and data (Uint8Array) attributes
  // TODO not used at the moment
  putImage(trackId, picture) {
    const { data, format } = picture;
    const objKey = `${this.baseUrl}${trackId}.${format}`;

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

      this.bucket.putObject(params, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(data);
      });
    });
  }

  async deleteTracks(tracks) {
    if (tracks.length > MAX_DELETE_KEYS) {
      /* According to aws-sdk-js docs, there is an upper limit */
      throw new Error(`Cannot delete more than ${MAX_DELETE_KEYS} at a time`);
    }
    const keyToTrack = {};
    for (const track of tracks) {
      keyToTrack[this.getTrackKey(track.id)] = track;
    }
    const params = {
      Delete: {
        Objects: Object.keys(keyToTrack).map((Key) => ({ Key })),
      },
    };

    const data = await this.bucket.deleteObjects(params).promise();
    for (const err of data.Errors) {
      err.track = keyToTrack[err.Key];
      err.code = err.Code;
      err.message = err.Message;
    }
    return {
      deleted: data.Deleted.map(({ Key }) => keyToTrack[Key]),
      deleteErrs: data.Errors,
    };
  }
}

module.exports = S3Client;
