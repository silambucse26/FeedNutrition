import React from 'react';
import { Thermometer, Droplets, MapPin, Key, ShieldCheck } from 'lucide-react';

export default function WeatherWidget({ weather, loading, apiKey, error, fetchWeatherByCoords, fetchWeatherByCity }) {
  
  const calcTHI = (tempC, rh) => {
    if (tempC === undefined || tempC === null || rh === undefined || rh === null) return null;
    return Math.round((1.8 * tempC + 32) - (0.55 - 0.0055 * rh) * (1.8 * tempC - 26));
  };

  const thi = weather ? calcTHI(weather.tempC, weather.humidity) : null;

  const getTHIStatus = (val) => {
    if (!val) return { label: 'Climate Telemetry Standby', color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1' };
    if (val < 72) return { label: 'Optimal Thermal Comfort', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' };
    if (val <= 78) return { label: 'Mild Heat Stress', color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
    if (val <= 88) return { label: 'Moderate Heat Stress', color: '#ea580c', bg: '#fff7ed', border: '#ffedd5' };
    return { label: 'Severe Heat Stress Warning', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
  };

  const thiStatus = getTHIStatus(thi);

  return (
    <div className="wg-card" style={{ padding: '20px 24px', marginBottom: '28px', borderLeft: '5px solid #16a34a' }}>
      
      {!apiKey && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.85rem'
        }}>
          <Key color="#dc2626" size={18} />
          <div>
            <strong style={{ color: '#991b1b' }}>OpenWeather Key Required in .env:</strong>
            <span style={{ color: '#b91c1c', marginLeft: '6px' }}>
              Add <code>VITE_OPENWEATHER_API_KEY=your_key</code> in <code>.env</code> file.
            </span>
          </div>
        </div>
      )}

      {/* Main Climate Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        
        {/* Station Location */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
              Station Location
            </span>
            <MapPin size={15} color="#16a34a" />
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
            {weather?.city ? weather.city : 'Select Location'}
          </div>
          
          {/* Quick Click City Selectors */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
            {['Karnal', 'Anand', 'Pune', 'Delhi', 'Jaipur'].map(city => (
              <button
                key={city}
                onClick={() => fetchWeatherByCity(city)}
                style={{
                  padding: '2px 6px',
                  fontSize: '0.7rem',
                  borderRadius: '4px',
                  border: '1px solid #bbf7d0',
                  background: '#f0fdf4',
                  color: '#15803d',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Temperature */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
              Air Temperature
            </span>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>
              {weather?.tempC !== undefined ? `${Math.round(weather.tempC)}°C` : '--'}
            </div>
            <span style={{ fontSize: '0.725rem', color: '#64748b' }}>Dry-Bulb Ambient</span>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Thermometer size={18} />
          </div>
        </div>

        {/* Humidity */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
              Relative Humidity
            </span>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#0d9488', marginTop: '2px' }}>
              {weather?.humidity !== undefined ? `${weather.humidity}%` : '--'}
            </div>
            <span style={{ fontSize: '0.725rem', color: '#64748b' }}>Moisture Content</span>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ccfbf1', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Droplets size={18} />
          </div>
        </div>

        {/* THI Index */}
        <div style={{
          background: thiStatus.bg,
          border: `1px solid ${thiStatus.border}`,
          borderRadius: '12px',
          padding: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: thiStatus.color, textTransform: 'uppercase' }}>
              THI Stress Index
            </span>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: thiStatus.color, marginTop: '2px' }}>
              {thi !== null ? thi : '--'}
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: thiStatus.color }}>
              {thiStatus.label}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
