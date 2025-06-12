# Contributor Guidelines

## 5. 테스트 & 품질
| 단계 | 명령 |
| --- | --- |
| Deps(오프라인) | `./scripts/restore-modules.sh && npm ci --offline --ignore-scripts` |
| Lint | `npm run lint:js && npm run lint:css` |
| HTML | `npm run validate:html && npm run check:links -- --offline` |
| Test | `npm run build:search` |

`offline_cache/node_modules.tar.gz` is not tracked in the repository. Provide
the archive locally before running the restore script.
## 7. 체크리스트
- [ ] node_modules 오프라인 복원 완료 (`./scripts/restore-modules.sh`)

## 수정 히스토리
- v0.2: 오프라인 캐시 도입
