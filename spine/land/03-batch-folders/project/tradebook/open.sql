-- What counts as open: an LC that is ISSUED, ACTIVE or AMENDED. Its amount is
-- exposure; EXPIRED, CLOSED and CANCELLED carry none. Never across currencies.
SELECT currency, count(*) AS open_lcs, sum(amount) AS exposure
FROM lc_deals
WHERE status IN ('ISSUED', 'ACTIVE', 'AMENDED')
GROUP BY currency
ORDER BY currency;
