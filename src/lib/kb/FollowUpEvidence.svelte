<script lang="ts">
  import raw from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { groupByCause, uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  const unique = uniqueById(raw as Report[]);
  const reports = unique.filter((r) => r.mergedInto === 4471);
  const groups = groupByCause(reports, tenantOf);
  const uncertain = reports.filter((r) => notes.oneDayMove.includes(r.id));
  const disagree = groups.reduce((sum, g) =>
    sum + g.reports.filter((r) => r.meta.intakeTag !== g.cause).length, 0);
  const latestReceived = reports.map((r) => r.receivedAt).sort().at(-1);
  const latestMerged = reports.map((r) => r.mergedAt).filter(Boolean).sort().at(-1);
  const mergeDays = new Map<string, number>();
  for (const r of reports) {
    if (r.mergedAt) {
      const day = r.mergedAt.slice(0, 10);
      mergeDays.set(day, (mergeDays.get(day) ?? 0) + 1);
    }
  }
  const busiest = [...mergeDays].sort((a, b) => b[1] - a[1])[0];
</script>

<section aria-label="Snapshot and counting method">
  <p>
    The export has <strong>{raw.length}</strong> rows, representing
    <strong>{reports.length}</strong> unique reports merged into #4471.
    Deduplicating by report ID removes <strong>{raw.length - unique.length}</strong> overlapping rows.
    Equal subjects or equal bodies do not make two IDs one report.
  </p>
  <p>
    The tenant-derived cause disagrees with intake's tag for <strong>{disagree}</strong> reports.
    Counts below use the tenant directory, channel and booking-form version, not browser locale or intake guesses.
  </p>
  <p>
    Latest report in this snapshot: <time>{latestReceived}</time>.
    Latest merge: <time>{latestMerged}</time>.
    This is an exported snapshot, not a live connection to the desk.
  </p>
  {#if busiest}
    <p>
      The busiest merge day was <time>{busiest[0]}</time> with <strong>{busiest[1]}</strong> reports merged.
      A batch of merge events is not a batch of newly received reports.
    </p>
  {/if}
</section>

<h3>Reports that need a separate investigation</h3>
<p>
  The desk records <strong>{uncertain.length}</strong> unusual timing or one-day reports under the parser grouping.
  That is their current filing, not proof that month/day parsing explains their symptoms.
  Keep them counted once where filed, visibly flagged; do not silently discard them or claim a confirmed timezone cause.
  Ask for the original input, stored date/time, timezone, generated invite and expected result before deciding whether to split them further.
</p>
<table>
  <thead><tr><th>Report</th><th>Tenant / channel</th><th>Reported symptom</th></tr></thead>
  <tbody>
    {#each uncertain as r (r.id)}
      <tr><td><code>{r.id}</code></td><td>{r.tenant} / {r.channel}</td><td>{r.body}</td></tr>
    {/each}
  </tbody>
</table>
