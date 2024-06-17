FROM nginx:1.25.5-bookworm

COPY \
  build/* \
  src/index.html \
  src/privacy.html \
  src/favicon.ico \
  vendor/aws-sdk-2.268.1.min.js \
  /srv/http/

COPY rootfs/etc/nginx/nginx.conf /etc/nginx/nginx.conf
COPY rootfs/etc/nginx/sites/waves /etc/nginx/sites/waves
