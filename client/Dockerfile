FROM node:20 AS builder

COPY . .
RUN npm ci
RUN npm run build

FROM nginx:1.25.5-bookworm
LABEL org.opencontainers.image.source=https://github.com/wavesmp/wavesmp
EXPOSE 80

COPY --from=builder \
  packages/waves-client-web/build/* \
  packages/waves-client-web/src/index.html \
  packages/waves-client-web/src/privacy.html \
  packages/waves-client-web/src/favicon.ico \
  packages/waves-client-web/vendor/aws-sdk-2.268.1.min.js \
  /srv/http/

COPY --from=builder packages/waves-client-web/rootfs/etc/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder packages/waves-client-web/rootfs/etc/nginx/sites/waves /etc/nginx/sites/waves
