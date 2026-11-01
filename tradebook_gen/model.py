"""Syndica Bank's TradeBook: every letter of credit's whole history, generated from one seed.

The generator builds the FINAL world first — every LC with every version it will ever have up to the
end of the business date — and the files are cuts of it in time:

  the seed       each LC's latest version at SEED_CUTOFF (02:00 on the business date, when batch
                 41 ran): what TradeBook holds when Course 3 loads it
  the desk's day every version stamped during BUSINESS_DATE, as SQL the desk's application would
                 have run: applied between Course 5's batch 41 and batch 42 (`desk-<date>.sql`)

Every planted fact the course teaches with is a named constant here and asserted by verify.py
(COURSE-PLAN.md, "The data" and "Facts"). Standard library only. Same seed, same bytes.
"""
from __future__ import annotations

import random
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

SEED = 20261031
UTC = timezone.utc
BUSINESS_DATE = date(2026, 10, 31)
SEED_CUTOFF = datetime(2026, 10, 31, 2, 0, tzinfo=UTC)      # batch 41's window end
WINDOW_END = datetime(2026, 11, 1, 2, 0, tzinfo=UTC)        # batch 42's: tr_nightly_0200
FIRST_ISSUE = date(2026, 1, 5)
M = Decimal('1000000')

OPEN = ('ISSUED', 'ACTIVE', 'AMENDED')                      # exposure = amount
CLOSED = ('EXPIRED', 'CLOSED', 'CANCELLED')                 # exposure = 0

# ── counterparties (TradeBook's applicants) and the risk team's groups ──────────────────────────
# TradeBook knows legal entities; only the risk team's reference file knows which group each
# belongs to. UNMAPPED is in TradeBook but missing from that file (G3, §9.7–9.8).
COUNTERPARTIES = [
    ('CP-1101', 'Woodgrove Retail Ltd', 'GB', 'Woodgrove'),
    ('CP-1102', 'Woodgrove Foods plc', 'GB', 'Woodgrove'),
    ('CP-1103', 'Woodgrove Asia Pte Ltd', 'SG', 'Woodgrove'),
    ('CP-1201', 'Contoso Pharmaceuticals Inc', 'US', 'Contoso'),
    ('CP-1202', 'Contoso GmbH', 'DE', 'Contoso'),
    ('CP-1203', 'Contoso Logistics BV', 'NL', 'Contoso'),
    ('CP-1301', 'Fabrikam Textiles SA', 'FR', 'Fabrikam'),
    ('CP-1302', 'Fabrikam Iberia SL', 'ES', 'Fabrikam'),
    ('CP-1401', 'Northwind Traders Inc', 'US', 'Northwind'),
    ('CP-1402', 'Northwind Marine Ltd', 'GB', 'Northwind'),
    ('CP-1403', 'Northwind Energy Corp', 'CA', 'Northwind'),
    ('CP-1501', 'Tailspin Imports Ltd', 'GB', None),
]
UNMAPPED = 'CP-1501'
GROUP_LIMITS = [  # (group, currency, limit) — group_limits.csv
    ('Woodgrove', 'USD', Decimal('10000000.00')),
    ('Contoso', 'USD', Decimal('6000000.00')),
    ('Contoso', 'EUR', Decimal('4000000.00')),
    ('Fabrikam', 'EUR', Decimal('3000000.00')),
    ('Northwind', 'USD', Decimal('8000000.00')),
]
CURRENCIES = {g: [c for gg, c, _ in GROUP_LIMITS if gg == g] for g, _, _ in GROUP_LIMITS}

# ── the answer (Facts: "the answer") ─────────────────────────────────────────────────────────────
ANSWER_LC = 'LC-2041'                                   # v1 2.0m at the seed → v2 2.2m on the day
ANSWER_V1, ANSWER_V2 = Decimal('2000000.00'), Decimal('2200000.00')
WOODGROVE_OPEN = {ANSWER_LC: ANSWER_V2, 'LC-2087': Decimal('5000000.00'), 'LC-2133': Decimal('2500000.00')}
WOODGROVE_GROSS = Decimal('9700000.00')
UNMAPPED_LC, UNMAPPED_AMOUNT = 'LC-2299', Decimal('1200000.00')  # the 1.2m an inner join loses
# Open exposure per (group, currency) at the end of the day, for the groups the course does not
# quote line by line. Fabrikam EUR is over its 3.0m limit (breach = Yes, §10.5); the rest are under.
OPEN_TARGETS = {
    ('Contoso', 'USD'): Decimal('4850000.00'),
    ('Contoso', 'EUR'): Decimal('3100000.00'),
    ('Fabrikam', 'EUR'): Decimal('3420000.00'),
    ('Northwind', 'USD'): Decimal('6300000.00'),
}

