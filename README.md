# BPE-Lab CFD

This repository hosts materials for the BPE-Lab CFD website.

> **비용 관리:**
> Cloud Translation API는 월 50 만 자 무료 한도가 있습니다. 초과 시 과금되므로 Google Cloud Billing에서 예산 알림을 설정하세요.

## Setup

1. In the Google Cloud Console open **IAM & Admin → Service Accounts**. Create a service account if needed and, from the **Keys** tab, click **Add Key → Create new key** in **JSON** format to download the file.
2. In this repository navigate to **Settings → Secrets and variables → Actions**. Create a secret named `GCLOUD_SERVICE_KEY` and paste the entire downloaded JSON.
3. Add another secret named `GCLOUD_PROJECT_ID` containing your Google Cloud project ID.
4. Optionally configure a budget alert in Google Cloud Billing to track API usage and prevent unexpected charges.

## i18n automation

* The `i18n_full.yml` workflow runs on pushes to `main` and ignores branches
  matching `i18n/**`.
* The translation script exits early when no HTML or Markdown files changed
  thanks to the `--skip-if-no-diff` flag.
* Bot commits open pull requests titled "♻️ i18n JSON 업데이트" whenever new
  translation files are added.


## Supported languages

Currently the website is localized into the following languages:

- Korean (`ko`)
- English (`en`)
- Chinese (`zh`)


## Using data-i18n attributes

Wrap any new text in an element with `data-i18n="yourKey"` or assign it an ID.
The translation script automatically collects these strings and updates
`assets/i18n/*.json` when run:

```bash
python scripts/i18n_full_auto.py --skip-if-no-diff
```

Commit the regenerated JSON files and HTML changes.
