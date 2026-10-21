"""
FreshSense AI - Notification & Alert Management Service
=======================================================
Tracks, triggers, and persists notifications across risk tiers (Critical, Warning, Info).
Includes intelligent de-duplication, state transition triggers (Fresh -> Monitor -> At Risk -> Critical),
and food-specific navigation callbacks.
"""

from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import uuid


@dataclass
class FreshnessNotification:
    id: str
    timestamp: datetime
    food_id: str
    food_name: str
    food_icon: str
    severity: str  # "CRITICAL", "WARNING", "INFO"
    title: str
    message: str
    recommended_action: str
    is_read: bool = False
    category: str = "Warning"  # "Critical", "Warning", "Information"

    @property
    def severity_badge(self) -> str:
        if self.severity == "CRITICAL":
            return "🔴 HIGH RISK"
        elif self.severity == "WARNING":
            return "🟡 WARNING"
        else:
            return "🟢 INFO"

    @property
    def formatted_time(self) -> str:
        now = datetime.now()
        diff = now - self.timestamp
        if diff.total_seconds() < 60:
            return "Just now"
        elif diff.total_seconds() < 3600:
            return f"{int(diff.total_seconds() // 60)}m ago"
        elif diff.total_seconds() < 86400:
            return f"{int(diff.total_seconds() // 3600)}h ago"
        else:
            return self.timestamp.strftime("%b %d, %H:%M")


