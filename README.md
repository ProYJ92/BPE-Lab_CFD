# BPE-Lab CFD

This repository hosts materials for the BPE-Lab CFD website.

> **비용 관리:**
> Cloud Translation API는 월 50 만 자 무료 한도가 있습니다. 초과 시 과금되므로 Google Cloud Billing에서 예산 알림을 설정하세요.

## i18n automation

The repository uses GitHub Actions to keep the Korean translation files up to
date.  The process works as follows:

* **Trigger conditions** – `i18n_full.yml` runs whenever a commit is pushed to
  `main` and it explicitly ignores branches matching `i18n/**`.
* **Skipping unchanged content** – the script is called with
  `--skip-if-no-diff`, which exits early when no HTML or Markdown files were
  modified.
* **Automatic pull requests** – when new JSON files are generated, a bot
  creates a pull request titled "♻️ i18n JSON 업데이트".

