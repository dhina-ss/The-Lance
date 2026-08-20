// Shared API configuration for the EMS backend.
// VITE_API_URL points at the API (empty = same origin). Device credentials are
// the dashboard's read/observer credential, set in EMS.Dashboard/.env.local.
export const API_BASE = import.meta.env.VITE_API_URL ?? '';

const DEVICE_ID = import.meta.env.VITE_API_DEVICE_ID ?? '';
const DEVICE_TOKEN = import.meta.env.VITE_API_DEVICE_TOKEN ?? '';

export const credentialHeaders = {
  'X-Device-Id': DEVICE_ID,
  'X-Device-Token': DEVICE_TOKEN,
};

export const jsonHeaders = {
  ...credentialHeaders,
  'Content-Type': 'application/json',
};

export function throwForStatus(status) {
  if (status === 401) {
    throw new Error(
      'Unauthorized. Set VITE_API_DEVICE_ID and VITE_API_DEVICE_TOKEN in EMS.Dashboard/.env.local.',
    );
  }
  throw new Error(`The EMS API returned ${status}.`);
}
