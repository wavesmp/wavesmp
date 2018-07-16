const Promise = require('bluebird')

class S3Client {
  constructor({ regionName, bucketName, roleArn, providerId }) {
    this.regionName = regionName
    this.bucketName = bucketName
    this.roleArn = roleArn
    this.providerId = providerId
  }

  login(idp, idpId, token) {
    AWS.config.region = this.regionName
    this.bucket = new AWS.S3({ params: { Bucket: this.bucketName } })

    this.bucket.config.credentials = new AWS.WebIdentityCredentials({
      ProviderId: this.providerId,
      RoleArn: this.roleArn,
      WebIdentityToken: token});

    this.baseUrl = idp + '/' + idpId + '/'
  }

  getSignedUrl(trackId) {
    const objKey = this.baseUrl + trackId + '.mp3'
    const params = {
      Key: objKey,
      // TODO these are probably used for put...
      // ContentType: file.type,
      // Body: file,
      // ACL: 'public-read'
    }

    // AWS.getSignedUrl does not support promise:
    // https://github.com/aws/aws-sdk-js/issues/1008
    return new Promise((resolve, reject) => {
      this.bucket.getSignedUrl('getObject', params, (err, url) => {
        if (err) {
            reject(err)
            return
        }
        resolve(url)
      })
    })
  }

  // TODO support multiple file types
  putTrack(trackId, file) {
    const objKey = this.baseUrl + trackId + '.mp3'
    // TODO look into setting ContentDisposition for settings download file name
    const params = {
      Key: objKey,
      Body: file,
      ContentType: file.type
    }

    // AWS.putObject does not support promise:
    // https://github.com/aws/aws-sdk-js/issues/1008
    return new Promise((resolve, reject) => {
      this.bucket.putObject(params, (err, data) => {
        if (err) {
            reject(err)
            return
        }
        resolve(data)
      })
    })
  }

  // picture has format (string) and data (Uint8Array) attributes
  putImage(trackId, picture) {
    const { data, format } = picture
    const objKey = this.baseUrl + trackId + '.' + format

    // AWS.putObject does not support promise:
    // https://github.com/aws/aws-sdk-js/issues/1008
    return new Promise((resolve, reject) => {
      let mime = format
      if (mime === 'jpg') {
        mime = 'jpeg'
      } else {
        // TODO fail fast for now... Need to see where the mime (format) comes from
        reject(new Error(`Error uploading image: Unknown format: ${mime}`))
        return
      }

      // TODO look into setting ContentDisposition for settings download file name
      const params = {
        Key: objKey,
        Body: data,
        ContentType: `image/${mime}`
      }

      this.bucket.putObject(params, (err, data) => {
        if (err) {
          reject(err)
          return
        }
        resolve(data)
      })
    })
  }

  deleteTracks(tracks) {
    const keyToTrack = {}
    for (const track of tracks) {
      keyToTrack[this.baseUrl + track.id + '.mp3'] = track
    }
    const params = {
      Delete: {
        Objects: Object.keys(keyToTrack).map(Key => ({Key}))
      }
    }

    // AWS.deleteObjects does not support promise:
    // https://github.com/aws/aws-sdk-js/issues/1008
    return new Promise((resolve, reject) => {
      this.bucket.deleteObjects(params, (err, data) => {
        if (err) {
            reject(err)
            return
        }
        data.Deleted = data.Deleted.map(({Key}) => keyToTrack[Key])
        for (const err of data.Errors) {
          err.Track = keyToTrack(err.Key)
        }
        resolve(data)
      })
    })
  }

}

module.exports = S3Client
