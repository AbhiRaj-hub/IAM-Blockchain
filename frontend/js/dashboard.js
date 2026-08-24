/**
 * dashboard.js - Loads dashboard statistics and blockchain health
 */

document.addEventListener('DOMContentLoaded', async () => {
  requireAuth();
  initUserNavbar();
  await loadDashboardStats();
});

async function loadDashboardStats() {
  const bcValidEl = document.getElementById('statBlockchainValid');
  const bcBlocksEl = document.getElementById('statBlockchainBlocks');

  try {
    const res = await apiRequest('/api/audit/stats');
    if (res.ok && res.data && res.data.success) {
      const stats = res.data.data;

      const totalUsersEl = document.getElementById('statTotalUsers');
      const activeIdentitiesEl = document.getElementById('statActiveIdentities');
      const activeGrantsEl = document.getElementById('statActiveGrants');
      const totalAssetsEl = document.getElementById('statTotalAssets');
      const totalAttemptsEl = document.getElementById('statTotalAttempts');

      if (totalUsersEl) totalUsersEl.textContent = stats.totalUsers ?? 0;
      if (activeIdentitiesEl) activeIdentitiesEl.textContent = stats.activeIdentities ?? 0;
      if (activeGrantsEl) activeGrantsEl.textContent = stats.activeGrants ?? 0;
      if (totalAssetsEl) totalAssetsEl.textContent = stats.totalAssets ?? 0;
      if (totalAttemptsEl) totalAttemptsEl.textContent = stats.totalAttempts ?? 0;

      if (bcValidEl) {
        if (stats.blockchain && stats.blockchain.isValid) {
          bcValidEl.innerHTML = '<span class="badge badge-verified">Cryptographically Valid</span>';
        } else {
          const msg = (stats.blockchain && stats.blockchain.validationMessage) || 'Offline';
          bcValidEl.innerHTML = `<span class="badge badge-tampered">${msg}</span>`;
        }
      }

      if (bcBlocksEl && stats.blockchain) {
        bcBlocksEl.textContent = `${stats.blockchain.blocksCount || 0} Mined Blocks`;
      }
    } else {
      if (bcValidEl) {
        bcValidEl.innerHTML = '<span class="badge badge-tampered">Offline</span>';
      }
    }
  } catch (err) {
    console.error('Error loading dashboard stats:', err);
    if (bcValidEl) {
      bcValidEl.innerHTML = '<span class="badge badge-tampered">Offline</span>';
    }
  }

  // Load recent audit attempts
  await loadRecentLogs();
}

async function loadRecentLogs() {
  const tbody = document.getElementById('recentLogsTableBody');
  if (!tbody) return;

  try {
    const res = await apiRequest('/api/audit?limit=6');
    if (res.ok && res.data && res.data.data && res.data.data.length > 0) {
      tbody.innerHTML = res.data.data
        .map((log) => {
          const isAllowed = log.decision === 'ALLOWED';
          const badgeClass = isAllowed ? 'badge-allowed' : 'badge-denied';
          const timeStr = new Date(log.timestamp).toLocaleTimeString();
          return `
            <tr>
              <td><span class="hash-text">${log.did || 'N/A'}</span></td>
              <td><strong>${log.resource}</strong></td>
              <td><span class="badge ${badgeClass}">${log.decision}</span></td>
              <td><span class="badge badge-block">Block #${log.blockchainBlockIndex}</span></td>
              <td style="color: var(--text-muted); font-size: 0.8rem;">${timeStr}</td>
            </tr>
          `;
        })
        .join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No access attempts recorded yet.</td></tr>`;
    }
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No access attempts recorded yet.</td></tr>`;
  }
}
