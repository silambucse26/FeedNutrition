/**
 * Location and Farm Name Normalization Service
 * Ensures accurate administrative city and clean dairy farm name representation.
 * Cleans ward/sub-locality prefixes (e.g. Alandur, Guindy, Velachery / ஆலந்தூர், கிண்டி)
 * and legacy cached strings, presenting pure district and state formatting.
 */

export const SUB_LOCALITIES = new Set([
  // English sub-localities and wards
  'alandur', 'guindy', 'velachery', 'saidapet', 't nagar', 't. nagar', 
  'mylapore', 'egmore', 'annanagar', 'anna nagar', 'tambaram', 'chromepet', 
  'porur', 'adyar', 'besant nagar', 'triplicane', 'royapettah', 'nungambakkam',
  'kilpauk', 'perambur', 'kodambakkam', 'vadapalani', 'sholinganallur', 'thiruvanmiyur',
  'pallavaram', 'medavakkam', 'madipakkam', 'meenambakkam', 'nanganallur', 'royapuram',
  // Tamil sub-localities and wards
  'ஆலந்தூர்', 'கிண்டி', 'வேளச்சேரி', 'சைதாப்பேட்டை', 'டி நகர்', 'தி. நகர்',
  'மயிலாப்பூர்', 'எழும்பூர்', 'அண்ணா நகர்', 'தாம்பரம்', 'குரோம்பேட்டை',
  'போரூர்', 'அடையாறு', 'பெசன்ட் நகர்', 'திருவல்லிக்கேணி', 'ராயப்பேட்டை',
  'நுங்கம்பாக்கம்', 'கீழ்ப்பாக்கம்', 'பெரம்பூர்', 'கோடம்பாக்கம்', 'வடபழனி',
  'சோழிங்கநல்லூர்', 'திருவான்மியூர்', 'பல்லாவரம்', 'மேடவாக்கம்', 'மடிப்பாக்கம்',
  'மீனம்பாக்கம்', 'நங்கநல்லூர்', 'ராயபுரம்'
]);

export const CITY_TRANSLATIONS = {
  'chennai': { ta: 'சென்னை', hi: 'चेन्नई' },
  'salem': { ta: 'சேலம்', hi: 'सेलम' },
  'coimbatore': { ta: 'கோயம்புத்தூர்', hi: 'कोयंबटूर' },
  'madurai': { ta: 'மதுரை', hi: 'मदुरै' },
  'tiruchirappalli': { ta: 'திருச்சிராப்பள்ளி', hi: 'तिरुचिरापल्ली' },
  'tiruchy': { ta: 'திருச்சி', hi: 'तिरुचि' },
  'tirunelveli': { ta: 'திருநெல்வேலி', hi: 'तिरुनेलवेली' },
  'erode': { ta: 'ஈரோடு', hi: 'इरोड' },
  'vellore': { ta: 'வேலூர்', hi: 'वेल्लोर' },
  'dindigul': { ta: 'திண்டுக்கல்', hi: 'डिंडीगुल' },
  'thanjavur': { ta: 'தஞ்சாவூர்', hi: 'तंजावुर' },
  'kallakurichi': { ta: 'கள்ளக்குறிச்சி', hi: 'कल्लाकुरिची' },
  'dharmapuri': { ta: 'தருமபுரி', hi: 'धर्मपुरी' },
  'krishnagiri': { ta: 'கிருஷ்ணகிரி', hi: 'कृष्णगिरि' },
  'namakkal': { ta: 'நாமக்கல்', hi: 'नमक्कल' },
  'karur': { ta: 'கரூர்', hi: 'करूर' },
  'theni': { ta: 'தேனி', hi: 'थेनी' },
  'virudhunagar': { ta: 'விருதுநகர்', hi: 'विरुधुनगर' },
  'tiruppur': { ta: 'திருப்பூர்', hi: 'तिरुपुर' },
  'kanchipuram': { ta: 'காஞ்சிபுரம்', hi: 'कांचीपुरम' },
  'chengalpattu': { ta: 'செங்கல்பட்டு', hi: 'चेंगलपट्टू' },
  'tiruvallur': { ta: 'திருவள்ளூர்', hi: 'तिरुवल्लूर' },
  'cuddalore': { ta: 'கடலூர்', hi: 'कुड्डालोर' },
  'villupuram': { ta: 'விழுப்புரம்', hi: 'विल्लुपुरम' },
  'ranipet': { ta: 'ராணிப்பேட்டை', hi: 'रानीपेट' },
  'tirupathur': { ta: 'திருப்பத்தூர்', hi: 'तिरुपात्तूर' }
};

/**
 * Extracts a clean, verified District and City from BigDataCloud reverse geocoding
 * Priority is ALWAYS given to the official administrative District (adminLevel 5)
 * and State (adminLevel 4), preventing ward / cell-tower sub-localities (adminLevel 8)
 * from masquerading as the city.
 */