# ── sizes ────────────────────────────────────────────────────────────────────────────────────────
SEED_LCS = 400                     # LC-2001 … LC-2400 exist at SEED_CUTOFF: batch 41's full load
DAY_NEW = 18                       # LC-2401 … LC-2418 issued on the business date
DAY_AMENDED = 70                   # existing open LCs amended on the day
DAY_CLOSED = 32                    # existing open LCs closed or expired on the day
BATCH_42_ROWS = DAY_NEW + DAY_AMENDED + DAY_CLOSED  # = 120: lc_deals rows changed in the window
# §5.6's race: three LCs the desk amends at 02:00:07 on 1 November — after the window's end, while
# batch 42 is copying. Northwind's, so the branch touches no number the course quotes.
LATE_AMENDED = ('LC-2310', 'LC-2316', 'LC-2322')
LATE_AT = datetime(2026, 11, 1, 2, 0, 7, tzinfo=UTC)


@dataclass
class Version:
    version: int
    amount: Decimal
    status: str
    at: datetime


@dataclass
class LC:
    lc_id: str
    applicant_id: str
    beneficiary: str
    currency: str
    issue_date: date
    expiry_date: date
    versions: list[Version] = field(default_factory=list)

    def at(self, cutoff: datetime) -> Version | None:
        """The version current at `cutoff` (the latest stamped at or before it)."""
        seen = [v for v in self.versions if v.at <= cutoff]
        return seen[-1] if seen else None


BENEFICIARIES = [
    'Shenzhen Brightway Electronics', 'Gujarat Cotton Mills', 'Hanoi Garment Export JSC', 'Izmir Dried Fruits AS',
    'Santos Coffee Trading SA', 'Busan Marine Parts Co', 'Valencia Citrus Export SL', 'Penang Semiconductor Sdn Bhd',
    'Rotterdam Steel Trading BV', 'Lagos Cocoa Processors Ltd', 'Monterrey Auto Components', 'Chittagong Knitwear Ltd',
]


def business_time(r: random.Random, d: date, start: int = 8, end: int = 19) -> datetime:
    return datetime(d.year, d.month, d.day, tzinfo=UTC) + timedelta(seconds=r.randrange(start * 3600, end * 3600))


