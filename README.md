Waves Music Player
==================
A multi-tenant music player with a client/server architecture.
Music is stored in S3. Music metadata stored MongoDB.
Uses Google auth.

TODO instructions below are a work in progress

Requirements
============
- Docker
- Node
- [Google Auth Client ID](https://developers.google.com/identity/sign-in/web/sign-in)
- [S3 bucket configured for Google auth](./aws)

Instructions
============
- Run `npm install` to install lerna monorepo tool
- Run `npm run bootstrap` to install node dependencies and link packages
- Optionally, run the `restore-server.sh <bucket_name>` script if restoring from s3 bucket
- See the `waves-server-main` and `waves-client-web` packages for entry scripts
