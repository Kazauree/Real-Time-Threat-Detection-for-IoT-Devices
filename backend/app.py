import os
import sys
from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
from werkzeug.security import generate_password_hash

# Ensure project paths are registered
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from models.database import init_db, SessionLocal, User, Device, ModelVersion, SecurityLog
from api.auth import auth_bp
from api.devices import devices_bp
from api.traffic import traffic_bp
from api.predictions import predictions_bp, set_socketio
from api.threats import threats_bp
from api.dashboard import dashboard_bp
from api.ml import ml_bp
from api.reports import reports_bp
from api.logs import logs_bp

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "iot-cybersecurity-super-secret-key-2026")
CORS(app, resources={r"/api/*": {"origins": "*"}})

socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")
set_socketio(socketio)

# Register Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(devices_bp)
app.register_blueprint(traffic_bp)
app.register_blueprint(predictions_bp)
app.register_blueprint(threats_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(ml_bp)
app.register_blueprint(reports_bp)
app.register_blueprint(logs_bp)

@app.route("/")
def index():
    return jsonify({
        "system": "Real-Time Threat Detection System in IoT Devices Using Random Forest ML",
        "status": "Online",
        "version": "1.0.0",
        "api_docs": "/api/dashboard/statistics"
    })

def seed_database():
    """Initializes DB schema and creates default seed data if database is empty."""
    init_db()
    db = SessionLocal()
    
    # 1. Seed Users
    if db.query(User).count() == 0:
        admin_user = User(
            name="System Administrator",
            email="admin@iotshield.sec",
            password_hash=generate_password_hash("admin123"),
            role="Administrator"
        )
        analyst_user = User(
            name="Security Analyst",
            email="analyst@iotshield.sec",
            password_hash=generate_password_hash("analyst123"),
            role="Security Analyst"
        )
        db.add_all([admin_user, analyst_user])
        db.commit()
        print("[+] Seeded default Administrator (admin@iotshield.sec) and Analyst users.")
        
    # 2. Seed IoT Devices
    if db.query(Device).count() == 0:
        sample_devices = [
            Device(device_name="HD Security Camera 01", device_type="Smart Camera", ip_address="192.168.1.12", mac_address="00:1A:2B:3C:4D:5E", manufacturer="Hikvision IoT", status="Online", risk_level="SAFE"),
            Device(device_name="Environmental Sensor 04", device_type="Smart Sensor", ip_address="192.168.1.19", mac_address="00:1A:2B:3C:4D:5F", manufacturer="Bosch Sensortec", status="Warning", risk_level="HIGH"),
            Device(device_name="Core Router Gateway", device_type="Smart Router", ip_address="192.168.1.1", mac_address="00:1A:2B:3C:4D:60", manufacturer="Cisco Systems", status="Online", risk_level="SAFE"),
            Device(device_name="Smart Thermostat Pro", device_type="Smart Thermostat", ip_address="192.168.1.25", mac_address="00:1A:2B:3C:4D:61", manufacturer="Nest IoT", status="Online", risk_level="SAFE"),
            Device(device_name="Smart Lock Entry Gate", device_type="Smart Lock", ip_address="192.168.1.30", mac_address="00:1A:2B:3C:4D:62", manufacturer="August Home", status="Online", risk_level="MEDIUM"),
            Device(device_name="Industrial PLC Gateway", device_type="IoT Gateway", ip_address="192.168.1.50", mac_address="00:1A:2B:3C:4D:63", manufacturer="Siemens Industrial", status="Online", risk_level="CRITICAL")
        ]
        db.add_all(sample_devices)
        db.commit()
        print(f"[+] Seeded {len(sample_devices)} sample IoT devices.")

    # 3. Verify / Train ML Model
    model_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "../ml/saved_models/random_forest.pkl"))
    if not os.path.exists(model_file):
        print("[*] No trained Random Forest model found. Training initial model now...")
        from ml.train_model import train_and_evaluate_model
        _, metadata = train_and_evaluate_model()
        
        mv = ModelVersion(
            model_name=metadata["model_name"],
            algorithm=metadata["algorithm"],
            version=metadata["version"],
            accuracy=metadata["metrics"]["accuracy"],
            precision=metadata["metrics"]["precision"],
            recall=metadata["metrics"]["recall"],
            f1_score=metadata["metrics"]["f1_score"],
            model_path=model_file
        )
        db.add(mv)
        db.commit()
        print(f"[+] Model RF-IOT-v1.0 trained and saved to database.")

    db.close()

@socketio.on("connect")
def handle_connect():
    print("[+] Dashboard client connected to real-time WebSocket feed.")

@socketio.on("disconnect")
def handle_disconnect():
    print("[-] Dashboard client disconnected from WebSocket feed.")

if os.getenv("VERCEL"):
    seed_database()

if __name__ == "__main__":
    seed_database()
    print("[+] Starting Real-Time IoT Threat Detection Backend Server on port 5000...")
    socketio.run(app, host="0.0.0.0", port=5000, debug=False)
