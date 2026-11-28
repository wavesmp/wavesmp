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
