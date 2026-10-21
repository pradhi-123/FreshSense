"""
FreshSense AI - Historical Analytics & Telemetry Tracking Service
=================================================================
Generates and maintains historical data series across 24h, 7d, and 30d windows,
supporting clean trend visualization, status transition logging, and multi-sensor analytics.
Pure Python + standard library implementation to maximize portability and speed.
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any
import math
import random


class HistoryService:
    """Provides historical time-series telemetry and food decay tracking."""

    @classmethod
    def get_history_records(cls, timeframe: str = "24h", current_temp: float = 24.8, current_humidity: float = 78.0, current_gas: float = 195.0) -> List[Dict[str, Any]]:
        """
        Generates realistic chronological telemetry history anchored to the current live readings.
        Returns a list of dicts.
        """
        tf_clean = str(timeframe).lower().strip()
        if "7" in tf_clean or "week" in tf_clean:
            points = 28  # 4 points per day
            delta = timedelta(hours=6)
            time_format = "%a %H:%M"
        elif "30" in tf_clean or "month" in tf_clean:
            points = 30
            delta = timedelta(days=1)
            time_format = "%b %d"
        else:
            points = 24
            delta = timedelta(hours=1)
            time_format = "%H:%M"

        now = datetime.now()
        timestamps = [now - delta * (points - 1 - i) for i in range(points)]

        # Stable random seed for deterministic curves per reading
        rng = random.Random(101)

        records = []
        for i in range(points):
            t_ratio = i / max(1, points - 1)
            # Temperature curve: starts cooler and rises towards current
            t_base = (current_temp - 3.8) + t_ratio * 3.8
            t_val = round(max(2.0, min(45.0, t_base + rng.uniform(-0.4, 0.4))), 1)
            if i == points - 1:
                t_val = current_temp

            # Humidity curve
            h_base = (current_humidity - 8.0) + t_ratio * 8.0
            h_val = round(max(30.0, min(95.0, h_base + rng.uniform(-1.2, 1.2))), 1)
            if i == points - 1:
                h_val = current_humidity

            # Gas curve: baseline low then climbing to current
            g_min = max(20.0, current_gas * 0.25)
            g_base = g_min + t_ratio * (current_gas - g_min)
            g_val = round(max(15.0, min(800.0, g_base + rng.uniform(-4.0, 4.0))), 1)
            if i == points - 1:
                g_val = current_gas

            # Spoilage decay
            decay = (g_val / 450.0) * 55.0 + ((t_val - 10.0) / 25.0) * 25.0 + ((h_val - 50.0) / 45.0) * 20.0
            score = max(5.0, min(99.0, 100.0 - decay))

            ts = timestamps[i]
            records.append({
                "datetime": ts.isoformat(),
                "time_label": ts.strftime(time_format),
                "temperature_c": t_val,
                "humidity_pct": h_val,
                "gas_ppm": g_val,
                "freshness_score": round(score, 1),
            })

        return records

    @staticmethod
    def get_food_timeline(food_id: str, current_score: float) -> List[Dict[str, Any]]:
        """
        Generates a 48-hour historical decay progression for a specific food item.
        """
        points = 24
        now = datetime.now()
        timestamps = [now - timedelta(hours=2 * (points - 1 - i)) for i in range(points)]

        rng = random.Random(42 + hash(food_id) % 1000)
        records = []
        for i in range(points):
            ratio = i / max(1, points - 1)
            base_score = 96.0 - ratio * (96.0 - current_score)
            score = round(max(0.0, min(100.0, base_score + rng.uniform(-0.8, 0.8))), 1)
            if i == points - 1:
                score = current_score

            if score >= 80:
                status = "FRESH"
            elif score >= 60:
                status = "MONITOR"
            elif score >= 30:
                status = "AT RISK"
            else:
                status = "SPOILED"

            records.append({
                "time": timestamps[i].strftime("%H:%M"),
                "freshness_score": score,
                "status": status,
            })

        return records

    def get_telemetry_history(self, timeframe: str = "24h", current_temp: float = 24.8, current_humidity: float = 78.0, current_gas: float = 195.0) -> List[Dict[str, Any]]:
        """Instance alias for get_history_records."""
        return self.get_history_records(timeframe, current_temp, current_humidity, current_gas)