export function extractCleanCityFromBdc(bdcData, currentLang = 'en') {
  if (!bdcData) return '';
  const admin = bdcData.localityInfo?.administrative || [];
  
  // In India: adminLevel 4 is State, adminLevel 5 is District, adminLevel 6 is Taluk, adminLevel 8 is Locality/Ward
  const stateObj = admin.find(a => a.adminLevel === 4);
  const distObj = admin.find(a => a.adminLevel === 5);
  const locality = bdcData.locality || '';
  const bdcCity = bdcData.city || '';
  
  const rawDist = distObj?.name || '';
  const cleanDist = rawDist
    .replace(/\s*(district|மாவட்டம்|வட்டம்|மண்டலம்|ज़िला)/gi, '')
    .trim();
    
  const cleanState = (stateObj?.name || bdcData.principalSubdivision || 'Tamil Nadu')
    .replace(/\s*(state|மாநிலம்|राज्य)/gi, '')
    .trim();

  // If in Chennai municipal district / metropolitan area:
  if (/chennai|சென்னை|चेन्नई/i.test(cleanDist) || /chennai|சென்னை|चेन्नई/i.test(bdcCity)) {
    const isTa = currentLang === 'ta';
    const isHi = currentLang === 'hi';
    const cityName = isTa ? 'சென்னை' : isHi ? 'चेन्नई' : 'Chennai';
    const stateName = isTa ? 'தமிழ்நாடு' : isHi ? 'तमिलनाडु' : 'Tamil Nadu';
    return `${cityName}, ${stateName}`;
  }

  // If bdcCity is a recognized major municipal town distinct from district (e.g. Tambaram in Chengalpattu)
  let primaryCity = cleanDist || bdcCity || locality;
  if (bdcCity && cleanDist && bdcCity.toLowerCase() !== cleanDist.toLowerCase() && !SUB_LOCALITIES.has(bdcCity.toLowerCase())) {
    primaryCity = `${bdcCity}, ${cleanDist}`;
  } else if (cleanDist) {
    primaryCity = cleanDist;
  }
  
  return cleanState && !primaryCity.includes(cleanState) ? `${primaryCity}, ${cleanState}` : primaryCity;
}

/**
 * Resolves a raw location string into structured clean components
 */
export function resolveLocationDetails(rawLocation) {
  if (!rawLocation || typeof rawLocation !== 'string') {
    return {
      city: 'Salem',
      state: 'Tamil Nadu',
      fullLocation: 'Salem, Tamil Nadu',
      farmName: 'Salem Dairy Farm',
      farmNameTa: 'சேலம் பால் பண்ணை',
      farmNameHi: 'सेलम डेयरी फार्म'
    };
  }

  // 1. Strip accidental redundant words from raw input
  let cleaned = String(rawLocation)
    .replace(/dairy farm/gi, '')
    .replace(/பால் பண்ணை/g, '')
    .replace(/डेयरी फार्म/g, '')
    .trim();

  let parts = cleaned.split(',').map(s => s.trim()).filter(Boolean);

  // 2. If sub-locality precedes a major city (e.g., "Alandur, Chennai, Tamil Nadu" or "ஆலந்தூர், சென்னை")
  if (parts.length >= 3) {
    const p0 = parts[0].toLowerCase();
    const p1 = parts[1].toLowerCase();
    if (SUB_LOCALITIES.has(p0) || p1.includes('chennai') || parts[1].includes('சென்னை')) {
      parts = parts.slice(1);
    }
  } else if (parts.length === 2) {
    const p0 = parts[0].toLowerCase();
    const p1 = parts[1].toLowerCase();
    if (SUB_LOCALITIES.has(p0) && (p1.includes('chennai') || parts[1].includes('சென்னை'))) {
      parts = ['Chennai', 'Tamil Nadu'];
    } else if (SUB_LOCALITIES.has(p0)) {
      parts = ['Chennai', parts[1]];
    }
  }

  let city = parts[0] || 'Salem';
  city = city.replace(/\s*(district|மாவட்டம்|வட்டம்|ज़िला)/gi, '').trim();

  let state = parts[1] || 'Tamil Nadu';
  state = state.replace(/\s*(district|மாவட்டம்|வட்டம்|ज़िला)/gi, '').trim();

  // If city is recognized as Chennai in English or Tamil
  if (/chennai|சென்னை|चेन्नई/i.test(city)) {
    city = 'Chennai';
    state = 'Tamil Nadu';
  }

  const fullLocation = state && !city.toLowerCase().includes(state.toLowerCase())
    ? `${city}, ${state}`
    : city;

  const farmName = `${city} Dairy Farm`;

  const cityKey = city.toLowerCase();
  const trans = CITY_TRANSLATIONS[cityKey] || null;
  const farmNameTa = trans?.ta ? `${trans.ta} பால் பண்ணை` : `${city} பால் பண்ணை`;
  const farmNameHi = trans?.hi ? `${trans.hi} डेयरी फार्म` : `${city} डेयरी फार्म`;

  return {
    city,
    state,
    fullLocation,
    farmName,
    farmNameTa,
    farmNameHi
  };
}

/**
 * Sanitizes a weather object ensuring city name is accurate and free of legacy sub-localities
 */
export function sanitizeWeather(weatherObj) {
  if (!weatherObj) return null;
  const copy = { ...weatherObj };
  if (copy.city) {
    const { fullLocation } = resolveLocationDetails(copy.city);
    copy.city = fullLocation;
  }
  return copy;
}
