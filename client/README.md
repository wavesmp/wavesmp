# waves-client-web

# Configuring the Client

- Copy `src/config/config.example.ts` to `src/config/config.ts`
- Substitute AWS/Google/hostname values in the `config.ts`. Its type,
  `Config`, is in `src/config/configTypes.ts`

# Project Layout

The client is a single npm package using ES modules and TypeScript, with the
same strict compiler and lint settings as jettison-ui. The app entrypoint is
`src/main.tsx`, and the code is organized into modules under `src/`:

- `src/components`, `src/styles`: React components and global styles
- `src/actions`: action creators and thunks
- `src/actionTypes`: action types. Some are also server message types
- `src/auth`: Google sign in
- `src/constants`, `src/errors`, `src/utils`: shared code
- `src/localState`: settings persisted in localStorage
- `src/player`: S3 and local file audio players
- `src/reducer`, `src/selectors`: app state, provided by `src/providers` (React Context)
- `src/socket`: WebSocket client for the server
- `src/testUtil`: shared test helpers and data
- `src/types`: types of the state, actions, tracks and playlists

Modules import each other with the `src/` alias (e.g. `src/constants`). Tests
live next to the code as `*.test.ts` and run with vitest.

`npm run format` also sorts imports with prettier-plugin-organize-imports, as
in jettison-ui. It only sorts within groups separated by blank lines, so keep
order-sensitive side-effect imports (e.g. CSS imports) in their own blank-line
separated group.

# Local Development

## Running the Client

Start the vite dev server, which serves the client at http://localhost:5173
with hot reloading. The websocket server url comes from `config.ts`.

```
npm run dev
```

## Running the Client with nginx

In one terminal, run a watch on the client files for automatic rebuilding

```
npm run watch
```

In another terminal, start the client server. The `waves` nginx configuration
may need to be updated with the desired listening ports and server urls.

```
docker run --rm -it --net host \
  -v "./dist:/srv/http" \
  -v "./rootfs/etc/nginx/nginx.conf:/etc/nginx/nginx.conf" \
  -v "./rootfs/etc/nginx/sites/waves:/etc/nginx/sites/waves" \
  nginx:1.25.5-bookworm
```

## Building the Code

```
npm run build
```

The build type checks first (`tsc -b`). The output is written to `dist`. To serve it locally, run `npm run preview`.

## Testing the Code

```
npm run test
```

The coverage report is written to `coverage`. To run a single test file, or
to rerun tests on change:

```
npx vitest run src/reducer/menu.test.ts
npx vitest
```

## Linting the Code

Runs eslint, the TypeScript type check (`tsc -b`) and the prettier check

```
npm run lint
```

## Formatting the Code

```
npm run format
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
