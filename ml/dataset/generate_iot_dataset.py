import os
import numpy as np
import pandas as pd

def generate_iot_dataset(output_path="ml/dataset/iot_network_traffic.csv", n_samples=12000, seed=42):
    """
    Generates a realistic synthetic IoT network traffic dataset for intrusion detection.
    Covers 6 traffic categories: Normal, DoS, Port Scan, Brute Force, Botnet, Suspicious.
    """
    np.random.seed(seed)
    
    classes = ["Normal", "DoS", "Port Scan", "Brute Force", "Botnet", "Suspicious"]
    # Class ratios: 50% Normal, 15% DoS, 10% Port Scan, 10% Brute Force, 10% Botnet, 5% Suspicious
    class_probs = [0.50, 0.15, 0.10, 0.10, 0.10, 0.05]
    
    samples_per_class = np.random.multinomial(n_samples, class_probs)
    
    data = []
    
    for idx, label in enumerate(classes):
        count = samples_per_class[idx]
        
        if label == "Normal":
            # Normal IoT traffic: balanced flows, standard HTTP/MQTT/CoAP ports
            flow_duration = np.random.uniform(50, 5000, count)
            packet_count = np.random.randint(5, 150, count)
            pkt_len_mean = np.random.uniform(100, 800, count)
            pkt_len_std = np.random.uniform(10, 200, count)
            byte_count = packet_count * pkt_len_mean
            flow_pkts_per_sec = (packet_count / (flow_duration / 1000.0)).clip(1, 500)
            flow_bytes_per_sec = (byte_count / (flow_duration / 1000.0)).clip(100, 50000)
            port_entropy = np.random.uniform(1.0, 2.5, count)
            dest_ports = np.random.choice([80, 443, 1883, 8883, 5683, 53], count, p=[0.3, 0.4, 0.1, 0.1, 0.05, 0.05])
            protocols = np.random.choice(["TCP", "UDP"], count, p=[0.75, 0.25])
            
        elif label == "DoS":
            # Denial of Service: extremely high packet rate, short duration, uniform small packet sizes
            flow_duration = np.random.uniform(10, 500, count)
            packet_count = np.random.randint(500, 10000, count)
            pkt_len_mean = np.random.uniform(40, 120, count)
            pkt_len_std = np.random.uniform(0.5, 15, count)
            byte_count = packet_count * pkt_len_mean
            flow_pkts_per_sec = (packet_count / (flow_duration / 1000.0)).clip(1000, 100000)
            flow_bytes_per_sec = (byte_count / (flow_duration / 1000.0)).clip(500000, 10000000)
            port_entropy = np.random.uniform(0.1, 0.8, count)
            dest_ports = np.random.choice([80, 443, 8080, 53], count, p=[0.4, 0.3, 0.2, 0.1])
            protocols = np.random.choice(["TCP", "UDP", "ICMP"], count, p=[0.5, 0.3, 0.2])
            
        elif label == "Port Scan":
            # Port Scanning: very short flow duration, minimal packet count (1-4 pkts), sweeping ports
            flow_duration = np.random.uniform(1, 50, count)
            packet_count = np.random.randint(1, 5, count)
            pkt_len_mean = np.random.uniform(40, 80, count)
            pkt_len_std = np.random.uniform(0, 5, count)
            byte_count = packet_count * pkt_len_mean
            flow_pkts_per_sec = (packet_count / (flow_duration / 1000.0)).clip(50, 2000)
            flow_bytes_per_sec = (byte_count / (flow_duration / 1000.0)).clip(2000, 100000)
            port_entropy = np.random.uniform(3.5, 5.0, count) # high port entropy across scans
            dest_ports = np.random.randint(1, 65535, count)
            protocols = np.random.choice(["TCP", "UDP"], count, p=[0.9, 0.1])
            
        elif label == "Brute Force":
            # SSH / Telnet / HTTP Auth Brute Force: repeated authentication packets on port 22, 23, 80
            flow_duration = np.random.uniform(500, 15000, count)
            packet_count = np.random.randint(150, 1200, count)
            pkt_len_mean = np.random.uniform(150, 350, count)
            pkt_len_std = np.random.uniform(20, 60, count)
            byte_count = packet_count * pkt_len_mean
            flow_pkts_per_sec = (packet_count / (flow_duration / 1000.0)).clip(10, 300)
            flow_bytes_per_sec = (byte_count / (flow_duration / 1000.0)).clip(2000, 80000)
            port_entropy = np.random.uniform(0.2, 1.0, count)
            dest_ports = np.random.choice([22, 23, 80, 443, 3389], count, p=[0.45, 0.30, 0.15, 0.05, 0.05])
            protocols = np.random.choice(["TCP"], count, p=[1.0])
            
        elif label == "Botnet":
            # Botnet Command & Control (C2): periodic heartbeat, unusual non-standard ports (e.g. 6667, 7000, 4444)
            flow_duration = np.random.uniform(2000, 30000, count)
            packet_count = np.random.randint(20, 300, count)
            pkt_len_mean = np.random.uniform(80, 400, count)
            pkt_len_std = np.random.uniform(5, 40, count)
            byte_count = packet_count * pkt_len_mean
            flow_pkts_per_sec = (packet_count / (flow_duration / 1000.0)).clip(1, 50)
            flow_bytes_per_sec = (byte_count / (flow_duration / 1000.0)).clip(500, 20000)
            port_entropy = np.random.uniform(1.2, 3.0, count)
            dest_ports = np.random.choice([6667, 7000, 4444, 8081, 9999, 5555], count, p=[0.25, 0.2, 0.2, 0.15, 0.1, 0.1])
            protocols = np.random.choice(["TCP", "UDP"], count, p=[0.8, 0.2])
            
        elif label == "Suspicious":
            # Suspicious / Malformed / Anomaly: irregular packet sizes, unexpected ports, unusual entropy
            flow_duration = np.random.uniform(100, 10000, count)
            packet_count = np.random.randint(10, 500, count)
            pkt_len_mean = np.random.uniform(900, 1450, count)
            pkt_len_std = np.random.uniform(300, 700, count)
            byte_count = packet_count * pkt_len_mean
            flow_pkts_per_sec = (packet_count / (flow_duration / 1000.0)).clip(5, 500)
            flow_bytes_per_sec = (byte_count / (flow_duration / 1000.0)).clip(5000, 200000)
            port_entropy = np.random.uniform(2.8, 4.5, count)
            dest_ports = np.random.randint(1024, 49151, count)
            protocols = np.random.choice(["TCP", "UDP", "ICMP"], count, p=[0.6, 0.3, 0.1])

        df_class = pd.DataFrame({
            "flow_duration": np.round(flow_duration, 2),
            "packet_count": packet_count.astype(int),
            "byte_count": np.round(byte_count, 2),
            "pkt_len_mean": np.round(pkt_len_mean, 2),
            "pkt_len_std": np.round(pkt_len_std, 2),
            "flow_pkts_per_sec": np.round(flow_pkts_per_sec, 2),
            "flow_bytes_per_sec": np.round(flow_bytes_per_sec, 2),
            "port_entropy": np.round(port_entropy, 3),
            "dest_port": dest_ports.astype(int),
            "protocol": protocols,
            "label": label
        })
        data.append(df_class)
        
    df_all = pd.concat(data, ignore_index=True)
    # Shuffle dataset
    df_all = df_all.sample(frac=1, random_state=seed).reset_index(drop=True)
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df_all.to_csv(output_path, index=False)
    print(f"[+] IoT dataset successfully generated with {len(df_all)} records at '{output_path}'")
    print("Class breakdown:")
    print(df_all["label"].value_counts())
    return df_all

if __name__ == "__main__":
    generate_iot_dataset()
