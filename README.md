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



## Codex Pre-PR Verification
모든 PR 작성 전, 저장소 최상단에서 다음 명령으로 Codex 사전 점검을 실시하세요.

```bash
./scripts/codex-test.sh
```

Codex 테스트가 실패하면 PR을 제출하지 말고 먼저 문제를 수정해 주세요.

