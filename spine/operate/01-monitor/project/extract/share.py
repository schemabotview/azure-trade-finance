"""A link that reads ONE reference file for a few hours: a user delegation SAS.

    python extract/share.py group_limits 2026-10-31

Signed with a key Azure lends to Ana's identity, never with an account key
(the account has none): the link names who signed it, and expires.
"""
import os
import sys
from datetime import datetime, timedelta, timezone

from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobSasPermissions, BlobServiceClient
from azure.storage.blob import generate_blob_sas

name, as_of = sys.argv[1], sys.argv[2]
container, blob = "reference", f"{name}/as_of={as_of}/{name}.csv"
service = BlobServiceClient(os.environ["LAKE_URL"],
                            credential=DefaultAzureCredential())
start = datetime.now(timezone.utc)
expiry = start + timedelta(hours=4)
key = service.get_user_delegation_key(start, expiry)
sas = generate_blob_sas(service.account_name, container, blob,
                        user_delegation_key=key, expiry=expiry,
                        permission=BlobSasPermissions(read=True))
print(f"{os.environ['LAKE_URL']}/{container}/{blob}?{sas}")
