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

모든 Pull Request는 **DESIGN_GUIDE.md**를 숙지한 후 아래 명령으로 사전 검증을 통과해야 합니다:

```bash
npm install
npm run codex:test
```

CI 검증에 실패하면 병합되지 않으므로, 오류 로그를 참고해 수정해 주세요.

