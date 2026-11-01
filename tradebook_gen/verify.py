"""Assert every planted fact (COURSE-PLAN.md, "The data" and "Facts") is really in the data.

A lesson is built on each of these; a generator change that loses one fails here, not on screen.
Later courses' faults (G2's malformed rows, the re-sent file, the late older version, G4's bug) are
planted by the pipeline steps that meet them, not by TradeBook, and are asserted there.
"""
from __future__ import annotations

from collections import Counter, defaultdict
from decimal import Decimal

from .model import (ANSWER_LC, ANSWER_V1, ANSWER_V2, BATCH_42_ROWS, COUNTERPARTIES, GROUP_LIMITS, LATE_AMENDED,
                    OPEN, OPEN_TARGETS, SEED_CUTOFF, SEED_LCS, UNMAPPED, UNMAPPED_AMOUNT, UNMAPPED_LC, WINDOW_END,
                    WOODGROVE_GROSS, WOODGROVE_OPEN, build)


def verify() -> int:
    lcs = build()
    problems: list[str] = []
    ok: list[str] = []

    def check(cond: bool, good: str, bad: str) -> None:
        (ok if cond else problems).append(good if cond else bad)

    group = {c: g for c, _, _, g in COUNTERPARTIES}
    seed = [lc for lc in lcs if lc.at(SEED_CUTOFF)]
    check(len(seed) == SEED_LCS, f'batch 41 (full load at {SEED_CUTOFF:%Y-%m-%d %H:%M}): {len(seed)} LCs',
          f'the seed holds {len(seed)} LCs, not {SEED_LCS}')
    changed = [lc for lc in lcs if any(SEED_CUTOFF < v.at <= WINDOW_END for v in lc.versions)]
    check(len(changed) == BATCH_42_ROWS, f'batch 42 window: {len(changed)} lc_deals rows changed',
          f'{len(changed)} LCs change in batch 42\'s window, not {BATCH_42_ROWS}')
    twice = [lc.lc_id for lc in lcs if sum(SEED_CUTOFF < v.at <= WINDOW_END for v in lc.versions) > 1]
    check(not twice, 'no LC changes twice in the window', f'LCs changed twice in the window: {twice}')

    answer = next(lc for lc in lcs if lc.lc_id == ANSWER_LC)
    v1, v2 = answer.at(SEED_CUTOFF), answer.at(WINDOW_END)
    check(v1.version == 1 and v1.amount == ANSWER_V1 and v2.version == 2 and v2.amount == ANSWER_V2 and v2.status == 'AMENDED',
          f'{ANSWER_LC}: v1 {v1.amount} at the seed → v2 {v2.amount} AMENDED on the day', f'{ANSWER_LC} is not v1 2.0m → v2 2.2m')

    exposure: dict[tuple[str, str], Decimal] = defaultdict(Decimal)
    open_lcs: dict[tuple[str, str], list[str]] = defaultdict(list)
    for lc in lcs:
        v = lc.at(WINDOW_END)
        if v.status in OPEN:
            exposure[(group[lc.applicant_id], lc.currency)] += v.amount
            open_lcs[(group[lc.applicant_id], lc.currency)].append(lc.lc_id)
    wg = exposure[('Woodgrove', 'USD')]
    check(sorted(open_lcs[('Woodgrove', 'USD')]) == sorted(WOODGROVE_OPEN) and wg == WOODGROVE_GROSS,
          f'Woodgrove USD: open {", ".join(sorted(WOODGROVE_OPEN))} = {wg} (limit 10.0m → 97%)',
          f'Woodgrove USD is {open_lcs[("Woodgrove", "USD")]} = {wg}, not 2.2m + 5.0m + 2.5m = 9.7m')
    check(set(k for k in exposure if k[0]) <= {(g, c) for g, c, _ in GROUP_LIMITS},
          'every open (group, currency) has a limit', f'open exposure without a limit: {set(exposure) - {(g, c) for g, c, _ in GROUP_LIMITS}}')
    for key, target in OPEN_TARGETS.items():
        check(exposure[key] == target, f'{key[0]} {key[1]}: open {exposure[key]}', f'{key[0]} {key[1]} is {exposure[key]}, not {target}')
    limits = {(g, c): a for g, c, a in GROUP_LIMITS}
    breaches = sorted(f'{g} {c}' for (g, c), e in exposure.items() if g and e > limits[(g, c)])
    check(breaches == ['Fabrikam EUR'], 'breach: Fabrikam EUR only', f'groups over their limit: {breaches}, not Fabrikam EUR only')
    check(len(set(exposure)) == 6 and ('Contoso', 'USD') in exposure and ('Contoso', 'EUR') in exposure,
          'Contoso holds USD and EUR LCs (never summed)', 'Contoso does not hold both USD and EUR')

    unmapped = next(lc for lc in lcs if lc.lc_id == UNMAPPED_LC)
    check(unmapped.applicant_id == UNMAPPED and group[UNMAPPED] is None and unmapped.at(WINDOW_END).status in OPEN
          and unmapped.at(WINDOW_END).amount == UNMAPPED_AMOUNT,
          f'{UNMAPPED_LC}: {UNMAPPED} has no group, open {UNMAPPED_AMOUNT}', f'{UNMAPPED_LC} is not an open 1.2m LC of an unmapped counterparty')
    closed = Counter(lc.at(WINDOW_END).status for lc in lcs if lc.at(WINDOW_END).status not in OPEN)
    check(closed['CLOSED'] > 0, f'closed LCs stay in the data: {dict(sorted(closed.items()))}', 'no CLOSED LC')
    late = [lc for lc in lcs if lc.lc_id in LATE_AMENDED]
    check(all(group[lc.applicant_id] == 'Northwind' and lc.at(WINDOW_END).status in OPEN and lc in changed for lc in late),
          f'§5.6 race: {", ".join(LATE_AMENDED)} are open Northwind LCs changed in the window', 'the late-amended LCs are not open Northwind LCs changed in batch 42\'s window')

    for line in ok:
        print(f'✓ {line}')
    for line in problems:
        print(f'✗ {line}')
    print(f"{'✗' if problems else '✓'} {len(ok)} planted fact(s) hold, {len(problems)} problem(s)")
    return 1 if problems else 0
