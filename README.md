# BPE-Lab CFD

This repository hosts materials for the BPE-Lab CFD website.

## Local Development

The site can be served using the provided `server.js`. The server reads the
protected resource password from the `ACCESS_PASSWORD` environment variable and
exposes an endpoint used by the frontend for validation.

```bash
ACCESS_PASSWORD=bioprocess2025 node server.js
```

The site will be available at `http://localhost:3000` by default.


## License

This project is licensed under the [MIT License](LICENSE).



## Contributing & CI

See [AGENTS.md](AGENTS.md) for workflow and coding guidelines.

