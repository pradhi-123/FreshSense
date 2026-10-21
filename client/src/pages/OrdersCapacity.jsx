import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BhashiniLanguageSwitcher from '../components/common/BhashiniLanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';
import './OrdersCapacity.css';

export default function OrdersCapacity() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [orders, setOrders] = useState(() => {
    const defaultOrders = [
      {
        id: 'ord-101',
        buyer_name: 'Ananya Sharma',
        buyer_contact: '+91 98765 43210',
        product_title: 'Authentic Handwoven Muga Silk Mekhela Chador',
        price: 14500,
        status: 'in_progress',
        estimated_delivery: '2026-10-18',
        created_at: '2026-09-22',
      },
    ];
    try {
      const savedOrders = JSON.parse(localStorage.getItem('virasat_orders') || '[]');
      if (savedOrders.length > 0) {
        return [...savedOrders, ...defaultOrders];
      }
    } catch (e) {
      console.warn('Error loading orders:', e);
    }
    return defaultOrders;
  });

  // Calculate dynamic capacity using Section 8.7 Made-To-Order Blueprint Formula:
  // Monthly Capacity = 3 pieces; Lead Time = (active_orders + 1) * days_per_piece + 3
  const activeCount = orders.filter((o) => o.status === 'in_progress' || o.status === 'requested').length;
  const monthlyCapacity = 3;
  const openSlots = Math.max(0, monthlyCapacity - activeCount);
  const leadTimeDays = (activeCount + 1) * 12 + 3;

  const capacity = {
    monthlyCapacity,
    activeOrdersCount: activeCount,
    openSlots,
    leadTimeDays,
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    setOrders(updated);
    try {
      const customOnly = updated.filter((o) => !o.id.startsWith('ord-101'));
      localStorage.setItem('virasat_orders', JSON.stringify(customOnly));
    } catch (e) {
      console.warn('Error saving order status update:', e);
    }
  };

  return (
    <div className="orders-capacity-page">
      {/* Top Header */}
      <header className="orders-header">
        {/* Left side: Back button & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button type="button" className="orders-back-btn" onClick={() => navigate('/artisan')}>
            ← {t('back') || 'Back'}
          </button>
          <div className="orders-title-box">
            <span className="orders-eyebrow">MADE-TO-ORDER LOGIC (S9)</span>
            <h1 className="orders-heading">Orders & Production Capacity</h1>
          </div>
        </div>

        {/* Right side: Bhashini Language Switcher Globe */}
        <BhashiniLanguageSwitcher />
      </header>

      <main className="orders-stage">
        {/* Capacity Summary Dashboard Card */}
        <section className="capacity-dashboard-card">
          <div className="dashboard-header">
            <span className="dash-title">🛠️ Monthly Handloom Capacity</span>
            <span className="dash-badge">{capacity.openSlots} Open Slot Available</span>
          </div>

          <div className="capacity-stats-grid">
            <div className="stat-box">
              <span className="stat-label">Monthly Limit</span>
              <span className="stat-val">{capacity.monthlyCapacity} <small>pieces</small></span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Active Woven Orders</span>
              <span className="stat-val">{capacity.activeOrdersCount} <small>in loom</small></span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Current Lead Time</span>
              <span className="stat-val badge-gold">~{capacity.leadTimeDays} <small>days</small></span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="capacity-bar-wrap">
            <div className="bar-label-row">
              <span>Slot Utilization</span>
              <span>{capacity.activeOrdersCount} / {capacity.monthlyCapacity} Used</span>
            </div>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{
                  width: `${(capacity.activeOrdersCount / capacity.monthlyCapacity) * 100}%`,
                }}
              />
            </div>
          </div>
        </section>

        {/* Incoming Orders Stack */}
        <section className="orders-list-section">
          <h2 className="orders-section-title">Incoming Made-To-Order Requests</h2>

          <div className="orders-stack">
            {orders.map((ord) => (
              <div key={ord.id} className={`order-card status-${ord.status}`}>
                <div className="order-card-header">
                  <span className="order-id">#{ord.id}</span>
                  <span className={`status-pill pill-${ord.status}`}>
                    {ord.status === 'in_progress' ? '🔨 In Production' : ord.status}
                  </span>
                </div>

                <div className="order-details">
                  <h3 className="order-product-name">{ord.product_title}</h3>
                  <p className="order-buyer-info">
                    Buyer: <strong>{ord.buyer_name}</strong> ({ord.buyer_contact})
                  </p>

                  <div className="order-meta-row">
                    <span className="order-price">₹{ord.price.toLocaleString('en-IN')}</span>
                    <span className="order-eta">Est. Delivery: {ord.estimated_delivery}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="order-actions-row">
                  {ord.status === 'requested' && (
                    <>
                      <button
                        type="button"
                        className="btn-accept"
                        onClick={() => handleUpdateStatus(ord.id, 'accepted')}
                      >
                        ✓ Accept Order
                      </button>
                      <button
                        type="button"
                        className="btn-decline"
                        onClick={() => handleUpdateStatus(ord.id, 'declined')}
                      >
                        ✕ Decline
                      </button>
                    </>
                  )}

                  {ord.status === 'in_progress' && (
                    <button
                      type="button"
                      className="btn-ship"
                      onClick={() => handleUpdateStatus(ord.id, 'shipped')}
                    >
                      📦 Mark Shipped & Dispatch
                    </button>
                  )}

                  {ord.status === 'shipped' && (
                    <span className="shipped-note">✓ Order Dispatched & Tracked on ONDC</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
