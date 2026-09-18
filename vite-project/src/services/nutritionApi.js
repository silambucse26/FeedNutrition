const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
// Strip any trailing slash to prevent double slashes like https://domain.com//api/...
const DEFAULT_API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

let resolvedApiUrl = null;
let cachedHealthStatus = null;
let prewarmPromise = null;
let heartbeatTimer = null;

/**
 * Fast resolution of active API URL.
 * If running on localhost / 127.0.0.1, checks if local python backend is active (1s timeout).
 * If local is alive, connects to local in 2ms.
 * Otherwise uses configured DEFAULT_API_BASE_URL (e.g. Render cloud).
 */
export async function getActiveApiUrl() {
  if (resolvedApiUrl) return resolvedApiUrl;

  const isLocalHost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (isLocalHost) {
    // 1. Try Vite proxy relative endpoint (completely bypasses cross-origin CORS)
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 1200);
      const res = await fetch('/api/health', { signal: ctrl.signal });
      clearTimeout(tid);
      if (res.ok) {
        resolvedApiUrl = ''; // Relative path uses Vite's configured proxy to 127.0.0.1:8000
        cachedHealthStatus = { connected: true, timestamp: Date.now() };
        return resolvedApiUrl;
      }
    } catch {
      // Proxy not active or failed, try direct 127.0.0.1:8000
    }

    // 2. Direct local FastAPI server check
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 1200);
      const res = await fetch('http://127.0.0.1:8000/api/health', { signal: ctrl.signal });
      clearTimeout(tid);
      if (res.ok) {
        resolvedApiUrl = 'http://127.0.0.1:8000';
        cachedHealthStatus = { connected: true, timestamp: Date.now() };
        return resolvedApiUrl;
      }
    } catch {
      // Local server not running, fall back to remote
    }
  }

  resolvedApiUrl = DEFAULT_API_BASE_URL;
  return resolvedApiUrl;
}

/**
 * Pre-warm the backend immediately on app load.
 * For Render free-tier, waking from cold start takes 40-50s.
 * Starting the wake-up ping right when the app loads ensures the server is
 * fully awake and warm by the time the user reaches Step 6 (Summary & Calculation).
 */
export function prewarmBackend() {
  if (prewarmPromise) return prewarmPromise;

  prewarmPromise = (async () => {
    try {
      const url = await getActiveApiUrl();
      const ctrl = new AbortController();
      // Generous timeout for initial cold-start wake
      const tid = setTimeout(() => ctrl.abort(), 55000);
      const res = await fetch(`${url}/api/health`, { signal: ctrl.signal });
      clearTimeout(tid);
      if (res.ok) {
        const data = await res.json();
        cachedHealthStatus = { connected: true, data, timestamp: Date.now() };
        return { connected: true, data };
      }
    } catch (e) {
      // Silent in background pre-warm
    }

    // Keep-alive heartbeat: ping every 10 minutes to prevent Render from going to sleep
    if (!heartbeatTimer && typeof window !== 'undefined') {
      heartbeatTimer = setInterval(async () => {
        try {
          const url = resolvedApiUrl || DEFAULT_API_BASE_URL;
          await fetch(`${url}/api/health`);
        } catch {}
      }, 10 * 60 * 1000);
    }

    return { connected: false };
  })();

  return prewarmPromise;
}

/**
 * Health check to verify if the Python backend is reachable.
 * Uses cached result if checked within last 25 seconds for instant response.
 */
export async function checkBackendStatus() {
  // If recently verified, return instantly
  if (cachedHealthStatus && (Date.now() - cachedHealthStatus.timestamp < 25000)) {
    return cachedHealthStatus;
  }

  try {
    const url = await getActiveApiUrl();
    const controller = new AbortController();
    // 50s timeout for cold start if needed
    const timeoutId = setTimeout(() => controller.abort(), 50000);
    const res = await fetch(`${url}/api/health`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      cachedHealthStatus = null;
      return { connected: false, error: `HTTP ${res.status}` };
    }
    const data = await res.json();
    cachedHealthStatus = { connected: true, data, timestamp: Date.now() };
    return cachedHealthStatus;
  } catch (err) {
    cachedHealthStatus = null;
    const isTimeout = err.name === 'AbortError';
    return {
      connected: false,
      error: isTimeout
        ? 'Backend timed out — Render cold start can take up to 50 seconds. Please retry.'
        : (err.message || 'Connection failed')
    };
  }
}

/**
 * Sends complete farm data to Python calculation engine.
 */
