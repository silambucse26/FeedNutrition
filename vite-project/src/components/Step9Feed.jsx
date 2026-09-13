import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Plus, Trash2, X, Sparkles, Edit3 } from 'lucide-react';
import { translateFeed, translateCategory, translateTerm } from '../utils/tamilTranslations';

// Recommended quick quantity chips by category
const QUICK_QTY_MAP = {
  'Green Fodder': [10, 15, 20, 25, 30, 40, 50],
  'Dry Fodder': [3, 5, 8, 10, 15, 20],
  'Concentrates': [1, 2, 3, 4, 5, 8, 10],
  'Unconventional': [2, 5, 8, 10, 15],
};

export default function Step9Feed({
  selectedFeeds = [],
  setSelectedFeeds,
  acknowledgeStep,
  onNext,
  onPrev,
  currentLang = 'ta',
  t,
}) {
  const [activeTab, setActiveTab] = useState('All');
  const [editingFeed, setEditingFeed] = useState(null); // feed item currently in prompt modal
  const [modalQty, setModalQty] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('Green Fodder');
  const [customDm, setCustomDm] = useState(25);

  const defaultFeedCatalog = [
    // 1. GREEN FODDER
    { id: 'maize_fodder', name: 'Maize Fodder', category: 'Green Fodder', dmPct: 22, cpPct: 8.5, defQty: 25 },
    { id: 'napier_grass', name: 'Napier Grass / CO-4', category: 'Green Fodder', dmPct: 20, cpPct: 9.0, defQty: 25 },
    { id: 'sorghum_fodder', name: 'Sorghum Fodder (Jowar)', category: 'Green Fodder', dmPct: 25, cpPct: 7.5, defQty: 20 },
    { id: 'lucerne', name: 'Lucerne (Alfalfa)', category: 'Green Fodder', dmPct: 20, cpPct: 19.5, defQty: 15 },
    { id: 'berseem', name: 'Berseem (Egyptian Clover)', category: 'Green Fodder', dmPct: 16, cpPct: 18.0, defQty: 18 },
    { id: 'cowpea_fodder', name: 'Cowpea Fodder (Lobia)', category: 'Green Fodder', dmPct: 18, cpPct: 19.0, defQty: 15 },
    { id: 'rice_grass', name: 'Rice Grass / Para Grass', category: 'Green Fodder', dmPct: 22, cpPct: 7.0, defQty: 20 },
    { id: 'green_pasture_grass', name: 'Green Pasture Grass', category: 'Green Fodder', dmPct: 22, cpPct: 8.0, defQty: 20 },
    { id: 'oats_fodder', name: 'Oats Fodder', category: 'Green Fodder', dmPct: 20, cpPct: 10.0, defQty: 20 },
    { id: 'silage', name: 'Maize / Corn Silage', category: 'Green Fodder', dmPct: 32, cpPct: 8.5, defQty: 18 },

    // 2. DRY FODDER
    { id: 'wheat_straw', name: 'Wheat Straw (Bhoosa / Turi)', category: 'Dry Fodder', dmPct: 90, cpPct: 3.5, defQty: 5 },
    { id: 'paddy_straw', name: 'Paddy Straw (Rice Straw)', category: 'Dry Fodder', dmPct: 88, cpPct: 3.8, defQty: 5 },
    { id: 'groundnut_haulm', name: 'Groundnut Haulm / Vines', category: 'Dry Fodder', dmPct: 85, cpPct: 13.5, defQty: 4 },
    { id: 'mixed_grass_hay', name: 'Mixed Grass Hay', category: 'Dry Fodder', dmPct: 88, cpPct: 7.5, defQty: 5 },
    { id: 'jowar_hay', name: 'Jowar / Sorghum Stover (Kadbi)', category: 'Dry Fodder', dmPct: 88, cpPct: 6.0, defQty: 5 },
    { id: 'sugarcane_bagasse', name: 'Sugarcane Bagasse / Tops', category: 'Dry Fodder', dmPct: 90, cpPct: 2.0, defQty: 4 },

    // 3. CONCENTRATES
    { id: 'wheat_bran', name: 'Wheat Bran (Choker)', category: 'Concentrates', dmPct: 88, cpPct: 14.5, defQty: 4 },
    { id: 'maize_grain', name: 'Maize Grain Crushed (Makka)', category: 'Concentrates', dmPct: 88, cpPct: 9.5, defQty: 3 },
    { id: 'soybean_meal', name: 'Soybean Meal (DOC)', category: 'Concentrates', dmPct: 90, cpPct: 48.0, defQty: 2 },
    { id: 'cottonseed_cake', name: 'Cottonseed Cake (Khal)', category: 'Concentrates', dmPct: 91, cpPct: 22.0, defQty: 3 },
    { id: 'mustard_cake', name: 'Mustard / Rapeseed Cake (Sarson Khal)', category: 'Concentrates', dmPct: 90, cpPct: 36.0, defQty: 2 },
    { id: 'groundnut_cake', name: 'Groundnut Cake', category: 'Concentrates', dmPct: 92, cpPct: 45.0, defQty: 2 },
    { id: 'rice_bran', name: 'De-oiled Rice Bran (DORB)', category: 'Concentrates', dmPct: 90, cpPct: 13.0, defQty: 3 },
    { id: 'commercial_pellets', name: 'Commercial Dairy Compound Pellets', category: 'Concentrates', dmPct: 89, cpPct: 20.0, defQty: 4 },
    { id: 'barley_grain', name: 'Barley Grain Crushed (Jau)', category: 'Concentrates', dmPct: 89, cpPct: 11.5, defQty: 3 },
    { id: 'oats_grain', name: 'Oats Grain Crushed', category: 'Concentrates', dmPct: 89, cpPct: 12.0, defQty: 3 },
    { id: 'sesame_cake', name: 'Sesame / Til Cake', category: 'Concentrates', dmPct: 90, cpPct: 38.0, defQty: 2 },
    { id: 'sunflower_meal', name: 'Sunflower Meal', category: 'Concentrates', dmPct: 90, cpPct: 32.0, defQty: 2 },

    // 4. UNCONVENTIONAL
    { id: 'brewer_grain', name: 'Spent Brewer Grain (Wet)', category: 'Unconventional', dmPct: 24, cpPct: 26.0, defQty: 10 },
    { id: 'citrus_pulp', name: 'Citrus Fruit Pulp', category: 'Unconventional', dmPct: 20, cpPct: 6.5, defQty: 8 },
    { id: 'cane_molasses', name: 'Cane Molasses', category: 'Unconventional', dmPct: 75, cpPct: 4.0, defQty: 2 },
    { id: 'azolla', name: 'Azolla Pinnata (Fresh)', category: 'Unconventional', dmPct: 10, cpPct: 24.0, defQty: 2 },
  ];

  const getSelectedFeed = (id) => selectedFeeds.find(f => f.id === id);

  // When user clicks a feed card, immediately open quantity prompt!
  const handleSelectFeedCard = (item) => {
    const existing = getSelectedFeed(item.id);
    setEditingFeed(item);
    setModalQty(existing?.quantityKg ? String(existing.quantityKg) : String(item.defQty || 10));
  };

  // Confirm quantity from modal
  const handleSaveModalQty = () => {
    if (!editingFeed) return;
    const num = parseFloat(modalQty);
    if (isNaN(num) || num <= 0) {
      alert('Please enter a valid quantity in kg/day.');
      return;
    }

    if (acknowledgeStep) acknowledgeStep();
    const existing = getSelectedFeed(editingFeed.id);

    if (existing) {
      setSelectedFeeds(selectedFeeds.map(f => f.id === editingFeed.id ? { ...f, quantityKg: num } : f));
    } else {
      setSelectedFeeds([
        ...selectedFeeds,
        {
          id: editingFeed.id,
          name: editingFeed.name,
          category: editingFeed.category,
          dmPct: editingFeed.dmPct,
          cpPct: editingFeed.cpPct,
          quantityKg: num,
        },
      ]);
    }
    setEditingFeed(null);
  };

  const handleRemoveFeed = (id, e) => {
    e.stopPropagation();
    if (acknowledgeStep) acknowledgeStep();
    setSelectedFeeds(selectedFeeds.filter(f => f.id !== id));
  };

  const handleAddCustomFeed = (e) => {
    e.preventDefault();
    if (!customName.trim()) return;
    if (acknowledgeStep) acknowledgeStep();
    const newId = `custom_${Date.now()}`;
    const newFeed = {
      id: newId,
      name: customName.trim(),
      category: customCategory,
      dmPct: parseFloat(customDm) || 25,
      quantityKg: 10,
    };
    setSelectedFeeds([...selectedFeeds, newFeed]);
    setShowCustomModal(false);
    setCustomName('');
  };

  const categories = ['All', 'Green Fodder', 'Dry Fodder', 'Concentrates', 'Unconventional'];

  const displayedCatalog = activeTab === 'All'
    ? defaultFeedCatalog
    : defaultFeedCatalog.filter(f => f.category === activeTab);

  const totalKg = selectedFeeds.reduce((acc, f) => acc + (Number(f.quantityKg) || 0), 0);

  const handleProceed = () => {
    if (selectedFeeds.length === 0) {
      alert('Please select at least one feed available on your farm.');
      return;
    }
    const incomplete = selectedFeeds.filter(f => !f.quantityKg || Number(f.quantityKg) <= 0);
    if (incomplete.length > 0) {
      alert(`Please enter quantities for: ${incomplete.map(f => f.name).join(', ')}`);
      return;
    }
    onNext();
  };

  return (
    <div className="wg-card animate-fade-in">

      {/* Visual Banner */}
      <div
        className="step-banner"
        style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '1.5px solid #86efac',
          marginBottom: '20px',
        }}
      >
        <div className="step-banner-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ background: '#16a34a', color: '#ffffff', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>
              {currentLang === 'ta' ? 'படி 5 / 6' : 'STEP 5 OF 6'}
            </span>
            <span style={{ fontSize: '0.825rem', color: '#15803d', fontWeight: 800 }}>
              {currentLang === 'ta' ? 'பண்ணை தீவன இருப்பு' : 'FARM FEED INVENTORY'}
            </span>
          </div>
          <h2 className="step-banner-title" style={{ color: '#14532d' }}>
            {currentLang === 'ta' ? 'தீவனம் & பசுந்தீவன இருப்பு' : 'Feed & Fodder Availability'}
          </h2>
          <p className="step-banner-subtitle" style={{ color: '#334155' }}>
            {currentLang === 'ta' 
              ? 'உங்கள் பண்ணையில் உள்ள ஒவ்வொரு தீவனத்தையும் தொட்டுத் தேர்வு செய்து, தினசரி கிடைக்கும் அளவை (கிலோ/நாள்) உள்ளிடவும்.' 
              : 'Tap each feed you have on your farm. When you select a feed, enter how much you have right now (kg/day).'}
          </p>
        </div>

        <img
          src="/cattle_art/feed.jpg"
          alt="Feeds and Fodder"
          className="step-banner-img"
          onError={e => { e.target.style.display = 'none'; }}
        />
      </div>

      {/* Inventory Summary Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#ffffff',
        border: '1.5px solid #86efac',
        borderRadius: '14px',
        padding: '12px 18px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, display: 'block' }}>
              {currentLang === 'ta' ? 'தேர்வு செய்த தீவனங்கள்' : 'FEEDS SELECTED'}
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#16a34a' }}>
              {selectedFeeds.length} {currentLang === 'ta' ? 'வகைகள்' : 'Feeds'}
            </span>
          </div>
          <div style={{ width: '1px', height: '30px', background: '#e2e8f0' }} />
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, display: 'block' }}>
              {currentLang === 'ta' ? 'மொத்த தீவன இருப்பு' : 'TOTAL INVENTORY'}
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
              {totalKg.toFixed(0)} {currentLang === 'ta' ? 'கிலோ/நாள்' : 'kg/day'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowCustomModal(true)}
          className="btn-secondary"
          style={{ padding: '6px 14px', fontSize: '0.78rem', fontWeight: 800 }}
        >
          {currentLang === 'ta' ? '+ புதிய தீவனம் சேர்' : '+ Add Custom Feed'}
        </button>
      </div>

      {/* Category Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '8px',
        marginBottom: '16px',
      }}>
        {categories.map(cat => {
          const isSel = activeTab === cat;
          const displayLabel = cat === 'All' 
            ? (currentLang === 'ta' ? 'அனைத்தும்' : 'All') 
            : translateCategory(cat, currentLang);
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveTab(cat)}
              style={{
                padding: '7px 16px',
                borderRadius: '20px',
                border: `1.5px solid ${isSel ? '#16a34a' : '#e2e8f0'}`,
                background: isSel ? '#16a34a' : '#ffffff',
                color: isSel ? '#ffffff' : '#475569',
                fontSize: '0.8rem',
                fontWeight: isSel ? 800 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {displayLabel}
            </button>
          );
        })}
      </div>

      {/* FEED CARDS GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 250px), 1fr))',
        gap: '12px',
        marginBottom: '24px',
      }}>
        {displayedCatalog.map(item => {
          const selected = getSelectedFeed(item.id);
          const isSelected = Boolean(selected);

          return (
            <div
              key={item.id}
              onClick={() => handleSelectFeedCard(item)}
              style={{
                background: isSelected ? '#f0fdf4' : '#ffffff',
                border: `2px solid ${isSelected ? '#16a34a' : '#e2e8f0'}`,
                borderRadius: '14px',
                padding: '14px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.18s ease',
                boxShadow: isSelected ? '0 4px 12px rgba(22,163,74,0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                position: 'relative',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    color: isSelected ? '#15803d' : '#94a3b8',
                    background: isSelected ? '#dcfce7' : '#f1f5f9',
                    padding: '2px 7px',
                    borderRadius: '10px',
                  }}>
                    {translateCategory(item.category, currentLang)}
                  </span>

                  {isSelected && (
                    <button
                      type="button"
                      onClick={(e) => handleRemoveFeed(item.id, e)}
                      title="Remove this feed"
                      style={{
                        background: '#fee2e2',
                        border: 'none',
                        color: '#ef4444',
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 2px' }}>
                  {translateFeed(item.name, currentLang)}
                </div>
                {currentLang === 'ta' && (
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '6px' }}>
                    {item.name}
                  </div>
                )}
              </div>

              {/* Status / Quantity Pill */}
              <div style={{ marginTop: '8px' }}>
                {isSelected ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#ffffff',
                    border: '1.5px solid #86efac',
                    borderRadius: '8px',
                    padding: '5px 10px',
                  }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#15803d' }}>
                      ✓ {selected.quantityKg} {currentLang === 'ta' ? 'கிலோ/நாள்' : 'kg/day'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <Edit3 size={11} /> {currentLang === 'ta' ? 'மாற்று' : 'edit'}
                    </span>
                  </div>
                ) : (
                  <div style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#64748b',
                    background: '#f8fafc',
                    padding: '5px 8px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '1px dashed #cbd5e1',
                  }}>
                    {currentLang === 'ta' ? '+ அளவை உள்ளிட தொடவும்' : '+ Tap to add quantity'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>


      {/* POPUP MODAL: ASK QUANTITY IMMEDIATELY ON SELECTION */}
      {editingFeed && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px',
        }}>
          <div
            className="animate-fade-in"
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '440px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '2px solid #86efac',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#16a34a', background: '#f0fdf4', padding: '2px 8px', borderRadius: '10px' }}>
                  {translateCategory(editingFeed.category, currentLang)}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 0' }}>
                  {currentLang === 'ta' 
                    ? `தற்போது உங்களிடம் உள்ள ${translateFeed(editingFeed.name, currentLang)} தீவனத்தின் அளவு எவ்வளவு?` 
                    : `How much ${editingFeed.name} do you have right now?`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingFeed(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 16px' }}>
              {currentLang === 'ta' 
                ? 'உங்கள் பண்ணையில் தினசரி கிடைக்கும் மொத்த அளவை (கிலோ/நாள்) உள்ளிடவும்.' 
                : 'Enter the total amount (kg/day) available on your farm.'}
            </p>

            {/* Stepper + Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <button
                type="button"
                onClick={() => setModalQty(String(Math.max(1, (parseFloat(modalQty) || 10) - (editingFeed.category === 'Concentrates' ? 1 : 5))))}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                −
              </button>

              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 14px',
                borderRadius: '10px',
                border: '2px solid #16a34a',
                background: '#f0fdf4',
              }}>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="500"
                  autoFocus
                  value={modalQty}
                  onChange={e => setModalQty(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveModalQty()}
                  style={{
                    width: '80px',
                    fontSize: '1.4rem',
                    fontWeight: 900,
                    textAlign: 'center',
                    color: '#16a34a',
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                  }}
                />
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#16a34a' }}>
                  {currentLang === 'ta' ? 'கிலோ/நாள்' : 'kg/day'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setModalQty(String((parseFloat(modalQty) || 10) + (editingFeed.category === 'Concentrates' ? 1 : 5)))}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  border: '1.5px solid #16a34a',
                  background: '#16a34a',
                  color: '#ffffff',
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                +
              </button>
            </div>

            {/* Quick-tap Quantity Chips */}
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                {currentLang === 'ta' ? 'விரைவுத் தேர்வு (கிலோ):' : 'Quick select kg:'}
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(QUICK_QTY_MAP[editingFeed.category] || [5, 10, 15, 20, 25, 30]).map(q => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setModalQty(String(q))}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '16px',
                      border: `1.5px solid ${Number(modalQty) === q ? '#16a34a' : '#e2e8f0'}`,
                      background: Number(modalQty) === q ? '#16a34a' : '#ffffff',
                      color: Number(modalQty) === q ? '#ffffff' : '#475569',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    {q} {currentLang === 'ta' ? 'கிலோ' : 'kg'}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setEditingFeed(null)}
                className="btn-secondary"
                style={{ flex: 1, padding: '10px', fontSize: '0.82rem' }}
              >
                {currentLang === 'ta' ? 'ரத்து' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSaveModalQty}
                className="btn-primary"
                style={{ flex: 2, padding: '10px', fontSize: '0.85rem' }}
              >
                <Check size={16} />
                <span>{currentLang === 'ta' ? 'பண்ணை இருப்பில் சேமி' : 'Save to Farm Inventory'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Feed Modal */}
      {showCustomModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px',
        }}>
          <form onSubmit={handleAddCustomFeed} style={{ background: '#ffffff', borderRadius: '18px', padding: '24px', maxWidth: '400px', width: '100%' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 12px' }}>
              {currentLang === 'ta' ? 'புதிய தீவனம் சேர்' : 'Add Custom Feed'}
            </h3>
            <input
              type="text"
              placeholder={currentLang === 'ta' ? 'தீவனப் பெயர் (எ.கா. நாட்டு நேப்பியர்)' : 'Feed Name (e.g. Local Napier Hybrid)'}
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', marginBottom: '10px' }}
            />
            <select
              value={customCategory}
              onChange={e => setCustomCategory(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', marginBottom: '16px' }}
            >
              <option value="Green Fodder">{currentLang === 'ta' ? 'பசுந்தீவனம்' : 'Green Fodder'}</option>
              <option value="Dry Fodder">{currentLang === 'ta' ? 'உலர் தீவனம்' : 'Dry Fodder'}</option>
              <option value="Concentrates">{currentLang === 'ta' ? 'அடர்தீவனம்' : 'Concentrates'}</option>
              <option value="Unconventional">{currentLang === 'ta' ? 'மரபுசாராத் தீவனம்' : 'Unconventional'}</option>
            </select>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={() => setShowCustomModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                {currentLang === 'ta' ? 'ரத்து' : 'Cancel'}
              </button>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                {currentLang === 'ta' ? 'சேர்' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1.5px solid #e2e8f0', paddingTop: '20px' }}>
        <button onClick={onPrev} className="btn-secondary">
          <ChevronLeft size={18} />
          <span>{currentLang === 'ta' ? 'முந்தையது (தண்ணீர்)' : 'Previous'}</span>
        </button>

        <button onClick={handleProceed} className="btn-primary">
          <span>{currentLang === 'ta' ? 'அடுத்த படி: இறுதிச் சுருக்கம் & கணக்கீடு' : 'Next: Review & Results'}</span>
          <ChevronRight size={18} />
        </button>
      </div>


    </div>
  );
}
