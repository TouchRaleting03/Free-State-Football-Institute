import { supabase } from './supabase.js';
import { isAdmin } from './auth.js';
import { loadGallery } from './gallery.js';

export function showAdminPanel() {
  if (!isAdmin()) {
    alert('Access denied. Admin privileges required.');
    return;
  }

  const modal = document.getElementById('admin-modal');
  const content = document.getElementById('admin-content');

  content.innerHTML = `
    <h2>Admin Dashboard</h2>
    <div class="admin-tabs">
      <button class="tab-btn active" data-tab="gallery">Gallery Management</button>
      <button class="tab-btn" data-tab="contacts">Contact Submissions</button>
    </div>
    <div id="admin-tab-content" class="admin-tab-content"></div>
  `;

  modal.style.display = 'block';

  const tabBtns = content.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      if (tab === 'gallery') {
        showGalleryManagement();
      } else if (tab === 'contacts') {
        showContactSubmissions();
      }
    });
  });

  showGalleryManagement();
}

async function showGalleryManagement() {
  const tabContent = document.getElementById('admin-tab-content');

  tabContent.innerHTML = `
    <h3>Gallery Images</h3>
    <div class="admin-form">
      <h4>Add New Image</h4>
      <form id="add-gallery-form">
        <input type="text" id="gallery-title" placeholder="Image title" required />
        <input type="text" id="gallery-description" placeholder="Description" />
        <input type="url" id="gallery-url" placeholder="Image URL" required />
        <input type="number" id="gallery-order" placeholder="Display order" value="0" />
        <button type="submit">Add Image</button>
      </form>
    </div>
    <div id="gallery-list" class="admin-list"></div>
  `;

  const form = document.getElementById('add-gallery-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await addGalleryImage();
  });

  await loadGalleryList();
}

async function addGalleryImage() {
  const title = document.getElementById('gallery-title').value;
  const description = document.getElementById('gallery-description').value;
  const imageUrl = document.getElementById('gallery-url').value;
  const displayOrder = parseInt(document.getElementById('gallery-order').value);

  try {
    const { error } = await supabase
      .from('gallery_images')
      .insert([
        {
          title,
          description,
          image_url: imageUrl,
          display_order: displayOrder
        }
      ]);

    if (error) throw error;

    alert('Image added successfully!');
    document.getElementById('add-gallery-form').reset();
    await loadGalleryList();
    await loadGallery();
  } catch (error) {
    console.error('Error adding image:', error);
    alert('Failed to add image. Please try again.');
  }
}

async function loadGalleryList() {
  const listDiv = document.getElementById('gallery-list');

  try {
    const { data: images, error } = await supabase
      .from('gallery_images')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    if (images && images.length > 0) {
      listDiv.innerHTML = `
        <table class="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Description</th>
              <th>Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${images.map(img => `
              <tr>
                <td><img src="${img.image_url}" alt="${img.title}" style="width: 60px; height: 60px; object-fit: cover;" /></td>
                <td>${img.title}</td>
                <td>${img.description || '-'}</td>
                <td>${img.display_order}</td>
                <td>
                  <button class="btn-delete" data-id="${img.id}">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      listDiv.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (confirm('Are you sure you want to delete this image?')) {
            await deleteGalleryImage(btn.dataset.id);
          }
        });
      });
    } else {
      listDiv.innerHTML = '<p>No images in gallery.</p>';
    }
  } catch (error) {
    console.error('Error loading gallery list:', error);
    listDiv.innerHTML = '<p class="error">Failed to load gallery images.</p>';
  }
}

async function deleteGalleryImage(id) {
  try {
    const { error } = await supabase
      .from('gallery_images')
      .delete()
      .eq('id', id);

    if (error) throw error;

    alert('Image deleted successfully!');
    await loadGalleryList();
    await loadGallery();
  } catch (error) {
    console.error('Error deleting image:', error);
    alert('Failed to delete image. Please try again.');
  }
}

async function showContactSubmissions() {
  const tabContent = document.getElementById('admin-tab-content');

  tabContent.innerHTML = `
    <h3>Contact Submissions</h3>
    <div id="contacts-list" class="admin-list"></div>
  `;

  await loadContactsList();
}

async function loadContactsList() {
  const listDiv = document.getElementById('contacts-list');

  try {
    const { data: contacts, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (contacts && contacts.length > 0) {
      listDiv.innerHTML = `
        <table class="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Email</th>
              <th>Message</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${contacts.map(contact => `
              <tr>
                <td>${new Date(contact.created_at).toLocaleDateString()}</td>
                <td>${contact.name}</td>
                <td>${contact.email}</td>
                <td>${contact.message}</td>
                <td>
                  <select class="status-select" data-id="${contact.id}">
                    <option value="unread" ${contact.status === 'unread' ? 'selected' : ''}>Unread</option>
                    <option value="read" ${contact.status === 'read' ? 'selected' : ''}>Read</option>
                    <option value="replied" ${contact.status === 'replied' ? 'selected' : ''}>Replied</option>
                  </select>
                </td>
                <td>
                  <a href="mailto:${contact.email}" class="btn-secondary">Reply</a>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      listDiv.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', async () => {
          await updateContactStatus(select.dataset.id, select.value);
        });
      });
    } else {
      listDiv.innerHTML = '<p>No contact submissions yet.</p>';
    }
  } catch (error) {
    console.error('Error loading contacts:', error);
    listDiv.innerHTML = '<p class="error">Failed to load contact submissions.</p>';
  }
}

async function updateContactStatus(id, status) {
  try {
    const { error } = await supabase
      .from('contact_submissions')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating contact status:', error);
    alert('Failed to update status. Please try again.');
  }
}
