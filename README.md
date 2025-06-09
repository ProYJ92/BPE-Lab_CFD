# BPE-Lab CFD

This repository hosts materials for the BPE-Lab CFD website.

> **비용 관리:**
> Cloud Translation API는 월 50 만 자 무료 한도가 있습니다. 초과 시 과금되므로 Google Cloud Billing에서 예산 알림을 설정하세요.

## Setup

1. Generate a service account key JSON in Google Cloud. Navigate to **IAM & Admin → Service Accounts**, create a key in JSON format and download it.
2. Set the `GCLOUD_SERVICE_KEY` environment variable (or GitHub secret) to the downloaded JSON contents.
3. Set `GCLOUD_PROJECT_ID` to your Google Cloud project ID.
4. Optionally configure a budget alert in Google Cloud to avoid unexpected charges.

## i18n automation

* The `i18n_full.yml` workflow runs on pushes to `main` and ignores branches
  matching `i18n/**`.
* The translation script exits early when no HTML or Markdown files changed
  thanks to the `--skip-if-no-diff` flag.
* Bot commits open pull requests titled "♻️ i18n JSON 업데이트" whenever new
  translation files are added.

