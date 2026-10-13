import time
import random
import requests
import sys

API_URL = "http://localhost:5000/api/predict"
DEVICES_URL = "http://localhost:5000/api/devices"

SAMPLE_DEVICES = [
    {"id": 1, "device_name": "HD Security Camera 01", "ip_address": "192.168.1.12", "mac_address": "00:1A:2B:3C:4D:5E"},
    {"id": 2, "device_name": "Environmental Sensor 04", "ip_address": "192.168.1.19", "mac_address": "00:1A:2B:3C:4D:5F"},
    {"id": 3, "device_name": "Core Router Gateway", "ip_address": "192.168.1.1", "mac_address": "00:1A:2B:3C:4D:60"},
    {"id": 4, "device_name": "Smart Thermostat Pro", "ip_address": "192.168.1.25", "mac_address": "00:1A:2B:3C:4D:61"},
    {"id": 5, "device_name": "Smart Lock Entry Gate", "ip_address": "192.168.1.30", "mac_address": "00:1A:2B:3C:4D:62"},
    {"id": 6, "device_name": "Industrial PLC Gateway", "ip_address": "192.168.1.50", "mac_address": "00:1A:2B:3C:4D:63"}
]

def fetch_active_devices():
    try:
        res = requests.get(DEVICES_URL, timeout=3)
        if res.status_code == 200 and isinstance(res.json(), list) and len(res.json()) > 0:
            return res.json()
    except Exception:
        pass
    return SAMPLE_DEVICES

def generate_flow_payload(scenario="Normal", device=None):
    if not device:
        device = random.choice(SAMPLE_DEVICES)
        
    source_ip = device.get("ip_address", "192.168.1.100")
    dest_ip = "192.168.1.1"
    
    if scenario == "Normal":
        dest_port = random.choice([80, 443, 1883, 8883, 53])
        protocol = random.choice(["TCP", "UDP"])
        flow_duration = random.uniform(50, 4000)
        packet_count = random.randint(5, 120)
        pkt_len_mean = random.uniform(120, 750)
        pkt_len_std = random.uniform(15, 180)
        byte_count = packet_count * pkt_len_mean
        flow_pkts_per_sec = packet_count / (flow_duration / 1000.0)
        flow_bytes_per_sec = byte_count / (flow_duration / 1000.0)
        port_entropy = random.uniform(1.2, 2.5)

    elif scenario == "DoS":
        dest_port = random.choice([80, 443, 8080, 53])
        protocol = random.choice(["TCP", "UDP", "ICMP"])
        flow_duration = random.uniform(10, 300)
        packet_count = random.randint(800, 8000)
        pkt_len_mean = random.uniform(40, 100)
        pkt_len_std = random.uniform(1, 10)
        byte_count = packet_count * pkt_len_mean
        flow_pkts_per_sec = packet_count / (flow_duration / 1000.0)
        flow_bytes_per_sec = byte_count / (flow_duration / 1000.0)
        port_entropy = random.uniform(0.1, 0.6)

    elif scenario == "Port Scan":
        dest_port = random.randint(1, 65535)
        protocol = "TCP"
        flow_duration = random.uniform(2, 35)
        packet_count = random.randint(1, 3)
        pkt_len_mean = random.uniform(40, 70)
        pkt_len_std = random.uniform(0, 4)
        byte_count = packet_count * pkt_len_mean
        flow_pkts_per_sec = packet_count / (flow_duration / 1000.0)
        flow_bytes_per_sec = byte_count / (flow_duration / 1000.0)
        port_entropy = random.uniform(3.8, 5.0)

    elif scenario == "Brute Force":
        dest_port = random.choice([22, 23, 80, 443])
        protocol = "TCP"
        flow_duration = random.uniform(800, 12000)
        packet_count = random.randint(200, 1000)
        pkt_len_mean = random.uniform(180, 320)
        pkt_len_std = random.uniform(20, 50)
        byte_count = packet_count * pkt_len_mean
        flow_pkts_per_sec = packet_count / (flow_duration / 1000.0)
        flow_bytes_per_sec = byte_count / (flow_duration / 1000.0)
        port_entropy = random.uniform(0.3, 0.9)

    elif scenario == "Botnet":
        dest_port = random.choice([6667, 7000, 4444, 8081, 9999])
        protocol = random.choice(["TCP", "UDP"])
        flow_duration = random.uniform(3000, 25000)
        packet_count = random.randint(25, 250)
        pkt_len_mean = random.uniform(90, 380)
        pkt_len_std = random.uniform(5, 30)
        byte_count = packet_count * pkt_len_mean
        flow_pkts_per_sec = packet_count / (flow_duration / 1000.0)
        flow_bytes_per_sec = byte_count / (flow_duration / 1000.0)
        port_entropy = random.uniform(1.5, 3.2)

    else: # Suspicious
        dest_port = random.randint(1024, 49151)
        protocol = random.choice(["TCP", "UDP", "ICMP"])
        flow_duration = random.uniform(200, 8000)
        packet_count = random.randint(20, 400)
        pkt_len_mean = random.uniform(950, 1400)
        pkt_len_std = random.uniform(350, 650)
        byte_count = packet_count * pkt_len_mean
        flow_pkts_per_sec = packet_count / (flow_duration / 1000.0)
        flow_bytes_per_sec = byte_count / (flow_duration / 1000.0)
        port_entropy = random.uniform(3.0, 4.5)

    return {
        "device_id": device.get("id", 1),
        "source_ip": source_ip,
        "destination_ip": dest_ip,
        "destination_port": dest_port,
        "protocol": protocol,
        "source_type": "SIMULATED",
        "features": {
            "flow_duration": round(flow_duration, 2),
            "packet_count": packet_count,
            "byte_count": round(byte_count, 2),
            "pkt_len_mean": round(pkt_len_mean, 2),
            "pkt_len_std": round(pkt_len_std, 2),
            "flow_pkts_per_sec": round(flow_pkts_per_sec, 2),
            "flow_bytes_per_sec": round(flow_bytes_per_sec, 2),
            "port_entropy": round(port_entropy, 3),
            "dest_port": dest_port,
            "protocol": protocol
        }
    }

