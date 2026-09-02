import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StepProgress from './components/StepProgress';

import Step1BreedSelect from './components/Step1BreedSelect';
import Step2Heifers from './components/Step2Heifers';
import Step3PregnantCows from './components/Step3PregnantCows';
import Step4Lactation from './components/Step4Lactation';
import Step5DryCows from './components/Step5DryCows';
import Step6Bulls from './components/Step6Bulls';
import Step7Grazing from './components/Step7Grazing';
import Step8Water from './components/Step8Water';
import Step9Feed from './components/Step9Feed';
import Step10Review from './components/Step10Review';

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

  // App Step (1 to 10)
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Selected Breed
  const [selectedBreed, setSelectedBreed] = useState(CATTLE_BREEDS[0]);

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
  const [grazingSystem, setGrazingSystem] = useState('no_grazing');
  const [grazingData, setGrazingData] = useState({});

  // Step 8: Water Availability
  const [waterVolume, setWaterVolume] = useState(0);
  const [waterSource, setWaterSource] = useState('Borewell');
  const [waterQuality, setWaterQuality] = useState('Good');

  // Step 9: Feed and Fodder Details (Clean default empty list)
  const [selectedFeeds, setSelectedFeeds] = useState([]);

  // Load saved state from LocalStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('bovina_farm_state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed.selectedBreed) setSelectedBreed(parsed.selectedBreed);
        if (parsed.heifersData) setHeifersData(parsed.heifersData);
        if (parsed.pregnantCategory) setPregnantCategory(parsed.pregnantCategory);
        if (parsed.firstTimeCattle) setFirstTimeCattle(parsed.firstTimeCattle);
        if (parsed.repeatCattle) setRepeatCattle(parsed.repeatCattle);
        if (parsed.lactatingData) setLactatingData(parsed.lactatingData);
        if (parsed.dryCowsData) setDryCowsData(parsed.dryCowsData);
        if (parsed.bullsData) setBullsData(parsed.bullsData);
        if (parsed.grazingSystem) setGrazingSystem(parsed.grazingSystem);
        if (parsed.grazingData) setGrazingData(parsed.grazingData);
        if (parsed.waterVolume) setWaterVolume(parsed.waterVolume);
        if (parsed.waterSource) setWaterSource(parsed.waterSource);
        if (parsed.waterQuality) setWaterQuality(parsed.waterQuality);
        if (parsed.selectedFeeds) setSelectedFeeds(parsed.selectedFeeds);
      }
    } catch (e) {
      console.error('LocalStorage load failed', e);
    }
  }, []);

  // Save state automatically whenever data changes
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
        selectedFeeds
      };
      localStorage.setItem('bovina_farm_state', JSON.stringify(payload));
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
    selectedFeeds
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

  // Weather by coordinates with High Accuracy Geolocation & Reverse Geocoding
  const fetchWeatherByCoords = () => {
    if (!navigator.geolocation) {
      setWeatherError('Geolocation not supported by your browser');
      return;
    }

    setLoadingWeather(true);
    setWeatherError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          // 1. Precise Reverse Geocoding to get City / District / Town Name
          let cityName = '';
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
          try {
            localStorage.setItem('feednutrition_weather', JSON.stringify(weatherObj));
          } catch (e) {}
        } catch (err) {
          console.error(err);
          setWeatherError('Could not fetch location weather data.');
        } finally {
          setLoadingWeather(false);
        }
      },
      (err) => {
        console.warn('Geolocation error / permission denied', err);
        setWeatherError('Location access was denied or timed out. Please enter city manually.');
        setLoadingWeather(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
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

  const isStepValid = (stepNumber) => {
    if (stepNumber === 1) return selectedBreed !== null;
    return true;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-page)' }}>
      {/* Top Navbar with Language Selector */}
      <Navbar 
        weather={weather}
        fetchWeatherByCoords={fetchWeatherByCoords}
        fetchWeatherByCity={fetchWeatherByCity}
        envApiKey={envApiKey}
        currentLang={currentLang}
        setLang={setLanguage}
        t={t}
      />

      {/* Main Container */}
      <main style={{
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        padding: '24px 16px',
        flex: 1
      }}>
        {/* Step Progress Bar */}
        <StepProgress 
          currentStep={currentStep} 
          setStep={(step) => setCurrentStep(step)} 
          isStepValid={isStepValid}
          t={t}
        />

        {/* Step Views */}
        {currentStep === 1 && (
          <Step1BreedSelect 
            selectedBreed={selectedBreed}
            onSelectBreed={setSelectedBreed}
            onNext={() => setCurrentStep(2)}
            t={t}
          />
        )}

        {currentStep === 2 && (
          <Step2Heifers 
            heifersData={heifersData}
            setHeifersData={setHeifersData}
            defaultBreed={selectedBreed}
            onNext={() => setCurrentStep(3)}
            onPrev={() => setCurrentStep(1)}
            t={t}
          />
        )}

        {currentStep === 3 && (
          <Step3PregnantCows 
            pregnantCategory={pregnantCategory}
            setPregnantCategory={setPregnantCategory}
            firstTimeCattle={firstTimeCattle}
            setFirstTimeCattle={setFirstTimeCattle}
            repeatCattle={repeatCattle}
            setRepeatCattle={setRepeatCattle}
            defaultBreed={selectedBreed}
            onNext={() => setCurrentStep(4)}
            onPrev={() => setCurrentStep(2)}
            t={t}
          />
        )}

        {currentStep === 4 && (
          <Step4Lactation 
            lactatingData={lactatingData}
            setLactatingData={setLactatingData}
            defaultBreed={selectedBreed}
            onNext={() => setCurrentStep(5)}
            onPrev={() => setCurrentStep(3)}
            t={t}
          />
        )}

        {currentStep === 5 && (
          <Step5DryCows 
            dryCowsData={dryCowsData}
            setDryCowsData={setDryCowsData}
            defaultBreed={selectedBreed}
            onNext={() => setCurrentStep(6)}
            onPrev={() => setCurrentStep(4)}
            t={t}
          />
        )}

        {currentStep === 6 && (
          <Step6Bulls 
            bullsData={bullsData}
            setBullsData={setBullsData}
            defaultBreed={selectedBreed}
            onNext={() => setCurrentStep(7)}
            onPrev={() => setCurrentStep(5)}
            t={t}
          />
        )}

        {currentStep === 7 && (
          <Step7Grazing 
            grazingSystem={grazingSystem}
            setGrazingSystem={setGrazingSystem}
            grazingData={grazingData}
            setGrazingData={setGrazingData}
            onNext={() => setCurrentStep(8)}
            onPrev={() => setCurrentStep(6)}
            t={t}
          />
        )}

        {currentStep === 8 && (
          <Step8Water 
            waterVolume={waterVolume}
            setWaterVolume={setWaterVolume}
            waterSource={waterSource}
            setWaterSource={setWaterSource}
            waterQuality={waterQuality}
            setWaterQuality={setWaterQuality}
            onNext={() => setCurrentStep(9)}
            onPrev={() => setCurrentStep(7)}
            t={t}
          />
        )}

        {currentStep === 9 && (
          <Step9Feed 
            selectedFeeds={selectedFeeds}
            setSelectedFeeds={setSelectedFeeds}
            onNext={() => setCurrentStep(10)}
            onPrev={() => setCurrentStep(8)}
            t={t}
          />
        )}

        {currentStep === 10 && (
          <Step10Review 
            weather={weather}
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
            onEditStep={(step) => setCurrentStep(step)}
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
        FeedNutrition AI - {t('brand_tagline')}
      </footer>
    </div>
  );
}
