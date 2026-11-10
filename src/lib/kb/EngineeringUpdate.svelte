<script lang="ts">
  import update from '#lib/data/engineering-update.json';
</script>

<section aria-label="Current engineering disposition">
  <h2>Engineering update: #{update.ticket} closed {update.closedOn}</h2>
  <p>
    Observed {update.observedOn} on the <a href={update.source}>course challenge page</a>,
    after initial ticket acceptance. This update is separate from the older KB export.
  </p>
  <table>
    <thead><tr><th>Mechanism</th><th>Engineering disposition</th><th>Reason</th></tr></thead>
    <tbody>
      <tr><td>parser</td><td><strong>{update.parser.status}</strong></td><td>{update.parser.message}</td></tr>
      <tr><td>hint</td><td><strong>{update.hint.status}</strong></td><td>{update.hint.message}</td></tr>
    </tbody>
  </table>
  <p>
    Fixed and won't fix are different outcomes. Retirement ends the v3 form path;
    it does not establish that its misleading hint was corrected.
    The parser fix is reported by engineering, not independently tested against production here.
    The update does not separately explain the five unusual reports below.
    Historical report counts do not become zero when a ticket closes.
  </p>
</section>
