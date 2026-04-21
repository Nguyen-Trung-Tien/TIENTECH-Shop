#!/bin/sh
set -eu

template="/usr/share/nginx/html/env-config.template.js"
output="/usr/share/nginx/html/env-config.js"

if [ -f "$template" ]; then
  envsubst < "$template" > "$output"
fi
