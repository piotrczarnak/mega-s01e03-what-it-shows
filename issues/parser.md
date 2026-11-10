# Shared date parser reads day-first dates as month-first — 379 reports in the export

## Count and scope

**379 unique reports** in the exported #4471 parser grouping, across 11 tenants.
Received 2026-04-01 through 2026-10-04. This is an exported snapshot, not a live count.
The separate booking-v3 form-hint issue covers 33 other IDs; the groups are disjoint.

Method: collapse overlapping export rows by ID, keep `mergedInto === 4471`,
look up each tenant's locale and form, and run `causeOf` from the original
`src/lib/kb/causes.ts`. Do not count `meta.intakeTag` or browser locale as cause.
There are 15 duplicate rows in the whole export. In this group, 23 reports are
intake-tagged `hint` but tenant/channel logic assigns them to `parser`.
Membership is reproducible in `evidence/analysis.json`; run `npm run analyze`.

## Observed problem and mechanism

The shared parser reads dates month first, but these tenants write day first.
The export assigns app/email reports and day-first `booking-v2` form reports
to this mechanism. A v3 tenant's app/email report still uses the parser path;
the v3 hint issue only applies to the form channel.

- `R-41200`: Harbour Dental, app, `en-GB`: 7 April becomes 4 July.
- `R-41248`: Long Table, form, `it-IT`, v2: agreed 8 May appears as 5 August.
- Source of mechanism: `causes.ts`, `locales.ts` and the tenant JSON files.

## Important uncertainty: five reports are filed here but not explained yet

The 379 count **includes**, rather than drops or double-counts, `R-41202`,
`R-41209`, `R-41236`, `R-41344`, and `R-41620`, as specified by the desk's
`oneDayMove` notes and current tenant-derived filing. Their bodies describe
one-day discrepancies, a June-only discrepancy, a premature invite, or a
Lisbon/Toronto difference. Their filing is not proof of this root cause.

Investigate their input, stored date/time, timezone and generated invite before
closing them with a parser fix or opening a further confirmed-cause issue.
No timezone/DST cause is established by the export. Full evidence is visible
on the follow-up page and in `evidence/analysis.json`.

## Proposed correction

Use a validated, explicit input format aligned with the tenant, and preserve an
unambiguous internal date. Do not infer tenant convention from browser locale.
Reject impossible dates clearly instead of silently converting them.

## Acceptance criteria (proposed product tests)

- Day-first `07/04/2026` yields 7 April, not 4 July, on app, email and v2 form paths.
- `13/04/2026` is accepted; impossible dates are rejected.
- Verify both stored booking and generated invite, including month-first regressions.
- Test separately from the booking-v3 hint; neither issue's fix proves the other fixed.
- Keep the five unresolved reports open for evidence-based re-triage.

The production parser is not included here, so these acceptance checks have not
been run against it. This ticket proposes a fix; it does not report a deployed one.

## KB follow-up

Source: `src/routes/kb/incidents/4471-follow-up/+page.svx`.
Desk-facing render: `docs/kb/incidents/4471-follow-up/index.html`.
The signed page explains counts, limitations, received-versus-merged timing and
the proposed replacement for subject-only deduplication.
