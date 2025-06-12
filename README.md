# BPE-Lab CFD

This repository hosts materials for the BPE-Lab CFD website.

## Local Development

The site can be served using the provided `server.js`. The server reads the
protected resource password from the `ACCESS_PASSWORD` environment variable and
exposes an endpoint used by the frontend for validation.

For development without network access, place an archive of your
`node_modules` directory at `offline_cache/node_modules.tar.gz` and
restore dependencies before running any npm scripts:

```bash
./scripts/restore-modules.sh
npm ci --offline --ignore-scripts
```

```bash
ACCESS_PASSWORD=bioprocess2025 node server.js
```

The site will be available at `http://localhost:3000` by default.


## License

This project is licensed under the [MIT License](LICENSE).


