import { supabase } from './supabase.js';

export async function loadGallery() {
  const galleryGrid = document.getElementById('gallery-grid');

  try {
    const { data: images, error } = await supabase
      .from('gallery_images')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    if (images && images.length > 0) {
      galleryGrid.innerHTML = images.map(image => `
        <div class="gallery-item" data-id="${image.id}">
          <img src="${image.image_url}" alt="${image.title}" loading="lazy" />
          <p>${image.title}</p>
        </div>
      `).join('');
    } else {
      galleryGrid.innerHTML = '<p class="no-content">No gallery images available yet.</p>';
    }
  } catch (error) {
    console.error('Error loading gallery:', error);
    galleryGrid.innerHTML = '<p class="error">Failed to load gallery images.</p>';
  }
}
