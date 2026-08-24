/**
 * assets.js - Asset upload, SHA-256 calculation, on-chain anchoring & tamper detection
 */

document.addEventListener('DOMContentLoaded', async () => {
  requireAuth();
  initUserNavbar();
  await loadAssets();

  const uploadForm = document.getElementById('uploadAssetForm');
  if (uploadForm) {
    uploadForm.addEventListener('submit', handleUploadAsset);
  }
});

async function loadAssets() {
  const tbody = document.getElementById('assetsTableBody');
  if (!tbody) return;

  const res = await apiRequest('/api/assets');

  if (res.ok && res.data && res.data.data && res.data.data.length > 0) {
    tbody.innerHTML = res.data.data
      .map((a) => {
        const currentUser = getCurrentUser();
        const isAdmin = currentUser && currentUser.role === 'ADMIN';

        const tamperBtn = isAdmin
          ? `<button class="btn btn-secondary btn-sm" onclick="handleTamperDemo('${a.assetId}')" title="Modify 1 byte on disk to demonstrate tamper detection">Simulate Tamper</button>`
          : '';

        return `
          <tr>
            <td><strong>${a.filename}</strong></td>
            <td>v${a.version || 1}</td>
            <td><span class="hash-text">${a.sha256}</span></td>
            <td><span class="badge badge-block">Block #${a.blockchainBlockIndex}</span></td>
            <td><span class="hash-text">${a.ownerDid}</span></td>
            <td>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <button class="btn btn-primary btn-sm" onclick="handleVerifyAsset('${a.assetId}')">Verify Integrity</button>
                ${tamperBtn}
              </div>
            </td>
          </tr>
        `;
      })
      .join('');
  } else {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">No digital assets anchored yet. Upload an asset above.</td></tr>`;
  }
}

async function handleUploadAsset(e) {
  e.preventDefault();
  const fileInput = document.getElementById('assetFileInput');
  const version = document.getElementById('assetVersion').value;
  const alertEl = document.getElementById('assetAlert');

  if (!fileInput.files || fileInput.files.length === 0) {
    alert('Please select a file to upload.');
    return;
  }

  const formData = new FormData();
  formData.append('file', fileInput.files[0]);
  formData.append('version', version || 1);

  const submitBtn = document.getElementById('uploadSubmitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Calculating SHA-256 & Anchoring...';

  const res = await apiRequest('/api/assets/upload', {
    method: 'POST',
    body: formData,
  });

  submitBtn.disabled = false;
  submitBtn.textContent = '⚡ Mint Token & Anchor SHA-256';

  if (res.ok && res.data.success) {
    alertEl.className = 'alert alert-success';
    alertEl.textContent = `Asset successfully anchored to Block #${res.data.blockchain.blockIndex}! SHA-256: ${res.data.blockchain.sha256}`;
    alertEl.style.display = 'block';
    document.getElementById('uploadAssetForm').reset();
    await loadAssets();
  } else {
    alertEl.className = 'alert alert-danger';
    alertEl.textContent = res.data.message || 'Asset upload failed.';
    alertEl.style.display = 'block';
  }
}

async function handleVerifyAsset(assetId) {
  const modalBox = document.getElementById('verifyResultBox');
  const modalTitle = document.getElementById('verifyResultTitle');
  const modalText = document.getElementById('verifyResultText');
  const modalHashExpected = document.getElementById('verifyHashExpected');
  const modalHashCurrent = document.getElementById('verifyHashCurrent');

  modalBox.style.display = 'block';
  modalBox.className = 'result-callout';
  modalTitle.textContent = '🔍 Recalculating Disk SHA-256 & Querying Blockchain...';
  modalText.textContent = 'Validating cryptographic fingerprint against immutable block anchor...';
  modalHashExpected.textContent = 'Loading...';
  modalHashCurrent.textContent = 'Computing...';

  const res = await apiRequest(`/api/assets/${encodeURIComponent(assetId)}/verify`, {
    method: 'POST',
  });

  if (res.ok && res.data && res.data.data) {
    const d = res.data.data;
    if (d.integrityIntact) {
      modalBox.className = 'result-callout allowed';
      modalTitle.textContent = '✅ FILE INTEGRITY VERIFIED (100% Authentic)';
      modalText.textContent = d.message;
    } else {
      modalBox.className = 'result-callout denied';
      modalTitle.textContent = '⚠️ TAMPERING DETECTED! (Cryptographic Mismatch)';
      modalText.textContent = d.message;
    }

    modalHashExpected.textContent = d.expectedHash;
    modalHashCurrent.textContent = d.currentHash;
  } else {
    modalBox.className = 'result-callout denied';
    modalTitle.textContent = '⚠️ Verification Failed';
    modalText.textContent = res.data.message || 'Error communicating with asset verification engine.';
    modalHashExpected.textContent = 'N/A';
    modalHashCurrent.textContent = 'N/A';
  }
}

async function handleTamperDemo(assetId) {
  if (!confirm('This will modify 1 byte of the local file on disk to demonstrate live tamper detection to the judges. Proceed?')) {
    return;
  }

  const res = await apiRequest(`/api/assets/${encodeURIComponent(assetId)}/tamper-demo`, {
    method: 'POST',
  });

  if (res.ok && res.data && res.data.success) {
    alert('File deliberately modified on disk! Now click "Verify Integrity" to witness instant cryptographic tamper detection.');
    await handleVerifyAsset(assetId);
  } else {
    alert(`Failed to tamper demo: ${res.data ? res.data.message : 'Error'}`);
  }
}