class NotificationManager:
    """Manages alert queue, cooldowns, and status transition triggers."""

    def __init__(self, cooldown_seconds: int = 30):
        self.notifications: List[FreshnessNotification] = []
        self.cooldown_seconds = cooldown_seconds
        self._last_emitted: Dict[str, datetime] = {}
        self._last_known_status: Dict[str, str] = {}
        self._seed_default_notifications()

    def _seed_default_notifications(self):
        """Seeds initial realistic notifications matching prompt specifications."""
        now = datetime.now()
        self.notifications = [
            FreshnessNotification(
                id=str(uuid.uuid4()),
                timestamp=now - timedelta(minutes=12),
                food_id="tomato",
                food_name="Tomatoes",
                food_icon="🍅",
                severity="CRITICAL",
                category="Critical",
                title="Tomatoes may spoil soon.",
                message="Estimated remaining: ~8 hours. Elevated gas (420 ppm) and ambient temperature detected.",
                recommended_action="Consider consuming the tomatoes soon or moving them to a cooler environment.",
                is_read=False,
            ),
            FreshnessNotification(
                id=str(uuid.uuid4()),
                timestamp=now - timedelta(minutes=45),
                food_id="bell_pepper",
                food_name="Bell Pepper",
                food_icon="🫑",
                severity="WARNING",
                category="Warning",
                title="Bell peppers are entering the monitoring zone.",
                message="Estimated remaining: ~1.4 days. Volatile exposure slightly increasing.",
                recommended_action="Monitor storage conditions closely.",
                is_read=False,
            ),
            FreshnessNotification(
                id=str(uuid.uuid4()),
                timestamp=now - timedelta(hours=2, minutes=10),
                food_id="lemon",
                food_name="Lemon",
                food_icon="🍋",
                severity="INFO",
                category="Information",
                title="Storage conditions optimal.",
                message="Lemon rind protection active. Peak freshness preserved (~3.2 days remaining).",
                recommended_action="No action required.",
                is_read=True,
            ),
        ]
        self._last_known_status["tomato"] = "AT RISK"
        self._last_known_status["bell_pepper"] = "MONITOR"
        self._last_known_status["lemon"] = "FRESH"

    def process_results(self, freshness_results: list) -> List[FreshnessNotification]:
        """
        Evaluates food analysis results and triggers alerts when status transitions occur:
        FRESH -> MONITOR (Warning)
        MONITOR -> AT RISK (High Risk / Critical)
        AT RISK -> CRITICAL (Critical Hazard)
        """
        now = datetime.now()
        new_alerts = []

        for item in freshness_results:
            food_id = item.food_id
            current_status = item.status
            prev_status = self._last_known_status.get(food_id, "FRESH")

            # Check if status transitioned to a worse state
            status_changed = (current_status != prev_status)
            last_time = self._last_emitted.get(food_id)
            cooldown_active = last_time and (now - last_time).total_seconds() < self.cooldown_seconds

            if status_changed and not cooldown_active:
                notification = None

                if current_status == "CRITICAL":
                    notification = FreshnessNotification(
                        id=str(uuid.uuid4()),
                        timestamp=now,
                        food_id=food_id,
                        food_name=item.food_name,
                        food_icon=item.icon,
                        severity="CRITICAL",
                        category="Critical",
                        title=f"{item.food_name} at critical spoilage threshold.",
                        message=f"Freshness dropped to {item.freshness_score:.0f}%. Severe gas emission detected.",
                        recommended_action="Inspect immediately and discard safely to prevent cross-spoilage.",
                        is_read=False,
                    )
                elif current_status == "AT RISK" and prev_status in ["FRESH", "MONITOR"]:
                    notification = FreshnessNotification(
                        id=str(uuid.uuid4()),
                        timestamp=now,
                        food_id=food_id,
                        food_name=item.food_name,
                        food_icon=item.icon,
                        severity="CRITICAL",
                        category="Critical",
                        title=f"{item.food_name} may spoil soon.",
                        message=f"Estimated remaining: {item.estimated_remaining_str}. Spoilage indicators increasing.",
                        recommended_action=item.recommended_action,
                        is_read=False,
                    )
                elif current_status == "MONITOR" and prev_status == "FRESH":
                    notification = FreshnessNotification(
                        id=str(uuid.uuid4()),
                        timestamp=now,
                        food_id=food_id,
                        food_name=item.food_name,
                        food_icon=item.icon,
                        severity="WARNING",
                        category="Warning",
                        title=f"{item.food_name} entering the monitoring zone.",
                        message=f"Freshness index at {item.freshness_score:.0f}%. Storage conditions approaching boundary.",
                        recommended_action=item.recommended_action,
                        is_read=False,
                    )
                elif current_status == "FRESH" and prev_status in ["MONITOR", "AT RISK"]:
                    notification = FreshnessNotification(
                        id=str(uuid.uuid4()),
                        timestamp=now,
                        food_id=food_id,
                        food_name=item.food_name,
                        food_icon=item.icon,
                        severity="INFO",
                        category="Information",
                        title=f"Storage conditions improved for {item.food_name}.",
                        message=f"Freshness stabilized at {item.freshness_score:.0f}%. Conditions returned to optimal.",
                        recommended_action="Preservation conditions optimal.",
                        is_read=False,
                    )

                if notification:
                    self.notifications.insert(0, notification)
                    new_alerts.append(notification)
                    self._last_emitted[food_id] = now

            self._last_known_status[food_id] = current_status

        return new_alerts

    def get_all(self) -> List[FreshnessNotification]:
        return self.notifications

    def get_unread(self) -> List[FreshnessNotification]:
        return [n for n in self.notifications if not n.is_read]

    def get_unread_count(self) -> int:
        return sum(1 for n in self.notifications if not n.is_read)

    def get_filtered(self, category: str) -> List[FreshnessNotification]:
        if category in ["ALL", "All"]:
            return self.notifications
        cat_lower = category.lower()
        if "crit" in cat_lower:
            return [n for n in self.notifications if n.severity == "CRITICAL"]
        elif "warn" in cat_lower:
            return [n for n in self.notifications if n.severity == "WARNING"]
        elif "info" in cat_lower:
            return [n for n in self.notifications if n.severity == "INFO"]
        return self.notifications

    def mark_as_read(self, notif_id: str):
        for n in self.notifications:
            if n.id == notif_id:
                n.is_read = True

    def mark_all_as_read(self):
        for n in self.notifications:
            n.is_read = True

    def clear_all(self):
        self.notifications.clear()
