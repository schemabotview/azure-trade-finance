-- One letter of credit's life, version by version: psql -v lc=LC-2052
SELECT source_version AS v, status, amount, changed_at::date AS changed
FROM lc_amendments
WHERE lc_id = :'lc'
ORDER BY source_version;