export async function runNutritionCalculation(farmData) {
  const payload = {
    weather: farmData.weather ? {
      tempC: Number(farmData.weather.tempC) || 28.0,
      humidity: Number(farmData.weather.humidity) || 65.0,
      condition: farmData.weather.condition || 'Clear',
      city: farmData.weather.city || ''
    } : null,
    selectedBreed: farmData.selectedBreed ? {
      id: farmData.selectedBreed.id,
      name: farmData.selectedBreed.name,
      category: farmData.selectedBreed.category,
      subCategory: farmData.selectedBreed.subCategory,
      avgWeightHeifer: Number(farmData.selectedBreed.avgWeightHeifer) || 320,
      avgWeightCow: Number(farmData.selectedBreed.avgWeightCow) || 450
    } : null,
    heifersData: (farmData.heifersData || []).map(h => ({
      id: String(h.id || ''),
      weight: Number(h.weight) || 300,
      ageMonths: Number(h.ageMonths) || 24
    })),
    pregnantCategory: farmData.pregnantCategory || 'both',
    firstTimeCattle: (farmData.firstTimeCattle || []).map(c => {
      const pm = Number(c.pregMonth !== undefined && c.pregMonth !== '' ? c.pregMonth : (c.gestationalMonths || 7));
      return {
        id: String(c.id || ''),
        weight: Number(c.weight) || 350,
        pregMonth: pm,
        gestationalMonths: pm,
        pregDays: Number(c.pregDays) || (pm * 30)
      };
    }),
    repeatCattle: (farmData.repeatCattle || []).map(c => {
      const pm = Number(c.pregMonth !== undefined && c.pregMonth !== '' ? c.pregMonth : (c.gestationalMonths || 7));
      return {
        id: String(c.id || ''),
        weight: Number(c.weight) || 450,
        pregMonth: pm,
        gestationalMonths: pm,
        pregDays: Number(c.pregDays) || (pm * 30)
      };
    }),
    lactatingData: (farmData.lactatingData || []).map(l => {
      const fat = Number(l.milkFat !== undefined && l.milkFat !== '' ? l.milkFat : (l.fatPct || 4.2));
      const bcsVal = Number(l.bcs !== undefined && l.bcs !== '' ? l.bcs : 3.0);
      const stageVal = l.stage || 'Mid lactation';
      const isFirst = l.lactationType === 'first_lactation' || Boolean(l.isFirstLactation);
      return {
        id: String(l.id || ''),
        weight: Number(l.weight) || 420,
        milkYield: Number(l.milkYield) || 0,
        fatPct: fat,
        milkFat: fat,
        bcs: bcsVal,
        stage: stageVal,
        lactationType: isFirst ? 'first_lactation' : 'second_plus',
        isFirstLactation: isFirst,
        parity: isFirst ? 1 : 2,
        dim: Number(l.dim) || (stageVal.includes('Early') ? 30 : stageVal.includes('Late') ? 210 : 90)
      };
    }),
    dryCowsData: (farmData.dryCowsData || []).map(d => ({
      id: String(d.id || ''),
      weight: Number(d.weight) || 400,
      dryDays: Number(d.dryDays !== undefined && d.dryDays !== '' ? d.dryDays : 45),
      daysToCalving: Number(d.daysToCalving !== undefined && d.daysToCalving !== '' ? d.daysToCalving : 21),
      bcs: Number(d.bcs !== undefined && d.bcs !== '' ? d.bcs : 3.5),
    })),
    bullsData: (farmData.bullsData || []).map(b => ({
      id: String(b.id || ''),
      weight: Number(b.weight) || 550,
      purpose: b.purpose || 'Breeding Bull',
    })),
    grazingSystem: farmData.grazingSystem || 'no_grazing',
    grazingData: farmData.grazingData || {},
    waterVolume: Number(farmData.waterVolume) || 0,
    waterSource: farmData.waterSource || 'Borewell',
    waterQuality: farmData.waterQuality || 'Good',
    selectedFeeds: (farmData.selectedFeeds || []).map(f => ({
      id: String(f.id || ''),
      name: f.name || '',
      category: f.category || 'Green Fodder',
      quantityKg: Number(f.quantityKg) || 0,
      dmPct: Number(f.dmPct) || 25
    }))
  };

  const url = await getActiveApiUrl();
  const res = await fetch(`${url}/api/nutrition/calculate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Calculation failed (${res.status}): ${errText}`);
  }

  return await res.json();
}
