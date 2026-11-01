#!/usr/bin/env bash
# Install the course's pinned Azure tooling (COURSE-PLAN.md, "Stack and pins"). Idempotent; usable
# as part of the cloud environment's setup script, after install-toolchain.sh.
#
#   Azure CLI  AZ_VERSION      in its own venv at /opt/azure-cli, linked as /usr/local/bin/az. It runs
#                              on the system python3, not the course's 3.14.9: the CLI is a tool the
#                              learner installs, not part of lc-exposure's code.
#   Azurite    AZURITE_VERSION Azure Storage's emulator (Blob API only — no hierarchical namespace),
#                              at /opt/azurite, linked as /usr/local/bin/azurite-blob
#   Terraform  TF_VERSION      HashiCorp's release zip, its SHA256 checked against the release's
#                              SHA256SUMS, at /usr/local/bin/terraform. The providers come from the
#                              registry at `terraform init`, pinned by infra/'s required_providers and
#                              the committed .terraform.lock.hcl.
set -euo pipefail
AZ_VERSION="${AZ_VERSION:-2.91.0}"
AZURITE_VERSION="${AZURITE_VERSION:-3.37.0}"
TF_VERSION="${TF_VERSION:-1.17.0}"

if [[ "$(/opt/azure-cli/bin/pip show azure-cli 2>/dev/null | sed -n 's/^Version: //p')" != "$AZ_VERSION" ]]; then
  rm -rf /opt/azure-cli
  /usr/bin/python3 -m venv /opt/azure-cli
  /opt/azure-cli/bin/pip install -q --disable-pip-version-check "azure-cli==${AZ_VERSION}"
fi
ln -sf /opt/azure-cli/bin/az /usr/local/bin/az

if [[ "$(sed -n 's/.*"version": "\(.*\)".*/\1/p' /opt/azurite/node_modules/azurite/package.json 2>/dev/null)" != "$AZURITE_VERSION" ]]; then
  rm -rf /opt/azurite && mkdir -p /opt/azurite
  npm install --silent --prefix /opt/azurite "azurite@${AZURITE_VERSION}" >/dev/null
fi
ln -sf /opt/azurite/node_modules/.bin/azurite-blob /usr/local/bin/azurite-blob

if ! terraform version 2>/dev/null | grep -qx "Terraform v${TF_VERSION}"; then
  work=$(mktemp -d)
  zip="terraform_${TF_VERSION}_linux_amd64.zip"
  base="https://releases.hashicorp.com/terraform/${TF_VERSION}"
  curl -fsSL -o "$work/$zip" "$base/$zip"
  curl -fsSL -o "$work/sums" "$base/terraform_${TF_VERSION}_SHA256SUMS"
  (cd "$work" && grep " ${zip}\$" sums | sha256sum -c --quiet)
  python3 -m zipfile -e "$work/$zip" "$work/out"
  install -m 755 "$work/out/terraform" /usr/local/bin/terraform
  rm -rf "$work"
fi

az version --query '"azure-cli"' -o tsv
azurite-blob --version
terraform version | head -1
