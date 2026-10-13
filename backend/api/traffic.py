from flask import Blueprint, request, jsonify
from models.database import SessionLocal, TrafficRecord, Prediction, Device

traffic_bp = Blueprint("traffic", __name__, url_prefix="/api/traffic")

@traffic_bp.route("", methods=["GET"])
def get_traffic():
    db = SessionLocal()
    limit = int(request.args.get("limit", 50))
    device_id = request.args.get("device_id")
    protocol = request.args.get("protocol")
    prediction_filter = request.args.get("prediction")
    source_type = request.args.get("source_type")
    
    query = db.query(TrafficRecord).join(Prediction)
    
    if device_id:
        query = query.filter(TrafficRecord.device_id == int(device_id))
    if protocol:
        query = query.filter(TrafficRecord.protocol == protocol.upper())
    if prediction_filter:
        query = query.filter(Prediction.prediction == prediction_filter)
    if source_type:
        query = query.filter(TrafficRecord.source_type == source_type)
        
    records = query.order_by(TrafficRecord.timestamp.desc()).limit(limit).all()
    
    results = []
    for r in records:
        pred = r.prediction
        dev = r.device
        results.append({
            "id": r.id,
            "device_id": r.device_id,
            "device_name": dev.device_name if dev else "Unknown",
            "source_ip": r.source_ip,
            "destination_ip": r.destination_ip,
            "source_port": r.source_port,
            "destination_port": r.destination_port,
            "protocol": r.protocol,
            "packet_count": r.packet_count,
            "byte_count": r.byte_count,
            "flow_duration": r.flow_duration,
            "source_type": r.source_type,
            "timestamp": r.timestamp.isoformat() + "Z",
            "prediction": pred.prediction if pred else "Normal",
            "confidence": pred.confidence if pred else 1.0,
            "severity": pred.severity if pred else "SAFE"
        })
    db.close()
    return jsonify(results)

@traffic_bp.route("/live", methods=["GET"])
def get_live_traffic():
    db = SessionLocal()
    records = db.query(TrafficRecord).join(Prediction).order_by(TrafficRecord.timestamp.desc()).limit(15).all()
    results = []
    for r in records:
        pred = r.prediction
        dev = r.device
        results.append({
            "id": r.id,
            "device_name": dev.device_name if dev else "Unknown",
            "source_ip": r.source_ip,
            "destination_ip": r.destination_ip,
            "protocol": r.protocol,
            "destination_port": r.destination_port,
            "packet_count": r.packet_count,
            "flow_duration": r.flow_duration,
            "prediction": pred.prediction if pred else "Normal",
            "confidence": pred.confidence if pred else 1.0,
            "severity": pred.severity if pred else "SAFE",
            "source_type": r.source_type,
            "timestamp": r.timestamp.isoformat() + "Z"
        })
    db.close()
    return jsonify(results)
