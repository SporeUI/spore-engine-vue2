#!/bin/sh
branch=$(git rev-parse --symbolic --abbrev-ref HEAD)
if [ "master" == "$branch" ]; then
  echo ".git/hooks: 不允许 commit 到 $branch 分支"
  exit 1
fi
