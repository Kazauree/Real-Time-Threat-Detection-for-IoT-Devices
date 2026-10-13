#!/usr/bin/env python3
import os
import sys
import time
import subprocess

def main():
    print("\n" + "=" * 65)
    print("      REAL-TIME IOT THREAT DETECTION SYSTEM (RANDOM FOREST ML)   ")
    print("=" * 65)
    
    root_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(root_dir)
    
    python_bin = os.path.join(root_dir, "venv", "bin", "python")
    if not os.path.exists(python_bin):
        python_bin = sys.executable

    # 1. Verify / Train ML Model
    model_path = os.path.join(root_dir, "ml", "saved_models", "random_forest.pkl")
    if not os.path.exists(model_path):
        print("[*] Training initial Random Forest Classifier model...")
        subprocess.run([python_bin, "ml/train_model.py"], check=True)

    print("\n[+] Launching Backend REST API & WebSocket Server (Port 5000)...")
    backend_env = os.environ.copy()
    backend_env["PYTHONPATH"] = os.path.join(root_dir, "backend") + ":" + root_dir
    backend_proc = subprocess.Popen([python_bin, "backend/app.py"], env=backend_env)

    time.sleep(2)

    print("[+] Launching React Web Dashboard (Port 5173)...")
    frontend_dir = os.path.join(root_dir, "frontend")
    frontend_proc = subprocess.Popen(["npm", "run", "dev"], cwd=frontend_dir)

    time.sleep(2)

    print("[+] Launching IoT Traffic Simulator (Background Stream)...")
    sim_proc = subprocess.Popen([python_bin, "simulator/traffic_generator.py", "mixed", "2.0"])

    print("\n" + "=" * 65)
    print("🚀 ALL SYSTEM SERVICES ONLINE & RUNNING!")
    print("=" * 65)
    print(" 💻 Web Dashboard URL : http://localhost:5173")
    print(" ⚙️ Backend REST API  : http://localhost:5000/api")
    print(" 📡 WebSocket Feed    : ws://localhost:5000")
    print("-" * 65)
    print(" 🔑 Demo Administrator Credentials:")
    print("    Email    : admin@iotshield.sec")
    print("    Password : admin123")
    print("-" * 65)
    print(" 🔑 Demo Security Analyst Credentials:")
    print("    Email    : analyst@iotshield.sec")
    print("    Password : analyst123")
    print("=" * 65)
    print("Press Ctrl+C to stop all services.\n")

    try:
        backend_proc.wait()
    except KeyboardInterrupt:
        print("\n[*] Stopping all system processes...")
        backend_proc.terminate()
        frontend_proc.terminate()
        sim_proc.terminate()
        print("[+] System shutdown complete.")

if __name__ == "__main__":
    main()
