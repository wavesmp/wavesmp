# waves-client-web

# Configuring the Client

- Rename `packages/waves-client-web/src/config/config.example.js` as `packages/waves-client-web/src/config/config.js`
- Substitute AWS/Google/hostname values in the `config.js`
- Create a build directory `mkdir packages/waves-client-web/build`

# Local Development

## Running the Client

In one terminal, run a watch on the client files for automatic rebuilding

```
npm run watch
```

In another terminal, start the client server. The `waves` nginx configuration
may need to be updated with the desired listening ports and server urls.

```
docker run --rm -it --net host \
  -v "./packages/waves-client-web/build:/srv/http" \
  -v "./packages/waves-client-web/rootfs/etc/nginx/nginx.conf:/etc/nginx/nginx.conf" \
  -v "./packages/waves-client-web/rootfs/etc/nginx/sites/waves:/etc/nginx/sites/waves" \
  nginx:1.25.5-bookworm
```

## Building the Code

```
NODE_ENV=production npm run build
```

## Testing the Code

```
npm run test
```

## Linting the Code

```
npm run eslint
```

## Formatting the Code

```
npm run prettier
```

## Running the Integration Test

```
./tests/integration-test.sh http://localhost:8080
```

# Docker Development

## Building the Image

```
docker build -t waves-client-web .
```

## Running the Image

```
docker run -it --rm --net host waves-client-web
```

## Building the Integration Test

```
docker build -t waves-client-web-integration-test --target integration-test .
```

## Running the Integration Test

```
docker run -it --rm --net host waves-client-web-integration-test ./integration-test.sh http://localhost:8080
```
