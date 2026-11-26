/*
 * Globals loaded by script tags in index.html. Only the parts used by the
 * app are declared.
 */

/* Google Identity Services
 * See https://developers.google.com/identity/gsi/web/reference/js-reference */
declare namespace google.accounts.id {
  interface CredentialResponse {
    credential: string;
  }

  interface IdConfiguration {
    client_id: string;
    auto_select?: boolean;
    use_fedcm_for_prompt?: boolean;
    callback?: (response: CredentialResponse) => void;
  }

  interface PromptMomentNotification {
    isSkippedMoment: () => boolean;
    isDismissedMoment: () => boolean;
    getDismissedReason: () => string;
  }

  interface GsiButtonConfiguration {
    size?: "large" | "medium" | "small";
  }

  function initialize(config: IdConfiguration): void;
  function prompt(
    listener?: (notification: PromptMomentNotification) => void,
  ): void;
  function renderButton(
    parent: HTMLElement,
    options: GsiButtonConfiguration,
  ): void;
  function disableAutoSelect(): void;
}

/* AWS SDK for JavaScript v2, loaded from public/aws-sdk-2.268.1.min.js
 * See https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/ */
declare namespace AWS {
  interface Request<T> {
    on(
      event: "httpUploadProgress",
      listener: (progress: { loaded: number; total: number }) => void,
    ): Request<T>;
    promise(): Promise<T>;
  }

  interface DeleteObjectsOutput {
    Deleted: { Key: string }[];
    Errors: { Key: string; Code: string; Message: string }[];
  }

  interface S3Params {
    Key: string;
    Body?: Blob | Uint8Array;
    ContentType?: string;
  }

  class S3 {
    constructor(options: { params: { Bucket: string } });
    config: { credentials: WebIdentityCredentials | null };
    getSignedUrl(
      operation: "getObject",
      params: S3Params,
      callback: (err: Error | null, url: string) => void,
    ): void;
    putObject(params: S3Params): Request<unknown>;
    putObject(
      params: S3Params,
      callback: (err: Error | null, data: unknown) => void,
    ): void;
    deleteObjects(params: {
      Delete: { Objects: { Key: string }[] };
    }): Request<DeleteObjectsOutput>;
  }

  /* Opaque. Only passed to the S3 config */
  type WebIdentityCredentials = object;
  const WebIdentityCredentials: new (options: {
    ProviderId: string | null;
    RoleArn: string;
    WebIdentityToken: string;
  }) => WebIdentityCredentials;

  const config: { region: string };
}
