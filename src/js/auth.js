import { supabase } from './supabase.js';

let currentUser = null;
let currentProfile = null;

export async function initAuth() {
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    await handleAuthStateChange(session);
  }

  supabase.auth.onAuthStateChange((event, session) => {
    (async () => {
      if (event === 'SIGNED_IN' && session) {
        await handleAuthStateChange(session);
      } else if (event === 'SIGNED_OUT') {
        currentUser = null;
        currentProfile = null;
        updateUIForAuth();
      }
    })();
  });
}

async function handleAuthStateChange(session) {
  currentUser = session.user;

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', currentUser.id)
    .maybeSingle();

  currentProfile = profile;
  updateUIForAuth();
}

export function updateUIForAuth() {
  const authButtons = document.getElementById('auth-buttons');
  const userMenu = document.getElementById('user-menu');
  const userName = document.getElementById('user-name');
  const adminBtn = document.getElementById('admin-btn');

  if (currentUser) {
    authButtons.style.display = 'none';
    userMenu.style.display = 'flex';
    userName.textContent = currentProfile?.full_name || currentUser.email;

    if (currentProfile?.role === 'admin') {
      adminBtn.style.display = 'block';
    } else {
      adminBtn.style.display = 'none';
    }
  } else {
    authButtons.style.display = 'flex';
    userMenu.style.display = 'none';
  }
}

export async function signUp(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });

  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function getCurrentUser() {
  return currentUser;
}

export function getCurrentProfile() {
  return currentProfile;
}

export function isAdmin() {
  return currentProfile?.role === 'admin';
}
