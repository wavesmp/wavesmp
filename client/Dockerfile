# Build the production assets
FROM node:26 AS build

WORKDIR /home/node
ENV CI=true

# Install dependencies
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
  npm ci

# Build the production assets
COPY \
  .prettierignore \
  eslint.config.js \
  index.html \
  tsconfig.json \
  tsconfig.app.json \
  tsconfig.node.json \
  tsconfig.test.json \
  vite.config.ts \
  ./

COPY public ./public
COPY rootfs ./rootfs
COPY src ./src

RUN npm run build

# Run unit tests and lint
FROM build AS test-results
RUN npm run lint && \
  npm run test

# Build the Integration Tests
FROM ubuntu:24.04 AS integration-test
RUN apt-get update && \
  apt-get -y install curl && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists /var/cache/apt/archives
WORKDIR /root
COPY tests .
CMD [ "./integration-test.sh" ]

FROM nginx:1.25.5-bookworm
LABEL org.opencontainers.image.source=https://github.com/wavesmp/wavesmp
EXPOSE 80

COPY --from=build /home/node/dist/ /srv/http/
COPY --from=build /home/node/rootfs/etc/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /home/node/rootfs/etc/nginx/sites/waves /etc/nginx/sites/waves
