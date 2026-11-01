#!/usr/bin/env bash
# Terraform's state needs a home before Terraform can run: a storage account
# made once with the CLI, outside the state it will hold (Course 3, §5).
set -euo pipefail
rg=rg-tradefin-tfstate account=sttradefintfstate
az group create -n $rg -l uksouth -o none \
  --tags app=lc-exposure owner=trade-risk
az storage account create -n $account -g $rg --sku Standard_LRS \
  --allow-shared-key-access false --min-tls-version TLS1_2 -o none
az storage container-rm create --storage-account $account -n tfstate -o none
# Reading state is data access: the signed-in identity needs a data role.
# Its object id and kind come from its own token (no directory lookup).
claims=$(az account get-access-token --query accessToken -o tsv | cut -d. -f2)
read -r me kind < <(python3 -c 'import base64, json, sys
s = sys.argv[1]
c = json.loads(base64.urlsafe_b64decode(s + "=" * (-len(s) % 4)))
kind = "ServicePrincipal" if c.get("idtyp") == "app" else "User"
print(c["oid"], kind)' "$claims")
az role assignment create --role "Storage Blob Data Contributor" \
  --assignee-object-id "$me" --assignee-principal-type "$kind" \
  --scope "$(az storage account show -n $account --query id -o tsv)" -o none
# A new role takes a minute or two to reach the data plane: wait for it.
for _ in $(seq 30); do
  az storage blob list -c tfstate --account-name $account --auth-mode login \
    -o none 2>/dev/null && exit 0
  sleep 10
done
echo "the data role did not arrive" >&2; exit 1
