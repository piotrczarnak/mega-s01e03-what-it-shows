# #4471 follow-up

This repository preserves the course's support-KB export and adds a signed,
evidence-based follow-up. This is fictional course data, not Allegro support data.
It contains no login links, credentials, browser profile or email-agent files.

## Later engineering disposition

After the course accepted the two tickets, its challenge page revealed an
engineering update: **#4471 closed 5 October 2026**. The parser is **fixed**
(`fix(dates): parse dd/mm for eu locales`); the form hint is **won't fix**
because `booking-v3` was retired. These are different outcomes. Retirement
does not mean the hint was corrected, and this repo does not independently
test the production parser fix. The unchanged ZIP did not contain this update.
The source and exact status text are recorded in
`src/lib/data/engineering-update.json` and rendered into the follow-up.
GitHub issue #1 is closed as completed; #2 is closed as not planned, with
explanatory comments linking those dispositions to the engineering update.

## Deliverables

- New page: `src/routes/kb/incidents/4471-follow-up/+page.svx`.
- New, **proposed** decision: `src/routes/kb/decisions/0002-dedupe-by-cause/+page.svx`.
- Existing accepted decision 0001 is unchanged.
- Generated desk-facing HTML: `docs/kb/incidents/4471-follow-up/index.html`.
- Reproducible count evidence and membership: `evidence/analysis.json`.
- One GitHub issue per demonstrated mechanism (body copies in `issues/`):
  [parser #1](https://github.com/piotrczarnak/mega-s01e03-what-it-shows/issues/1) and
  [form hint #2](https://github.com/piotrczarnak/mega-s01e03-what-it-shows/issues/2).

## Interpretation

Count unique report IDs, not rows, subjects or repeated text. Use the tenant's
locale and form version with the report channel; intake tags and browser locale
do not decide the cause. The current export's model yields 379 parser reports
and 33 form-hint reports, summing to 412; 15 overlapping rows are excluded.

The parser grouping includes five desk-noted unusual timing/one-day reports.
Their filing is not proof of their root cause. They remain visibly flagged for
investigation, counted once, rather than being dropped or presented as a
confirmed timezone bug. The JSON includes all five bodies and their IDs.

The source is an exported snapshot with reports through 4 October 2026. It is
not a live support feed. Regenerate after any source changes and recheck the
course export before submitting. Received and merged timestamps measure
different events; the merge spike is not evidence of an incident onset.

## Reproduce

Use Node 22.23 or later (the analysis imports the original TypeScript rules
using Node's type stripping). Install the pinned dependencies:

```sh
npm ci
npm test
npm run analyze
npm run render
python3 -m http.server 8763 --bind 127.0.0.1 --directory docs
```

Open `http://127.0.0.1:8763/kb/incidents/4471-follow-up/`. The render runs the
actual MDsveX pages and Svelte components, with their original aliases and
layout. The static artifact includes computed tables, chart, stale warnings
and the desk reference derived by `RenderStamp` from the page signature.
The generated browser assets hydrate the explorer's controls; the browser check
changes a tenant and subject and verifies the verdict updates. Report counts
remain an exported snapshot, not a live support feed. Serve `docs/` at the root
of a local HTTP server so the absolute KB links and `/assets/` URLs resolve.

## Limits

Tests check the exported classification logic and accounting. They do not run
the production booking parser or validate a production fix, which is not in
this export. New decision 0002 remains a proposal pending desk acceptance.
The old incident's “no ticket of its own” row describes the exported desk,
not whether a GitHub issue exists in this repository.

## Build dependency advisory

The installation audit reports a low-severity prototype-poisoning advisory in
`deepmerge`, inherited by `@sveltejs/vite-plugin-svelte` (two affected package
entries, one advisory; no fix available at installation). This is local build
tooling, not a dependency served by the generated site. Build configuration is
controlled locally; the build does not merge configuration received from visitors.
No automatic force-fix was applied. Recheck the advisory before reusing this
toolchain with untrusted configuration or as a network-facing build service.
