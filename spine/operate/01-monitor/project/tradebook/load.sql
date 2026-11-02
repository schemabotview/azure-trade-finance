-- Seed the local copy from tradebook_gen's files (data/tradebook/).
\copy counterparty FROM 'data/tradebook/counterparties.csv' CSV HEADER
\copy lc_deals FROM 'data/tradebook/lc_deals.csv' CSV HEADER
\copy lc_amendments FROM 'data/tradebook/lc_amendments.csv' CSV HEADER
