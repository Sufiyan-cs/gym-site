const API_BASE = '/api';

function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (data: any) => fetchWithAuth('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => fetchWithAuth('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => fetchWithAuth('/auth/me'),
  updateProfile: (data: any) => fetchWithAuth('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
  
  // Members & Community
  getMembers: () => fetchWithAuth('/admin/members'),
  getCommunityMembers: () => fetchWithAuth('/members/community'),
  getActiveFloorMembers: () => fetchWithAuth('/checkins/active'),
  
  // Subscriptions
  getPlans: () => fetchWithAuth('/subscriptions/plans'),
  createSubscription: (data: any) => fetchWithAuth('/subscriptions', { method: 'POST', body: JSON.stringify(data) }),
  
  // Check-ins
  checkIn: () => fetchWithAuth('/checkin', { method: 'POST' }),
  checkOut: () => fetchWithAuth('/checkin/checkout', { method: 'POST' }),
  getLeaderboard: () => fetchWithAuth('/checkin/leaderboard'),
  
  // Workouts
  getExercises: () => fetchWithAuth('/workouts/exercises'),
  saveWorkout: (data: any) => fetchWithAuth('/workouts', { method: 'POST', body: JSON.stringify(data) }),
  logWorkout: (data: any) => fetchWithAuth('/workouts/log', { method: 'POST', body: JSON.stringify(data) }),
  
  // Progress
  getProgress: () => fetchWithAuth('/progress'),
  logWeight: (data: any) => fetchWithAuth('/progress/weight', { method: 'POST', body: JSON.stringify(data) }),
  
  // Supplements
  getSupplements: () => fetchWithAuth('/supplements'),
  orderSupplement: (data: any) => fetchWithAuth('/supplements/order', { method: 'POST', body: JSON.stringify(data) }),
  
  // Personal Training
  getPTPackages: () => fetchWithAuth('/pt/packages'),
  bookPT: (data: any) => fetchWithAuth('/pt/book', { method: 'POST', body: JSON.stringify(data) }),
};
