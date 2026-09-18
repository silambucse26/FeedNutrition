
import React, { useState, useRef, useEffect } from 'react';
import { Thermometer, Droplets, Search, X, Globe, ChevronDown, Loader2, Smartphone, AlertCircle, Navigation, Info, Edit3, MapPin } from 'lucide-react';

export default function Navbar({ 
  weather, 
  loadingWeather,
  weatherError,
  clearWeatherError,
  fetchWeatherByCoords, 
  fetchWeatherByCity, 
  envApiKey,
  currentLang = 'en',
  setLang,
  showIosLocationHelp,
  setShowIosLocationHelp,
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
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' }
  ];

  const popularDistricts = [
    { name: 'Salem', labelTa: 'சேலம்' },
    { name: 'Namakkal', labelTa: 'நாமக்கல்' },
    { name: 'Erode', labelTa: 'ஈரோடு' },
    { name: 'Coimbatore', labelTa: 'கோயம்புத்தூர்' },
    { name: 'Tiruchirappalli', labelTa: 'திருச்சிராப்பள்ளி' },
    { name: 'Madurai', labelTa: 'மதுரை' },
    { name: 'Dindigul', labelTa: 'திண்டுக்கல்' },
    { name: 'Thanjavur', labelTa: 'தஞ்சாவூர்' },
    { name: 'Dharmapuri', labelTa: 'தருமபுரி' },
    { name: 'Krishnagiri', labelTa: 'கிருஷ்ணகிரி' },
    { name: 'Tirunelveli', labelTa: 'திருநெல்வேலி' },
    { name: 'Vellore', labelTa: 'வேலூர்' },
    { name: 'Chennai', labelTa: 'சென்னை' },
    { name: 'Karnal', labelTa: 'கர்னால்' },
    { name: 'Anand', labelTa: 'ஆனந்த்' },
    { name: 'Bengaluru', labelTa: 'பெங்களூரு' },
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
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Live search with debounce - supports both Open-Meteo and OpenWeather
  const handleSearchChange = (val) => {
    setManualCity(val);

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (val.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    searchTimerRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        let results = [];
        // 1. Try Open-Meteo free global geocoding
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(val.trim())}&count=6&language=en&format=json`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            results = data.results.map(loc => ({
              name: loc.name,
              state: loc.admin1 || '',
              country: loc.country || '',
              lat: loc.latitude,
              lon: loc.longitude,
              display: loc.admin1 ? `${loc.name}, ${loc.admin1}, ${loc.country}` : `${loc.name}, ${loc.country}`
            }));
          }
        }

        // 2. Fallback to OpenWeather if available and no results yet
        if (results.length === 0 && envApiKey) {
          const owRes = await fetch(
            `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(val.trim())}&limit=5&appid=${envApiKey}`
          );
          if (owRes.ok) {
            const data = await owRes.json();
            results = data.map(loc => ({
              name: loc.name,
              state: loc.state || '',
              country: loc.country,
              lat: loc.lat,
              lon: loc.lon,
              display: loc.state ? `${loc.name}, ${loc.state}, ${loc.country}` : `${loc.name}, ${loc.country}`
            }));
          }
        }

        setSearchResults(results);
      } catch (err) {
        console.warn('City search failed', err);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const handleSelectSearchResult = (result) => {
    fetchWeatherByCity(result.name, result.lat, result.lon);
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
  const locationText = hasLocation ? weather.city : (currentLang === 'ta' ? 'இருப்பிடம் இல்லை' : (t ? t('no_location') : 'No location detected'));

  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
    }}>
      <div className="navbar-inner" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        {/* Brand Name with MooPoshaq Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <img 
            src="/mooposhaqlogo.png" 
            alt="MooPoshaq Logo" 
            style={{ 
              width: 'clamp(36px, 4.5vw, 49px)', 
              height: 'clamp(36px, 4.5vw, 49px)', 
              objectFit: 'contain',
              borderRadius: '8px',
              flexShrink: 0,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
            }} 
          />
          <div>
            <h1 style={{
              fontSize: 'clamp(1.15rem, 3.2vw, 1.38rem)',
              fontWeight: 900,
              color: '#0f172a',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              whiteSpace: 'nowrap'
            }}>
              <span>MOO</span>
              <span style={{ color: '#16a34a' }}>POSHAQ</span>
            </h1>
            <p style={{ 
              fontSize: 'clamp(0.64rem, 1.8vw, 0.7rem)', 
              color: '#64748b', 
              fontWeight: 600, 
              margin: '2px 0 0',
              lineHeight: 1.2,
              whiteSpace: 'nowrap'
            }}>
              {t ? t('brand_tagline') : 'Cattle Nutrition & Advisory'}
            </p>
          </div>
        </div>

        {/* RIGHT CONTROLS: Desktop Location Card + Detect GPS Button + Language Selector */}
        <div className="nav-controls" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          flexWrap: 'nowrap'
        }}>
          
          {/* Desktop Location Card (Hidden on Mobile < 768px via CSS) */}
          <div 
            className="desktop-nav-location"
            onClick={() => setShowManualModal(true)}
            title={hasLocation ? `${locationText} - Click to change` : 'Click to set location'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: hasLocation ? '#f8fafc' : '#f0fdf4',
              border: `1.5px solid ${hasLocation ? '#cbd5e1' : '#86efac'}`,
              borderRadius: '24px',
              padding: '6px 14px',
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <MapPin size={15} color="#16a34a" style={{ flexShrink: 0 }} />

            <span style={{ 
              color: hasLocation ? '#0f172a' : '#16a34a', 
              fontWeight: 800, 
              whiteSpace: 'nowrap'
            }}>
              {loadingWeather ? (t ? t('locating') : 'Locating...') : locationText}
            </span>

            {hasLocation && (
              <>
                <span style={{ color: '#cbd5e1' }}>|</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#0f172a', fontWeight: 800 }}>
                  <Thermometer size={13} color="#0f172a" />
                  {weather.tempC !== undefined ? `${Math.round(weather.tempC)}°C` : '--'}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#0f172a', fontWeight: 800 }}>
                  <Droplets size={13} color="#0f172a" />
                  {weather.humidity !== undefined ? `${weather.humidity}%` : '--'}
                </span>
                <span style={{
                  fontSize: '0.72rem',
                  color: '#16a34a',
                  background: '#dcfce7',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontWeight: 800
                }}>
                  {currentLang === 'ta' ? 'மாற்று' : 'Edit'}
                </span>
              </>
            )}
          </div>

          {/* Quick GPS Detect Button: Shown ONLY when location is NOT yet detected */}
          {!hasLocation && (
            <button 
              type="button"
              onClick={fetchWeatherByCoords}
              disabled={loadingWeather}
              className="nav-gps-btn"
              title={currentLang === 'ta' ? 'நேரலை GPS இருப்பிடம் கண்டறி' : 'Detect live GPS location'}
              style={{ 
                padding: '6px 12px', 
                fontSize: '0.78rem', 
                borderRadius: '20px', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '5px',
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                flexShrink: 0,
                whiteSpace: 'nowrap',
                opacity: loadingWeather ? 0.75 : 1,
                cursor: loadingWeather ? 'wait' : 'pointer',
                boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)'
              }}
            >
              {loadingWeather ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Navigation size={13} />
              )}
              <span>{loadingWeather ? (t ? t('locating') : 'Locating...') : (currentLang === 'ta' ? 'GPS இடம்' : 'GPS')}</span>
            </button>
          )}

          {/* LANGUAGE SELECTOR DROPDOWN (3 Languages: Tamil, English, Hindi) */}
          <div style={{ position: 'relative', flexShrink: 0, zIndex: 100 }} ref={langRef}>
            <button
              type="button"
              onClick={() => setShowLangMenu(!showLangMenu)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                borderRadius: '20px',
                border: '1.5px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: '0.76rem',
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
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                minWidth: '150px',
                zIndex: 1000,
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
                      padding: '10px 14px',
                      fontSize: '0.85rem',
                      fontWeight: currentLang === lang.code ? 800 : 600,
                      color: currentLang === lang.code ? '#16a34a' : '#0f172a',
                      background: currentLang === lang.code ? '#f0fdf4' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid #f1f5f9',
                      userSelect: 'none'
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

      {/* MOBILE / TABLET DEDICATED LOCATION STRIP (Clean, simple, borderless design) */}
      <div 
        className="mobile-nav-location"
        onClick={() => setShowManualModal(true)}
        style={{
          margin: 0,
          padding: '6px 14px',
          background: '#f8fafc',
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          borderBottom: '1px solid #f1f5f9',
          borderRadius: 0,
          boxShadow: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          cursor: 'pointer'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
          <MapPin size={14} color="#16a34a" style={{ flexShrink: 0 }} />
          <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: '5px', overflow: 'hidden' }}>
            <span style={{ 
              fontSize: '0.82rem', 
              fontWeight: 700, 
              color: hasLocation ? '#0f172a' : '#16a34a',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {loadingWeather ? (t ? t('locating') : 'Locating...') : locationText}
            </span>
            {hasLocation && weather.condition && (
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap' }}>
                • {weather.condition}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {hasLocation && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '0.78rem', 
              fontWeight: 700, 
              color: '#334155'
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                <Thermometer size={12} color="#0284c7" />
                <span>{weather.tempC !== undefined ? `${Math.round(weather.tempC)}°` : '--'}</span>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                <Droplets size={12} color="#0284c7" />
                <span>{weather.humidity !== undefined ? `${weather.humidity}%` : '--'}</span>
              </span>
            </div>
          )}
          <span style={{
            fontSize: '0.72rem',
            color: '#16a34a',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2px'
          }}>
            <Edit3 size={11} color="#16a34a" />
            <span>{currentLang === 'ta' ? 'மாற்று' : currentLang === 'hi' ? 'बदलें' : 'Change'}</span>
          </span>
        </div>
      </div>

      {/* MANUAL LOCATION ENTRY MODAL */}
      {showManualModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: '60px',
          paddingBottom: '20px',
          overflowY: 'auto',
          zIndex: 200
        }}>
          <div 
            ref={modalRef}
            className="wg-card animate-fade-in" 
            style={{ maxWidth: '520px', width: '92%', padding: '24px', position: 'relative' }}
          >
            <button 
              onClick={() => setShowManualModal(false)}
              style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: 900, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/location_pin.jpg" alt="Pin" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
              {currentLang === 'ta' ? 'பண்ணை இருப்பிடத்தை தேர்வு செய்யவும்' : currentLang === 'hi' ? 'फार्म का स्थान चुनें' : 'Select Farm Location'}
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: '16px' }}>
              {currentLang === 'ta' 
                ? 'நேரலை GPS மூலம் கண்டறியவும் அல்லது கீழே உள்ள மாவட்டங்களில் ஒன்றை கிளிக் செய்யவும்.' 
                : 'Detect your live location via GPS or pick your dairy district below.'}
            </p>

            {/* Quick Detect Live GPS Button */}
            <button
              type="button"
              onClick={() => {
                setShowManualModal(false);
                if (fetchWeatherByCoords) fetchWeatherByCoords();
              }}
              className="btn-primary"
              style={{
                width: '100%',
                marginBottom: '10px',
                padding: '10px 16px',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderRadius: '12px'
              }}
            >
              <Navigation size={17} />
              <span>{currentLang === 'ta' ? 'தற்போதைய நேரலை GPS இடம் கண்டறி' : 'Detect Current Live Location (GPS)'}</span>
            </button>

            {/* PC/Laptop Geolocation Notice */}
           
              <span>
                {currentLang === 'ta' ? "" : ""}
              </span>
           

            {/* Search Input with Live Dropdown */}
            <form onSubmit={handleSearchManual} style={{ marginBottom: '16px', position: 'relative' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type="text" 
                    placeholder={currentLang === 'ta' ? 'ஊர் அல்லது மாவட்டத்தின் பெயரை தட்டச்சு செய்யவும்...' : 'Type village, town or district (e.g. Salem, Namakkal)...'}
                    value={manualCity}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    style={{ width: '100%', paddingLeft: '38px', fontSize: '0.9rem' }}
                    autoFocus
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  {currentLang === 'ta' ? 'தேடு' : 'Search'}
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
                  {currentLang === 'ta' ? 'இடங்களைத் தேடுகிறது...' : 'Searching locations...'}
                </div>
              )}
            </form>

            {/* POPULAR DAIRY DISTRICTS IN TAMIL NADU & INDIA */}
            <div>
              <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 800, display: 'block', marginBottom: '8px' }}>
                {currentLang === 'ta' ? 'பிரபல பால்பண்ணை மாவட்டங்கள் (தமிழ்நாடு & இந்தியா):' : 'Key Dairy Districts (Tamil Nadu & India):'}
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {popularDistricts.map(d => (
                  <button
                    key={d.name}
                    onClick={() => handlePickCity(d.name)}
                    style={{
                      padding: '5px 11px',
                      fontSize: '0.78rem',
                      borderRadius: '16px',
                      border: '1.5px solid #cbd5e1',
                      background: '#f8fafc',
                      color: '#0f172a',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f0fdf4';
                      e.currentTarget.style.borderColor = '#16a34a';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }}
                  >
                    {currentLang === 'ta' ? d.labelTa : d.name}
                  </button>
                ))}
              </div>
            </div>

            {/* iOS Safari Help link inside modal */}
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setShowManualModal(false);
                  if (setShowIosLocationHelp) setShowIosLocationHelp(true);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0284c7',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <Smartphone size={14} />
                <span>Need help with iOS Safari location access?</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IOS SAFARI LOCATION ACCESS GUIDE MODAL */}
      {showIosLocationHelp && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 350
        }}>
          <div 
            className="wg-card animate-fade-in" 
            style={{ maxWidth: '500px', width: '100%', padding: '24px', position: 'relative', borderRadius: '18px' }}
          >
            <button 
              onClick={() => {
                if (setShowIosLocationHelp) setShowIosLocationHelp(false);
                if (clearWeatherError) clearWeatherError();
              }}
              style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ background: '#f0fdf4', padding: '8px', borderRadius: '12px', border: '1.5px solid #86efac' }}>
                <Smartphone size={22} color="#16a34a" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: 900, margin: 0 }}>
                  iOS Safari Location Access
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                  How to enable live GPS location on iPhone & iPad
                </span>
              </div>
            </div>

            {weatherError && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fca5a5',
                borderRadius: '10px',
                padding: '10px 12px',
                fontSize: '0.78rem',
                color: '#991b1b',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{weatherError}</span>
              </div>
            )}

            {/* 3 Step Instructions for iOS Safari */}
            <div style={{
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '14px',
              padding: '14px',
              marginBottom: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '0.82rem',
              color: '#1e293b'
            }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ background: '#16a34a', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 900, flexShrink: 0 }}>1</span>
                <span>Open <strong>Settings</strong> on your iPhone or iPad.</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ background: '#16a34a', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 900, flexShrink: 0 }}>2</span>
                <span>Tap <strong>Privacy & Security</strong> → <strong>Location Services</strong> (ensure it is toggled <strong>ON</strong>).</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ background: '#16a34a', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 900, flexShrink: 0 }}>3</span>
                <span>Scroll down and tap <strong>Safari Websites</strong> → Select <strong>"While Using the App"</strong> and turn <strong>ON</strong> "Precise Location".</span>
              </div>
            </div>

            {/* Quick Region Selector as Instant Fallback */}
            <div style={{ marginBottom: '18px' }}>
              <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 800, display: 'block', marginBottom: '8px' }}>
                Or select your dairy region instantly:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {popularCities.map(city => (
                  <button
                    key={city}
                    onClick={() => {
                      handlePickCity(city);
                      if (setShowIosLocationHelp) setShowIosLocationHelp(false);
                      if (clearWeatherError) clearWeatherError();
                    }}
                    style={{
                      padding: '5px 11px',
                      fontSize: '0.78rem',
                      borderRadius: '16px',
                      border: '1.5px solid #cbd5e1',
                      background: '#ffffff',
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

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  if (setShowIosLocationHelp) setShowIosLocationHelp(false);
                  setShowManualModal(true);
                }}
                className="btn-secondary"
                style={{ flex: 1, padding: '10px', fontSize: '0.82rem' }}
              >
                Search City
              </button>

              <button
                type="button"
                onClick={() => {
                  if (setShowIosLocationHelp) setShowIosLocationHelp(false);
                  fetchWeatherByCoords();
                }}
                className="btn-primary"
                style={{ flex: 1, padding: '10px', fontSize: '0.82rem' }}
              >
                Try Detect Again
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
