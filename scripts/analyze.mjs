import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { causeOf, groupByCause, uniqueById } from '../src/lib/kb/causes.ts';

const data = new URL('../src/lib/data/', import.meta.url);
export const raw = JSON.parse(readFileSync(new URL('reports-4471.json', data), 'utf8'));
export const reports = uniqueById(raw).filter((r) => r.mergedInto === 4471);
export const notes = JSON.parse(readFileSync(new URL('desk-notes.json', data), 'utf8'));
export const tenants = new Map(readdirSync(new URL('tenants/', data))
  .filter((name) => name.endsWith('.json'))
  .map((name) => JSON.parse(readFileSync(new URL(`tenants/${name}`, data), 'utf8')))
  .map((tenant) => [tenant.handle, tenant]));
export const tenantOf = (report) => tenants.get(report.tenant);

export function analysis() {
  const counts = new Map();
  for (const r of raw) counts.set(r.id, (counts.get(r.id) ?? 0) + 1);
  const conflicts = raw.filter((r) => raw.some((other) =>
    other.id === r.id && JSON.stringify(other) !== JSON.stringify(r)));
  if (conflicts.length) throw new Error('Conflicting versions of duplicate report IDs need review');
  const anomalies = new Set(notes.oneDayMove);
  const groups = groupByCause(reports, tenantOf);
  return {
    rawRows: raw.length,
    uniqueReports: reports.length,
    duplicateRows: raw.length - uniqueById(raw).length,
    duplicateIds: [...counts].filter(([, n]) => n > 1).map(([id]) => id),
    receivedFrom: reports.map((r) => r.receivedAt).sort()[0],
    receivedThrough: reports.map((r) => r.receivedAt).sort().at(-1),
    latestMerge: reports.map((r) => r.mergedAt).filter(Boolean).sort().at(-1),
    groups: groups.map((g) => ({
      cause: g.cause,
      reports: g.reports.length,
      taggedAs: g.taggedAs,
      tenants: g.tenants,
      firstSeen: g.firstSeen,
      lastSeen: g.lastSeen,
      intakeDisagreements: g.reports.filter((r) => r.meta.intakeTag !== g.cause).map((r) => r.id),
      reviewNeeded: g.reports.filter((r) => anomalies.has(r.id)).map((r) => r.id),
      reportIds: g.reports.map((r) => r.id),
    })),
    reviewNeeded: reports.filter((r) => anomalies.has(r.id)).map((r) => ({
      id: r.id, tenant: r.tenant, channel: r.channel,
      deskCause: causeOf(r, tenantOf(r)), body: r.body,
    })),
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(analysis(), null, 2));
}
