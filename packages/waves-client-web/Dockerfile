FROM nginx:1.15.8
ARG host
COPY rootfs/etc/nginx/nginx.conf /etc/nginx/nginx.conf
RUN [ ! -d /etc/nginx/sites ]
COPY rootfs/etc/nginx/sites/ /etc/nginx/sites/
RUN sed "s/__HOST__/$host/g" -i /etc/nginx/sites/*
COPY build/* /srv/http/
EXPOSE 80
EXPOSE 443
