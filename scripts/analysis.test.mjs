import assert from 'node:assert/strict';
import { test } from 'node:test';
import { causeOf, dayFirst, sameCause, uniqueById } from '../src/lib/kb/causes.ts';
import { analysis, raw, reports, tenants, tenantOf, notes } from './analyze.mjs';

test('overlapping export pages count once by report ID, not subject or body', () => {
  assert.equal(raw.length, 427);
  assert.equal(reports.length, 412);
  assert.equal(analysis().duplicateRows, 15);
  assert.equal(new Set(reports.map((r) => r.id)).size, reports.length);
  assert.equal(uniqueById([{ id: 'A', value: 1 }, { id: 'A', value: 2 }])[0].value, 2);
});

test('all source reports belong to #4471 and have known tenant configurations', () => {
  assert.ok(raw.every((r) => r.mergedInto === 4471));
  assert.ok(reports.every((r) => tenantOf(r)));
  assert.ok([...tenants.values()].every((t) => dayFirst(t.locale)));
});

test('form version and tenant locale determine cause, not browser locale or intake tag', () => {
  const sample = { channel: 'form', meta: { browserLocale: 'en-US', intakeTag: 'parser' } };
  assert.equal(causeOf(sample, tenants.get('alder.physio')), 'hint');
  assert.equal(causeOf(sample, tenants.get('kettle.books')), 'parser');
  assert.equal(causeOf({ ...sample, channel: 'app' }, tenants.get('alder.physio')), 'parser');
  assert.equal(causeOf({ ...sample, channel: 'email' }, tenants.get('alder.physio')), 'parser');
});

test('unknown and month-first tenants are not silently classified as parser', () => {
  assert.equal(causeOf({ channel: 'email' }, undefined), null);
  assert.equal(causeOf({ channel: 'form' }, { locale: 'en-US', form: 'booking-v3' }), null);
  assert.equal(sameCause({ channel: 'email' }, undefined, { channel: 'email' }, undefined), false);
});

test('same subject can mask different causes and different subjects can share a cause', () => {
  const a = { channel: 'form', subject: 'Booking on the wrong date' };
  const b = { channel: 'app', subject: 'Booking on the wrong date' };
  assert.equal(sameCause(a, tenants.get('alder.physio'), b, tenants.get('alder.physio')), false);
  assert.equal(sameCause(a, tenants.get('alder.physio'),
    { ...a, subject: 'A different title' }, tenants.get('copper.studio')), true);
});

test('derived groups partition the snapshot without double counting', () => {
  const result = analysis();
  assert.deepEqual(Object.fromEntries(result.groups.map((g) => [g.cause, g.reports])), { parser: 379, hint: 33 });
  assert.equal(result.groups.reduce((sum, g) => sum + g.reports, 0), reports.length);
  assert.ok(result.groups.every((g) => g.reportIds.length === new Set(g.reportIds).size));
});

test('one-day and timing reports remain visible without inventing a confirmed cause', () => {
  const result = analysis();
  assert.equal(result.reviewNeeded.length, 5);
  assert.deepEqual(result.reviewNeeded.map((r) => r.id).sort(), [...notes.oneDayMove].sort());
  assert.ok(result.reviewNeeded.every((r) => r.deskCause === 'parser'));
});
