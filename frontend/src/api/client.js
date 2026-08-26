export const API_BASE = import.meta.env.VITE_API_URL ?? '';

const DEVICE_ID = import.meta.env.VITE_API_DEVICE_ID ?? '';
const DEVICE_TOKEN = import.meta.env.VITE_API_DEVICE_TOKEN ?? '';

export function getAuthToken() {
  try {
    return localStorage.getItem('auth_token') || '';
  } catch {
    return '';
  }
}

export function getAuthHeaders() {
  const token = getAuthToken();
  return {
    'X-Device-Id': DEVICE_ID,
    'X-Device-Token': DEVICE_TOKEN,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function getJsonHeaders() {
  return {
    ...getAuthHeaders(),
    'Content-Type': 'application/json',
  };
}

export const credentialHeaders = new Proxy({}, {
  get(_, prop) {
    return getAuthHeaders()[prop];
  },
  ownKeys() {
    return Object.keys(getAuthHeaders());
  },
  getOwnPropertyDescriptor(_, prop) {
    return Object.getOwnPropertyDescriptor(getAuthHeaders(), prop);
  }
});

export const jsonHeaders = new Proxy({}, {
  get(_, prop) {
    return getJsonHeaders()[prop];
  },
  ownKeys() {
    return Object.keys(getJsonHeaders());
  },
  getOwnPropertyDescriptor(_, prop) {
    return Object.getOwnPropertyDescriptor(getJsonHeaders(), prop);
  }
});

export function throwForStatus(status) {
  if (status === 401) {
    throw new Error(
      'Unauthorized. Please log in again to refresh your authentication session.',
    );
  }
  throw new Error(`The EMS API returned ${status}.`);
}
