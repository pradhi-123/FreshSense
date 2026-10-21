"""
FreshSense AI - Core Package
"""
from .food_profiles import FoodProfile, FOOD_REGISTRY, DEFAULT_THRESHOLDS, get_all_food_profiles, get_food_profile
from .sensor_service import SensorReading, SensorProvider, SimulationSensorProvider, ESP32SensorProvider
from .freshness_engine import FreshnessPredictionService, FoodFreshnessResult
from .notification_service import NotificationManager, FreshnessNotification
from .history_service import HistoryService
