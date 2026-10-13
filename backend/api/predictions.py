from flask import Blueprint, request, jsonify
from models.database import SessionLocal
from services.ml_service import ml_service

predictions_bp = Blueprint("predictions", __name__, url_prefix="/api")

# SocketIO reference will be injected by main app
socketio_instance = None

def set_socketio(sio):
    global socketio_instance
    socketio_instance = sio

@predictions_bp.route("/predict", methods=["POST"])
def predict_traffic():
    payload = request.get_json() or {}
    
    db = SessionLocal()
    try:
        event_data = ml_service.predict_and_record(db, payload)
        
        # Broadcast real-time event to all connected dashboard WebSocket clients
        if socketio_instance:
            socketio_instance.emit("new_traffic_prediction", event_data)
            if event_data.get("is_threat"):
                socketio_instance.emit("new_threat_alert", {
                    "alert_id": event_data.get("alert_id"),
                    "threat_id": event_data.get("threat_id"),
                    "title": f"🚨 {event_data['severity']} Threat: {event_data['prediction']}",
                    "message": f"Device '{event_data['device_name']}' ({event_data['source_ip']}) detected with {event_data['prediction']}.",
                    "severity": event_data["severity"],
                    "device_name": event_data["device_name"],
                    "timestamp": event_data["timestamp"]
                })
                
        return jsonify({
            "message": "Prediction processed successfully",
            "result": event_data
        }), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@predictions_bp.route("/predictions", methods=["GET"])
def get_predictions():
    db = SessionLocal()
    from models.database import Prediction, TrafficRecord, Device
    limit = int(request.args.get("limit", 50))
    
    predictions = db.query(Prediction).order_by(Prediction.prediction_time.desc()).limit(limit).all()
    res = []
    for p in predictions:
        tr = p.traffic_record
        dev = tr.device if tr else None
        res.append({
            "id": p.id,
            "traffic_id": p.traffic_id,
            "device_name": dev.device_name if dev else "Unknown",
            "prediction": p.prediction,
            "confidence": p.confidence,
            "severity": p.severity,
            "model_version": p.model_version,
            "timestamp": p.prediction_time.isoformat() + "Z"
        })
    db.close()
    return jsonify(res)
