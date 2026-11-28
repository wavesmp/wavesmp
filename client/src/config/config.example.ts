import type { Config } from "./configTypes";

const config: Config = {
  /* Auth opts are passed into google.accounts.id.initialize.
   * client_id is required. See IdConfiguration for more options:
   * https://developers.google.com/identity/gsi/web/reference/js-reference */
  googleAuthOpts: {
    client_id: "REPLACE_ME",
    /* Additional opts here, if needed */
  },
  s3Opts: {
    /* Role ARN for storing tracks in S3 */
    roleArn: "REPLACE_ME",
    /* Bucket for storing tracks */
    bucketName: "REPLACE_ME",
    /* AWS region */
    regionName: "REPLACE_ME",
    /* null for google */
    providerId: null,
  },
  defaultTrackSource: "s3",
  /* Waves websocket server url */
  server: "wss://www.HOST_NAME/ws",
};

export { config };
