import { API_BASE, credentialHeaders, jsonHeaders, throwForStatus } from './client';

async function getJson(path) {
  const res = await fetch(`${API_BASE}${path}`, { headers: credentialHeaders });
  if (!res.ok) throwForStatus(res.status);
  return res.json();
}

// ---------- formatting helpers ----------

export function relativeTime(iso) {
  if (!iso) return '—';
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return '—';
  const secs = Math.round((Date.now() - then) / 1000);
  if (secs < 60) return 'Just now';
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
}

export function formatBytes(bytes) {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function formatHoursMinutes(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  return h === 0 ? `${m}m` : `${h}h ${m}m`;
}

export function formatDuration(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h === 0 && m === 0) return '< 1m';
  return h === 0 ? `${m}m` : `${h}h ${m}m`;
}

function osTypeFrom(osVersion) {
  const v = (osVersion || '').toLowerCase();
  if (v.includes('windows')) return 'windows';
  if (v.includes('mac') || v.includes('os x')) return 'macos';
  if (v.includes('ubuntu') || v.includes('linux') || v.includes('debian')) return 'linux';
  if (v.includes('android') || v.includes('ios') || v.includes('ipad')) return 'mobile';
  return 'windows';
}

/** Maps an EMS API DeviceResponse to the shape the New UI components expect. */
export function mapDevice(d) {
  return {
    id: d.id, // internal GUID (used for all detail/action calls)
    deviceId: d.deviceId,
    name: d.deviceName,
    manufacturer: d.manufacturer,
    model: d.model || d.deviceName,
    serialNumber: d.serialNumber,
    processor: d.processor,
    ram: d.ramSize,
    storage: d.storageSize,
    os: d.osVersion || '—',
    osType: osTypeFrom(d.osVersion),
    osVersion: d.osVersion,
    buildNumber: d.osBuildNumber,
    userName: d.activatedByName,
    user: d.activatedByEmail || d.username || '—',
    userRole: d.activatedByName ? 'Assigned User' : 'Unassigned',
    empCode: d.activatedByEmployeeCode,
    activated: !!(d.activatedAt || d.activatedByUserId),
    requireLoginEachStartup: !!d.requireLoginEachStartup,
    ip: d.ipAddress || '—',
    mac: d.macAddress || '—',
    status: d.status || 'Offline',
    lastSync: relativeTime(d.lastSeen),
    lastBootTime: formatDate(d.lastBootTime),
    registrationDate: formatDate(d.createdDate),
    activatedOn: formatDate(d.activatedAt),
    lastInventoryUpdate: relativeTime(d.updatedDate),
    usbBlocking: d.usbBlockingEnabled,
    usbBlockingUntil: d.usbBlockingUntil,
    storeGating: d.storeGatingEnabled,
    publicIp: d.publicIPAddress,
    city: d.locationCity,
    region: d.locationRegion,
    country: d.locationCountry,
    latitude: d.latitude,
    longitude: d.longitude,
    locationLabel:
      [d.locationCity, d.locationRegion, d.locationCountry].filter(Boolean).join(', ') || null,
    locationSource: d.locationSource, // "GPS" | "IP" | null
    gpsAccuracyMeters: d.gpsAccuracyMeters,
    locationUpdatedAt: d.locationUpdatedAt,
    // Microsoft Defender status snapshot (read-only)
    defenderRealtime: d.defenderRealtimeProtectionEnabled,
    defenderAntivirus: d.defenderAntivirusEnabled,
    defenderLastQuickScan: d.defenderLastQuickScan,
    defenderLastFullScan: d.defenderLastFullScan,
    defenderSignatureVersion: d.defenderSignatureVersion,
    defenderSignatureAgeDays: d.defenderSignatureAgeDays,
    defenderEngineVersion: d.defenderEngineVersion,
    securityStatusUpdatedAt: d.securityStatusUpdatedAt,
  };
}

// ---------- devices ----------

export async function fetchDevices() {
  const devices = await getJson('/api/devices');
  return devices.map(mapDevice);
}

export function fetchDeviceMetrics(id) {
  return getJson(`/api/devices/${encodeURIComponent(id)}/metrics`);
}

// Live aggregate data for the tenant dashboard overview.
export function fetchOverview() {
  return getJson('/api/overview');
}

export function fetchInstalledApps(id) {
  return getJson(`/api/devices/${encodeURIComponent(id)}/installed-apps`);
}

export function fetchAppUsage(id) {
  return getJson(`/api/devices/${encodeURIComponent(id)}/app-usage`);
}

export function fetchNetworkUsage(id, days = 7) {
  return getJson(`/api/devices/${encodeURIComponent(id)}/network-usage?days=${days}`);
}

export function fetchWorkTime(id, days = 7) {
  return getJson(`/api/devices/${encodeURIComponent(id)}/work-time?days=${days}`);
}

export function fetchThreats(id) {
  return getJson(`/api/devices/${encodeURIComponent(id)}/threats`);
}

export function fetchDeviceCommands(id) {
  return getJson(`/api/devices/${encodeURIComponent(id)}/commands`);
}

export function fetchBlockedWebsites(id) {
  return getJson(`/api/devices/${encodeURIComponent(id)}/blocked-websites`);
}

export async function addBlockedWebsite(id, domain) {
  const res = await fetch(`${API_BASE}/api/devices/${encodeURIComponent(id)}/blocked-websites`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ domain }),
  });
  if (!res.ok) {
    if (res.status === 400 || res.status === 409) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.message ?? `The domain could not be added (${res.status}).`);
    }
    throwForStatus(res.status);
  }
  return res.json();
}

