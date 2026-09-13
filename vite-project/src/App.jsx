import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StepProgress from './components/StepProgress';

import Step1BreedSelect from './components/Step1BreedSelect';
import CattleCycleHub from './components/CattleCycleHub';
import Step7Grazing from './components/Step7Grazing';
import Step8Water from './components/Step8Water';
import Step9Feed from './components/Step9Feed';
import Step10Review from './components/Step10Review';
import { prewarmBackend } from './services/nutritionApi';

import { CATTLE_BREEDS } from './data/breeds';
import translations from './data/translations.json';

export default function App() {
  const rawKey = import.meta.env.VITE_OPENWEATHER_API_KEY || '';
  const envApiKey = rawKey.replace(/['"]/g, '').trim();

  // Multi-Language state ('en', 'ta', 'hi', 'te', 'kn', 'mr')
  const [currentLang, setCurrentLang] = useState(() => {
    try {
      return localStorage.getItem('feednutrition_lang') || 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (langCode) => {
    setCurrentLang(langCode);
    try {
      localStorage.setItem('feednutrition_lang', langCode);
    } catch (e) {
      console.error(e);
    }
  };

  // Translation lookup helper
  const t = (path, vars = {}) => {
    const keys = path.split('.');
    const langData = translations[currentLang] || translations['en'];
    const fallbackData = translations['en'];

    let val = keys.reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : null), langData);
    if (val === null || val === undefined) {
      val = keys.reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : null), fallbackData);
    }
    if (val === null || val === undefined) return path;

    if (typeof val === 'string') {
      Object.keys(vars).forEach(k => {
        val = val.replace(new RegExp(`\\{${k}\\}`, 'g'), vars[k]);
      });
    }
    return val;
  };

  // Weather State (null until user detects or enters location, restored from localStorage if available)
  const [weather, setWeather] = useState(() => {
    try {
      const saved = localStorage.getItem('feednutrition_weather');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState(null);
  const [showIosLocationHelp, setShowIosLocationHelp] = useState(false);

  // App Step (1 to 6)
  const [currentStep, setCurrentStep] = useState(1);
  const [herdActiveStage, setHerdActiveStage] = useState('heifers');

  // Step 1: Selected Breed (clean start: null until user selects a breed)
  const [selectedBreed, setSelectedBreed] = useState(null);

  // Step 2: Heifer Cattle Details (Clean default empty list)
  const [heifersData, setHeifersData] = useState([]);

  // Step 3: Pregnant Cattle Details (Clean default empty list)
  const [pregnantCategory, setPregnantCategory] = useState('both');
  const [firstTimeCattle, setFirstTimeCattle] = useState([]);
  const [repeatCattle, setRepeatCattle] = useState([]);

  // Step 4: Lactating Cattle Details (Clean default empty list)
  const [lactatingData, setLactatingData] = useState([]);

  // Step 5: Dry Cow Details (Clean default empty list)
  const [dryCowsData, setDryCowsData] = useState([]);

  // Step 6: Bull Details (Clean default empty list)
  const [bullsData, setBullsData] = useState([]);

  // Step 7: Grazing Management
  const [grazingSystem, setGrazingSystem] = useState('');
  const [grazingData, setGrazingData] = useState({});

  // Step 8: Water Availability (empty by default)
  const [waterVolume, setWaterVolume] = useState('');
  const [waterSource, setWaterSource] = useState('');
  const [waterQuality, setWaterQuality] = useState('Good');

  // Step 9: Feed and Fodder Details (Clean default empty list)
  const [selectedFeeds, setSelectedFeeds] = useState([]);

  // Step Acknowledgment state
  const [acknowledgedSteps, setAcknowledgedSteps] = useState(() => {
    try {
      const savedState = localStorage.getItem('feednutrition_farm_v3');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed.acknowledgedSteps) return parsed.acknowledgedSteps;
      }
    } catch (e) {}
    return {};
  });

  const acknowledgeStep = (stepNum) => {
    setAcknowledgedSteps(prev => ({ ...prev, [stepNum]: true }));
  };

  // Prevent mouse wheel from accidentally incrementing/decrementing number inputs across the entire app
  useEffect(() => {
    const handleWheel = (e) => {
      if (document.activeElement && document.activeElement.tagName === 'INPUT' && document.activeElement.type === 'number') {
        document.activeElement.blur();
      }
      if (e.target && e.target.tagName === 'INPUT' && e.target.type === 'number') {
        e.target.blur();
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  // Load saved state from LocalStorage on mount (clean purge of legacy mock data)
  useEffect(() => {
    // Proactively pre-warm backend (Render cloud / local) so it is hot and instant by calculation time
    prewarmBackend();

    try {
      // 1. Permanently remove old legacy mock storage key if present in browser
      localStorage.removeItem('bovina_farm_state');

      // 2. Load legitimate user data from new storage key
      const savedState = localStorage.getItem('feednutrition_farm_v3');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed.selectedBreed) setSelectedBreed(parsed.selectedBreed);
        if (Array.isArray(parsed.heifersData)) setHeifersData(parsed.heifersData);
        if (parsed.pregnantCategory) setPregnantCategory(parsed.pregnantCategory);
        if (Array.isArray(parsed.firstTimeCattle)) setFirstTimeCattle(parsed.firstTimeCattle);
        if (Array.isArray(parsed.repeatCattle)) setRepeatCattle(parsed.repeatCattle);
        if (Array.isArray(parsed.lactatingData)) setLactatingData(parsed.lactatingData);
        if (Array.isArray(parsed.dryCowsData)) setDryCowsData(parsed.dryCowsData);
        if (Array.isArray(parsed.bullsData)) setBullsData(parsed.bullsData);
        if (parsed.grazingSystem) setGrazingSystem(parsed.grazingSystem);
        if (parsed.grazingData) setGrazingData(parsed.grazingData);
        if (typeof parsed.waterVolume === 'number') setWaterVolume(parsed.waterVolume);
        if (parsed.waterSource) setWaterSource(parsed.waterSource);
        if (parsed.waterQuality) setWaterQuality(parsed.waterQuality);
        if (Array.isArray(parsed.selectedFeeds)) setSelectedFeeds(parsed.selectedFeeds);
        if (parsed.acknowledgedSteps) setAcknowledgedSteps(parsed.acknowledgedSteps);
      }
    } catch (e) {
      console.error('LocalStorage load failed', e);
    }
  }, []);

  // Reset all farm data to clean empty state
  const handleResetAllData = () => {
    setSelectedBreed(null);
    setHeifersData([]);
    setPregnantCategory('both');
    setFirstTimeCattle([]);
    setRepeatCattle([]);
    setLactatingData([]);
    setDryCowsData([]);
    setBullsData([]);
    setGrazingSystem('');
    setGrazingData({});
    setWaterVolume('');
    setWaterSource('');
    setWaterQuality('Good');
    setSelectedFeeds([]);
    setAcknowledgedSteps({});
    setCurrentStep(1);
    try {
      localStorage.removeItem('bovina_farm_state');
      localStorage.removeItem('feednutrition_farm_v3');
    } catch (e) {
      console.error('Reset failed', e);
    }
  };

  // Save state automatically whenever user fills or modifies data
  useEffect(() => {
    try {
      const payload = {
        selectedBreed,
        heifersData,
        pregnantCategory,
        firstTimeCattle,
        repeatCattle,
        lactatingData,
        dryCowsData,
        bullsData,
        grazingSystem,
        grazingData,
        waterVolume,
        waterSource,
        waterQuality,
        selectedFeeds,
        acknowledgedSteps
      };
      localStorage.setItem('feednutrition_farm_v3', JSON.stringify(payload));
    } catch (e) {
      console.error('LocalStorage save failed', e);
    }
  }, [
    selectedBreed,
    heifersData,
    pregnantCategory,
    firstTimeCattle,
    repeatCattle,
    lactatingData,
    dryCowsData,
    bullsData,
    grazingSystem,
    grazingData,
    waterVolume,
    waterSource,
    waterQuality,
    selectedFeeds,
    acknowledgedSteps
  ]);

  // Helper: map WMO weather code to text
  const getWeatherConditionFromCode = (code) => {
    if (code === 0) return 'Clear';
    if (code >= 1 && code <= 3) return 'Partly Cloudy';
    if (code === 45 || code === 48) return 'Foggy';
    if (code >= 51 && code <= 67) return 'Rain';
    if (code >= 71 && code <= 77) return 'Snow';
    if (code >= 80 && code <= 82) return 'Rain Showers';
    if (code >= 95) return 'Thunderstorm';
    return 'Clear';
  };

  // Weather by coordinates with iOS Safari compatibility & multi-tier fallback
  const fetchWeatherByCoords = () => {
    if (!navigator.geolocation) {
      setWeatherError('Geolocation is not supported by your browser.');
      return;
    }

    const isIOS = typeof navigator !== 'undefined' && 
      (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
    const isLocalhost = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const isSecure = typeof window !== 'undefined' && (window.isSecureContext || isLocalhost);

    if (!isSecure) {
      const msg = isIOS
        ? 'iOS Safari requires an HTTPS connection for live GPS location. Please search your city manually below.'
        : 'Live location requires a secure HTTPS connection. Please search city manually.';
      setWeatherError(msg);
      setShowIosLocationHelp(true);
      return;
    }

    setLoadingWeather(true);
    setWeatherError(null);

    const handleSuccess = async (pos) => {
      try {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        // 1. Precise Reverse Geocoding to get City / District / Town Name
        let cityName = '';
        if (envApiKey) {
          try {
            const owGeoRes = await fetch(
              `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${envApiKey}`
            );
            if (owGeoRes.ok) {
              const owGeoData = await owGeoRes.json();
              if (owGeoData && owGeoData.length > 0) {
                cityName = owGeoData[0].name || '';
              }
            }
          } catch (e) {
            console.warn('OpenWeather reverse geocode fallback', e);
          }
        }

        if (!cityName) {
          try {
            const geoRes = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
            );
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              cityName = geoData.locality || geoData.city || geoData.town || geoData.village || geoData.county || geoData.principalSubdivision || '';
            }
          } catch (e) {
            console.warn('BigDataCloud reverse geocode fallback', e);
          }
        }

        if (!cityName) {
          try {
            const nomRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`
            );
            if (nomRes.ok) {
              const nomData = await nomRes.json();
              cityName = nomData.address?.city || nomData.address?.town || nomData.address?.village || nomData.address?.county || nomData.address?.state_district || nomData.name || '';
            }
          } catch (e) {
            console.warn('Nominatim reverse geocode fallback', e);
          }
        }

        // 2. Fetch Real-time Weather Data (OpenWeather if API key available, else Open-Meteo)
        let temp = 28;
        let rh = 65;
        let condition = 'Clear';
        let weatherFetched = false;

        if (envApiKey) {
          try {
            const owRes = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${envApiKey}`
            );
            if (owRes.ok) {
              const owData = await owRes.json();
              temp = Math.round(owData.main.temp);
              rh = Math.round(owData.main.humidity);
              condition = owData.weather[0]?.main || 'Clear';
              if (!cityName) cityName = owData.name;
              weatherFetched = true;
            }
          } catch (e) {
            console.warn('OpenWeather fetch failed, trying Open-Meteo', e);
          }
        }

        if (!weatherFetched) {
          // Open-Meteo High Accuracy Real-time Weather (Free, No Key Required)
          const omRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code`
          );
          if (omRes.ok) {
            const omData = await omRes.json();
            if (omData.current) {
              temp = Math.round(omData.current.temperature_2m);
              rh = Math.round(omData.current.relative_humidity_2m);
              condition = getWeatherConditionFromCode(omData.current.weather_code);
              weatherFetched = true;
            }
          }
        }

        if (!cityName) {
          cityName = `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`;
        }

        const thiCalc = Math.round(0.8 * temp + (rh / 100) * (temp - 14.4) + 46.4);
        const weatherObj = {
          city: cityName,
          tempC: temp,
          humidity: rh,
          condition: condition,
          thi: thiCalc,
          lat,
          lon
        };

        setWeather(weatherObj);
        setShowIosLocationHelp(false);
        try {
          localStorage.setItem('feednutrition_weather', JSON.stringify(weatherObj));
        } catch (e) {}
      } catch (err) {
        console.error(err);
        setWeatherError('Could not fetch location weather data. Please search city manually.');
      } finally {
        setLoadingWeather(false);
      }
    };

    const handleInitialFailure = (err) => {
      console.warn('High-accuracy geolocation failed, attempting cell/network fallback', err);
      // If code === 1 (PERMISSION_DENIED), user or iOS settings denied permission
      if (err.code === 1) {
        if (isIOS) {
          setShowIosLocationHelp(true);
        }
        setWeatherError('Location access was denied on iOS. Tap for Settings guide or enter city manually.');
        setLoadingWeather(false);
        return;
      }

      // Tier 2: Low-accuracy fallback with cached position (fast and reliable on iOS Safari)
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        (fallbackErr) => {
          console.warn('Fallback geolocation failed', fallbackErr);
          if (fallbackErr.code === 1 && isIOS) {
            setShowIosLocationHelp(true);
          }
          setWeatherError('Could not acquire GPS position. Please pick your city manually.');
          setLoadingWeather(false);
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
      );
    };

    // Tier 1: Try high accuracy first with 6s timeout
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleInitialFailure,
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 }
    );
  };

  // Weather by city search
  const fetchWeatherByCity = async (cityName) => {
    if (!cityName) return;
    setLoadingWeather(true);
    setWeatherError(null);

    try {
      let lat = null;
      let lon = null;
      let resolvedName = cityName;
      let temp = 28;
      let rh = 65;
      let condition = 'Clear';
      let weatherFetched = false;

      // 1. Try OpenWeather if API key available
      if (envApiKey) {
        try {
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&units=metric&appid=${envApiKey}`
          );
          if (res.ok) {
            const data = await res.json();
            lat = data.coord.lat;
            lon = data.coord.lon;
            resolvedName = data.name || cityName;
            temp = Math.round(data.main.temp);
            rh = Math.round(data.main.humidity);
            condition = data.weather[0]?.main || 'Clear';
            weatherFetched = true;
          }
        } catch (e) {
          console.warn('OpenWeather city search failed', e);
        }
      }

      // 2. Open-Meteo Geocoding + Weather fallback (Free, 100% Reliable in Production)
      if (!weatherFetched) {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
        );
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.results && geoData.results.length > 0) {
            const r = geoData.results[0];
            lat = r.latitude;
            lon = r.longitude;
            resolvedName = r.name;

            const omRes = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code`
            );
            if (omRes.ok) {
              const omData = await omRes.json();
              if (omData.current) {
                temp = Math.round(omData.current.temperature_2m);
                rh = Math.round(omData.current.relative_humidity_2m);
                condition = getWeatherConditionFromCode(omData.current.weather_code);
                weatherFetched = true;
              }
            }
          }
        }
      }

      const thiCalc = Math.round(0.8 * temp + (rh / 100) * (temp - 14.4) + 46.4);
      const weatherObj = {
        city: resolvedName,
        tempC: temp,
        humidity: rh,
        condition: condition,
        thi: thiCalc,
        lat,
        lon
      };

      setWeather(weatherObj);
      try {
        localStorage.setItem('feednutrition_weather', JSON.stringify(weatherObj));
      } catch (e) {}
    } catch (err) {
      console.error(err);
      setWeatherError(`Could not find weather for "${cityName}".`);
    } finally {
      setLoadingWeather(false);
    }
  };

  // Weather completeness check - Location, Temp, and RH are MANDATORY
  const isWeatherComplete = Boolean(
    weather &&
    weather.city &&
    typeof weather.tempC === 'number' &&
    !isNaN(weather.tempC) &&
    typeof weather.humidity === 'number' &&
    !isNaN(weather.humidity)
  );

  // Precise Step Status Evaluation (Steps 1 to 6):
  // 'complete' (Green) | 'partial' (Yellow) | 'empty' (Red)
  const getStepStatus = (stepNum) => {
    switch (stepNum) {
      case 1:
        return selectedBreed ? 'complete' : 'empty';

      case 2: // Cattle Herd Hub (All 5 Categories)
        {
          const totalCattle = (heifersData?.length || 0) + (firstTimeCattle?.length || 0) + (repeatCattle?.length || 0) + (lactatingData?.length || 0) + (dryCowsData?.length || 0) + (bullsData?.length || 0);
          if (totalCattle === 0) return acknowledgedSteps[2] ? 'complete' : 'empty';
          const hasInvalidCattle = 
            (heifersData && heifersData.some(h => !h.weight || Number(h.weight) <= 0)) ||
            (firstTimeCattle && firstTimeCattle.some(c => !c.weight || Number(c.weight) <= 0)) ||
            (repeatCattle && repeatCattle.some(c => !c.weight || Number(c.weight) <= 0)) ||
            (lactatingData && lactatingData.some(l => !l.weight || Number(l.weight) <= 0 || l.milkYield === '' || Number(l.milkYield) <= 0 || l.milkFat === '' || Number(l.milkFat) <= 0)) ||
            (dryCowsData && dryCowsData.some(d => !d.weight || Number(d.weight) <= 0)) ||
            (bullsData && bullsData.some(b => !b.weight || Number(b.weight) <= 0));
          return hasInvalidCattle ? 'partial' : 'complete';
        }

      case 3: // Grazing Management
        return (grazingSystem || acknowledgedSteps[3]) ? 'complete' : 'empty';

      case 4: // Water Availability
        if (Number(waterVolume) > 0 && waterSource) return 'complete';
        if (Number(waterVolume) > 0 || waterSource) return 'partial';
        return acknowledgedSteps[4] ? 'partial' : 'empty';

      case 5: // Feed & Fodder
        if (selectedFeeds && selectedFeeds.length > 0) {
          const hasZeroKg = selectedFeeds.some(f => !f.quantityKg || Number(f.quantityKg) <= 0);
          return hasZeroKg ? 'partial' : 'complete';
        }
        return 'empty';

      case 6: // Review & Formulation
        {
          const totalCattle = (heifersData?.length || 0) + (firstTimeCattle?.length || 0) + (repeatCattle?.length || 0) + (lactatingData?.length || 0) + (dryCowsData?.length || 0) + (bullsData?.length || 0);
          const hasBreed = Boolean(selectedBreed);
          const hasWater = Number(waterVolume) > 0 && Boolean(waterSource);
          const hasFeed = selectedFeeds && selectedFeeds.length > 0 && selectedFeeds.every(f => Number(f.quantityKg) > 0);
          const hasInvalidCattle = 
            (heifersData && heifersData.some(h => !h.weight || Number(h.weight) <= 0)) ||
            (firstTimeCattle && firstTimeCattle.some(c => !c.weight || Number(c.weight) <= 0)) ||
            (repeatCattle && repeatCattle.some(c => !c.weight || Number(c.weight) <= 0)) ||
            (lactatingData && lactatingData.some(l => !l.weight || Number(l.weight) <= 0 || l.milkYield === '' || Number(l.milkYield) <= 0 || l.milkFat === '' || Number(l.milkFat) <= 0)) ||
            (dryCowsData && dryCowsData.some(d => !d.weight || Number(d.weight) <= 0)) ||
            (bullsData && bullsData.some(b => !b.weight || Number(b.weight) <= 0));

          if (hasBreed && totalCattle > 0 && !hasInvalidCattle && hasWater && hasFeed && isWeatherComplete) {
            return 'complete';
          }
          if (hasBreed || totalCattle > 0 || hasWater || (selectedFeeds && selectedFeeds.length > 0)) {
            return 'partial';
          }
          return 'empty';
        }

      default:
        return 'empty';
    }
  };

  const isStepValid = (stepNumber) => {
    return getStepStatus(stepNumber) === 'complete';
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-page)' }}>
      {/* Top Navbar with Language Selector */}
      <Navbar 
        weather={weather}
        loadingWeather={loadingWeather}
        weatherError={weatherError}
        clearWeatherError={() => setWeatherError(null)}
        fetchWeatherByCoords={fetchWeatherByCoords}
        fetchWeatherByCity={fetchWeatherByCity}
        envApiKey={envApiKey}
        currentLang={currentLang}
        setLang={setLanguage}
        showIosLocationHelp={showIosLocationHelp}
        setShowIosLocationHelp={setShowIosLocationHelp}
        t={t}
      />

      {/* Main Container */}
      <main style={{
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        padding: 'clamp(12px, 3vw, 24px) clamp(10px, 2.5vw, 16px)',
        flex: 1
      }}>
        {/* Step Progress Bar (6 steps) */}
        <StepProgress 
          currentStep={currentStep} 
          setStep={(step) => setCurrentStep(step)} 
          getStepStatus={getStepStatus}
          isStepValid={isStepValid}
          isWeatherComplete={isWeatherComplete}
          t={t}
        />

        {/* Step 1: Breed Selection */}
        {currentStep === 1 && (
          <Step1BreedSelect 
            selectedBreed={selectedBreed}
            onSelectBreed={setSelectedBreed}
            allEnteredAnimals={[...lactatingData, ...firstTimeCattle, ...repeatCattle, ...heifersData, ...dryCowsData, ...bullsData]}
            onNext={() => {
              acknowledgeStep(1);
              setCurrentStep(2);
            }}
            t={t}
          />
        )}

        {/* Step 2: Cattle Herd Hub (All 5 Categories via Interactive Cycle) */}
        {currentStep === 2 && (
          <CattleCycleHub
            heifersData={heifersData}
            setHeifersData={setHeifersData}
            firstTimeCattle={firstTimeCattle}
            setFirstTimeCattle={setFirstTimeCattle}
            repeatCattle={repeatCattle}
            setRepeatCattle={setRepeatCattle}
            pregnantCategory={pregnantCategory}
            setPregnantCategory={setPregnantCategory}
            lactatingData={lactatingData}
            setLactatingData={setLactatingData}
            dryCowsData={dryCowsData}
            setDryCowsData={setDryCowsData}
            bullsData={bullsData}
            setBullsData={setBullsData}
            defaultBreed={selectedBreed}
            initialActiveStage={herdActiveStage}
            acknowledgeStep={() => acknowledgeStep(2)}
            onNext={() => {
              acknowledgeStep(2);
              setCurrentStep(3);
            }}
            onPrev={() => setCurrentStep(1)}
            t={t}
          />
        )}

        {/* Step 3: Grazing Management */}
        {currentStep === 3 && (
          <Step7Grazing
            grazingSystem={grazingSystem}
            setGrazingSystem={setGrazingSystem}
            grazingData={grazingData}
            setGrazingData={setGrazingData}
            heifersCount={heifersData?.length || 0}
            pregnantCount={(firstTimeCattle?.length || 0) + (repeatCattle?.length || 0)}
            lactatingCount={lactatingData?.length || 0}
            dryCount={dryCowsData?.length || 0}
            bullsCount={bullsData?.length || 0}
            acknowledgeStep={() => acknowledgeStep(3)}
            onNext={() => {
              acknowledgeStep(3);
              setCurrentStep(4);
            }}
            onPrev={() => setCurrentStep(2)}
            t={t}
          />
        )}

        {/* Step 4: Water Availability */}
        {currentStep === 4 && (
          <Step8Water 
            waterVolume={waterVolume}
            setWaterVolume={setWaterVolume}
            waterSource={waterSource}
            setWaterSource={setWaterSource}
            waterQuality={waterQuality}
            setWaterQuality={setWaterQuality}
            acknowledgeStep={() => acknowledgeStep(4)}
            onNext={() => {
              acknowledgeStep(4);
              setCurrentStep(5);
            }}
            onPrev={() => setCurrentStep(3)}
            t={t}
          />
        )}

        {/* Step 5: Feed & Fodder Inventory */}
        {currentStep === 5 && (
          <Step9Feed 
            selectedFeeds={selectedFeeds}
            setSelectedFeeds={setSelectedFeeds}
            acknowledgeStep={() => acknowledgeStep(5)}
            onNext={() => {
              acknowledgeStep(5);
              setCurrentStep(6);
            }}
            onPrev={() => setCurrentStep(4)}
            t={t}
          />
        )}

        {/* Step 6: Summary & Calculation */}
        {currentStep === 6 && (
          <Step10Review 
            weather={weather}
            setWeather={setWeather}
            fetchWeatherByCoords={fetchWeatherByCoords}
            fetchWeatherByCity={fetchWeatherByCity}
            isWeatherComplete={isWeatherComplete}
            getStepStatus={getStepStatus}
            selectedBreed={selectedBreed}
            heifersData={heifersData}
            pregnantCategory={pregnantCategory}
            firstTimeCattle={firstTimeCattle}
            repeatCattle={repeatCattle}
            lactatingData={lactatingData}
            dryCowsData={dryCowsData}
            bullsData={bullsData}
            grazingSystem={grazingSystem}
            grazingData={grazingData}
            waterVolume={waterVolume}
            waterSource={waterSource}
            waterQuality={waterQuality}
            selectedFeeds={selectedFeeds}
            onEditStep={(step) => {
              if (step === 1) setCurrentStep(1);
              else if (step === 2) { setHerdActiveStage('heifers'); setCurrentStep(2); }
              else if (step === 3) { setHerdActiveStage('pregnant'); setCurrentStep(2); }
              else if (step === 4) { setHerdActiveStage('lactating'); setCurrentStep(2); }
              else if (step === 5) { setHerdActiveStage('dry'); setCurrentStep(2); }
              else if (step === 6) { setHerdActiveStage('bulls'); setCurrentStep(2); }
              else if (step === 7) setCurrentStep(3); // Grazing
              else if (step === 8) setCurrentStep(4); // Water
              else if (step === 9) setCurrentStep(5); // Feed
              else setCurrentStep(6); // Review
            }}
            onResetAllData={handleResetAllData}
            t={t}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        textAlign: 'center',
        padding: '20px',
        color: '#475569',
        fontSize: '0.8rem',
        fontWeight: 600
      }}>
        MOOPOSHAQ - {t('brand_tagline')}
      </footer>
    </div>
  );
}
