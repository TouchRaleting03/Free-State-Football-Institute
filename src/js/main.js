import { initAuth } from './auth.js';
import { initContactForm } from './contact.js';
import { loadGallery } from './gallery.js';
import { initModals } from './modal.js';
import { initNavigation } from './navigation.js';
import { showAdminPanel } from './admin.js';

async function init() {
  await initAuth();
  initNavigation();
  initModals();
  initContactForm();
  await loadGallery();

  const adminBtn = document.getElementById('admin-btn');
  adminBtn.addEventListener('click', showAdminPanel);
}

document.addEventListener('DOMContentLoaded', init);
