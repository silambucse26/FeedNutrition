import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, CheckSquare, Square, AlertCircle, Info, Sparkles } from 'lucide-react';

export default function Step9Feed({ 
  selectedFeeds = [], 
  setSelectedFeeds, 
  acknowledgeStep,
  onNext, 
  onPrev,
  t
}) {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('Green Fodder');
  const [customDm, setCustomDm] = useState(25);
  const [activeTab, setActiveTab] = useState('All');

  // Complete Scientific Feed Catalog derived directly from roughages.csv, concentrates.csv, unconventionalFeeds.csv & consolidated_minerals.dat
  const defaultFeedCatalog = [
    // 1. GREEN FODDER (SUCCULENT ROUGHAGES)
    { id: 'maize_fodder', name: 'Maize Fodder', category: 'Green Fodder', dmPct: 22, cpPct: 8.5, placeholder: '25' },
    { id: 'napier_grass', name: 'Napier Grass / CO-4', category: 'Green Fodder', dmPct: 20, cpPct: 9.0, placeholder: '25' },
    { id: 'sorghum_fodder', name: 'Sorghum Fodder (Jowar)', category: 'Green Fodder', dmPct: 25, cpPct: 7.5, placeholder: '20' },
    { id: 'lucerne', name: 'Lucerne (Alfalfa)', category: 'Green Fodder', dmPct: 20, cpPct: 19.5, placeholder: '15' },
    { id: 'berseem', name: 'Berseem (Egyptian Clover)', category: 'Green Fodder', dmPct: 16, cpPct: 18.0, placeholder: '18' },
    { id: 'cowpea_fodder', name: 'Cowpea Fodder (Lobia)', category: 'Green Fodder', dmPct: 18, cpPct: 19.0, placeholder: '15' },
    { id: 'rice_grass', name: 'Rice Grass / Para Grass', category: 'Green Fodder', dmPct: 22, cpPct: 7.0, placeholder: '20' },
    { id: 'green_pasture_grass', name: 'Green Pasture Grass', category: 'Green Fodder', dmPct: 22, cpPct: 8.0, placeholder: '20' },
    { id: 'oats_fodder', name: 'Oats Fodder', category: 'Green Fodder', dmPct: 20, cpPct: 10.0, placeholder: '20' },
    { id: 'silage', name: 'Maize / Corn Silage', category: 'Green Fodder', dmPct: 32, cpPct: 8.5, placeholder: '18' },

    // 2. DRY FODDER (DRY ROUGHAGES & STRAW)
    { id: 'wheat_straw', name: 'Wheat Straw (Bhoosa / Turi)', category: 'Dry Fodder', dmPct: 90, cpPct: 3.5, placeholder: '5' },
    { id: 'paddy_straw', name: 'Paddy Straw (Rice Straw)', category: 'Dry Fodder', dmPct: 88, cpPct: 3.8, placeholder: '5' },
    { id: 'groundnut_haulm', name: 'Groundnut Haulm / Vines', category: 'Dry Fodder', dmPct: 85, cpPct: 13.5, placeholder: '4' },
    { id: 'mixed_grass_hay', name: 'Mixed Grass Hay', category: 'Dry Fodder', dmPct: 88, cpPct: 7.5, placeholder: '5' },
    { id: 'jowar_hay', name: 'Jowar / Sorghum Stover (Kadbi)', category: 'Dry Fodder', dmPct: 88, cpPct: 6.0, placeholder: '5' },
    { id: 'sugarcane_bagasse', name: 'Sugarcane Bagasse / Tops', category: 'Dry Fodder', dmPct: 90, cpPct: 2.0, placeholder: '4' },

    // 3. CONCENTRATES (GRAINS, OILSEED CAKES & BRANS)
    { id: 'wheat_bran', name: 'Wheat Bran (Choker)', category: 'Concentrates', dmPct: 88, cpPct: 14.5, placeholder: '4' },
    { id: 'maize_grain', name: 'Maize Grain Crushed (Makka)', category: 'Concentrates', dmPct: 88, cpPct: 9.5, placeholder: '3' },
    { id: 'soybean_meal', name: 'Soybean Meal (DOC)', category: 'Concentrates', dmPct: 90, cpPct: 48.0, placeholder: '2' },
    { id: 'cottonseed_cake', name: 'Cottonseed Cake (Khal)', category: 'Concentrates', dmPct: 91, cpPct: 22.0, placeholder: '3' },
    { id: 'mustard_cake', name: 'Mustard / Rapeseed Cake (Sarson Khal)', category: 'Concentrates', dmPct: 90, cpPct: 36.0, placeholder: '2' },
    { id: 'groundnut_cake', name: 'Groundnut Cake', category: 'Concentrates', dmPct: 92, cpPct: 45.0, placeholder: '2' },
    { id: 'rice_bran', name: 'De-oiled Rice Bran (DORB)', category: 'Concentrates', dmPct: 90, cpPct: 13.0, placeholder: '3' },
    { id: 'commercial_pellets', name: 'Commercial Dairy Compound Pellets', category: 'Concentrates', dmPct: 89, cpPct: 20.0, placeholder: '4' },
    { id: 'barley_grain', name: 'Barley Grain Crushed (Jau)', category: 'Concentrates', dmPct: 89, cpPct: 11.5, placeholder: '3' },
    { id: 'oats_grain', name: 'Oats Grain Crushed', category: 'Concentrates', dmPct: 89, cpPct: 12.0, placeholder: '3' },
    { id: 'sesame_cake', name: 'Sesame / Til Cake', category: 'Concentrates', dmPct: 90, cpPct: 38.0, placeholder: '2' },
    { id: 'sunflower_meal', name: 'Sunflower Meal', category: 'Concentrates', dmPct: 90, cpPct: 32.0, placeholder: '2' },

    // 4. UNCONVENTIONAL & BY-PRODUCT FEEDS
    { id: 'brewer_grain', name: 'Spent Brewer Grain (Wet)', category: 'Unconventional', dmPct: 24, cpPct: 26.0, placeholder: '10' },
    { id: 'citrus_pulp', name: 'Citrus Fruit Pulp', category: 'Unconventional', dmPct: 20, cpPct: 6.5, placeholder: '8' },
    { id: 'cane_molasses', name: 'Cane Molasses', category: 'Unconventional', dmPct: 75, cpPct: 4.0, placeholder: '1.5' },
    { id: 'azolla', name: 'Azolla Pinnata (Fresh)', category: 'Unconventional', dmPct: 10, cpPct: 24.0, placeholder: '2' }
  ];

  const isFeedSelected = (id) => selectedFeeds.some(f => f.id === id);

  const toggleSelectFeed = (item) => {
    if (acknowledgeStep) acknowledgeStep();
    if (isFeedSelected(item.id)) {
      setSelectedFeeds(selectedFeeds.filter(f => f.id !== item.id));
    } else {
      // Clean initialization with EMPTY quantity - user MUST explicitly enter quantity
      setSelectedFeeds([
        ...selectedFeeds,
        {
          id: item.id,
          name: item.name,
          category: item.category,
          dmPct: item.dmPct,
          cpPct: item.cpPct,
          quantityKg: '' // clean empty initial value
        }
      ]);
    }
  };

  const handleUpdateQty = (id, val) => {
    if (acknowledgeStep) acknowledgeStep();
    const updated = selectedFeeds.map(f => {
      if (f.id === id) {
        return { 
          ...f, 
          quantityKg: val === '' ? '' : (parseFloat(val) || '') 
        };
      }
      return f;
    });
    setSelectedFeeds(updated);
  };

  const handleAddCustomFeed = (e) => {
    e.preventDefault();
    if (!customName.trim()) return;
    if (acknowledgeStep) acknowledgeStep();
    const newId = `custom_feed_${Date.now()}`;
    const newFeed = {
      id: newId,
      name: customName.trim(),
      category: customCategory,
      dmPct: parseFloat(customDm) || 25,
      quantityKg: '' // clean empty initial value
    };
    setSelectedFeeds([...selectedFeeds, newFeed]);
    setShowCustomModal(false);
    setCustomName('');
  };

  const categories = [
    { key: 'All', label: 'All Feeds' },
    { key: 'Green Fodder', label: t ? t('step9.green_fodder') : 'Green Fodder' },
    { key: 'Dry Fodder', label: t ? t('step9.dry_fodder') : 'Dry Fodder' },
    { key: 'Concentrates', label: t ? t('step9.concentrates') : 'Concentrates' },
    { key: 'Unconventional', label: 'Unconventional Feeds' }
  ];

  // Validation before proceeding
  const handleProceed = () => {
    if (selectedFeeds.length === 0) {
      alert('Please select at least one feed ingredient available on your farm.');
      return;
    }

    const uncompletedFeeds = selectedFeeds.filter(f => f.quantityKg === '' || f.quantityKg === undefined || Number(f.quantityKg) <= 0);
    if (uncompletedFeeds.length > 0) {
      alert(`Please enter the daily feeding quantity (kg/day) for: ${uncompletedFeeds.map(f => f.name).join(', ')}.`);
      return;
    }

    onNext();
  };

  const hasIncompleteWeights = selectedFeeds.some(f => f.quantityKg === '' || f.quantityKg === undefined || Number(f.quantityKg) <= 0);

  return (
    <div className="wg-card animate-fade-in">
      {/* Visual Header Banner */}
      <div 
        className="step-banner"
        style={{
          background: 'linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)',
          border: '1.5px solid #fde047'
        }}
      >
        <div className="step-banner-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ background: '#ca8a04', color: '#ffffff', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>
              {t ? t('step9.badge') : 'STEP 9 OF 9'}
            </span>
            <span style={{ fontSize: '0.825rem', color: '#854d0e', fontWeight: 800 }}>
              {t ? t('step9.tag') : 'NUTRITION & FODDER INVENTORY'}
            </span>
          </div>
          <h2 className="step-banner-title" style={{ color: '#713f12' }}>
            {t ? t('step9.title') : 'Feed, Fodder & Concentrate Selection'}
          </h2>
          <p className="step-banner-subtitle" style={{ color: '#854d0e' }}>
            {t ? t('step9.subtitle') : 'Select the feeds currently given to your cattle and record daily weight fed (kg/day).'}
          </p>
        </div>

        <img 
          src="/cattle_art/feed.jpg" 
          alt="Feed and Fodder" 
          className="step-banner-img"
        />
      </div>

      {/* Category Filter Tabs & Add Custom Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '10px',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  border: isActive ? '2px solid #16a34a' : '1px solid #cbd5e1',
                  background: isActive ? '#f0fdf4' : '#ffffff',
                  color: isActive ? '#15803d' : '#475569',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <button 
          onClick={() => setShowCustomModal(true)}
          className="btn-secondary"
          style={{ padding: '7px 14px', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} />
          <span>{t ? t('step9.custom_btn') : 'Add Custom Feed'}</span>
        </button>
      </div>

      {/* Feed Ingredient Selection Grid */}
      <div style={{ marginBottom: '28px' }}>
        {categories.filter(c => c.key !== 'All').map(cat => {
          if (activeTab !== 'All' && activeTab !== cat.key) return null;

          const items = defaultFeedCatalog.filter(f => f.category === cat.key);
          if (items.length === 0) return null;

          return (
            <div key={cat.key} style={{ marginBottom: '22px' }}>
              <h3 style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 800, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }}></span>
                <span>{cat.label}</span>
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                {items.map(feed => {
                  const selected = isFeedSelected(feed.id);
                  return (
                    <div
                      key={feed.id}
                      onClick={() => toggleSelectFeed(feed)}
                      style={{
                        background: selected ? '#f0fdf4' : '#ffffff',
                        border: selected ? '2px solid #16a34a' : '1.5px solid #cbd5e1',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: selected ? '0 4px 12px rgba(22, 163, 74, 0.12)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: selected ? '#15803d' : '#0f172a', display: 'block' }}>
                          {feed.name}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          ~{feed.dmPct}% Dry Matter {feed.cpPct ? `• CP ${feed.cpPct}%` : ''}
                        </span>
                      </div>
                      <div>
                        {selected ? <CheckSquare color="#16a34a" size={20} /> : <Square color="#94a3b8" size={20} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Feed Ingredient Quantity Input Section */}
      {selectedFeeds.length > 0 && (
        <div style={{
          background: '#f8fafc',
          border: hasIncompleteWeights ? '2px solid #fde047' : '1.5px solid #e2e8f0',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '28px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
                {t ? t('step9.daily_quantity_header') : 'Daily Feeding Weight for Herd (kg / day)'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0' }}>
                Enter the total daily amount fed to your herd. Values must be entered (no automatic defaults).
              </p>
            </div>
            <span className="badge-green">{selectedFeeds.length} feeds selected</span>
          </div>

          {/* Action Required Banner if any weight is missing */}
          {hasIncompleteWeights && (
            <div style={{
              padding: '10px 14px',
              background: '#fffbeb',
              border: '1.5px solid #fde047',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '16px'
            }}>
              <AlertCircle size={18} color="#ca8a04" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.825rem', color: '#854d0e', fontWeight: 700 }}>
                * Action Required: Please enter the daily weight for every selected feed below before moving to Step 10.
              </span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {selectedFeeds.map(feed => {
              const hasVal = feed.quantityKg !== '' && feed.quantityKg !== undefined && Number(feed.quantityKg) > 0;
              const dmVal = hasVal ? ((Number(feed.quantityKg) * (feed.dmPct || 25)) / 100).toFixed(1) : '0.0';
              
              // Find matching catalog item for accurate placeholder
              const matchedCatalog = defaultFeedCatalog.find(c => c.name.toLowerCase() === feed.name.toLowerCase());
              const placeholderQty = matchedCatalog?.placeholder || (feed.category === 'Green Fodder' ? '25' : feed.category === 'Dry Fodder' ? '5' : '4');

              return (
                <div 
                  key={feed.id} 
                  style={{ 
                    background: '#ffffff', 
                    border: hasVal ? '1.5px solid #86efac' : '2px solid #fca5a5', 
                    borderRadius: '12px', 
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: hasVal ? '#16a34a' : '#ef4444' }}></span>
                      <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{feed.name}</strong>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setSelectedFeeds(selectedFeeds.filter(f => f.id !== feed.id))}
                      style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '2px' }}
                      title="Remove feed"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '10px' }}>
                    Category: <strong>{feed.category}</strong> ({feed.dmPct}% Dry Matter)
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <input 
                      type="number"
                      min="0.5" 
                      max="2000"
                      step="0.5"
                      placeholder={`e.g. ${placeholderQty}`}
                      value={feed.quantityKg === undefined ? '' : feed.quantityKg}
                      onFocus={(e) => {
                        if (e.target.value === '0') handleUpdateQty(feed.id, '');
                        e.target.select();
                      }}
                      onWheel={(e) => e.target.blur()}
                      onChange={(e) => handleUpdateQty(feed.id, e.target.value)}
                      style={{ 
                        width: '120px', 
                        fontWeight: 800, 
                        color: hasVal ? '#16a34a' : '#0f172a', 
                        fontSize: '1.05rem',
                        border: hasVal ? '1.5px solid #86efac' : '1.5px solid #f87171',
                        background: hasVal ? '#ffffff' : '#fff5f5',
                        padding: '6px 10px',
                        borderRadius: '8px'
                      }}
                      required
                    />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>
                      {t ? t('step9.kg_per_day') : 'kg / day'} *
                    </span>
                  </div>

                  {!hasVal ? (
                    <span style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 700, display: 'block' }}>
                      * Enter quantity (kg/day)
                    </span>
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>
                      Dry Matter: <strong>{dmVal} kg DM</strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
        <button onClick={onPrev} className="btn-secondary">
          <ChevronLeft size={18} />
          <span>{t ? t('previous') : 'Previous'}</span>
        </button>

        <button onClick={handleProceed} className="btn-primary">
          <span>{t ? t('next_step') : 'Next Step'}</span>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Add Custom Feed Ingredient Modal */}
      {showCustomModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: '20px'
        }}>
          <div className="wg-card" style={{ maxWidth: '420px', width: '100%', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '14px' }}>{t ? t('step9.custom_modal_title') : 'Add Custom Feed Ingredient'}</h3>
            <form onSubmit={handleAddCustomFeed}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 600 }}>{t ? t('step9.feed_name') : 'Feed Name'} *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Groundnut Cake, Tree Fodder..."
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 600 }}>Category</label>
                <select 
                  value={customCategory} 
                  onChange={(e) => setCustomCategory(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="Green Fodder">{t ? t('step9.green_fodder') : 'Green Fodder'}</option>
                  <option value="Dry Fodder">{t ? t('step9.dry_fodder') : 'Dry Fodder'}</option>
                  <option value="Concentrates">{t ? t('step9.concentrates') : 'Concentrates'}</option>
                  <option value="Unconventional">Unconventional Feeds</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 600 }}>{t ? t('step9.dry_matter') : 'Dry Matter'} (%)</label>
                <input 
                  type="number" 
                  min="5" max="100"
                  placeholder="e.g. 25"
                  value={customDm}
                  onFocus={(e) => e.target.select()}
                  onWheel={(e) => e.target.blur()}
                  onChange={(e) => setCustomDm(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowCustomModal(false)} className="btn-secondary">{t ? t('cancel') : 'Cancel'}</button>
                <button type="submit" className="btn-primary">{t ? t('step9.add_ingredient') : 'Add Ingredient'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
