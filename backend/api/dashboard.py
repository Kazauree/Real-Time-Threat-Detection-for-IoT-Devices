from datetime import datetime, timedelta
from flask import Blueprint, jsonify
from sqlalchemy import func
from models.database import SessionLocal, Device, TrafficRecord, Prediction, Threat, Alert, ModelVersion

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")

@dashboard_bp.route("/statistics", methods=["GET"])
def get_statistics():
    db = SessionLocal()
    
    total_devices = db.query(Device).count()
    active_devices = db.query(Device).filter(Device.status == "Online").count()
    warning_devices = db.query(Device).filter(Device.status == "Warning").count()
    
    total_traffic = db.query(TrafficRecord).count()
    total_threats = db.query(Threat).count()
    investigating_threats = db.query(Threat).filter(Threat.status == "Investigating").count()
    resolved_threats = db.query(Threat).filter(Threat.status == "Resolved").count()
    critical_alerts = db.query(Alert).filter(Alert.severity.in_(["HIGH", "CRITICAL"]), Alert.is_read == False).count()
    
    # Normal vs Malicious traffic ratio
    normal_traffic = db.query(Prediction).filter(Prediction.prediction == "Normal").count()
    malicious_traffic = total_traffic - normal_traffic
    normal_pct = round((normal_traffic / total_traffic * 100), 1) if total_traffic > 0 else 100.0
    
    # Latest trained model accuracy
    model_ver = db.query(ModelVersion).order_by(ModelVersion.trained_at.desc()).first()
    model_accuracy = round(model_ver.accuracy * 100, 1) if model_ver else 98.5
    
    db.close()
    
    return jsonify({
        "total_devices": total_devices,
        "active_devices": active_devices,
        "warning_devices": warning_devices,
        "total_traffic": total_traffic,
        "total_threats": total_threats,
        "investigating_threats": investigating_threats,
        "resolved_threats": resolved_threats,
        "critical_alerts": critical_alerts,
        "normal_percentage": normal_pct,
        "malicious_percentage": round(100 - normal_pct, 1),
        "model_accuracy": model_accuracy
    })

@dashboard_bp.route("/attack-distribution", methods=["GET"])
def get_attack_distribution():
    db = SessionLocal()
    counts = db.query(Prediction.prediction, func.count(Prediction.id)).group_by(Prediction.prediction).all()
    db.close()
    
    res = []
    colors = {
        "Normal": "#10B981",       # Emerald
        "Suspicious": "#F59E0B",   # Amber
        "Port Scan": "#3B82F6",    # Blue
        "Brute Force": "#F97316",  # Orange
        "DoS": "#EF4444",          # Red
        "Botnet": "#8B5CF6"        # Purple
    }
    
    for category, count in counts:
        res.append({
            "name": category,
            "value": count,
            "color": colors.get(category, "#6B7280")
        })
        
    return jsonify(res)

@dashboard_bp.route("/threat-trends", methods=["GET"])
def get_threat_trends():
    db = SessionLocal()
    # Fetch last 50 threats to build chronological timeline trend
    recent_threats = db.query(Threat).order_by(Threat.detected_at.asc()).limit(60).all()
    
    # Group threats into 6 timestamp buckets for clean dynamic charts
    buckets = {}
    for t in recent_threats:
        # Time bucket key HH:MM
        t_key = t.detected_at.strftime("%H:%M")
        if t_key not in buckets:
            buckets[t_key] = {"time": t_key, "Normal": 0, "DoS": 0, "Port Scan": 0, "Brute Force": 0, "Botnet": 0, "Suspicious": 0}
        if t.threat_type in buckets[t_key]:
            buckets[t_key][t.threat_type] += 1
            
    res = list(buckets.values())
    if not res:
        # Fallback default empty trend format
        res = [{"time": datetime.now().strftime("%H:%M"), "DoS": 0, "Port Scan": 0, "Brute Force": 0, "Botnet": 0, "Suspicious": 0}]
        
    db.close()
    return jsonify(res)

@dashboard_bp.route("/device-risk", methods=["GET"])
def get_device_risk():
    db = SessionLocal()
    devices = db.query(Device).order_by(Device.risk_level.desc(), Device.last_seen.desc()).limit(10).all()
    
    res = []
    for d in devices:
        threat_count = db.query(Threat).filter(Threat.device_id == d.id).count()
        res.append({
            "id": d.id,
            "device_name": d.device_name,
            "device_type": d.device_type,
            "ip_address": d.ip_address,
            "risk_level": d.risk_level,
            "status": d.status,
            "threat_count": threat_count
        })
    db.close()
    return jsonify(res)
