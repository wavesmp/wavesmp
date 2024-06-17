# <img src="https://s3-us-west-2.amazonaws.com/assets.wavesmusicplayer.com/waves-logo-full.png"/>

A multi-tenant music player with a client/server architecture.
Manages your personal music collection on the cloud.

# Features

- Responsive web design supports multiple screen sizes
- Client directly talks to the cloud to manage music. Stream anywhere
- Music metadata is stored locally to quickly view your entire library
- Supports multiple users by integrating with identity providers (e.g. Google)

# Requirements

- Kubernetes
- [Google Auth Client ID](https://developers.google.com/identity/sign-in/web/sign-in)
- [S3 bucket configured for Google auth](./aws)

# Instructions

- Optionally, run the `scripts/backups/restore.sh <bucket_name>` script if restoring from an s3 bucket
- Rename `./k8s/examples/waves-server-rust-config-map.example.yaml` as `./k8s/waves-server-rust-config-map.yaml`
- Substitute Google client id in the copied yaml
- Apply the k8s manifest in the `./k8s` directory

# Publishing Images
- See the [waves-client-web package](./packages/waves-client-web) for publishing images
- See the [waves-server-rust package](./packages/waves-server-rust) for publishing images
