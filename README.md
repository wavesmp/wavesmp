# <img src="https://s3-us-west-2.amazonaws.com/assets.wavesmusicplayer.com/waves-logo-full.png"/>

A multi-tenant music player with a client/server architecture.
Manages your personal music collection on the cloud.

# Features

- Responsive web design supports multiple screen sizes
- Client directly talks to the cloud to manage music. Stream anywhere
- Music metadata is stored locally to quickly view your entire library
- Supports multiple users by integrating with identity providers (e.g. Google)

# Requirements

- Docker Compose
- [Google Auth Client ID](https://developers.google.com/identity/sign-in/web/sign-in)
- [S3 bucket configured for Google auth](./aws)

# Instructions

- Optionally, run the `scripts/backups/restore.sh <bucket_name>` script if restoring from an s3 bucket
- See the [waves-client-web package](./packages/waves-client-web) for configuring the client
- See the [waves-server-main package](./packages/waves-server-main) for configuring the server
- Run `docker-compose up`
