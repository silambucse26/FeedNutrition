import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, CheckSquare, Square } from 'lucide-react';

export default function Step9Feed({ 
  selectedFeeds, 
  setSelectedFeeds, 
  onNext, 
  onPrev,
  t
}) {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('Green Fodder');
  const [customDm, setCustomDm] = useState(25);

  const defaultFeedCatalog = [
    // Green Fodder
    { id: 'maize_fodder', name: 'Maize Fodder', category: 'Green Fodder', dmPct: 22 },
    { id: 'napier_grass', name: 'Napier Grass', category: 'Green Fodder', dmPct: 20 },
    { id: 'sorghum', name: 'Sorghum Fodder', category: 'Green Fodder', dmPct: 25 },
    { id: 'lucerne', name: 'Lucerne (Alfalfa)', category: 'Green Fodder', dmPct: 18 },
    { id: 'rice_grass', name: 'Rice Grass', category: 'Green Fodder', dmPct: 22 },

    // Dry Fodder
    { id: 'wheat_straw', name: 'Wheat Straw (Bhoosa)', category: 'Dry Fodder', dmPct: 90 },
    { id: 'paddy_straw', name: 'Paddy Straw', category: 'Dry Fodder', dmPct: 88 },
    { id: 'groundnut_haulm', name: 'Groundnut Haulm', category: 'Dry Fodder', dmPct: 85 },

    // Concentrates
    { id: 'wheat_bran', name: 'Wheat Bran', category: 'Concentrates', dmPct: 88 },
    { id: 'maize_grain', name: 'Maize Grain Crushed', category: 'Concentrates', dmPct: 88 },
    { id: 'soybean_meal', name: 'Soybean Meal', category: 'Concentrates', dmPct: 90 },
    { id: 'cottonseed_cake', name: 'Cottonseed Cake', category: 'Concentrates', dmPct: 91 }
  ];

  const isFeedSelected = (id) => selectedFeeds.some(f => f.id === id);

  const toggleSelectFeed = (item) => {
    if (isFeedSelected(item.id)) {
      setSelectedFeeds(selectedFeeds.filter(f => f.id !== item.id));
    } else {
      setSelectedFeeds([
        ...selectedFeeds,
        {
          id: item.id,
          name: item.name,
          category: item.category,
          dmPct: item.dmPct,
          quantityKg: item.category === 'Green Fodder' ? 25 : item.category === 'Dry Fodder' ? 6 : 4
        }
      ]);
    }
  };

  const handleUpdateQty = (id, val) => {
    const updated = selectedFeeds.map(f => {
      if (f.id === id) {
        return { ...f, quantityKg: parseFloat(val) || 0 };
      }
      return f;
    });
    setSelectedFeeds(updated);
  };

  const handleAddCustomFeed = (e) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const newId = `custom_feed_${Date.now()}`;
    const newFeed = {
      id: newId,
      name: customName.trim(),
      category: customCategory,
      dmPct: parseFloat(customDm) || 25,
      quantityKg: customCategory === 'Green Fodder' ? 20 : 5
    };
    setSelectedFeeds([...selectedFeeds, newFeed]);
    setShowCustomModal(false);
    setCustomName('');
  };

  const categories = [
    { key: 'Green Fodder', label: t ? t('step9.green_fodder') : 'Green Fodder' },
    { key: 'Dry Fodder', label: t ? t('step9.dry_fodder') : 'Dry Fodder' },
    { key: 'Concentrates', label: t ? t('step9.concentrates') : 'Concentrates' }
  ];

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
            <span style={{ background: '#ca8a04', color: '#ffffff', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>{t ? t('step9.badge') : 'STEP 9 OF 9'}</span>
            <span style={{ fontSize: '0.825rem', color: '#854d0e', fontWeight: 800 }}>{t ? t('step9.tag') : 'NUTRITION & FODDER INVENTORY'}</span>
          </div>
          <h2 className="step-banner-title" style={{ color: '#713f12' }}>
            {t ? t('step9.title') : 'Feed & Fodder Inventory'}
          </h2>
          <p className="step-banner-subtitle" style={{ color: '#854d0e' }}>
            {t ? t('step9.subtitle') : 'Select your available green fodders, dry straws, and concentrates to compute NRC ration balance.'}
          </p>
        </div>

        <img 
          src="/cattle_art/feed.jpg" 
          alt="Feed and Fodder" 
          className="step-banner-img"
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button onClick={() => setShowCustomModal(true)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
          <Plus size={14} /> {t ? t('step9.add_custom_feed') : '+ Add Custom Feed Ingredient'}
        </button>
      </div>

      {/* Categories Pickers */}
      {categories.map(cat => {
        const catItems = defaultFeedCatalog.filter(f => f.category === cat.key);
        
        return (
          <div key={cat.key} style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#15803d', fontWeight: 800, marginBottom: '12px' }}>
              {cat.label}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {catItems.map(item => {
                const selected = isFeedSelected(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSelectFeed(item)}
                    style={{
                      background: selected ? '#f0fdf4' : '#ffffff',
                      border: selected ? '2px solid #16a34a' : '1.5px solid #cbd5e1',
                      borderRadius: '12px',
                      padding: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{item.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                        ~{item.dmPct}% {t ? t('step9.dry_matter') : 'Dry Matter'}
                      </div>
                    </div>
                    {selected ? <CheckSquare color="#16a34a" size={18} /> : <Square color="#94a3b8" size={18} />}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Selected Feed Ingredient Quantity Cards */}
      {selectedFeeds.length > 0 && (
        <div style={{
          background: '#f8fafc',
          border: '1.5px solid #e2e8f0',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '28px'
        }}>
          <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 800, marginBottom: '16px' }}>
            {t ? t('step9.daily_quantity_header') : 'Daily Quantity Given to Herd (kg / day)'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {selectedFeeds.map(feed => {
              const dmKg = ((feed.quantityKg || 0) * (feed.dmPct || 25)) / 100;
              return (
                <div key={feed.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{feed.name}</strong>
                    <button 
                      onClick={() => setSelectedFeeds(selectedFeeds.filter(f => f.id !== feed.id))}
                      style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <input 
                      type="number"
                      min="0" max="1000"
                      value={feed.quantityKg}
                      onChange={(e) => handleUpdateQty(feed.id, e.target.value)}
                      style={{ width: '100px', fontWeight: 800, color: '#16a34a', fontSize: '1.05rem' }}
                    />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>{t ? t('step9.kg_per_day') : 'kg / day'}</span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {t ? t('step9.dry_matter') : 'Dry Matter'}: <strong style={{ color: '#16a34a' }}>{dmKg.toFixed(1)} kg DM</strong> ({feed.dmPct}%)
                  </div>
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

        <button onClick={onNext} className="btn-primary">
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
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 600 }}>{t ? t('step9.feed_name') : 'Feed Name'}</label>
                <input 
                  type="text" 
                  placeholder="e.g. Groundnut Cake, Silage..."
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
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 600 }}>{t ? t('step9.dry_matter') : 'Dry Matter'} (%)</label>
                <input 
                  type="number" 
                  min="5" max="100"
                  value={customDm}
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
