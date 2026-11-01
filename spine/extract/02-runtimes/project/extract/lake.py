"""The lake, through Azure Storage's Blob API: Azurite here, ADLS on Azure."""
import os

from azure.storage.blob import BlobServiceClient, ContainerClient


def container(name: str) -> ContainerClient:
    conn = os.environ.get("AZURE_STORAGE_CONNECTION_STRING")
    if conn:  # Azurite: the emulator's development account
        service = BlobServiceClient.from_connection_string(conn)
    else:  # Azure: the account's URL and the identity's token, no key
        from azure.identity import DefaultAzureCredential

        service = BlobServiceClient(os.environ["LAKE_URL"],
                                    credential=DefaultAzureCredential())
    return service.get_container_client(name)
