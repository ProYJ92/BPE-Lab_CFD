# BPE-Lab CFD

This repository hosts materials for the BPE-Lab CFD website.

> **비용 관리:**
> Cloud Translation API는 월 50 만 자 무료 한도가 있습니다. 초과 시 과금되므로 Google Cloud Billing에서 예산 알림을 설정하세요.

## i18n automation

GitHub Actions automatically keeps the Korean translation files up to date:

* **Workflow** – `i18n_full.yml` runs on pushes to `main` and skips branches
  under `i18n/**`.
* **No diff** – the script exits early with `--skip-if-no-diff` when no HTML or
  Markdown files changed.
* **Pull requests** – a bot opens PRs titled "♻️ i18n JSON 업데이트" whenever new
  JSON files are committed.

