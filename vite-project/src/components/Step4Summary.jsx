import React from 'react';
import { Thermometer, Droplets, Scale, Printer, ArrowLeft, Award, Activity, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { getBreedName } from '../data/breeds';

export default function Step4Summary({ 
  weather, 
  selectedBreed, 
  heiferCount, 
  heiferWeights,
  calvingOption,
  firstCount, 
  firstWeights, 
  firstDaysPregnant,
  moreCount, 
  moreWeights, 
  moreDaysPregnant,
  onEditStep,
  t
}) {
  const totalHeiferWeight = heiferWeights.reduce((a, b) => a + (b || 0), 0);
  const totalFirstWeight = firstWeights.reduce((a, b) => a + (b || 0), 0);
  const totalMoreWeight = moreWeights.reduce((a, b) => a + (b || 0), 0);

  const totalHerdCount = heiferCount + (calvingOption === 'first' || calvingOption === 'both' ? firstCount : 0) + (calvingOption === 'moreThanFirst' || calvingOption === 'both' ? moreCount : 0);
  const totalHerdWeight = totalHeiferWeight + (calvingOption === 'first' || calvingOption === 'both' ? totalFirstWeight : 0) + (calvingOption === 'moreThanFirst' || calvingOption === 'both' ? totalMoreWeight : 0);

  const calcTHI = (tempC, rh) => {
    if (tempC === undefined || rh === undefined) return null;
    return Math.round((1.8 * tempC + 32) - (0.55 - 0.0055 * rh) * (1.8 * tempC - 26));
  };

  const thi = weather ? calcTHI(weather.tempC, weather.humidity) : null;

  // Practical Feed Ration Calculations for Farmers
  const totalGreenFodder = Math.round(totalHerdCount * 28); // ~28 kg green fodder per cow/day
  const totalDryFodder = Math.round(totalHerdCount * 6);    // ~6 kg dry straw per cow/day
  const totalConcentrate = Math.round(totalHerdCount * 4);  // ~4 kg concentrate feed cake per cow/day

  const waterMultiplier = (weather?.tempC && weather.tempC > 30) ? 1.4 : (weather?.tempC && weather.tempC > 25) ? 1.2 : 1.0;
  const totalWaterLiters = Math.round(totalHerdCount * 70 * waterMultiplier);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="wg-card animate-fade-in" style={{ padding: '32px' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge-green">STEP 4 OF 4</span>
            <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 800 }}>FARMER FEED RATION COMPLETE</span>
          </div>
          <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#0f172a' }}>
            Daily Herd Feed & Water Plan
          </h2>
          <p style={{ color: '#475569', fontSize: '0.9rem', marginTop: '4px' }}>
            Simple, practical daily feeding recommendations for your {totalHerdCount} head of {getBreedName(selectedBreed, t) || 'cattle'}.
          </p>
        </div>

        <button onClick={handlePrint} className="btn-primary" style={{ padding: '10px 18px' }}>
          <Printer size={16} />
          <span>Print / Export Plan</span>
        </button>
      </div>

      {/* Practical Farmer Feed Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        
        {/* Green Fodder Card */}
        <div style={{ background: '#f0fdf4', border: '2px solid #bbf7d0', borderRadius: '16px', padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 800, textTransform: 'uppercase' }}>
            Daily Green Fodder
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#16a34a', marginTop: '4px' }}>
            {totalGreenFodder} <span style={{ fontSize: '1rem', color: '#15803d', fontWeight: 600 }}>kg/day</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px', fontWeight: 600 }}>
            ~28 kg per cow (Berseem, Maize, Sorghum)
          </div>
        </div>

        {/* Dry Fodder Card */}
        <div style={{ background: '#f0fdf4', border: '2px solid #bbf7d0', borderRadius: '16px', padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 800, textTransform: 'uppercase' }}>
            Daily Dry Fodder / Straw
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#16a34a', marginTop: '4px' }}>
            {totalDryFodder} <span style={{ fontSize: '1rem', color: '#15803d', fontWeight: 600 }}>kg/day</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px', fontWeight: 600 }}>
            ~6 kg per cow (Wheat Straw, Paddy Straw)
          </div>
        </div>

        {/* Concentrate Feed Card */}
        <div style={{ background: '#f0fdf4', border: '2px solid #bbf7d0', borderRadius: '16px', padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 800, textTransform: 'uppercase' }}>
            Daily Concentrate Feed
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#16a34a', marginTop: '4px' }}>
            {totalConcentrate} <span style={{ fontSize: '1rem', color: '#15803d', fontWeight: 600 }}>kg/day</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px', fontWeight: 600 }}>
            ~4 kg per cow (Compound Cattle Feed / Cake)
          </div>
        </div>

        {/* Water Demand Card */}
        <div style={{ background: '#f0fdf4', border: '2px solid #bbf7d0', borderRadius: '16px', padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: '#0d9488', fontWeight: 800, textTransform: 'uppercase' }}>
            Clean Drinking Water
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0d9488', marginTop: '4px' }}>
            {totalWaterLiters.toLocaleString()} <span style={{ fontSize: '1rem', color: '#0d9488', fontWeight: 600 }}>Liters/day</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px', fontWeight: 600 }}>
            Climate-adjusted hydration demand
          </div>
        </div>

      </div>

      {/* Herd Breakdown & Station Data */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        
        {/* Selected Breed Card */}
        <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={18} color="#16a34a" /> Selected Breed
            </h3>
            <button onClick={() => onEditStep(1)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
              Change
            </button>
          </div>

          {selectedBreed && (
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <img src={selectedBreed.image} alt={getBreedName(selectedBreed, t)} style={{ width: '68px', height: '68px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #bbf7d0' }} />
              <div>
                <h4 style={{ fontSize: '1.1rem', color: '#0f172a', margin: 0, fontWeight: 800 }}>{getBreedName(selectedBreed, t)}</h4>
                <p style={{ fontSize: '0.8rem', color: '#16a34a', margin: '2px 0 4px', fontWeight: 700 }}>{selectedBreed.category} ({selectedBreed.subCategory})</p>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>{selectedBreed.origin}</p>
              </div>
            </div>
          )}
        </div>

        {/* Climate Station Summary */}
        <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#0f172a', marginBottom: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Thermometer size={18} color="#16a34a" /> Climate Weather Station
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.85rem' }}>
              <span style={{ color: '#64748b' }}>Station Location:</span>
              <strong style={{ color: '#0f172a' }}>{weather?.city || 'Default Station'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.85rem' }}>
              <span style={{ color: '#64748b' }}>Air Temperature:</span>
              <strong style={{ color: '#16a34a' }}>{weather?.tempC !== undefined ? `${Math.round(weather.tempC)}°C` : 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.85rem' }}>
              <span style={{ color: '#64748b' }}>Relative Humidity:</span>
              <strong style={{ color: '#0d9488' }}>{weather?.humidity !== undefined ? `${weather.humidity}%` : 'N/A'}</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Inventory Summary */}
      <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '20px', marginBottom: '28px' }}>
        <h3 style={{ fontSize: '1.05rem', color: '#0f172a', marginBottom: '12px', fontWeight: 800 }}>
          Herd Count Inventory Summary
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Heifer Cattle:</div>
            <strong style={{ fontSize: '1.1rem', color: '#16a34a' }}>{heiferCount} head</strong> (~{heiferWeights[0] || 350} kg avg)
          </div>

          {(calvingOption === 'first' || calvingOption === 'both') && (
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>First Calving Cows:</div>
              <strong style={{ fontSize: '1.1rem', color: '#16a34a' }}>{firstCount} head</strong> (~{firstDaysPregnant} days pregnant)
            </div>
          )}

          {(calvingOption === 'moreThanFirst' || calvingOption === 'both') && (
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>More Than 1st Calving:</div>
              <strong style={{ fontSize: '1.1rem', color: '#16a34a' }}>{moreCount} head</strong> (~{moreDaysPregnant} days pregnant)
            </div>
          )}
        </div>
      </div>

      {/* Back Button */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
        <button onClick={() => onEditStep(3)} className="btn-secondary">
          <ArrowLeft size={16} />
          <span>Back to Edit Inputs</span>
        </button>
      </div>
    </div>
  );
}
