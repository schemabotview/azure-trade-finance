-- TradeBook: the trade finance desk's system of record. A local copy,
-- seeded by tradebook_gen; on the desk it is the bank's own PostgreSQL.
CREATE TABLE counterparty (
    counterparty_id text PRIMARY KEY,
    name            text NOT NULL,
    country         char(2) NOT NULL
);

-- One row per letter of credit: its CURRENT version.
CREATE TABLE lc_deals (
    lc_id          text PRIMARY KEY,
    applicant_id   text NOT NULL REFERENCES counterparty,
    beneficiary    text NOT NULL,
    currency       char(3) NOT NULL,
    amount         numeric(18,2) NOT NULL,
    status         text NOT NULL CHECK (status IN ('ISSUED', 'ACTIVE',
                       'AMENDED', 'EXPIRED', 'CLOSED', 'CANCELLED')),
    issue_date     date NOT NULL,
    expiry_date    date NOT NULL,
    source_version integer NOT NULL,
    updated_at     timestamptz NOT NULL
);
CREATE INDEX lc_deals_updated_at ON lc_deals (updated_at);

-- Every version an LC has had: the history behind lc_deals.
CREATE TABLE lc_amendments (
    lc_id          text NOT NULL REFERENCES lc_deals,
    source_version integer NOT NULL,
    amount         numeric(18,2) NOT NULL,
    status         text NOT NULL,
    changed_at     timestamptz NOT NULL,
    PRIMARY KEY (lc_id, source_version)
);
