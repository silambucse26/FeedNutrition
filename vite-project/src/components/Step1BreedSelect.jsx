import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronRight, Check, ChevronDown, Plus } from 'lucide-react';
import { CATTLE_BREEDS, getBreedName } from '../data/breeds';

export default function Step1BreedSelect({ selectedBreed, onSelectBreed, onNext, t }) {
  // Empty search term by default so ALL breeds are displayed on load!
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customBreedName, setCustomBreedName] = useState('');
  const [customCategory, setCustomCategory] = useState('Cattle');
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredBreeds = CATTLE_BREEDS.filter(breed => {
    const translatedName = getBreedName(breed, t);
    const searchLower = searchTerm.toLowerCase();
    return (
      breed.name.toLowerCase().includes(searchLower) ||
      (translatedName && translatedName.toLowerCase().includes(searchLower)) ||
      breed.category.toLowerCase().includes(searchLower)
    );
  });

  const handleSelectBreed = (breed) => {
    // Toggle: second click deselects
    if (selectedBreed?.id === breed.id) {
      onSelectBreed(null);
    } else {
      onSelectBreed(breed);
    }
    setIsOpen(false);
  };

  const handleAddCustomBreed = (e) => {
    e.preventDefault();
    if (!customBreedName.trim()) return;
    const newBreed = {
      id: `custom_${Date.now()}`,
      name: customBreedName.trim(),
      category: customCategory,
      subCategory: 'Custom',
      origin: 'Farm Custom Breed',
      avgWeightHeifer: 350,
      avgWeightCow: 500,
      image: 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=400&q=80',
      description: 'Custom added breed for farm ration calculation.',
      badge: 'Custom'
    };
    onSelectBreed(newBreed);
    setShowCustomModal(false);
  };

  return (
    <div className="wg-card animate-fade-in" style={{ padding: '32px' }}>
      {/* Visual Header Banner with Big Clean Image */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        border: '1.5px solid #bbf7d0',
        borderRadius: '20px',
        padding: '24px 28px',
        marginBottom: '28px',
        gap: '24px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '260px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge-green">{t ? t('step1.badge') : 'STEP 1 OF 9'}</span>
            <span style={{ fontSize: '0.825rem', color: '#16a34a', fontWeight: 800 }}>{t ? t('steps.step_1') : 'BREED SELECTION'}</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0', lineHeight: 1.2 }}>
            {t ? t('step1.title') : 'Select Cattle or Buffalo Breed'}
          </h2>
          <p style={{ color: '#475569', fontSize: '0.925rem', margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
            {t ? t('step1.subtitle') : 'Search or pick your breed from the single combined field below, or click any breed card to select.'}
          </p>
        </div>

        <img 
          src="/cattle_art/breed_select.jpg" 
          alt="Cattle Breed Selection" 
          style={{ 
            width: '160px', 
            height: '160px', 
            borderRadius: '20px', 
            objectFit: 'cover', 
            boxShadow: '0 10px 25px rgba(22, 163, 74, 0.25)',
            border: '4px solid #ffffff',
            flexShrink: 0
          }} 
        />
      </div>

      {/* SINGLE COMBINED SEARCH & SELECT FIELD */}
      <div style={{ marginBottom: '24px', position: 'relative' }} ref={dropdownRef}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 800 }}>
            {t ? t('step1.search_label') : 'Search & Select Cattle Breed'}
          </label>

          <button
            type="button"
            onClick={() => setShowCustomModal(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#16a34a',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Plus size={15} />
            <span>{t ? t('step1.add_custom') : 'Add Custom Breed'}</span>
          </button>
        </div>
        
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#16a34a' }} />
          
          <input 
            type="text" 
            placeholder={t ? t('step1.search_placeholder') : 'Search all breeds (e.g. Holstein Friesian, Jersey, Gir, Sahiwal, Murrah)...'}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            style={{ 
              width: '100%', 
              paddingLeft: '42px',
              paddingRight: '40px',
              paddingTop: '12px',
              paddingBottom: '12px',
              fontSize: '0.95rem',
              fontWeight: '700',
              borderColor: isOpen ? '#16a34a' : '#cbd5e1',
              borderRadius: '12px'
            }}
          />

          <ChevronDown 
            size={18} 
            style={{ 
              position: 'absolute', 
              right: '14px', 
              top: '50%', 
              transform: `translateY(-50%) rotate(${isOpen ? 180 : 0}deg)`, 
              color: '#64748b',
              transition: 'transform 0.2s ease',
              cursor: 'pointer' 
            }} 
            onClick={() => setIsOpen(!isOpen)}
          />
        </div>

        {/* Dropdown Options List */}
        {isOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '6px',
            background: '#ffffff',
            border: '2px solid #16a34a',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            maxHeight: '280px',
            overflowY: 'auto',
            zIndex: 100
          }}>
            {filteredBreeds.length > 0 ? (
              filteredBreeds.map(breed => (
                <div
                  key={breed.id}
                  onClick={() => handleSelectBreed(breed)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 16px',
                    cursor: 'pointer',
                    background: selectedBreed?.id === breed.id ? '#f0fdf4' : '#ffffff',
                    borderBottom: '1px solid #f1f5f9'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                  onMouseLeave={(e) => e.currentTarget.style.background = selectedBreed?.id === breed.id ? '#f0fdf4' : '#ffffff'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img 
                      src={breed.image} 
                      alt={getBreedName(breed, t)}
                      style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }}
                      onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=200&q=80'}
                    />
                    <div>
                      <div style={{ fontSize: '0.925rem', fontWeight: 800, color: '#0f172a' }}>{getBreedName(breed, t)}</div>
                      <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>{breed.category} ({breed.origin})</div>
                    </div>
                  </div>

                  {selectedBreed?.id === breed.id && (
                    <Check size={16} color="#16a34a" strokeWidth={3} />
                  )}
                </div>
              ))
            ) : (
              <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                {t ? t('step1.no_breeds_found') : 'No breeds match'} "{searchTerm}".
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Breed Banner & Proceed Button */}
      {selectedBreed && (
        <div style={{
          background: '#f0fdf4',
          border: '2px solid #16a34a',
          borderRadius: '14px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img 
              src={selectedBreed.image} 
              alt={getBreedName(selectedBreed, t)}
              style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover', border: '2px solid #86efac' }}
            />
            <div>
              <span className="badge-green">{t ? t('step1.selected_breed') : 'SELECTED BREED'}</span>
              <h3 style={{ fontSize: '1.2rem', color: '#0f172a', margin: '3px 0 0', fontWeight: 800 }}>
                {getBreedName(selectedBreed, t)}
              </h3>
            </div>
          </div>

          <button onClick={onNext} className="btn-primary" style={{ padding: '10px 22px', fontSize: '0.9rem' }}>
            <span>{t ? t('step1.proceed_step2') : 'Proceed to Step 2 (Heifers)'}</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Breed Cards Grid: DISPLAYS ALL BREEDS ON LOAD */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
        gap: '14px'
      }}>
        {filteredBreeds.map(breed => {
          const isSelected = selectedBreed?.id === breed.id;

          return (
            <div
              key={breed.id}
              onClick={() => handleSelectBreed(breed)}
              className="wg-card wg-card-hover"
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                border: isSelected ? '2.5px solid #16a34a' : '1.5px solid #e2e8f0',
                background: isSelected ? '#f0fdf4' : '#ffffff',
                position: 'relative',
                textAlign: 'center'
              }}
            >
              <div style={{ position: 'relative', height: '135px', overflow: 'hidden', background: '#f8fafc' }}>
                <img 
                  src={breed.image} 
                  alt={getBreedName(breed, t)}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: '#16a34a',
                    color: '#ffffff',
                    borderRadius: '50%',
                    width: '26px',
                    height: '26px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(22,163,74,0.4)'
                  }}>
                    <Check size={16} strokeWidth={3} />
                  </div>
                )}
              </div>

              <div style={{ padding: '10px 8px' }}>
                <h3 style={{ fontSize: '0.95rem', color: isSelected ? '#15803d' : '#0f172a', margin: 0, fontWeight: 800 }}>
                  {getBreedName(breed, t)}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Breed Modal */}
      {showCustomModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: '20px'
        }}>
          <div className="wg-card" style={{ maxWidth: '420px', width: '100%', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>{t ? t('step1.custom_modal_title') : 'Add Custom Breed'}</h3>
            <form onSubmit={handleAddCustomBreed}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 600 }}>{t ? t('step1.breed_name') : 'Breed Name'}</label>
                <input 
                  type="text" 
                  placeholder="e.g. Local Crossbreed..." 
                  value={customBreedName}
                  onChange={(e) => setCustomBreedName(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 600 }}>{t ? t('step1.category') : 'Category'}</label>
                <select 
                  value={customCategory} 
                  onChange={(e) => setCustomCategory(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="Cattle">Cattle</option>
                  <option value="Buffalo">Buffalo</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowCustomModal(false)} className="btn-secondary">{t ? t('cancel') : 'Cancel'}</button>
                <button type="submit" className="btn-primary">{t ? t('step1.add_and_select') : 'Add & Select'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginTop: '20px' }}>
        <button 
          onClick={onNext} 
          className="btn-primary" 
          disabled={!selectedBreed}
          style={{ 
            padding: '12px 24px', 
            opacity: selectedBreed ? 1 : 0.5, 
            cursor: selectedBreed ? 'pointer' : 'not-allowed' 
          }}
        >
          <span>{t ? t('next_step') : 'Next Step'}</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
