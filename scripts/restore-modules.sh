#!/usr/bin/env bash
set -e
mkdir -p node_modules
if [ -f offline_cache/node_modules.tar.gz ]; then
  tar -xzf offline_cache/node_modules.tar.gz
else
  echo "offline_cache/node_modules.tar.gz not found" >&2
fi
