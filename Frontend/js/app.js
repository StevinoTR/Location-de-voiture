// API Base URL - Dynamically set to the current origin for flexibility
const API_BASE = window.location.origin;

let storedUser = null;
try {
  storedUser = JSON.parse(localStorage.getItem('carrent_user') || 'null');
} catch (err) {
  localStorage.removeItem('carrent_user');
  storedUser = null;
}

const store = {
  token: localStorage.getItem('carrent_token'),
  user: storedUser
};

const setAuth = ({ token, user }) => {
  store.token = token;
  store.user = user;
  localStorage.setItem('carrent_token', token);
  localStorage.setItem('carrent_user', JSON.stringify(user));
};

const clearAuth = () => {
  store.token = null;
  store.user = null;
  localStorage.removeItem('carrent_token');
  localStorage.removeItem('carrent_user');
};

/**
 * Universal fetcher that prepends /api and attaches the Authorization token.
 */
const apiFetch = async (path, options = {}) => {
  const headers = options.headers || {};
  headers['Content-Type'] = 'application/json';
  if (store.token) headers['Authorization'] = `Bearer ${store.token}`;

  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  const res = await fetch(`${API_BASE}/api${cleanPath}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    let message = error.message || `Erreur ${res.status}`;
    if (Array.isArray(error.errors)) {
      message = error.errors.map((e) => e.msg || e.message).join(' | ');
    }
    throw new Error(message);
  }

  return res.json().catch(() => ({}));
};

// --- AUTH FUNCTIONS ---
const login = async (email, password) => {
  const data = await apiFetch('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  setAuth(data);
  return data;
};

const register = async (payload) => {
  const data = await apiFetch('/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  setAuth(data);
  return data;
};

const logout = () => {
  clearAuth();
  window.location.href = '/login'; // Uses the redirect from server.js
};

// --- VOITURES ---
const fetchVoitures = async (filters = {}) => {
  const qs = new URLSearchParams(filters).toString();
  return apiFetch(`/voitures${qs ? `?${qs}` : ''}`);
};

const createVoiture = async (payload) => {
  return apiFetch('/voitures', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

const updateVoiture = async (id, payload) => {
  return apiFetch(`/voitures/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
};

const removeVoiture = async (id) => {
  return apiFetch(`/voitures/${id}`, { method: 'DELETE' });
};

const uploadVoiturePhoto = async (id, file) => {
  const form = new FormData();
  form.append('photo', file);
  const headers = store.token ? { Authorization: `Bearer ${store.token}` } : {};

  const res = await fetch(`${API_BASE}/api/voitures/${id}/photo`, {
    method: 'POST',
    headers,
    body: form
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Erreur upload');
  }
  return res.json();
};

// --- RESERVATIONS ---
const createReservation = async (payload) => {
  return apiFetch('/reservations', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

const fetchMesReservations = async () => apiFetch('/mes-reservations');
const fetchReservations = async () => apiFetch('/reservations');

const updateReservation = async (id, payload) => {
  return apiFetch(`/reservations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
};

const confirmReservation = async (id) => {
  return apiFetch(`/reservations/${id}/confirm`, { method: 'PUT' });
};

const refuseReservation = async (id) => {
  return apiFetch(`/reservations/${id}/refuse`, { method: 'PUT' });
};

const terminateReservation = async (id) => {
  return apiFetch(`/reservations/${id}/terminate`, { method: 'PUT' });
};

// --- USERS & ENTREPRISES ---
const fetchUsers = async (role) => {
  const qs = new URLSearchParams(role ? { role } : {}).toString();
  return apiFetch(`/users${qs ? `?${qs}` : ''}`);
};

const deleteUser = async (id) => apiFetch(`/users/${id}`, { method: 'DELETE' });
const toggleBlockUser = async (id) => apiFetch(`/users/${id}/block`, { method: 'PUT' });
const fetchEntrepriseMe = async () => apiFetch('/entreprise/me');
const fetchEntreprises = async () => apiFetch('/entreprises');

export {
  store, login, logout, register,
  fetchVoitures, createVoiture, updateVoiture, removeVoiture, uploadVoiturePhoto,
  createReservation, fetchMesReservations, fetchReservations, updateReservation, confirmReservation, refuseReservation, terminateReservation,
  fetchUsers, deleteUser, toggleBlockUser, fetchEntrepriseMe, fetchEntreprises
};
