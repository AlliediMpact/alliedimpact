#!/bin/bash

# Script to move all pages from /app/* to /app/[locale]/*
# Preserves the directory structure

cd /workspaces/coinbox-ai/src/app

# Find all directories and page files (excluding [locale], api, and already processed ones)
find . -type f \( -name "page.tsx" -o -name "page.ts" -o -name "page.jsx" -o -name "page.js" \) \
  -not -path "./\[locale\]/*" \
  -not -path "./api/*" \
  -not -path "./_*" \
  -not -path "./page.tsx" \
  -not -path "./layout.tsx" \
  -not -path "./error.tsx" \
  -not -path "./not-found.tsx" \
  -not -path "./loading.tsx" | while read -r file; do
  
  # Get the directory path relative to src/app
  dir=$(dirname "$file")
  
  # Create the corresponding directory in [locale] if it doesn't exist
  if [ "$dir" != "." ]; then
    mkdir -p "\[locale\]/$dir"
    echo "Moving $file to \[locale\]/$file"
    mv "$file" "\[locale\]/$file"
  fi
done

echo "✓ Page files moved to [locale] structure"
echo "Note: Root page.tsx and layout.tsx were intentionally kept in /app"
