#!/usr/bin/env bash
# Install the course's pinned Azure tooling (COURSE-PLAN.md, "Stack and pins"). Idempotent; usable
# as part of the cloud environment's setup script, after install-toolchain.sh.
#
#   Azure CLI  AZ_VERSION      in its own venv at /opt/azure-cli, linked as /usr/local/bin/az. It runs
#                              on the system python3, not the course's 3.14.9: the CLI is a tool the
#                              learner installs, not part of lc-exposure's code.
#   Azurite    AZURITE_VERSION Azure Storage's emulator (Blob API only — no hierarchical namespace),
#                              at /opt/azurite, linked as /usr/local/bin/azurite-blob
#   Bicep      BICEP_VERSION   installed by the CLI itself (`az bicep install --version`), so
#                              `az bicep build` and `az deployment` use the pinned one
set -euo pipefail
AZ_VERSION="${AZ_VERSION:-2.91.0}"
AZURITE_VERSION="${AZURITE_VERSION:-3.37.0}"
BICEP_VERSION="${BICEP_VERSION:-}"

if [[ "$(/opt/azure-cli/bin/pip show azure-cli 2>/dev/null | sed -n 's/^Version: //p')" != "$AZ_VERSION" ]]; then
  rm -rf /opt/azure-cli
  /usr/bin/python3 -m venv /opt/azure-cli
  /opt/azure-cli/bin/pip install -q --disable-pip-version-check "azure-cli==${AZ_VERSION}"
fi
ln -sf /opt/azure-cli/bin/az /usr/local/bin/az

if [[ "$(cat /opt/azurite/node_modules/azurite/package.json 2>/dev/null | sed -n 's/.*"version": "\(.*\)".*/\1/p')" != "$AZURITE_VERSION" ]]; then
  rm -rf /opt/azurite && mkdir -p /opt/azurite
  npm install --silent --prefix /opt/azurite "azurite@${AZURITE_VERSION}" >/dev/null
fi
ln -sf /opt/azurite/node_modules/.bin/azurite-blob /usr/local/bin/azurite-blob

if [[ -n "$BICEP_VERSION" ]]; then az bicep install --version "v${BICEP_VERSION}" >/dev/null; fi

az version --query '"azure-cli"' -o tsv
azurite-blob --version
