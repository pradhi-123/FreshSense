import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BhashiniLanguageSwitcher from '../components/common/BhashiniLanguageSwitcher';
import BhashiniVoiceTranscriber from '../components/common/BhashiniVoiceTranscriber';
import { useLanguage } from '../context/LanguageContext';
import stripImg from '../assets/splash-ref.png';
import './PublicStorefront.css';

export default function PublicStorefront() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showVoiceInput, setShowVoiceInput] = useState(false);

  const [artisan, setArtisan] = useState(() => {
    try {
      const saved = localStorage.getItem('virasat_artisan_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          display_name: parsed.name || 'Rameshwari Devangan',
          craft: parsed.craft || 'Kosa Silk Weaving',
          place: parsed.village || 'Champa, Chhattisgarh',
          generation: 3,
          verification_level: 2,
        };
      }
    } catch (e) {
      console.warn('Profile read error:', e);
    }
    return {
      display_name: 'Rameshwari Devangan',
      craft: 'Kosa Silk Weaving',
      place: 'Champa, Chhattisgarh',
      generation: 3,
      verification_level: 2,
    };
  });

  const [products, setProducts] = useState(() => {
    const defaultList = [
      {
        id: 'L01',
        title: 'Authentic Handwoven Kosa Silk Saree',
        price: 14500,
        leadTimeDays: 27,
        story: 'Hand-spun 100% natural golden Kosa silk, woven over 46 hours of handloom work in Champa.',
        img: stripImg,
      },
    ];
    try {
      const custom = JSON.parse(localStorage.getItem('virasat_published_products') || '[]');
      if (custom.length > 0) {
        const formatted = custom.map((c) => ({
          id: c.id,
          title: c.title,
          price: typeof c.rawPrice === 'number' ? c.rawPrice : (parseInt(String(c.price).replace(/[^\d]/g, '')) || 2800),
          leadTimeDays: c.leadTimeDays || 21,
          story: c.story || 'Authentic handcrafted piece verified by Virasat AI studio.',
          img: c.image || stripImg,
        }));
        return [...formatted, ...defaultList];
      }
    } catch (e) {
      console.warn('Error reading custom storefront products:', e);
    }
    return defaultList;
  });

  const [orderModal, setOrderModal] = useState(false);
  const [selectedProductForOrder, setSelectedProductForOrder] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerContact, setBuyerContact] = useState('');

  useEffect(() => {
    const fetchStore = async () => {
      try {
        let res = await fetch(`http://localhost:5000/api/store/${slug || 'rameshwari-devangan'}`).catch(() => null);
        if (!res || !res.ok) {
          res = await fetch(`http://localhost:5001/api/store/${slug || 'rameshwari-devangan'}`).catch(() => null);
        }
        if (res && res.ok) {
          const data = await res.json();
          if (data.ok && data.artisan) setArtisan(data.artisan);
        }
      } catch (err) {
        console.warn('Storefront API fallback:', err);
      }
    };
    fetchStore();
  }, [slug]);

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    const targetItem = selectedProductForOrder || products[0];
    const newOrder = {
      id: `ord-${Date.now().toString().slice(-4)}`,
      buyer_name: buyerName,
      buyer_contact: buyerContact,
      product_title: targetItem.title,
      price: targetItem.price,
      status: 'requested',
      estimated_delivery: new Date(Date.now() + (targetItem.leadTimeDays || 27) * 86400000).toISOString().slice(0, 10),
      created_at: new Date().toISOString().slice(0, 10),
    };

    try {
      const existingOrders = JSON.parse(localStorage.getItem('virasat_orders') || '[]');
      localStorage.setItem('virasat_orders', JSON.stringify([newOrder, ...existingOrders]));
    } catch (err) {
      console.warn('Error saving order:', err);
    }

    setOrderSuccess(true);
    setTimeout(() => {
      setOrderModal(false);
      setOrderSuccess(false);
      setBuyerName('');
      setBuyerContact('');
    }, 2800);
  };

  return (
    <div className="storefront-page">
      {/* Top Header */}
      <header className="storefront-header">
        <button type="button" className="store-back-btn" onClick={() => navigate('/artisan')}>
          ← Back to Hub
        </button>
        <span className="storefront-brand">VIRASAT PUBLIC STOREFRONT</span>
        <BhashiniLanguageSwitcher />
      </header>

      {/* Artisan Profile Banner */}
      <section className="artisan-banner-card">
        <div className="artisan-avatar-ring">
          <span className="avatar-letter">{artisan.display_name.charAt(0)}</span>
        </div>
        <div className="banner-details">
          <span className="verified-seal-chip">✓ Verified Karigar (Govt ID Verified)</span>
          <h1 className="artisan-banner-name">{artisan.display_name}</h1>
          <p className="artisan-banner-sub">
            {artisan.generation}rd Generation Master • {artisan.craft} • {artisan.place}
          </p>
        </div>
      </section>

      {/* Product Catalog Stage */}
      <main className="store-products-stage">
        <h2 className="catalog-section-heading">Authentic Handloom Crafts</h2>

        <div className="store-products-grid">
          {products.map((item) => (
            <article key={item.id} className="store-product-card">
              <div className="product-img-wrap">
                <img src={item.img} alt={item.title} className="store-product-img" />
                <span className="mto-badge">Made for you • Ready in ~{item.leadTimeDays} days</span>
              </div>

              <div className="product-card-body">
                <h3 className="product-title">{item.title}</h3>
                <p className="product-story-quote">"{item.story}"</p>

                <div className="product-price-row">
                  <span className="price-tag">₹{item.price.toLocaleString('en-IN')}</span>
                  <span className="price-subtext">Direct Artisan Value</span>
                </div>

                <div className="product-btn-stack">
                  <button
                    type="button"
                    className="order-mto-btn"
                    onClick={() => {
                      setSelectedProductForOrder(item);
                      setOrderModal(true);
                    }}
                  >
                    🛍️ Order via Made-to-Order
                  </button>

                  <button
                    type="button"
                    className="view-karigar-pass-btn"
                    onClick={() => navigate('/karigar-pass')}
                  >
                    🏅 View Verified Karigar Pass
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* Order Modal */}
      {orderModal && (
        <div className="order-modal-backdrop" onClick={() => setOrderModal(false)}>
          <div className="order-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Place Made-To-Order Request</h3>
            <p className="modal-sub">
              Your order is placed directly with master weaver {artisan.display_name}.
            </p>

            {orderSuccess ? (
              <div className="order-success-state">
                <span className="success-icon">🎉</span>
                <p className="success-msg">
                  Order placed successfully! {artisan.display_name} will prepare your piece in ~{products[0].leadTimeDays} days.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePlaceOrder} className="order-form-stack">
                <div className="form-group">
                  <label className="field-label">Your Name</label>
                  <input
                    type="text"
                    required
                    className="field-input"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>

                <div className="form-group">
                  <label className="field-label">Phone / WhatsApp Number</label>
                  <input
                    type="text"
                    required
                    className="field-input"
                    value={buyerContact}
                    onChange={(e) => setBuyerContact(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>

                {/* Multilingual Voice Input Option for Buyers */}
                <div className="voice-buyer-box" style={{ marginTop: '10px', marginBottom: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowVoiceInput(!showVoiceInput)}
                    style={{
                      background: 'var(--surface-gold-soft, #FFF8EC)',
                      border: '1px solid var(--border-gold-subtle, #D4AF37)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      color: 'var(--gold-deep, #8A6320)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      width: '100%',
                      textAlign: 'left',
                    }}
                  >
                    🎙️ {showVoiceInput ? 'Hide Multilingual Voice Input' : 'Dictate Name / Contact via Multilingual Voice (BHASHINI)'}
                  </button>

                  {showVoiceInput && (
                    <div style={{ marginTop: '10px' }}>
                      <BhashiniVoiceTranscriber
                        sectionTitle="Buyer Multilingual Voice Input"
                        placeholder="Speak your name & contact details in Tamil, Hindi, Telugu, Assamese, Bengali, Malayalam, Kannada, etc..."
                        onInsertText={(text) => {
                          if (!buyerName) {
                            setBuyerName(text);
                          } else {
                            setBuyerContact(text);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>

                <button type="submit" className="confirm-order-btn">
                  Confirm Made-To-Order Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