export async function removeBlockedWebsite(id, blockId) {
  const res = await fetch(
    `${API_BASE}/api/devices/${encodeURIComponent(id)}/blocked-websites/${encodeURIComponent(blockId)}`,
    { method: 'DELETE', headers: credentialHeaders },
  );
  if (!res.ok && res.status !== 404) throwForStatus(res.status);
}

export async function setUsbBlocking(id, enabled, durationMinutes = null) {
  const res = await fetch(`${API_BASE}/api/devices/${encodeURIComponent(id)}/usb-blocking`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify({ enabled, durationMinutes }),
  });
  if (!res.ok) throwForStatus(res.status);
  return mapDevice(await res.json());
}

export async function setLoginPolicy(id, enabled) {
  const res = await fetch(`${API_BASE}/api/devices/${encodeURIComponent(id)}/login-policy`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify({ enabled }),
  });
  if (!res.ok) throwForStatus(res.status);
  return mapDevice(await res.json());
}

export async function setStoreGating(id, enabled) {
  const res = await fetch(`${API_BASE}/api/devices/${encodeURIComponent(id)}/store-gating`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify({ enabled }),
  });
  if (!res.ok) throwForStatus(res.status);
  return mapDevice(await res.json());
}

export async function uninstallApp(deviceId, appId) {
  const res = await fetch(
    `${API_BASE}/api/devices/${encodeURIComponent(deviceId)}/installed-apps/${encodeURIComponent(appId)}/uninstall`,
    { method: 'POST', headers: credentialHeaders },
  );
  if (!res.ok) {
    if (res.status === 409 || res.status === 404) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.message ?? `The uninstall could not be queued (${res.status}).`);
    }
    throwForStatus(res.status);
  }
}

export async function queueInstall(deviceId, packageId, type = 'install') {
  const res = await fetch(
    `${API_BASE}/api/devices/${encodeURIComponent(deviceId)}/commands?type=${type}`,
    { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ packageId }) },
  );
  if (!res.ok) {
    if (res.status === 404) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.message ?? `The command could not be queued (${res.status}).`);
    }
    throwForStatus(res.status);
  }
}

export async function cancelDeviceCommand(commandId) {
  const res = await fetch(
    `${API_BASE}/api/devices/commands/${encodeURIComponent(commandId)}/cancel`,
    { method: 'POST', headers: credentialHeaders },
  );
  if (!res.ok) {
    if (res.status === 404 || res.status === 409) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.message ?? `The command could not be cancelled (${res.status}).`);
    }
    throwForStatus(res.status);
  }
}

// ---------- installer packages ----------

export function fetchPackages() {
  return getJson('/api/packages');
}

export async function uploadPackage(file, displayName, silentArgs) {
  const form = new FormData();
  form.append('file', file);
  if (displayName?.trim()) form.append('displayName', displayName.trim());
  if (silentArgs?.trim()) form.append('silentArgs', silentArgs.trim());

  const res = await fetch(`${API_BASE}/api/packages`, {
    method: 'POST',
    headers: credentialHeaders, // no Content-Type: browser sets the multipart boundary
    body: form,
  });
  if (!res.ok) {
    if (res.status === 400) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.message ?? 'The installer could not be uploaded.');
    }
    throwForStatus(res.status);
  }
  return res.json();
}

// ---------- product installer (the agent .exe tenants download) ----------

export async function fetchInstallerInfo() {
  const res = await fetch(`${API_BASE}/api/installers`, { headers: credentialHeaders });
  if (!res.ok) throwForStatus(res.status);
  const data = await res.json();
  return data.installer || null;
}

export async function uploadInstaller(file, version) {
  const form = new FormData();
  form.append('file', file);
  if (version?.trim()) form.append('version', version.trim());
  const res = await fetch(`${API_BASE}/api/installers`, {
    method: 'POST',
    headers: credentialHeaders, // no Content-Type: browser sets the multipart boundary
    body: form,
  });
  if (!res.ok) {
    if (res.status === 400) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.message ?? 'The installer could not be uploaded.');
    }
    throwForStatus(res.status);
  }
  return res.json();
}

// ---------- users ----------

export function fetchUsers() {
  return getJson('/api/users');
}

export async function createUser(input) {
  const res = await fetch(`${API_BASE}/api/users`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    if (res.status === 400 || res.status === 409 || res.status === 403) {
      const body = await res.json().catch(() => null);
      if (body?.errors) {
        const first = Object.values(body.errors).flat()[0];
        if (first) throw new Error(first);
      }
      throw new Error(body?.error ?? body?.message ?? `The user could not be created (${res.status}).`);
    }
    throwForStatus(res.status);
  }
  return res.json();
}

// Dashboard-user quota for the tenant: { limit, count }.
export function fetchUserLimit() {
  return getJson('/api/user-limit');
}

export async function updateUser(id, input) {
  const res = await fetch(`${API_BASE}/api/users/${id}`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify(input),
  });
  if (!res.ok) throwForStatus(res.status);
  return res.json();
}

export async function deleteUser(id) {
  const res = await fetch(`${API_BASE}/api/users/${id}`, {
    method: 'DELETE',
    headers: credentialHeaders,
  });
  if (!res.ok) throwForStatus(res.status);
  return res.json();
}

// ---------- license verification & product download ----------

export async function verifyLicenseKey(licenseKey) {
  const res = await fetch(`${API_BASE}/api/verify-license-download`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ licenseKey }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || 'Invalid or expired license key. Please check your key and try again.');
  }
  return data;
}

