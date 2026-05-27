#!/usr/bin/env bash
set -euo pipefail

API_URL="${1:-http://localhost:8081/api/v1}"

echo "Running smoke tests against $API_URL"

check() {
  local name="$1"
  local url="$2"
  local expected="${3:-200}"
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  if [ "$status" = "$expected" ]; then
    echo "✓ $name ($status)"
  else
    echo "✗ $name (expected $expected, got $status)"
    exit 1
  fi
}

check "Health" "$API_URL/health"
check "Products" "$API_URL/products"
check "Categories" "$API_URL/categories"
check "Events" "$API_URL/events"
check "Hero Slides" "$API_URL/hero-slides"
check "Stats" "$API_URL/stats"
check "Features" "$API_URL/features"

echo ""
echo "All smoke tests passed."
