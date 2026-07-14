// Shared backend for Enablers self-assessment data (replaces localStorage-only
// storage so one person's answers become visible to everyone else).
// Same Apps Script Web App exec URL as LOG_URL — see APPS_SCRIPT_SETUP.md.
const ENABLERS_BACKEND_URL = "https://script.google.com/macros/s/AKfycbyiOmQXNYo31FvJ7g33Jmevmj3MhiKq7CAxob_MRtQIh9UGVENBubzQmTgpjuYa5IHhXg/exec";

function ebFetchWithTimeout_(url, opts, ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, Object.assign({}, opts, { signal: ctrl.signal })).finally(() => clearTimeout(t));
}

async function ebFetchDim(dim, timeoutMs) {
  try {
    const res = await ebFetchWithTimeout_(ENABLERS_BACKEND_URL + '?action=getDim&dim=' + encodeURIComponent(dim), { method: 'GET' }, timeoutMs || 4000);
    return res.ok ? await res.json() : null;
  } catch (e) { return null; }
}

async function ebFetchAllStatus(timeoutMs) {
  try {
    const res = await ebFetchWithTimeout_(ENABLERS_BACKEND_URL + '?action=getAllStatus', { method: 'GET' }, timeoutMs || 4000);
    return res.ok ? await res.json() : null;
  } catch (e) { return null; }
}

const _ebSaveTimers = {};
function ebScheduleSaveDim(dim, getData, getStatus, delayMs) {
  clearTimeout(_ebSaveTimers[dim]);
  _ebSaveTimers[dim] = setTimeout(() => {
    const payload = JSON.stringify({ action: 'saveDim', dim, data: getData(), status: getStatus() });
    fetch(ENABLERS_BACKEND_URL, { method: 'POST', body: payload, keepalive: true }).catch(() => {});
  }, delayMs || 800);
}
