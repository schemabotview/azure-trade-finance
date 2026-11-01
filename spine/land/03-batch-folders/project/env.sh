# Ana's environment for lc-exposure, sourced by her shell profile.
export PGDATABASE=tradebook
# The lake, on her laptop: Azurite, Azure Storage's emulator (Blob API only).
# Its account and key are the emulator's published development values, not a
# secret. On Azure there is no key at all: the account's URL and an identity.
export AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=http;\
AccountName=devstoreaccount1;\
AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/\
K1SZFPTOtr/KBHBeksoGMGw==;\
BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;"
