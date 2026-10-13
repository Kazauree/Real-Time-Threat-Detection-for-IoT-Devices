import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

if os.getenv("VERCEL"):
    _DB_DIR = "/tmp"
else:
    _DB_DIR = "database"
DB_PATH = os.getenv("DATABASE_URL", f"sqlite:///{_DB_DIR}/iot_threats.db")
os.makedirs(_DB_DIR, exist_ok=True)

engine = create_engine(DB_PATH, connect_args={"check_same_thread": False} if DB_PATH.startswith("sqlite") else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="Administrator") # Administrator or Security Analyst
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    logs = relationship("SecurityLog", back_populates="user")

class Device(Base):
    __tablename__ = "devices"
    
    id = Column(Integer, primary_key=True, index=True)
    device_name = Column(String(100), nullable=False)
    device_type = Column(String(50), nullable=False) # Smart Camera, Smart Sensor, Smart Router, etc.
    ip_address = Column(String(45), nullable=False)
    mac_address = Column(String(17), nullable=False, unique=True)
    manufacturer = Column(String(100), default="Generic IoT")
    status = Column(String(20), default="Online") # Online, Offline, Warning
    risk_level = Column(String(20), default="SAFE") # SAFE, LOW, MEDIUM, HIGH, CRITICAL
    last_seen = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    traffic_records = relationship("TrafficRecord", back_populates="device", cascade="all, delete-orphan")
    threats = relationship("Threat", back_populates="device", cascade="all, delete-orphan")

class TrafficRecord(Base):
    __tablename__ = "traffic_records"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False)
    source_ip = Column(String(45), nullable=False)
    destination_ip = Column(String(45), nullable=False)
    source_port = Column(Integer, default=0)
    destination_port = Column(Integer, nullable=False)
    protocol = Column(String(10), nullable=False) # TCP, UDP, ICMP
    packet_count = Column(Integer, nullable=False)
    byte_count = Column(Float, nullable=False)
    flow_duration = Column(Float, nullable=False)
    features_json = Column(Text, nullable=False)
    source_type = Column(String(20), default="SIMULATED") # LIVE or SIMULATED
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    device = relationship("Device", back_populates="traffic_records")
    prediction = relationship("Prediction", back_populates="traffic_record", uselist=False, cascade="all, delete-orphan")

class Prediction(Base):
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    traffic_id = Column(Integer, ForeignKey("traffic_records.id"), nullable=False)
    prediction = Column(String(50), nullable=False) # Normal, DoS, Port Scan, Brute Force, Botnet, Suspicious
    confidence = Column(Float, nullable=False)
    severity = Column(String(20), nullable=False) # SAFE, LOW, MEDIUM, HIGH, CRITICAL
    model_version = Column(String(50), default="RF-IOT-v1.0")
    prediction_time = Column(DateTime, default=datetime.utcnow)
    
    traffic_record = relationship("TrafficRecord", back_populates="prediction")
    threat = relationship("Threat", back_populates="prediction", uselist=False, cascade="all, delete-orphan")

class Threat(Base):
    __tablename__ = "threats"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False)
    prediction_id = Column(Integer, ForeignKey("predictions.id"), nullable=False)
    threat_type = Column(String(50), nullable=False)
    severity = Column(String(20), nullable=False)
    description = Column(Text)
    status = Column(String(30), default="Investigating") # Investigating, Resolved, Ignored
    detected_at = Column(DateTime, default=datetime.utcnow, index=True)
    resolved_at = Column(DateTime, nullable=True)
    
    device = relationship("Device", back_populates="threats")
    prediction = relationship("Prediction", back_populates="threat")
    alerts = relationship("Alert", back_populates="threat", cascade="all, delete-orphan")

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    threat_id = Column(Integer, ForeignKey("threats.id"), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(20), nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    threat = relationship("Threat", back_populates="alerts")

class ModelVersion(Base):
    __tablename__ = "model_versions"
    
    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), nullable=False)
    algorithm = Column(String(100), nullable=False)
    version = Column(String(50), nullable=False, unique=True)
    accuracy = Column(Float, nullable=False)
    precision = Column(Float, nullable=False)
    recall = Column(Float, nullable=False)
    f1_score = Column(Float, nullable=False)
    trained_at = Column(DateTime, default=datetime.utcnow)
    model_path = Column(String(255), nullable=False)

class SecurityLog(Base):
    __tablename__ = "security_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    ip_address = Column(String(45), default="127.0.0.1")
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    user = relationship("User", back_populates="logs")

def init_db():
    Base.metadata.create_all(bind=engine)
    print("[+] Database tables initialized successfully.")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
