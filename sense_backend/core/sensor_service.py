"""
FreshSense AI - Sensor Service Layer
====================================
Hardware-agnostic sensor abstraction layer. Standardized telemetry interfaces
supporting Simulation Mode (rich presets, manual overrides, and Rapid Spoilage Demo)
and extensible for future ESP32 / Arduino / Bluetooth / Wi-Fi integrations.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, Any, Optional, List


@dataclass
class SensorReading:
    temperature_c: float
    humidity_pct: float
    gas_ppm: float
    hours_elapsed: float
    timestamp: datetime
    device_id: str = "FS-KITCHEN-01"
    device_name: str = "Kitchen Container 01"
    is_simulated: bool = True
    battery_pct: float = 86.0
    signal_strength_dbm: int = -58
    status: str = "Online"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "temperature_c": self.temperature_c,
            "humidity_pct": self.humidity_pct,
            "gas_ppm": self.gas_ppm,
            "hours_elapsed": self.hours_elapsed,
            "timestamp": self.timestamp.isoformat(),
            "device_id": self.device_id,
            "device_name": self.device_name,
            "is_simulated": self.is_simulated,
            "battery_pct": self.battery_pct,
            "signal_strength_dbm": self.signal_strength_dbm,
            "status": self.status,
        }


class SensorProvider(ABC):
    """Abstract Base Class for IoT Telemetry Providers."""

    @abstractmethod
    def get_current_reading(self) -> SensorReading:
        """Returns the latest environmental and chemical telemetry."""
        pass

    @abstractmethod
    def set_reading(self, temp: float, humidity: float, gas: float, hours: float) -> None:
        """Updates sensor telemetry (for simulation control)."""
        pass


class SimulationSensorProvider(SensorProvider):
    """
    High-fidelity simulation sensor provider with scenario presets
    and step-by-step Rapid Spoilage demonstration sequences.
    """

    PRESETS = {
        "dashboard_mockup": {
            "name": "✨ Initial Demo (Active Container)",
            "description": "Standard monitoring: 24.8°C, 68% RH, 420 ppm Gas. Demonstrates Tomatoes at high risk.",
            "temp": 24.8,
            "humidity": 68.0,
            "gas": 420.0,
            "hours": 24.0,
        },
        "fresh_baseline": {
            "name": "🟢 Fresh Baseline (Optimal Cold Storage)",
            "description": "Ideal cold-chain storage with minimal volatile gas emissions (4.5°C, 65% RH, 24 ppm).",
            "temp": 4.5,
            "humidity": 65.0,
            "gas": 24.0,
            "hours": 6.0,
        },
        "normal_storage": {
            "name": "📦 Normal Storage (Pantry Conditions)",
            "description": "Typical ambient pantry storage within acceptable limits (16.5°C, 68% RH, 52 ppm).",
            "temp": 16.5,
            "humidity": 68.0,
            "gas": 52.0,
            "hours": 24.0,
        },
        "warning_elevated": {
            "name": "🟡 Warning (Elevated Heat & Moisture)",
            "description": "Temperature and humidity creep upwards, initiating microbial lag phase (24.8°C, 78% RH, 195 ppm).",
            "temp": 24.8,
            "humidity": 78.0,
            "gas": 195.0,
            "hours": 38.0,
        },
        "rapid_spoilage": {
            "name": "🔴 Rapid Decay (Active Spoilage Event)",
            "description": "High volatile gas release indicating active decomposition (28.5°C, 86% RH, 435 ppm).",
            "temp": 28.5,
            "humidity": 86.0,
            "gas": 435.0,
            "hours": 54.0,
        },
        "critical_emergency": {
            "name": "🛑 Critical Hazard (Peak Gas & Heat)",
            "description": "Severe gas emission and high heat. Immediate disposal required (34.0°C, 92% RH, 620 ppm).",
            "temp": 34.0,
            "humidity": 92.0,
            "gas": 620.0,
            "hours": 68.0,
        },
    }

    # Rapid Spoilage 4-Step Sequence for Demo
    SPOILAGE_STEPS = [
        {
            "step": 1,
            "label": "Step 1: 94% FRESH",
            "status": "FRESH",
            "temp": 6.0,
            "humidity": 65.0,
            "gas": 25.0,
            "hours": 6.0,
            "description": "Optimal cold storage. Tomatoes are crisp and fresh (~4.5 days remaining).",
        },
        {
            "step": 2,
            "label": "Step 2: 76% MONITOR",
            "status": "MONITOR",
            "temp": 20.0,
            "humidity": 72.0,
            "gas": 120.0,
            "hours": 24.0,
            "description": "Ambient heat begins to rise. Volatiles elevate (~24 hours remaining).",
        },
        {
            "step": 3,
            "label": "Step 3: 48% AT RISK",
            "status": "AT RISK",
            "temp": 26.5,
            "humidity": 82.0,
            "gas": 420.0,
            "hours": 48.0,
            "description": "Accelerated spoilage event. Tomatoes may spoil soon (~8 hours remaining).",
        },
        {
            "step": 4,
            "label": "Step 4: 24% CRITICAL",
            "status": "CRITICAL",
            "temp": 33.0,
            "humidity": 90.0,
            "gas": 680.0,
            "hours": 72.0,
            "description": "Critical bacterial saturation. Immediate disposal required (~2 hours remaining).",
        },
    ]

    def __init__(self, initial_preset: str = "dashboard_mockup"):
        self.preset_key = initial_preset
        preset = self.PRESETS.get(initial_preset, self.PRESETS["dashboard_mockup"])
        self._temp = preset["temp"]
        self._humidity = preset["humidity"]
        self._gas = preset["gas"]
        self._hours = preset["hours"]
        self._device_id = "FS-KITCHEN-01"
        self._device_name = "Kitchen Container 01"
        self._battery_pct = 86.0
        self._spoilage_step_idx = 0
        self._last_updated = datetime.now()

    def apply_preset(self, preset_key: str) -> None:
        if preset_key in self.PRESETS:
            self.preset_key = preset_key
            data = self.PRESETS[preset_key]
            self._temp = data["temp"]
            self._humidity = data["humidity"]
            self._gas = data["gas"]
            self._hours = data["hours"]
            self._last_updated = datetime.now()

    def apply_spoilage_step(self, step_idx: int) -> Dict[str, Any]:
        """Applies a specific step from the Rapid Spoilage 4-step sequence (0 to 3)."""
        idx = max(0, min(len(self.SPOILAGE_STEPS) - 1, step_idx))
        self._spoilage_step_idx = idx
        step_data = self.SPOILAGE_STEPS[idx]
        self._temp = step_data["temp"]
        self._humidity = step_data["humidity"]
        self._gas = step_data["gas"]
        self._hours = step_data["hours"]
        self.preset_key = f"spoilage_step_{idx+1}"
        self._last_updated = datetime.now()
        return step_data

    def set_reading(self, temp: float, humidity: float, gas: float, hours: float) -> None:
        self._temp = float(temp)
        self._humidity = float(humidity)
        self._gas = float(gas)
        self._hours = float(hours)
        self._last_updated = datetime.now()

    def get_current_reading(self) -> SensorReading:
        return SensorReading(
            temperature_c=round(self._temp, 1),
            humidity_pct=round(self._humidity, 1),
            gas_ppm=round(self._gas, 1),
            hours_elapsed=round(self._hours, 1),
            timestamp=datetime.now(),
            device_id=self._device_id,
            device_name=self._device_name,
            is_simulated=True,
            battery_pct=self._battery_pct,
            status="Online",
        )


class ESP32SensorProvider(SensorProvider):
    """Real hardware IoT telemetry provider (for future physical ESP32 / BLE deployment)."""

    def __init__(self, endpoint_url: str = "http://192.168.1.100/sensors"):
        self.endpoint_url = endpoint_url

    def get_current_reading(self) -> SensorReading:
        raise NotImplementedError("Physical ESP32 hardware connection is currently in development. Please use SimulationSensorProvider.")

    def set_reading(self, temp: float, humidity: float, gas: float, hours: float) -> None:
        pass

