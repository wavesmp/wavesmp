# waves-client-web

# Configuring the Client

- Rename `src/config.example.json` as `src/config.json`
- Substitute AWS/Google/hostname values in the config.json
- Ensure letsencrypt cert files are present in the `rootfs/`

# Building and Starting the Client

- Run `./build-container.sh <hostname>`
- Run `./run-container.sh`
