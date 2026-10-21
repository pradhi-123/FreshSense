"""
FreshSense AI - Food Profiles Registry
======================================
Defines domain-specific biological and environmental tolerances for diverse food types.
Each profile specifies optimal temperature/humidity windows, gas/VOC sensitivities,
decay kinetics, food-specific risk thresholds, and preservation advice.
"""

from dataclasses import dataclass, field
from typing import Dict, Tuple, List, Optional


@dataclass
class FoodProfile:
    id: str
    name: str
    icon: str
    category: str  # Fruit, Vegetable, Greens, Dairy
    optimal_temp_c: Tuple[float, float]  # (min, max)
    optimal_humidity_pct: Tuple[float, float]  # (min, max)
    gas_sensitivity: float  # Multiplier for VOC / spoilage gases impact
    baseline_shelf_life_hours: float  # Peak freshness duration in optimal conditions
    decay_acceleration: float  # Exponent factor for environmental stress
    storage_tips: str
    ideal_storage_location: str
    initial_hours_offset: float = 0.0  # Simulated current elapsed time
    # Food-specific status thresholds: (fresh_min, monitor_min, at_risk_min)
    # E.g. (85, 75, 40) -> score >= 85 FRESH, >= 75 MONITOR, >= 40 AT RISK, < 40 CRITICAL
    status_thresholds: Tuple[float, float, float] = (80.0, 60.0, 30.0)


# System-wide Freshness Threshold Configuration
DEFAULT_THRESHOLDS = {
    "FRESH": (80.0, 100.0),
    "MONITOR": (60.0, 79.9),
    "AT_RISK": (30.0, 59.9),
    "CRITICAL": (0.0, 29.9),
    "SPOILED": (0.0, 29.9),
}

# System-wide Status Colors & Badges
STATUS_COLORS = {
    "FRESH": "#10b981",       # Emerald Green
    "MONITOR": "#f59e0b",     # Amber Yellow
    "AT RISK": "#ef4444",     # Crimson Red / High Risk
    "CRITICAL": "#dc2626",    # Vivid Critical Red
    "SPOILED": "#991b1b",     # Dark Danger
}

STATUS_BG_COLORS = {
    "FRESH": "rgba(16, 185, 129, 0.12)",
    "MONITOR": "rgba(245, 158, 11, 0.15)",
    "AT RISK": "rgba(239, 68, 68, 0.15)",
    "CRITICAL": "rgba(220, 38, 38, 0.22)",
    "SPOILED": "rgba(153, 27, 27, 0.25)",
}


# Complete Biological Profiles Database for all Demo Foods
FOOD_REGISTRY: Dict[str, FoodProfile] = {
    "tomato": FoodProfile(
        id="tomato",
        name="Tomatoes",
        icon="🍅",
        category="Vegetable",
        optimal_temp_c=(12.0, 18.0),
        optimal_humidity_pct=(65.0, 80.0),
        gas_sensitivity=1.25,
        baseline_shelf_life_hours=144.0,  # ~6 days
        decay_acceleration=1.35,
        storage_tips="Store stem-side down at cool room temperature. Avoid cold refrigeration which impairs aroma enzymes.",
        ideal_storage_location="Pantry / Ventilated Countertop (12–18°C)",
        initial_hours_offset=24.0,
        status_thresholds=(85.0, 75.0, 40.0),  # 72% triggers AT RISK for Tomatoes
    ),
    "lemon": FoodProfile(
        id="lemon",
        name="Lemon",
        icon="🍋",
        category="Fruit",
        optimal_temp_c=(4.0, 14.0),
        optimal_humidity_pct=(60.0, 85.0),
        gas_sensitivity=0.25,  # High citrus peel essential oil barrier
        baseline_shelf_life_hours=360.0,  # ~15 days
        decay_acceleration=0.6,
        storage_tips="Store in a sealed crisper drawer or container to retain essential rind moisture.",
        ideal_storage_location="Refrigerator Crisper Drawer",
        initial_hours_offset=8.0,
        status_thresholds=(80.0, 60.0, 30.0),
    ),
    "bell_pepper": FoodProfile(
        id="bell_pepper",
        name="Bell Pepper",
        icon="🫑",
        category="Vegetable",
        optimal_temp_c=(7.0, 14.0),
        optimal_humidity_pct=(65.0, 85.0),
        gas_sensitivity=0.65,
        baseline_shelf_life_hours=192.0,  # ~8 days
        decay_acceleration=1.1,
        storage_tips="Keep dry in an airtight container. Moisture accumulation on the calyx causes rot.",
        ideal_storage_location="Refrigerator High-Humidity Zone",
        initial_hours_offset=20.0,
        status_thresholds=(85.0, 70.0, 40.0),  # 81% triggers MONITOR for Bell Pepper
    ),
    "apple": FoodProfile(
        id="apple",
        name="Apple",
        icon="🍎",
        category="Fruit",
        optimal_temp_c=(1.0, 4.0),
        optimal_humidity_pct=(80.0, 90.0),
        gas_sensitivity=0.75,
        baseline_shelf_life_hours=504.0,  # ~21 days
        decay_acceleration=0.7,
        storage_tips="Apples emit ethylene gas. Store separated in the chilled fruit bin.",
        ideal_storage_location="Chilled Fruit Zone (1–4°C)",
        initial_hours_offset=36.0,
        status_thresholds=(80.0, 60.0, 30.0),
    ),
    "banana": FoodProfile(
        id="banana",
        name="Banana",
        icon="🍌",
        category="Fruit",
        optimal_temp_c=(13.0, 16.0),
        optimal_humidity_pct=(60.0, 75.0),
        gas_sensitivity=1.45,
        baseline_shelf_life_hours=120.0,  # ~5 days
        decay_acceleration=1.65,
        storage_tips="Wrap crowns with foil to reduce natural ethylene release. Keep away from direct sunlight.",
        ideal_storage_location="Ambient Countertop (Ventilated)",
        initial_hours_offset=28.0,
        status_thresholds=(80.0, 60.0, 35.0),
    ),
    "leafy_greens": FoodProfile(
        id="leafy_greens",
        name="Leafy Greens",
        icon="🥬",
        category="Greens",
        optimal_temp_c=(1.0, 4.0),
        optimal_humidity_pct=(85.0, 95.0),
        gas_sensitivity=1.70,
        baseline_shelf_life_hours=96.0,  # ~4 days
        decay_acceleration=1.9,
        storage_tips="Wash immediately before consumption. Line container with breathable moisture-absorbing sheets.",
        ideal_storage_location="Cold Chain Crisper (1–4°C)",
        initial_hours_offset=22.0,
        status_thresholds=(80.0, 60.0, 35.0),
    ),
}

# Alias for backwards compatibility
FOOD_REGISTRY["pepper"] = FOOD_REGISTRY["bell_pepper"]


def get_all_food_profiles() -> List[FoodProfile]:
    primary_keys = ["tomato", "lemon", "bell_pepper", "apple", "banana", "leafy_greens"]
    return [FOOD_REGISTRY[k] for k in primary_keys if k in FOOD_REGISTRY]


def get_food_profile(food_id: str) -> FoodProfile:
    return FOOD_REGISTRY.get(food_id, FOOD_REGISTRY["tomato"])
