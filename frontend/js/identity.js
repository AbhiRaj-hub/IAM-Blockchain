/**
 * identity.js - DID issuance, listing, and revocation
 */

document.addEventListener('DOMContentLoaded', async () => {
  requireAuth();
  initUserNavbar();
  await loadIdentities();
  await populateUserDropdown();

  const issueForm = document.getElementById('issueIdentityForm');
  if (issueForm) {
    issueForm.addEventListener('submit', handleIssueIdentity);
  }
});

async function loadIdentities() {
  const tbody = document.getElementById('identitiesTableBody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 20px;">Syncing on-chain identities...</td></tr>`;

  try {
    const res = await apiRequest('/api/identity');

    if (res.ok && res.data && res.data.data && res.data.data.length > 0) {
      tbody.innerHTML = res.data.data
        .map((item) => {
          const isRevoked = item.status === 'REVOKED';
          const statusBadge = isRevoked
            ? '<span class="badge badge-revoked">REVOKED</span>'
            : '<span class="badge badge-active">ACTIVE</span>';

          const currentUser = getCurrentUser();
          const isAdmin = currentUser && currentUser.role === 'ADMIN';

          const actionBtn = isRevoked || !isAdmin
            ? `<span style="color: var(--text-muted); font-size: 0.8rem;">Read Only</span>`
            : `<button class="btn btn-danger btn-sm" onclick="handleRevokeIdentity('${item.did}')">Revoke DID</button>`;

          return `
            <tr>
              <td><strong>${item.subjectName}</strong></td>
              <td><span class="hash-text">${item.did}</span></td>
              <td>${item.role}</td>
              <td><span class="badge badge-clearance">Level ${item.clearanceLevel}</span></td>
              <td><span class="hash-text">${item.credentialId}</span></td>
              <td><span class="badge badge-block">Block #${item.blockchainBlockIndex}</span></td>
              <td>${statusBadge}</td>
              <td>${actionBtn}</td>
            </tr>
          `;
        })
        .join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">No identities issued yet.</td></tr>`;
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--danger);">Failed to load identities: ${err.message}</td></tr>`;
  }
}

async function populateUserDropdown() {
  const select = document.getElementById('selectUser');
  if (!select) return;

  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== 'ADMIN') return;

  try {
    const res = await apiRequest('/api/auth/users');
    if (res.ok && res.data && res.data.data) {
      select.innerHTML = '<option value="">-- Select Registered User (Optional) --</option>';
      res.data.data.forEach((u) => {
        const opt = document.createElement('option');
        opt.value = u._id;
        opt.textContent = `${u.name} (${u.email}) - Current: ${u.role}`;
        opt.dataset.name = u.name;
        opt.dataset.role = u.role;
        opt.dataset.clearance = u.clearanceLevel;
        select.appendChild(opt);
      });

      select.addEventListener('change', (e) => {
        const selectedOpt = select.options[select.selectedIndex];
        if (selectedOpt && selectedOpt.dataset.name) {
          document.getElementById('subjectName').value = selectedOpt.dataset.name;
          document.getElementById('role').value = selectedOpt.dataset.role || 'EMPLOYEE';
          document.getElementById('clearanceLevel').value = selectedOpt.dataset.clearance || 2;
        }
      });
    }
  } catch (e) {}
}

async function handleIssueIdentity(e) {
  e.preventDefault();
  const alertEl = document.getElementById('identityAlert');
  alertEl.style.display = 'none';

  const userId = document.getElementById('selectUser') ? document.getElementById('selectUser').value : '';
  const subjectName = document.getElementById('subjectName').value;
  const role = document.getElementById('role').value;
  const clearanceLevel = document.getElementById('clearanceLevel').value;
  const issuer = document.getElementById('issuer').value || 'BEL-Authority';

  const submitBtn = document.getElementById('issueSubmitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Mining Blockchain Block...';

  const res = await apiRequest('/api/identity', {
    method: 'POST',
    body: JSON.stringify({ userId, subjectName, role, clearanceLevel, issuer }),
  });

  submitBtn.disabled = false;
  submitBtn.textContent = 'Issue Identity & Mine Block';

  if (res.ok && res.data && res.data.success) {
    alertEl.className = 'alert alert-success';
    alertEl.textContent = `Identity issued on-chain! Assigned DID: ${res.data.data.did} (Block #${res.data.data.blockchainBlockIndex})`;
    alertEl.style.display = 'block';
    document.getElementById('issueIdentityForm').reset();
    await loadIdentities();
  } else {
    alertEl.className = 'alert alert-danger';
    alertEl.textContent = (res.data && res.data.message) || 'Failed to issue identity.';
    alertEl.style.display = 'block';
  }
}

async function handleRevokeIdentity(did) {
  const reason = prompt(`Enter reason for revoking DID ${did}:`, 'Security policy update');
  if (!reason) return;

  const res = await apiRequest(`/api/identity/${encodeURIComponent(did)}/revoke`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });

  if (res.ok && res.data && res.data.success) {
    alert(`DID revoked on-chain! Logged in Block #${res.data.blockchain.blockIndex}`);
    await loadIdentities();
  } else {
    alert(`Failed to revoke DID: ${(res.data && res.data.message) || 'Error'}`);
  }
}
