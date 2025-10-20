import { supabase } from './supabase.js';

export function initContactForm() {
  const form = document.getElementById('contact-form');
  const formMessage = document.getElementById('form-message');
  const submitBtn = document.getElementById('submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    formMessage.textContent = '';
    formMessage.className = 'form-message';

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert([
          {
            name,
            email,
            message
          }
        ]);

      if (error) throw error;

      formMessage.textContent = 'Thank you for your message! We will get back to you soon.';
      formMessage.className = 'form-message success';
      form.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      formMessage.textContent = 'Sorry, there was an error sending your message. Please try again.';
      formMessage.className = 'form-message error';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  });
}
