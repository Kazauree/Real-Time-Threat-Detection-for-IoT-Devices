import sys
import os
import json
from datetime import datetime
from sqlalchemy.orm import Session

# Add project root to path for ML imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from ml.predict import IoTPredictor
from models.database import Device, TrafficRecord, Prediction, Threat, Alert, SecurityLog

class MLThreatService:
    def __init__(self):
        self.predictor = None
        
    def _get_predictor(self):
        if self.predictor is None:
            model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../ml/saved_models/random_forest.pkl"))
            prep_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../ml/saved_models/preprocessing_pipeline.pkl"))
            self.predictor = IoTPredictor.get_instance(model_path=model_path, preprocessor_path=prep_path)
        return self.predictor

    def predict_and_record(self, db: Session, payload: dict):
        """
        Main pipeline function:
        1. Validates or fetches IoT device.
        2. Executes Random Forest prediction via IoTPredictor.
        3. Creates TrafficRecord, Prediction, and optional Threat & Alert.
        4. Updates Device risk level & last seen timestamp.
        5. Returns complete formatted event dictionary.
        """
        predictor = self._get_predictor()
        
        device_id = payload.get("device_id")
        mac_address = payload.get("mac_address")
        ip_address = payload.get("source_ip", "192.168.1.100")
        dest_ip = payload.get("destination_ip", "192.168.1.1")
        source_port = payload.get("source_port", 0)
        dest_port = payload.get("destination_port", payload.get("features", {}).get("dest_port", 80))
        protocol = payload.get("protocol", payload.get("features", {}).get("protocol", "TCP")).upper()
        source_type = payload.get("source_type", "SIMULATED")
        
        # Match or retrieve device
        device = None
        if device_id:
            device = db.query(Device).filter(Device.id == device_id).first()
        elif mac_address:
            device = db.query(Device).filter(Device.mac_address == mac_address).first()
            
        if not device:
            # Fallback to first available device or create default
            device = db.query(Device).first()
            if not device:
                device = Device(
                    device_name="IoT Gateway Alpha",
                    device_type="IoT Gateway",
                    ip_address=ip_address,
                    mac_address=mac_address or "AA:BB:CC:DD:EE:01",
                    manufacturer="Cisco IoT",
                    status="Online",
                    risk_level="SAFE"
                )
                db.add(device)
                db.commit()
                db.refresh(device)
                
        # Extract features dictionary
        features = payload.get("features", {})
        if not features:
            features = {
                "flow_duration": float(payload.get("flow_duration", 100)),
                "packet_count": int(payload.get("packet_count", 20)),
                "byte_count": float(payload.get("byte_count", 2000)),
                "pkt_len_mean": float(payload.get("pkt_len_mean", 100)),
                "pkt_len_std": float(payload.get("pkt_len_std", 15)),
                "flow_pkts_per_sec": float(payload.get("flow_pkts_per_sec", 10)),
                "flow_bytes_per_sec": float(payload.get("flow_bytes_per_sec", 1000)),
                "port_entropy": float(payload.get("port_entropy", 1.5)),
                "dest_port": int(dest_port),
                "protocol": protocol
            }
        else:
            features["dest_port"] = int(features.get("dest_port", dest_port))
            features["protocol"] = str(features.get("protocol", protocol)).upper()

        # Run Random Forest prediction
        pred_res = predictor.predict(features)
        
        # 1. Save Traffic Record
        traffic_rec = TrafficRecord(
            device_id=device.id,
            source_ip=ip_address,
            destination_ip=dest_ip,
            source_port=int(source_port),
            destination_port=int(dest_port),
            protocol=protocol,
            packet_count=int(features.get("packet_count", 20)),
            byte_count=float(features.get("byte_count", 2000)),
            flow_duration=float(features.get("flow_duration", 100)),
            features_json=json.dumps(features),
            source_type=source_type,
            timestamp=datetime.utcnow()
        )
        db.add(traffic_rec)
        db.commit()
        db.refresh(traffic_rec)
        
        # 2. Save Prediction Record
        prediction_rec = Prediction(
            traffic_id=traffic_rec.id,
            prediction=pred_res["prediction"],
            confidence=pred_res["confidence"],
            severity=pred_res["severity"],
            model_version="RF-IOT-v1.0",
            prediction_time=datetime.utcnow()
        )
        db.add(prediction_rec)
        db.commit()
        db.refresh(prediction_rec)
        
        threat_rec = None
        alert_rec = None
        
        # 3. Handle Threat & Alert Creation
        if pred_res["is_threat"]:
            threat_desc = f"Random Forest Classifier detected {pred_res['prediction']} activity with {pred_res['confidence']*100:.1f}% confidence."
            threat_rec = Threat(
                device_id=device.id,
                prediction_id=prediction_rec.id,
                threat_type=pred_res["prediction"],
                severity=pred_res["severity"],
                description=threat_desc,
                status="Investigating",
                detected_at=datetime.utcnow()
            )
            db.add(threat_rec)
            db.commit()
            db.refresh(threat_rec)
            
            alert_title = f"🚨 {pred_res['severity']} ALERT: {pred_res['prediction']} Detected"
            alert_msg = f"Device '{device.device_name}' ({device.ip_address}) flagged for {pred_res['prediction']}. Confidence: {pred_res['confidence']*100:.1f}%."
            alert_rec = Alert(
                threat_id=threat_rec.id,
                title=alert_title,
                message=alert_msg,
                severity=pred_res["severity"],
                is_read=False,
                created_at=datetime.utcnow()
            )
            db.add(alert_rec)
            
            # Update device risk level
            device.risk_level = pred_res["severity"]
            device.status = "Warning" if pred_res["severity"] in ["HIGH", "CRITICAL"] else "Online"
        
        device.last_seen = datetime.utcnow()
        db.commit()
        
        response_event = {
            "traffic_id": traffic_rec.id,
            "device_id": device.id,
            "device_name": device.device_name,
            "device_type": device.device_type,
            "source_ip": ip_address,
            "destination_ip": dest_ip,
            "protocol": protocol,
            "destination_port": dest_port,
            "packet_count": traffic_rec.packet_count,
            "flow_duration": traffic_rec.flow_duration,
            "prediction": pred_res["prediction"],
            "confidence": pred_res["confidence"],
            "severity": pred_res["severity"],
            "is_threat": pred_res["is_threat"],
            "source_type": source_type,
            "timestamp": traffic_rec.timestamp.isoformat() + "Z",
            "top_indicators": pred_res["top_indicators"],
            "class_probabilities": pred_res["class_probabilities"],
            "threat_id": threat_rec.id if threat_rec else None,
            "alert_id": alert_rec.id if alert_rec else None
        }
        
        return response_event

ml_service = MLThreatService()
