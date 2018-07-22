module.exports = {
  /* Auth opts are passed into the gapi.auth2.init method.
   * client_id is required.
   * See the gapi.auth2.ClientConfig for more options:
   * https://developers.google.com/identity/sign-in/web/
   * reference#gapiauth2clientconfig */
  googleAuthOpts: {
    client_id: 'REPLACE_ME',
    /* Additional opts here, if needed */
  },
  s3Opts: {
    /* Role ARN for storing tracks in S3 */
    roleArn: 'REPLACE_ME',
    /* Bucket for storing tracks */
    bucketName: 'REPLACE_ME',
    /* AWS region */
    regionName: 'REPLACE_ME',
    /* null for google */
    providerId: null
  },
  /* Waves websocket server url */
  server: 'wss://www.HOST_NAME/ws'
}

