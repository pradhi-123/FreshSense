import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Cpu, 
  Sliders, 
  CheckCircle2, 
  RefreshCw,
  Activity,
  Thermometer,
  Droplets,
  Wind,
  Palette
} from 'lucide-react';
import { fetchCurrentSensors, applySimulationPresetApi, pushEsp32Telemetry } from './api';

export default function SensorStatusBar({ onTelemetryUpdate }) {
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simPreset, setSimPreset] = useState('dashboard_mockup');
  const [pushingMockHardware, setPushingMockHardware] = useState(false);

  const loadTelemetry = async () => {
    try {
      const data = await fetchCurrentSensors();
      setTelemetry(data);
      if (onTelemetryUpdate) onTelemetryUpdate(data);
    } catch (err) {
      console.warn('Telemetry fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTelemetry();
    const interval = setInterval(loadTelemetry, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleApplyPreset = async (presetKey) => {
    setSimPreset(presetKey);
    try {
      await applySimulationPresetApi(presetKey);
      await loadTelemetry();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulateESP32Connection = async () => {
    setPushingMockHardware(true);
    try {
      await pushEsp32Telemetry({
        temp: 23.4,
        hum: 64.0,
        gas: 135.0,
        raw_gas: 480,
        rssi: -54,
      });
      await loadTelemetry();
    } catch (e) {
      console.error(e);
    } finally {
      setPushingMockHardware(false);
    }
  };

  const isHw = telemetry?.is_hardware;
  const temp = telemetry ? telemetry.temperature_c : 24.8;
  const hum = telemetry ? telemetry.humidity_pct : 68.0;
  const gas = telemetry ? telemetry.gas_ppm : 420.0;

  return (
    <div style={{
      background: 'var(--color-milky-white)',
      border: '1.5px solid var(--color-light-border)',
      borderRadius: 'var(--sense-radius-full)',
      padding: '12px 22px',
      marginBottom: '26px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '14px',
      boxShadow: 'var(--sense-shadow-sm)'
    }}>
      {/* Hardware Connection Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className={`sense-badge ${isHw ? 'sense-badge-hardware-on' : 'sense-badge-hardware-off'}`}>
          {isHw ? (
            <>
              <span className="sense-dot-live"></span>
              <Wifi size={13} color="var(--color-leaf-green)" />
              <span>{telemetry?.device_name || 'Hardware Node Connected'}</span>
            </>
          ) : (
            <>
              <WifiOff size={13} />
              <span>Hardware Standby (Simulation Mode)</span>
            </>
          )}
        </div>

        <span style={{ fontSize: '0.82rem', color: 'var(--color-muted-grey)' }}>
          Chamber: <strong style={{ color: 'var(--color-soft-charcoal)' }}>{telemetry?.device_name || 'Kitchen Container 01'}</strong>
        </span>
      </div>

      {/* Live Sensor Metrics Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem' }}>
          <Thermometer size={15} color={temp > 22 ? '#dc2626' : 'var(--color-leaf-green)'} />
          <span style={{ color: 'var(--color-muted-grey)' }}>Temp:</span>
          <strong style={{ color: temp > 22 ? '#dc2626' : 'var(--color-leaf-green)', fontFamily: 'var(--sense-font-mono)' }}>
            {temp.toFixed(1)}°C
          </strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem' }}>
          <Droplets size={15} color="#2563eb" />
          <span style={{ color: 'var(--color-muted-grey)' }}>Humidity:</span>
          <strong style={{ color: '#2563eb', fontFamily: 'var(--sense-font-mono)' }}>
            {hum.toFixed(0)}%
          </strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem' }}>
          <Wind size={15} color={gas > 180 ? '#dc2626' : 'var(--color-leaf-green)'} />
          <span style={{ color: 'var(--color-muted-grey)' }}>Gas / VOC:</span>
          <strong style={{ color: gas > 180 ? '#dc2626' : 'var(--color-leaf-green)', fontFamily: 'var(--sense-font-mono)' }}>
            {gas.toFixed(0)} ppm
          </strong>
        </div>

        {/* Live Color Sensor Metric Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem' }}>
          <span style={{
            display: 'inline-block',
            width: '13px',
            height: '13px',
            borderRadius: '50%',
            background: telemetry?.color_hex || '#4CAF50',
            boxShadow: `0 0 6px ${telemetry?.color_hex || '#4CAF50'}`,
            border: '1.5px solid rgba(255,255,255,0.8)'
          }} title={`Color Spectral: ${telemetry?.color_name || 'Chlorophyll'} (${telemetry?.color_hex || '#4CAF50'})`}></span>
          <span style={{ color: 'var(--color-muted-grey)' }}>Color:</span>
          <strong style={{ color: 'var(--color-soft-charcoal)', fontSize: '0.82rem' }}>
            {telemetry?.color_name ? telemetry.color_name.split(' ')[0] : 'Emerald'}
          </strong>
        </div>

        {/* Live Environmental Status Pill */}
        <div style={{
          background: gas < 200 ? 'var(--color-fresh-mint)' : 'rgba(239, 68, 68, 0.1)',
          color: gas < 200 ? 'var(--color-leaf-green)' : '#dc2626',
          border: `1px solid ${gas < 200 ? 'var(--color-soft-green)' : 'rgba(239, 68, 68, 0.3)'}`,
          borderRadius: 'var(--sense-radius-full)',
          padding: '4px 12px',
          fontSize: '0.78rem',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <Activity size={13} />
          <span>{gas < 200 ? 'Optimal Air Quality' : 'Elevated VOC Level'}</span>
        </div>

        {/* Live Refresh Button */}
        <button
          onClick={loadTelemetry}
          title="Refresh live environmental readings"
          style={{
            background: 'var(--color-vanilla-cream)',
            border: '1.5px solid var(--color-light-border)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--color-muted-grey)',
            transition: 'all 0.2s ease',
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
    </div>
  );
}
