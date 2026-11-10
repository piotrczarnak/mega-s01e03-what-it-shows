# booking-v3 date hint contradicts day-first tenant input — 33 reports in the export

## Count and scope

**33 unique reports**, all form-channel reports from day-first tenants running
`booking-v3`: Alder Physio (`de-DE`), Copper Studio (`es-ES`) and Pale Harbour
(`pt-PT`). Received 2026-04-17 through 2026-09-22 in this exported snapshot.
This is not a live count. The other 379 IDs belong to the desk's parser grouping.

Collapse duplicate export rows by ID, filter to #4471, look up tenant locale and
form version, then use the original `causeOf` rules. Of these 33 reports, intake
tags 15 as `parser` and 18 as `hint`; grouping by intake would miss much of this
problem. Full membership is in `evidence/analysis.json`; run `npm run analyze`.

## Observed problem and mechanism

`booking-v3` prints `MM/DD/YYYY` below the field, but the form reads dates using
the tenant's day-first convention. A person following the hint types month first,
so the form interprets the opposite date. This is a mismatch between the UI hint
and the input contract, not the shared parser's month-first interpretation.

- `R-41230`: Copper Studio form, `es-ES`, v3: intended 6 January appears as 1 June;
  intake misleadingly says `parser`.
- `R-41241`: Alder Physio form, `de-DE`, v3: intended 6 August appears as 8 June.
- `R-41294`: Pale Harbour form, `pt-PT`, v3: 5 November appears as 11 May.
- Mechanism: `DATE_HINT`, `causeOf`, and tenant definitions in the export.

App/email reports from the same tenants are **not** included: their input path
does not use the v3 form hint. Matching subjects do not make these one issue.

## Proposed correction

Generate the hint, example, validation and parsing from one explicit tenant date
contract. For day-first tenants the hint must say `DD/MM/YYYY`. Do not change
parsing to conform to a misleading hard-coded hint.

## Acceptance criteria (proposed product tests)

- All day-first v3 tenant hints and examples show day/month/year.
- Following that hint with `06/01/2026` books 6 January; stored value and invite agree.
- Test `de-DE`, `es-ES`, `pt-PT`, impossible dates and supported month-first locales.
- Regression-check v2 and app/email; do not mark the hint fixed based on a parser-only fix.

The production form is not included here. These are acceptance requirements,
not a claim that the product has been fixed or these checks have run against it.

## KB follow-up

Source: `src/routes/kb/incidents/4471-follow-up/+page.svx`.
Desk-facing render: `docs/kb/incidents/4471-follow-up/index.html`.
See proposed decision 0002 for cause-based deduplication; accepted decision 0001
is preserved unchanged and support has not yet accepted its replacement.
