const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Centralized API request wrapper.
 * Throws structured Error objects with readable messages extracted from MySQL responses.
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    throw new Error(`Network error connecting to backend: ${networkError.message}`);
  }

  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    throw new Error(`Server returned non-JSON response (HTTP ${response.status})`);
  }

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.errorType = data.errorType || 'API_ERROR';
    error.detail = data.detail || null;
    error.sqlState = data.sqlState || null;
    throw error;
  }

  return data;
}

export const api = {
  // Dashboard Endpoints
  dashboard: {
    getStats: () => request('/dashboard/stats'),
    getEarnings: () => request('/dashboard/earnings'),
    getTopArtists: () => request('/dashboard/top-artists'),
    getTopSongs: () => request('/dashboard/top-songs'),
    getPlatforms: () => request('/dashboard/platforms'),
  },

  // Artists Endpoints
  artists: {
    getAll: () => request('/artists'),
    getById: (id) => request(`/artists/${id}`),
    create: (artistData) => request('/artists', { method: 'POST', body: artistData }),
    update: (id, artistData) => request(`/artists/${id}`, { method: 'PUT', body: artistData }),
    delete: (id) => request(`/artists/${id}`, { method: 'DELETE' }),
  },

  // Albums Endpoints
  albums: {
    getAll: () => request('/albums'),
    getById: (id) => request(`/albums/${id}`),
    create: (albumData) => request('/albums', { method: 'POST', body: albumData }),
    update: (id, albumData) => request(`/albums/${id}`, { method: 'PUT', body: albumData }),
    delete: (id) => request(`/albums/${id}`, { method: 'DELETE' }),
  },

  // Songs Endpoints (uses v_song_details & fn_song_earnings)
  songs: {
    getAll: () => request('/songs'),
    getById: (id) => request(`/songs/${id}`),
    create: (songData) => request('/songs', { method: 'POST', body: songData }),
    update: (id, songData) => request(`/songs/${id}`, { method: 'PUT', body: songData }),
    delete: (id) => request(`/songs/${id}`, { method: 'DELETE' }),
  },

  // Producers Endpoints
  producers: {
    getAll: () => request('/producers'),
    create: (data) => request('/producers', { method: 'POST', body: data }),
    update: (id, data) => request(`/producers/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/producers/${id}`, { method: 'DELETE' }),
  },

  // Songwriters Endpoints
  songwriters: {
    getAll: () => request('/songwriters'),
    create: (data) => request('/songwriters', { method: 'POST', body: data }),
    update: (id, data) => request(`/songwriters/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/songwriters/${id}`, { method: 'DELETE' }),
  },

  // Contracts Endpoints (uses v_active_contracts & handles contract triggers)
  contracts: {
    getAll: () => request('/contracts'),
    getActive: () => request('/contracts/active'),
    create: (data) => request('/contracts', { method: 'POST', body: data }),
    update: (id, data) => request(`/contracts/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/contracts/${id}`, { method: 'DELETE' }),
  },

  // Streaming Platforms Endpoints
  platforms: {
    getAll: () => request('/platforms'),
    create: (data) => request('/platforms', { method: 'POST', body: data }),
    update: (id, data) => request(`/platforms/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/platforms/${id}`, { method: 'DELETE' }),
  },

  // Royalties Endpoints (uses v_royalty_earnings & sp_add_royalty)
  royalties: {
    getRecords: () => request('/royalties'),
    getEarnings: (filters = {}) => {
      const params = new URLSearchParams();
      if (filters.artist_id) params.append('artist_id', filters.artist_id);
      if (filters.platform_name) params.append('platform_name', filters.platform_name);
      if (filters.period) params.append('period', filters.period);
      const queryString = params.toString();
      return request(`/royalties/earnings${queryString ? `?${queryString}` : ''}`);
    },
    add: (data) => request('/royalties', { method: 'POST', body: data }),
  },

  // Payouts Endpoints (calls sp_calculate_payouts)
  payouts: {
    getPeriods: () => request('/payouts/periods'),
    calculate: (period) => request('/payouts/calculate', { method: 'POST', body: { period } }),
  },
};

export default api;