def run_simulation(mode="mixed", interval=2.0, count=50):
    devices = fetch_active_devices()
    print(f"[*] IoT Traffic Simulator running in '{mode}' mode. Target API: {API_URL}")
    print(f"[*] Dispatching simulated traffic events every {interval}s...")
    
    scenarios = ["Normal", "DoS", "Port Scan", "Brute Force", "Botnet", "Suspicious"]
    weights = [0.65, 0.10, 0.08, 0.07, 0.06, 0.04]
    
    sent = 0
    while sent < count or count == 0:
        if mode == "mixed":
            scen = random.choices(scenarios, weights=weights)[0]
        else:
            scen = mode
            
        device = random.choice(devices)
        payload = generate_flow_payload(scenario=scen, device=device)
        
        try:
            res = requests.post(API_URL, json=payload, timeout=5)
            if res.status_code == 200:
                result = res.json().get("result", {})
                pred = result.get("prediction", "Unknown")
                sev = result.get("severity", "SAFE")
                conf = result.get("confidence", 0.0)
                tag = "🚨" if result.get("is_threat") else "✅"
                print(f"{tag} [{time.strftime('%H:%M:%S')}] {device['device_name']} ({payload['source_ip']}) -> {pred:<12} | Conf: {conf*100:5.1f}% | Severity: {sev}")
            else:
                print(f"[!] Server returned status {res.status_code}: {res.text}")
        except Exception as e:
            print(f"[!] Error sending traffic packet: {e}")
            
        sent += 1
        time.sleep(interval)

if __name__ == "__main__":
    mode_input = sys.argv[1] if len(sys.argv) > 1 else "mixed"
    
    interval_val = 2.0
    count_val = 0
    
    if len(sys.argv) > 2:
        try:
            interval_val = float(sys.argv[2])
        except ValueError:
            interval_val = 2.0
            
    if len(sys.argv) > 3:
        try:
            count_val = int(sys.argv[3])
        except ValueError:
            count_val = 0
            
    run_simulation(mode=mode_input, interval=interval_val, count=count_val)
