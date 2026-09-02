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

  // Weather State (null until user detects or enters location)
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState(null);

  // App Step (1 to 10)
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Selected Breed
  const [selectedBreed, setSelectedBreed] = useState(CATTLE_BREEDS[0]);

  // Step 2: Heifer Cattle Details
  const [heifersData, setHeifersData] = useState([
    { id: 1, weight: 350 },
    { id: 2, weight: 320 }
  ]);

  // Step 3: Pregnant Cattle Details
  const [pregnantCategory, setPregnantCategory] = useState('both');
  const [firstTimeCattle, setFirstTimeCattle] = useState([
    { id: 1, weight: 450, inputType: 'months', pregMonth: 5, pregDays: 150 }
  ]);
  const [repeatCattle, setRepeatCattle] = useState([
    { id: 2, weight: 520, inputType: 'months', pregMonth: 7, pregDays: 210 }
  ]);

  // Step 4: Lactating Cattle Details
  const [lactatingData, setLactatingData] = useState([
    { id: 1, weight: 520, bcs: 3.5, milkYield: 18, milkFat: 4.2, stage: 'Early lactation' }
  ]);

  // Step 5: Dry Cow Details
  const [dryCowsData, setDryCowsData] = useState([
    { id: 1, weight: 500, dryDays: 60 }
  ]);

  // Step 6: Bull Details
  const [bullsData, setBullsData] = useState([
    { id: 1, weight: 650 }
  ]);

  // Step 7: Grazing Management
  const [grazingSystem, setGrazingSystem] = useState('farm_only');
  const [grazingData, setGrazingData] = useState({
    heifers: { hours: 4, areaType: 'Pasture', distance: 1.5 },
    pregnant: { hours: 3, areaType: 'Pasture', distance: 1.0 },
    lactating: { hours: 5, areaType: 'Pasture', distance: 2.0 },
    dry: { hours: 4, areaType: 'Pasture', distance: 1.0 },
    bulls: { hours: 3, areaType: 'Pasture', distance: 1.0 }
  });

  // Step 8: Water Availability
  const [waterVolume, setWaterVolume] = useState(500);
  const [waterSource, setWaterSource] = useState('Borewell');
  const [waterQuality, setWaterQuality] = useState('Good');

  // Step 9: Feed and Fodder Details
  const [selectedFeeds, setSelectedFeeds] = useState([
    { id: 'maize_fodder', name: 'Maize Fodder', category: 'Green Fodder', dmPct: 22, quantityKg: 25 },
    { id: 'wheat_straw', name: 'Wheat Straw (Bhoosa)', category: 'Dry Fodder', dmPct: 90, quantityKg: 6 },
    { id: 'wheat_bran', name: 'Wheat Bran', category: 'Concentrates', dmPct: 88, quantityKg: 4 }
  ]);

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

  // Weather by coordinates
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
          const apiKey = envApiKey;

          if (!apiKey) {
            setWeather({
              city: 'Detected Location',
              tempC: 30,
              humidity: 65,
              condition: 'Sunny',
              thi: 78
            });
            setLoadingWeather(false);
            return;
          }

          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
          );
          if (!res.ok) throw new Error('Failed to fetch weather');
          const data = await res.json();

          const temp = data.main.temp;
          const rh = data.main.humidity;
          const thiCalc = 0.8 * temp + (rh / 100) * (temp - 14.4) + 46.4;

          setWeather({
            city: data.name,
            tempC: temp,
            humidity: rh,
            condition: data.weather[0]?.main || 'Clear',
            thi: Math.round(thiCalc)
          });
        } catch (err) {
          console.error(err);
          setWeatherError('Could not fetch real weather data.');
        } finally {
          setLoadingWeather(false);
        }
      },
      (err) => {
        console.warn('Geolocation blocked', err);
        setWeatherError('Location access was denied. You can search manually.');
        setLoadingWeather(false);
      },
      { timeout: 8000 }
    );
  };

  // Weather by city search
  const fetchWeatherByCity = async (cityName) => {
    if (!cityName) return;
    setLoadingWeather(true);
    setWeatherError(null);

    const apiKey = envApiKey;
    if (!apiKey) {
      setWeather({
        city: cityName,
        tempC: 29,
        humidity: 60,
        condition: 'Clear',
        thi: 76
      });
      setLoadingWeather(false);
      return;
    }

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&units=metric&appid=${apiKey}`
      );
      if (!res.ok) throw new Error('City not found');
      const data = await res.json();

      const temp = data.main.temp;
      const rh = data.main.humidity;
      const thiCalc = 0.8 * temp + (rh / 100) * (temp - 14.4) + 46.4;

      setWeather({
        city: data.name,
        tempC: temp,
        humidity: rh,
        condition: data.weather[0]?.main || 'Clear',
        thi: Math.round(thiCalc)
      });
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
