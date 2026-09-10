const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
// Strip any trailing slash to prevent double slashes like https://domain.com//api/...
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

/**
 * Health check to verify if the Python backend is reachable.
 * Render free-tier cold starts can take up to 50 seconds.
 */
export async function checkBackendStatus() {
  try {
    const controller = new AbortController();
    // 50s timeout — Render free tier needs up to 50s to wake from a cold start
    const timeoutId = setTimeout(() => controller.abort(), 50000);
    const res = await fetch(`${API_BASE_URL}/api/health`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) return { connected: false, error: `HTTP ${res.status}` };
    const data = await res.json();
    return { connected: true, data };
  } catch (err) {
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
        dim: Number(l.dim) || (stageVal.includes('Early') ? 30 : stageVal.includes('Late') ? 210 : 90)
      };
    }),
    dryCowsData: (farmData.dryCowsData || []).map(d => ({
      id: String(d.id || ''),
      weight: Number(d.weight) || 400,
      dryDays: Number(d.dryDays !== undefined && d.dryDays !== '' ? d.dryDays : 45)
    })),
    bullsData: (farmData.bullsData || []).map(b => ({
      id: String(b.id || ''),
      weight: Number(b.weight) || 550
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

  const res = await fetch(`${API_BASE_URL}/api/nutrition/calculate`, {
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
