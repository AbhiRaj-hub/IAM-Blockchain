/**
 * access.js - Clearance request testing sandbox, explicit access grant & revoke
 */

document.addEventListener('DOMContentLoaded', async () => {
  requireAuth();
  initUserNavbar();
  await loadGrants();

  const accessRequestForm = document.getElementById('accessRequestForm');
  if (accessRequestForm) {
    accessRequestForm.addEventListener('submit', handleAccessRequest);
  }

  const grantAccessForm = document.getElementById('grantAccessForm');
  if (grantAccessForm) {
    grantAccessForm.addEventListener('submit', handleGrantAccess);
  }
});

async function loadGrants() {
  const res = await apiRequest('/api/access');
  const tbody = document.getElementById('grantsTableBody');
  if (!tbody) return;

  if (res.ok && res.data.data && res.data.data.length > 0) {
    tbody.innerHTML = res.data.data
      .map((g) => {
        const isRevoked = g.status === 'REVOKED';
        const statusBadge = isRevoked
          ? '<span class="badge badge-revoked">REVOKED</span>'
          : '<span class="badge badge-active">ACTIVE</span>';

        const currentUser = getCurrentUser();
        const isAdmin = currentUser && currentUser.role === 'ADMIN';

        const actionBtn = isRevoked || !isAdmin
          ? '<span style="color: var(--text-muted); font-size: 0.8rem;">None</span>'
          : `<button class="btn btn-danger btn-sm" onclick="handleRevokeGrant('${g.grantId}', '${g.did}', '${g.resource}')">Revoke Grant</button>`;

        return `
          <tr>
            <td><strong>${g.resource}</strong></td>
            <td><span class="badge badge-clearance">Req Level ${g.requiredClearance}</span></td>
            <td><span class="hash-text">${g.did}</span></td>
            <td>${g.grantedBy}</td>
            <td><span class="badge badge-block">Block #${g.blockchainBlockIndex}</span></td>
            <td>${statusBadge}</td>
            <td>${actionBtn}</td>
          </tr>
        `;
      })
      .join('');
  } else {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No explicit resource grants recorded.</td></tr>`;
  }
}

async function handleAccessRequest(e) {
  e.preventDefault();
  const resource = document.getElementById('requestResource').value;
  const requiredClearance = document.getElementById('requestClearance').value;
  const resultBox = document.getElementById('accessResultBox');
  const resultTitle = document.getElementById('accessResultTitle');
  const resultText = document.getElementById('accessResultText');
  const resultJson = document.getElementById('accessResultJson');

  resultBox.style.display = 'none';

  const res = await apiRequest('/api/access/request', {
    method: 'POST',
    body: JSON.stringify({ resource, requiredClearance }),
  });

  resultBox.style.display = 'block';
  const data = res.data;

  if (res.status === 200 && data.decision === 'ALLOWED') {
    resultBox.className = 'result-callout allowed';
    resultTitle.textContent = 'ACCESS ALLOWED (Mined on Blockchain)';
    resultText.textContent = data.message;
  } else {
    resultBox.className = 'result-callout denied';
    resultTitle.textContent = 'ACCESS DENIED (Logged on Blockchain)';
    resultText.textContent = data.message || 'Clearance check failed.';
  }

  resultJson.textContent = JSON.stringify(data, null, 2);
}

async function handleGrantAccess(e) {
  e.preventDefault();
  const did = document.getElementById('grantDid').value;
  const resource = document.getElementById('grantResource').value;
  const requiredClearance = document.getElementById('grantClearance').value;

  const res = await apiRequest('/api/access/grant', {
    method: 'POST',
    body: JSON.stringify({ did, resource, requiredClearance }),
  });

  if (res.ok && res.data.success) {
    alert(`Access granted on-chain! Block #${res.data.blockchain.blockIndex}`);
    document.getElementById('grantAccessForm').reset();
    await loadGrants();
  } else {
    alert(`Failed to grant access: ${res.data.message || 'Error'}`);
  }
}

async function handleRevokeGrant(grantId, did, resource) {
  if (!confirm(`Revoke grant on resource '${resource}' for DID ${did}?`)) return;

  const res = await apiRequest('/api/access/revoke', {
    method: 'POST',
    body: JSON.stringify({ grantId, did, resource }),
  });

  if (res.ok && res.data.success) {
    alert(`Access revoked on-chain!`);
    await loadGrants();
  } else {
    alert(`Failed to revoke grant: ${res.data.message || 'Error'}`);
  }
}