def amount(r: random.Random, low: int, high: int) -> Decimal:
    """A round amount in thousands: LCs are issued for round sums."""
    return Decimal(r.randrange(low // 1000, high // 1000 + 1) * 1000).quantize(Decimal('0.01'))


def build(seed: int = SEED) -> list[LC]:
    r = random.Random(seed)
    span = (BUSINESS_DATE - FIRST_ISSUE).days
    mapped = [c for c in COUNTERPARTIES if c[3]]
    lcs: list[LC] = []

    def new(n: int, cpty: tuple, ccy: str, issued: date) -> LC:
        return LC(f'LC-{n}', cpty[0], r.choice(BENEFICIARIES), ccy, issued, issued + timedelta(days=r.choice((90, 120, 180, 270))))

    # 1. the seed's LCs, issued between FIRST_ISSUE and the day before the business date
    planted = {ANSWER_LC: 'CP-1101', 'LC-2087': 'CP-1102', 'LC-2133': 'CP-1103', UNMAPPED_LC: UNMAPPED}
    for n in range(2001, 2001 + SEED_LCS):
        lc_id = f'LC-{n}'
        if lc_id in planted:
            cpty = next(c for c in COUNTERPARTIES if c[0] == planted[lc_id])
            ccy = 'USD'
        elif lc_id in LATE_AMENDED:
            cpty, ccy = next(c for c in COUNTERPARTIES if c[0] == 'CP-1401'), 'USD'
        else:
            cpty = r.choice(mapped)
            ccy = r.choice(CURRENCIES[cpty[3]])
        issued = FIRST_ISSUE + timedelta(days=r.randrange(span - 1))
        if lc_id == ANSWER_LC:
            issued = date(2026, 10, 12)
        lc = new(n, cpty, ccy, issued)
        lc.versions.append(Version(1, amount(r, 50_000, 900_000), 'ISSUED', business_time(r, issued)))
        lcs.append(lc)

    # 2. history before the seed: most older LCs are advised (ACTIVE), some amended, many finished
    def stamp_after(lc: LC, latest: date) -> datetime:
        last = lc.versions[-1].at.date()
        if last >= latest:
            return business_time(r, latest)
        return business_time(r, last + timedelta(days=r.randrange(1, (latest - last).days + 1)))

    seed_day = SEED_CUTOFF.date() - timedelta(days=1)
    for lc in lcs:
        if lc.lc_id in planted or lc.lc_id in LATE_AMENDED:
            continue
        age = (seed_day - lc.issue_date).days
        if age > 7 and r.random() < 0.8:
            lc.versions.append(Version(2, lc.versions[-1].amount, 'ACTIVE', stamp_after(lc, seed_day)))
        if age > 20 and r.random() < 0.3:
            lc.versions.append(Version(len(lc.versions) + 1, amount(r, 50_000, 900_000), 'AMENDED', stamp_after(lc, seed_day)))
        if lc.expiry_date <= seed_day or (age > 40 and r.random() < 0.55):
            lc.versions.append(Version(len(lc.versions) + 1, lc.versions[-1].amount, r.choice(CLOSED), stamp_after(lc, seed_day)))
    fixed = {ANSWER_LC: ANSWER_V1, 'LC-2087': WOODGROVE_OPEN['LC-2087'], 'LC-2133': WOODGROVE_OPEN['LC-2133'],
             UNMAPPED_LC: UNMAPPED_AMOUNT}
    for lc_id in ('LC-2087', 'LC-2133', ANSWER_LC, UNMAPPED_LC, *LATE_AMENDED):
        lc = next(x for x in lcs if x.lc_id == lc_id)
        if lc_id in fixed:
            lc.versions[0].amount = fixed[lc_id]
        if lc_id in ('LC-2087', UNMAPPED_LC, *LATE_AMENDED):  # advised; LC-2133 and LC-2041 are still ISSUED
            lc.versions.append(Version(2, lc.versions[-1].amount, 'ACTIVE', stamp_after(lc, seed_day)))

    # 3. the desk's day: new LCs, amendments and closures, each LC changed at most once
    day = BUSINESS_DATE
    for i in range(DAY_NEW):
        cpty = r.choice([c for c in mapped if c[3] != 'Woodgrove'])
        lc = new(2001 + SEED_LCS + i, cpty, r.choice(CURRENCIES[cpty[3]]), day)
        lc.versions.append(Version(1, amount(r, 50_000, 600_000), 'ISSUED', business_time(r, day)))
        lcs.append(lc)
    answer = next(x for x in lcs if x.lc_id == ANSWER_LC)
    answer.versions.append(Version(2, ANSWER_V2, 'AMENDED', datetime(2026, 10, 31, 11, 42, 5, tzinfo=UTC)))
    untouchable = set(planted) | set(LATE_AMENDED)
    woodgrove = {c[0] for c in COUNTERPARTIES if c[3] == 'Woodgrove'}
    open_now = [lc for lc in lcs[:SEED_LCS] if lc.lc_id not in untouchable and lc.versions[-1].status in OPEN]
    # Woodgrove's other LCs: whatever is still open at the seed closes on the day, so the group's
    # open USD is exactly WOODGROVE_OPEN (Facts: "the answer").
    closing = [lc for lc in open_now if lc.applicant_id in woodgrove]
    rest = [lc for lc in open_now if lc.applicant_id not in woodgrove]
    r.shuffle(rest)
    closing += rest[:DAY_CLOSED - len(closing)]
    remaining = [lc for lc in rest if lc not in closing]
    # LC-2041 is one of the day's 70 amendments, and so are the three LCs of §5.6's race: they must
    # be IN batch 42's window for a later amendment to move them out of it
    late = [lc for lc in lcs if lc.lc_id in LATE_AMENDED]
    amending = late + remaining[:DAY_AMENDED - 1 - len(late)]
    for lc in closing:
        lc.versions.append(Version(len(lc.versions) + 1, lc.versions[-1].amount, r.choice(('CLOSED', 'EXPIRED')), business_time(r, day)))
    for lc in amending:
        lc.versions.append(Version(len(lc.versions) + 1, amount(r, 50_000, 900_000), 'AMENDED', business_time(r, day)))

    # 4. the amounts of the other groups' open LCs at the end of the day, set to OPEN_TARGETS: the
    # latest version's amount, so history stays as generated and only today's figures are fixed
    final = lambda lc: lc.versions[-1]
    for (group, ccy), target in OPEN_TARGETS.items():
        members = {c[0] for c in COUNTERPARTIES if c[3] == group}
        open_lcs = sorted((lc for lc in lcs if lc.applicant_id in members and lc.currency == ccy and final(lc).status in OPEN),
                          key=lambda lc: lc.lc_id)
        weights = [final(lc).amount for lc in open_lcs]
        total = sum(weights)
        shares = [(target * w / total / 1000).quantize(Decimal('1')) * 1000 for w in weights]
        shares[-1] += target - sum(shares)
        for lc, share in zip(open_lcs, shares):
            final(lc).amount = Decimal(share).quantize(Decimal('0.01'))
    return lcs


def counterparty_group_rows() -> list[dict]:
    return [{'counterparty_id': c, 'counterparty_name': n, 'group_name': g} for c, n, _, g in COUNTERPARTIES if g]


def group_limit_rows() -> list[dict]:
    return [{'group_name': g, 'currency': c, 'limit_amount': f'{a:.2f}'} for g, c, a in GROUP_LIMITS]
