import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrdersDrawer.css';

export default function OrdersDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [paceMode, setPaceMode] = useState(true);

  const [orders, setOrders] = useState([
    {
      id: 'ORD-9021',
      buyer: 'Sunita Sharma (Patron)',
      item: 'Kanjivaram Zari Weave Silk Saree',
      channel: 'ONDC Network',
      amount: '₹ 4,800',
      status: 'Hand Weaving in Progress',
      daysLeft: '3 Days',
    },
    {
      id: 'ORD-8812',
      buyer: 'Ministry of Tribal Affairs',
      item: '10 Handcrafted Silk Stoles',
      channel: 'GeM Wholesale',
      amount: '₹ 38,000',
      status: 'Yarn Natural Dyeing',
      daysLeft: '7 Days',
    },
    {
      id: 'ORD-7504',
      buyer: 'Anand Varma (Direct Buyer)',
      item: 'Terracotta Bankura Horse Pair',
      channel: 'Karigar Micro-Store',
      amount: '₹ 2,500',
      status: 'Kiln Fired & Ready',
      daysLeft: 'Ready to Dispatch',
    },
  ]);

  if (!isOpen) return null;

  return (
    <div className="orders-drawer-overlay" onClick={onClose}>
      <div className="orders-drawer-card" onClick={(e) => e.stopPropagation()}>
        <header className="orders-drawer-header">
          <div className="drawer-title-row">
            <span className="drawer-badge">📦 LIVE ORDERS & SALES</span>
            <h3>Artisan Production Dashboard</h3>
          </div>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Close orders drawer">×</button>
        </header>

        {/* Made-to-Order Pace Production Banner */}
        <section className="pace-banner-card">
          <div className="pace-text-box">
            <h4>🌿 Traditional Crafting Pace Protection</h4>
            <p>
              Notify buyers automatically that items are handcrafted at authentic artisan speed (zero factory rush).
            </p>
          </div>
          <label className="pace-switch">
            <input
              type="checkbox"
              checked={paceMode}
              onChange={() => setPaceMode(!paceMode)}
            />
            <span className="pace-slider" />
          </label>
        </section>

        {/* Orders List */}
        <div className="orders-list">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="order-item-card"
              onClick={() => {
                onClose();
                navigate('/orders');
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="order-item-header">
                <span className="order-id-code">{ord.id}</span>
                <span className="order-channel-tag">{ord.channel}</span>
              </div>
              <h4 className="order-item-name">{ord.item}</h4>
              <p className="order-buyer-name">👤 {ord.buyer}</p>
              
              <div className="order-item-footer">
                <div className="order-price-val">{ord.amount}</div>
                <div className="order-status-pill">{ord.status} ({ord.daysLeft})</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
