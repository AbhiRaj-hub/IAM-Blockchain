/**
 * auth.js - User session management, login, logout, and role guards
 */

function getCurrentUser() {
  const userStr = localStorage.getItem('sih_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
}

function isAuthenticated() {
  return !!localStorage.getItem('sih_token') && !!getCurrentUser();
}

function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = 'login.html';
  }
}

function logout() {
  localStorage.removeItem('sih_token');
  localStorage.removeItem('sih_user');
  window.location.href = 'login.html';
}

/**
 * Updates UI with current user's profile, role, and clearance level
 */
function initUserNavbar() {
  const user = getCurrentUser();
  if (!user) return;

  const userNameEl = document.getElementById('navbarUserName');
  const userRoleEl = document.getElementById('navbarUserRole');
  const userDidEl = document.getElementById('navbarUserDid');
  const userAvatarEl = document.getElementById('navbarUserAvatar');

  if (userNameEl) userNameEl.textContent = user.name || user.email;
  if (userRoleEl) userRoleEl.textContent = `${user.role} (Clearance Level ${user.clearanceLevel || 1})`;
  if (userDidEl) userDidEl.textContent = user.did ? `DID: ${user.did.substring(0, 16)}...` : 'DID: Not Assigned';
  if (userAvatarEl) userAvatarEl.textContent = (user.name || 'U').charAt(0).toUpperCase();

  // Hide admin-only actions if not admin
  if (user.role !== 'ADMIN') {
    document.querySelectorAll('.admin-only').forEach((el) => {
      el.style.display = 'none';
    });
  }
}

// Auto-run user info init if user is logged in
document.addEventListener('DOMContentLoaded', () => {
  if (isAuthenticated()) {
    initUserNavbar();
  }
});
