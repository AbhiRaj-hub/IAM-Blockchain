/**
 * audit.js - Audit log explorer, direct on-chain ledger viewer, and chain validator
 */

document.addEventListener('DOMContentLoaded', async () => {
  requireAuth();
  initUserNavbar();
  await loadAuditLogs();

  const filterBtn = document.getElementById('applyFilterBtn');
  if (filterBtn) {
    filterBtn.addEventListener('click', loadAuditLogs);
  }

  const validateBtn = document.getElementById('validateChainBtn');
  if (validateBtn) {
    validateBtn.addEventListener('click', handleValidateChain);
  }
});

async function loadAuditLogs() {
  const didFilter = document.getElementById('filterDid') ? document.getElementById('filterDid').value : '';
  const decisionFilter = document.getElementById('filterDecision') ? document.getElementById('filterDecision').value : '';

  let query = '/api/audit?';
  if (didFilter) query += `did=${encodeURIComponent(didFilter)}&`;
  if (decisionFilter) query += `decision=${encodeURIComponent(decisionFilter)}&`;

  const res = await apiRequest(query);
  const tbody = document.getElementById('auditTableBody');
  if (!tbody) return;

  if (res.ok && res.data.data && res.data.data.length > 0) {
    tbody.innerHTML = res.data.data
      .map((log) => {
        const isAllowed = log.decision === 'ALLOWED';
        const badgeClass = isAllowed ? 'badge-allowed' : 'badge-denied';
        const dateStr = new Date(log.timestamp).toLocaleString();

        return `
          <tr>
            <td><span style="font-size: 0.8rem; color: var(--text-muted);">${dateStr}</span></td>
            <td><span class="hash-text">${log.did}</span></td>
            <td><strong>${log.resource}</strong></td>
            <td><span class="badge ${badgeClass}">${log.decision}</span></td>
            <td><span style="font-size: 0.85rem; color: var(--text-secondary);">${log.reason || 'Clearance policy check'}</span></td>
            <td><span class="badge badge-block">Block #${log.blockchainBlockIndex}</span></td>
          </tr>
        `;
      })
      .join('');
  } else {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No audit entries match filter.</td></tr>`;
  }

  // Also render raw on-chain transactions if container exists
  renderOnChainLedger(res.data.onChainTransactions || []);
}

function renderOnChainLedger(transactions) {
  const container = document.getElementById('onChainTxList');
  if (!container) return;

  if (transactions.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted);">No blockchain transactions found.</p>';
    return;
  }

  container.innerHTML = transactions
    .map((tx) => {
      const type = tx.type;
      const blockIdx = tx.block_index;
      const blockHash = tx.block_hash ? tx.block_hash.substring(0, 16) + '...' : 'Genesis';
      const timeStr = tx.timestamp ? new Date(tx.timestamp * 1000).toLocaleTimeString() : '';

      return `
        <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px 16px; margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div>
              <span class="badge badge-clearance" style="margin-right: 8px;">${type}</span>
              <span class="badge badge-block">Block #${blockIdx}</span>
            </div>
            <span style="font-size: 0.78rem; color: var(--text-muted);">${timeStr}</span>
          </div>
          <div style="font-family: monospace; font-size: 0.8rem; color: #93c5fd; word-break: break-all;">
            BlockHash: ${blockHash}
          </div>
          <pre style="font-size: 0.76rem; color: var(--text-secondary); margin-top: 6px; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px; overflow-x: auto;">${JSON.stringify(tx.payload, null, 2)}</pre>
        </div>
      `;
    })
    .join('');
}

async function handleValidateChain() {
  const resultBox = document.getElementById('chainValidateResult');
  resultBox.style.display = 'none';

  const res = await apiRequest('/api/blockchain/status');

  resultBox.style.display = 'block';
  if (res.ok && res.data.validation) {
    const val = res.data.validation;
    if (val.valid) {
      resultBox.className = 'result-callout allowed';
      resultBox.innerHTML = `<strong>✅ LEDGER INTEGRITY VALID:</strong> ${val.message} (Total ${res.data.blockHeight} blocks verified cryptographically).`;
    } else {
      resultBox.className = 'result-callout denied';
      resultBox.innerHTML = `<strong>⚠️ CRITICAL TAMPER ALERT:</strong> ${val.message}`;
    }
  }
}
