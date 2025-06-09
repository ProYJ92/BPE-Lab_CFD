# BPE-Lab CFD

This repository hosts materials for the BPE-Lab CFD website.

> **비용 관리:**
> Cloud Translation API는 월 50 만 자 무료 한도가 있습니다. 초과 시 과금되므로 Google Cloud Billing에서 예산 알림을 설정하세요.

## i18n automation

The `i18n_full.yml` workflow runs only on pushes to the `main` branch and
explicitly ignores branches under `i18n/**`. The underlying script is invoked
with the `--skip-if-no-diff` flag so it will exit early when no HTML or Markdown files have
changed, printing a message that the update was skipped. Pull requests titled
"♻️ i18n JSON 업데이트" are opened automatically whenever new translation files
are committed.

