import { signUp, signIn, signOut } from './auth.js';

export function initModals() {
  const authModal = document.getElementById('auth-modal');
  const adminModal = document.getElementById('admin-modal');
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  const logoutBtn = document.getElementById('logout-btn');

  loginBtn.addEventListener('click', () => {
    showAuthModal('login');
  });

  registerBtn.addEventListener('click', () => {
    showAuthModal('register');
  });

  logoutBtn.addEventListener('click', async () => {
    try {
      await signOut();
      alert('Logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to log out. Please try again.');
    }
  });

  const closeBtns = document.querySelectorAll('.modal .close');
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      authModal.style.display = 'none';
      adminModal.style.display = 'none';
    });
  });

  window.addEventListener('click', (e) => {
    if (e.target === authModal) {
      authModal.style.display = 'none';
    }
    if (e.target === adminModal) {
      adminModal.style.display = 'none';
    }
  });
}

function showAuthModal(type) {
  const modal = document.getElementById('auth-modal');
  const container = document.getElementById('auth-form-container');

  if (type === 'login') {
    container.innerHTML = `
      <h2>Login</h2>
      <form id="login-form" class="auth-form">
        <div id="login-message" class="form-message"></div>
        <input type="email" id="login-email" placeholder="Email" required />
        <input type="password" id="login-password" placeholder="Password" required />
        <button type="submit">Login</button>
        <p class="auth-switch">Don't have an account? <a href="#" id="switch-to-register">Register</a></p>
      </form>
    `;

    const form = document.getElementById('login-form');
    form.addEventListener('submit', handleLogin);

    document.getElementById('switch-to-register').addEventListener('click', (e) => {
      e.preventDefault();
      showAuthModal('register');
    });
  } else {
    container.innerHTML = `
      <h2>Register</h2>
      <form id="register-form" class="auth-form">
        <div id="register-message" class="form-message"></div>
        <input type="text" id="register-name" placeholder="Full Name" required />
        <input type="email" id="register-email" placeholder="Email" required />
        <input type="password" id="register-password" placeholder="Password (min 6 characters)" required minlength="6" />
        <button type="submit">Register</button>
        <p class="auth-switch">Already have an account? <a href="#" id="switch-to-login">Login</a></p>
      </form>
    `;

    const form = document.getElementById('register-form');
    form.addEventListener('submit', handleRegister);

    document.getElementById('switch-to-login').addEventListener('click', (e) => {
      e.preventDefault();
      showAuthModal('login');
    });
  }

  modal.style.display = 'block';
}

async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const message = document.getElementById('login-message');
  const submitBtn = e.target.querySelector('button[type="submit"]');

  submitBtn.disabled = true;
  submitBtn.textContent = 'Logging in...';
  message.textContent = '';
  message.className = 'form-message';

  try {
    await signIn(email, password);
    message.textContent = 'Login successful!';
    message.className = 'form-message success';

    setTimeout(() => {
      document.getElementById('auth-modal').style.display = 'none';
    }, 1000);
  } catch (error) {
    console.error('Login error:', error);
    message.textContent = error.message || 'Invalid email or password.';
    message.className = 'form-message error';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Login';
  }
}

async function handleRegister(e) {
  e.preventDefault();

  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const message = document.getElementById('register-message');
  const submitBtn = e.target.querySelector('button[type="submit"]');

  submitBtn.disabled = true;
  submitBtn.textContent = 'Registering...';
  message.textContent = '';
  message.className = 'form-message';

  try {
    await signUp(email, password, name);
    message.textContent = 'Registration successful! You are now logged in.';
    message.className = 'form-message success';

    setTimeout(() => {
      document.getElementById('auth-modal').style.display = 'none';
    }, 1500);
  } catch (error) {
    console.error('Registration error:', error);
    message.textContent = error.message || 'Registration failed. Please try again.';
    message.className = 'form-message error';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Register';
  }
}
