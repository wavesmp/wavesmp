# waves-client-web

# Configuring the Client

- Rename `src/config/config.example.js` as `src/config/config.js`
- Substitute AWS/Google/hostname values in the config.js
- Create a build directory `mkdir build`

# Development

## Building the Code

From this directory, run:

```
NODE_ENV=production npm run build
```

## Building the Image

```
docker build -t waves-client-web .
```

## Publishing the Image

```
docker tag waves-client-web osoriano/waves-client-web
docker push osoriano/waves-client-web
```
