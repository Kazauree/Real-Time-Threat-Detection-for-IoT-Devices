from datetime import datetime
from flask import Blueprint, request, jsonify
from models.database import SessionLocal, Device, SecurityLog
from api.auth import token_required

devices_bp = Blueprint("devices", __name__, url_prefix="/api/devices")

@devices_bp.route("", methods=["GET"])
def get_devices():
    db = SessionLocal()
    search = request.args.get("search", "")
    dev_type = request.args.get("type", "")
    risk = request.args.get("risk", "")
    
    query = db.query(Device)
    if search:
        query = query.filter(
            (Device.device_name.ilike(f"%{search}%")) |
            (Device.ip_address.ilike(f"%{search}%")) |
            (Device.mac_address.ilike(f"%{search}%"))
        )
    if dev_type:
        query = query.filter(Device.device_type == dev_type)
    if risk:
        query = query.filter(Device.risk_level == risk)
        
    devices = query.order_by(Device.created_at.desc()).all()
    
    result = []
    for d in devices:
        result.append({
            "id": d.id,
            "device_name": d.device_name,
            "device_type": d.device_type,
            "ip_address": d.ip_address,
            "mac_address": d.mac_address,
            "manufacturer": d.manufacturer,
            "status": d.status,
            "risk_level": d.risk_level,
            "last_seen": d.last_seen.isoformat() + "Z" if d.last_seen else None,
            "created_at": d.created_at.isoformat() + "Z"
        })
    db.close()
    return jsonify(result)

@devices_bp.route("/<int:device_id>", methods=["GET"])
def get_device(device_id):
    db = SessionLocal()
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        db.close()
        return jsonify({"error": "Device not found"}), 404
        
    data = {
        "id": device.id,
        "device_name": device.device_name,
        "device_type": device.device_type,
        "ip_address": device.ip_address,
        "mac_address": device.mac_address,
        "manufacturer": device.manufacturer,
        "status": device.status,
        "risk_level": device.risk_level,
        "last_seen": device.last_seen.isoformat() + "Z" if device.last_seen else None,
        "created_at": device.created_at.isoformat() + "Z",
        "total_traffic": len(device.traffic_records),
        "total_threats": len(device.threats)
    }
    db.close()
    return jsonify(data)

@devices_bp.route("", methods=["POST"])
@token_required
def create_device():
    data = request.get_json() or {}
    name = data.get("device_name")
    dev_type = data.get("device_type")
    ip = data.get("ip_address")
    mac = data.get("mac_address")
    manufacturer = data.get("manufacturer", "Generic IoT")
    
    if not name or not dev_type or not ip or not mac:
        return jsonify({"error": "device_name, device_type, ip_address, and mac_address are required"}), 400
        
    db = SessionLocal()
    existing = db.query(Device).filter(Device.mac_address == mac).first()
    if existing:
        db.close()
        return jsonify({"error": "Device with this MAC address already exists"}), 400
        
    device = Device(
        device_name=name,
        device_type=dev_type,
        ip_address=ip,
        mac_address=mac,
        manufacturer=manufacturer,
        status="Online",
        risk_level="SAFE"
    )
    db.add(device)
    db.commit()
    db.refresh(device)
    
    log = SecurityLog(user_id=request.current_user.id, action="DEVICE_CREATED", description=f"Registered device: {name} ({ip})")
    db.add(log)
    db.commit()
    db.close()
    
    return jsonify({
        "message": "IoT Device registered successfully",
        "id": device.id
    }), 201

@devices_bp.route("/<int:device_id>", methods=["PUT"])
@token_required
def update_device(device_id):
    data = request.get_json() or {}
    db = SessionLocal()
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        db.close()
        return jsonify({"error": "Device not found"}), 404
        
    if "device_name" in data:
        device.device_name = data["device_name"]
    if "device_type" in data:
        device.device_type = data["device_type"]
    if "ip_address" in data:
        device.ip_address = data["ip_address"]
    if "manufacturer" in data:
        device.manufacturer = data["manufacturer"]
    if "status" in data:
        device.status = data["status"]
    if "risk_level" in data:
        device.risk_level = data["risk_level"]
        
    device.last_seen = datetime.utcnow()
    db.commit()
    
    log = SecurityLog(user_id=request.current_user.id, action="DEVICE_UPDATED", description=f"Updated device ID {device_id}: {device.device_name}")
    db.add(log)
    db.commit()
    db.close()
    
    return jsonify({"message": "Device updated successfully"})

@devices_bp.route("/<int:device_id>", methods=["DELETE"])
@token_required
def delete_device(device_id):
    db = SessionLocal()
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        db.close()
        return jsonify({"error": "Device not found"}), 404
        
    dev_name = device.device_name
    db.delete(device)
    db.commit()
    
    log = SecurityLog(user_id=request.current_user.id, action="DEVICE_DELETED", description=f"Deleted device ID {device_id}: {dev_name}")
    db.add(log)
    db.commit()
    db.close()
    
    return jsonify({"message": "Device deleted successfully"})
