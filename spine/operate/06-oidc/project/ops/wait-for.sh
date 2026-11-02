#!/usr/bin/env bash
# Run a command every 30 seconds until it prints something: a log that has
# not arrived yet, an alert that has not fired. 20 minutes at most.
#   bash ops/wait-for.sh <command ...>
for _ in $(seq 40); do
  out=$("$@" 2>/dev/null) && [ -n "$out" ] && break
  sleep 30
done
