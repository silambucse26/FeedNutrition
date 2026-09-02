import React, { useState, useRef, useEffect } from 'react';
import { Thermometer, Droplets, Search, X, Globe, ChevronDown } from 'lucide-react';

export default function Navbar({ 
  weather, 
  fetchWeatherByCoords, 
  fetchWeatherByCity, 
  envApiKey,
  currentLang = 'en',
  setLang,
  t
}) {
  const [showManualModal, setShowManualModal] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [manualCity, setManualCity] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const modalRef = useRef(null);
  const langRef = useRef(null);
  const searchTimerRef = useRef(null);

  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'mr', label: 'Marathi', native: 'मराठी' }
  ];

  const popularCities = [
    'Salem', 'Karnal', 'Anand', 'Pune', 'Delhi', 
    'Jaipur', 'Bengaluru', 'Chennai', 'Patna', 'Hyderabad', 'Kolkata'
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowManualModal(false);
      }
      if (langRef.current && !langRef.current.contains(event.target)) {
        setShowLangMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live search with debounce - fetch matching cities from OpenWeather API
  const handleSearchChange = (val) => {
    setManualCity(val);

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (val.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    searchTimerRef.current = setTimeout(async () => {
      const apiKey = envApiKey;
      if (!apiKey) return;

      setSearching(true);
      try {
        const res = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(val.trim())}&limit=5&appid=${apiKey}`
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.map(loc => ({
            name: loc.name,
            state: loc.state || '',
            country: loc.country,
            lat: loc.lat,
            lon: loc.lon,
            display: loc.state ? `${loc.name}, ${loc.state}, ${loc.country}` : `${loc.name}, ${loc.country}`
          })));
        }
      } catch (err) {
        // Silent fail
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const handleSelectSearchResult = (result) => {
    fetchWeatherByCity(result.name);
    setShowManualModal(false);
    setManualCity('');
    setSearchResults([]);
  };

  const handleSearchManual = (e) => {
    e.preventDefault();
    if (manualCity.trim()) {
      fetchWeatherByCity(manualCity.trim());
      setShowManualModal(false);
      setManualCity('');
      setSearchResults([]);
    }
  };

  const handlePickCity = (cityName) => {
    fetchWeatherByCity(cityName);
    setShowManualModal(false);
    setSearchResults([]);
  };

  const hasLocation = weather && weather.city;
  const currentLangObj = languages.find(l => l.code === currentLang) || languages[0];
  const locationText = hasLocation ? weather.city : (t ? t('no_location') : 'No location detected');

  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'nowrap',
        gap: '12px'
      }}>
        {/* Brand Name (Single Line + Ellipsis for tagline) */}
        <div style={{ flexShrink: 0, minWidth: '150px' }}>
          <h1 style={{
            fontSize: '1.25rem',
            fontWeight: 900,
            color: '#0f172a',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            margin: 0,
            whiteSpace: 'nowrap'
          }}>
            Feed<span style={{ color: '#16a34a' }}>Nutrition AI</span>
          </h1>
          <p style={{ 
            fontSize: '0.72rem', 
            color: '#64748b', 
            fontWeight: 600, 
            margin: '2px 0 0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '180px'
          }}>
            {t ? t('brand_tagline') : 'Cattle Nutrition & Advisory'}
          </p>
        </div>

        {/* RIGHT CONTROLS: Location Pill + Detect Location + Language Selector */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px', 
          flexWrap: 'nowrap', 
          overflow: 'hidden',
          justifyContent: 'flex-end',
          flexShrink: 1
        }}>
          
          {/* Weather / Location Pill (With Truncation Ellipsis ...) */}
          <button 
            type="button"
            onClick={() => setShowManualModal(true)}
            title={locationText}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '6px 12px',
              fontSize: '0.825rem',
              cursor: 'pointer',
              maxWidth: '260px',
              flexShrink: 1,
              overflow: 'hidden',
              whiteSpace: 'nowrap'
            }}
          >
            <img 
              src="/location_pin.jpg" 
              alt="Pin" 
              style={{ width: '18px', height: '18px', objectFit: 'contain', borderRadius: '3px', flexShrink: 0 }}
            />

            <span style={{ 
              color: hasLocation ? '#0f172a' : '#64748b', 
              fontWeight: 700, 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap',
              maxWidth: '140px'
            }}>
              {locationText}
            </span>

            {hasLocation && (
              <>
                <span style={{ color: '#cbd5e1', fontWeight: 300, flexShrink: 0 }}>|</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#0f172a', fontWeight: 800, flexShrink: 0 }}>
                  <Thermometer size={14} color="#0f172a" />
                  {weather.tempC !== undefined ? `${Math.round(weather.tempC)}°` : '--'}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#0f172a', fontWeight: 800, flexShrink: 0 }}>
                  <Droplets size={14} color="#0f172a" />
                  {weather.humidity !== undefined ? `${weather.humidity}%` : '--'}
                </span>
              </>
            )}
          </button>

          {/* Detect Location Button */}
          <button 
            type="button"
            onClick={fetchWeatherByCoords}
            className="btn-primary"
            style={{ 
              padding: '7px 14px', 
              fontSize: '0.825rem', 
              borderRadius: '20px', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px',
              flexShrink: 0,
              whiteSpace: 'nowrap'
            }}
          >
            <img 
              src="/location_pin.jpg" 
              alt="Pin" 
              style={{ width: '15px', height: '15px', objectFit: 'contain', borderRadius: '3px' }} 
            />
            <span>{t ? t('detect_location') : 'Detect'}</span>
          </button>

          {/* LANGUAGE SELECTOR DROPDOWN (6 Languages) */}
          <div style={{ position: 'relative', flexShrink: 0 }} ref={langRef}>
            <button
              type="button"
              onClick={() => setShowLangMenu(!showLangMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '20px',
                border: '1.5px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: '0.825rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Globe size={14} color="#16a34a" />
              <span>{currentLangObj.native}</span>
              <ChevronDown size={13} color="#64748b" />
            </button>

            {showLangMenu && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12)',
                minWidth: '140px',
                zIndex: 100,
                overflow: 'hidden'
              }}>
                {languages.map(lang => (
                  <div
                    key={lang.code}
                    onClick={() => {
                      if (setLang) setLang(lang.code);
                      setShowLangMenu(false);
                    }}
                    style={{
                      padding: '8px 12px',
                      fontSize: '0.825rem',
                      fontWeight: currentLang === lang.code ? 800 : 600,
                      color: currentLang === lang.code ? '#16a34a' : '#0f172a',
                      background: currentLang === lang.code ? '#f0fdf4' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid #f1f5f9'
                    }}
                    onMouseEnter={(e) => {
                      if (currentLang !== lang.code) e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      if (currentLang !== lang.code) e.currentTarget.style.background = '#ffffff';
                    }}
                  >
                    <span>{lang.native}</span>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>{lang.code}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* MANUAL LOCATION ENTRY MODAL */}
      {showManualModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: '80px',
          zIndex: 200
        }}>
          <div 
            ref={modalRef}
            className="wg-card animate-fade-in" 
            style={{ maxWidth: '480px', width: '90%', padding: '24px', position: 'relative' }}
          >
            <button 
              onClick={() => setShowManualModal(false)}
              style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/location_pin.jpg" alt="Pin" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
              {t ? t('enter_location_manually') : 'Enter Location Manually'}
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: '16px' }}>
              {t ? t('type_location_hint') : 'Type your city name below. Matching locations will appear as you type.'}
            </p>

            {/* Search Input with Live Dropdown */}
            <form onSubmit={handleSearchManual} style={{ marginBottom: '16px', position: 'relative' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type="text" 
                    placeholder={t ? t('type_location_placeholder') : 'Type location (e.g. Salem, Delhi, Anand)...'}
                    value={manualCity}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    style={{ width: '100%', paddingLeft: '38px', fontSize: '0.9rem' }}
                    autoFocus
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  {t ? t('search') : 'Search'}
                </button>
              </div>

              {/* SEARCH RESULTS DROPDOWN */}
              {searchResults.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '6px',
                  background: '#ffffff',
                  border: '2px solid #16a34a',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12)',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  zIndex: 300
                }}>
                  {searchResults.map((result, idx) => (
                    <div
                      key={`${result.name}-${result.lat}-${idx}`}
                      onClick={() => handleSelectSearchResult(result)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 16px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                    >
                      <img src="/location_pin.jpg" alt="Pin" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>{result.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {result.state ? `${result.state}, ${result.country}` : result.country}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searching && (
                <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                  {t ? t('searching_locations') : 'Searching locations...'}
                </div>
              )}
            </form>

            <div>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                {t ? t('or_pick_popular') : 'Or pick a popular region:'}
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {popularCities.map(city => (
                  <button
                    key={city}
                    onClick={() => handlePickCity(city)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.78rem',
                      borderRadius: '16px',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      color: '#0f172a',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
