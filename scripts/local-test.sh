#!/bin/bash
set -e

tidy -q -errors $(find . -name "*.html")
docker run --rm -v $PWD:/data ghcr.io/lycheeverse/lychee --offline ./
echo "로컬 서버: python3 -m http.server 후 브라우저 확인"
