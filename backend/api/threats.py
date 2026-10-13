import json
from datetime import datetime
from flask import Blueprint, request, jsonify
from models.database import SessionLocal, Threat, Alert, Device, Prediction, TrafficRecord, SecurityLog
from api.auth import token_required

threats_bp = Blueprint("threats", __name__, url_prefix="/api")

@threats_bp.route("/threats", methods=["GET"])
def get_threats():
    db = SessionLocal()
    severity = request.args.get("severity")
    threat_type = request.args.get("threat_type")
    status = request.args.get("status")
    device_id = request.args.get("device_id")
    limit = int(request.args.get("limit", 50))
    
    query = db.query(Threat)
    if severity:
        query = query.filter(Threat.severity == severity)
    if threat_type:
        query = query.filter(Threat.threat_type == threat_type)
    if status:
        query = query.filter(Threat.status == status)
    if device_id:
        query = query.filter(Threat.device_id == int(device_id))
        
    threats = query.order_by(Threat.detected_at.desc()).limit(limit).all()
    
    results = []
    for t in threats:
        dev = t.device
        pred = t.prediction
        results.append({
            "id": t.id,
            "device_id": t.device_id,
            "device_name": dev.device_name if dev else "Unknown",
            "device_ip": dev.ip_address if dev else "N/A",
            "threat_type": t.threat_type,
            "severity": t.severity,
            "description": t.description,
            "status": t.status,
            "confidence": pred.confidence if pred else 0.95,
            "detected_at": t.detected_at.isoformat() + "Z",
            "resolved_at": t.resolved_at.isoformat() + "Z" if t.resolved_at else None
        })
    db.close()
    return jsonify(results)

@threats_bp.route("/threats/<int:threat_id>", methods=["GET"])
def get_threat_detail(threat_id):
    db = SessionLocal()
    threat = db.query(Threat).filter(Threat.id == threat_id).first()
    if not threat:
        db.close()
        return jsonify({"error": "Threat record not found"}), 404
        
    dev = threat.device
    pred = threat.prediction
    traffic = pred.traffic_record if pred else None
    
    features = {}
    if traffic and traffic.features_json:
        try:
            features = json.loads(traffic.features_json)
        except Exception:
            features = {}

    # Recommended Security Actions
    actions_map = {
        "DoS": [
            "Isolate the affected IoT device from the main network VLAN.",
            "Apply rate-limiting rules on the network firewall.",
            "Inspect upstream traffic for flood patterns."
        ],
        "Port Scan": [
            "Restrict open ports on the IoT gateway firewall.",
            "Block source IP address on perimeter routers.",
            "Monitor device for follow-up exploitation attempts."
        ],
        "Brute Force": [
            "Disable password authentication; enforce SSH public key pairs.",
            "Implement Fail2ban or automated IP lockout mechanisms.",
            "Review recent authentication log events."
        ],
        "Botnet": [
            "Sever C2 connection immediately by blocking outgoing destination ports.",
            "Flash clean firmware to remove unauthorized malware payloads.",
            "Perform vulnerability scan on device subnet."
        ],
        "Suspicious": [
            "Inspect raw packet capture for protocol violations.",
            "Monitor device bandwidth usage over the next 24 hours.",
            "Audit device configuration settings."
        ]
    }
    recommended_actions = actions_map.get(threat.threat_type, ["Investigate device activity and review connection logs."])
    
    res = {
        "id": threat.id,
        "device_id": threat.device_id,
        "device_name": dev.device_name if dev else "Unknown",
        "device_type": dev.device_type if dev else "Unknown",
        "device_ip": dev.ip_address if dev else "N/A",
        "device_mac": dev.mac_address if dev else "N/A",
        "threat_type": threat.threat_type,
        "severity": threat.severity,
        "description": threat.description,
        "status": threat.status,
        "detected_at": threat.detected_at.isoformat() + "Z",
        "resolved_at": threat.resolved_at.isoformat() + "Z" if threat.resolved_at else None,
        "prediction_details": {
            "confidence": pred.confidence if pred else 0.95,
            "model_version": pred.model_version if pred else "RF-IOT-v1.0",
            "prediction_time": pred.prediction_time.isoformat() + "Z" if pred else None
        },
        "traffic_details": {
            "source_ip": traffic.source_ip if traffic else "N/A",
            "destination_ip": traffic.destination_ip if traffic else "N/A",
            "destination_port": traffic.destination_port if traffic else 0,
            "protocol": traffic.protocol if traffic else "TCP",
            "packet_count": traffic.packet_count if traffic else 0,
            "byte_count": traffic.byte_count if traffic else 0.0,
            "flow_duration": traffic.flow_duration if traffic else 0.0,
            "source_type": traffic.source_type if traffic else "SIMULATED"
        },
        "features": features,
        "recommended_actions": recommended_actions
    }
    db.close()
    return jsonify(res)

@threats_bp.route("/threats/<int:threat_id>/status", methods=["PUT"])
@token_required
def update_threat_status(threat_id):
    data = request.get_json() or {}
    new_status = data.get("status")
    if new_status not in ["Investigating", "Resolved", "Ignored"]:
        return jsonify({"error": "Invalid status value. Must be Investigating, Resolved, or Ignored"}), 400
        
    db = SessionLocal()
    threat = db.query(Threat).filter(Threat.id == threat_id).first()
    if not threat:
        db.close()
        return jsonify({"error": "Threat not found"}), 404
        
    threat.status = new_status
    if new_status == "Resolved":
        threat.resolved_at = datetime.utcnow()
        # Reset device risk level if no other unresolved critical threats exist
        dev = threat.device
        if dev:
            active_threats = db.query(Threat).filter(Threat.device_id == dev.id, Threat.status == "Investigating").count()
            if active_threats == 0:
                dev.risk_level = "SAFE"
                dev.status = "Online"
                
    db.commit()
    
    log = SecurityLog(user_id=request.current_user.id, action="THREAT_STATUS_UPDATED", description=f"Threat #{threat_id} ({threat.threat_type}) marked as {new_status}")
    db.add(log)
    db.commit()
    db.close()
    
    return jsonify({"message": f"Threat status updated to {new_status}"})

@threats_bp.route("/alerts", methods=["GET"])
def get_alerts():
    db = SessionLocal()
    unread_only = request.args.get("unread", "false").lower() == "true"
    limit = int(request.args.get("limit", 20))
    
    query = db.query(Alert)
    if unread_only:
        query = query.filter(Alert.is_read == False)
        
    alerts = query.order_by(Alert.created_at.desc()).limit(limit).all()
    res = []
    for a in alerts:
        res.append({
            "id": a.id,
            "threat_id": a.threat_id,
            "title": a.title,
            "message": a.message,
            "severity": a.severity,
            "is_read": a.is_read,
            "created_at": a.created_at.isoformat() + "Z"
        })
    db.close()
    return jsonify(res)

@threats_bp.route("/alerts/<int:alert_id>/read", methods=["PUT"])
def mark_alert_read(alert_id):
    db = SessionLocal()
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        db.close()
        return jsonify({"error": "Alert not found"}), 404
    alert.is_read = True
    db.commit()
    db.close()
    return jsonify({"message": "Alert marked as read"})
