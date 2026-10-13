# Real-Time Threat Detection in IoT Devices Using Random Forest Machine Learning with Web Application Interface

A functional, end-to-end cybersecurity threat monitoring system engineered for Internet of Things (IoT) network security. The platform uses a trained **Random Forest Machine Learning Classifier** to analyze IoT network traffic flows in real time, detect malicious intrusions (DoS, Port Scan, Brute Force, Botnet, Suspicious), log security telemetry into a database, push real-time threat alerts via WebSockets, and present security insights through a modern dark-mode React web dashboard.

---

## 🚀 Key Features

* **Real-Time Random Forest ML Classifier**: Analyzes 10+ flow features (`flow_duration`, `packet_count`, `byte_count`, `pkt_len_mean`, `pkt_len_std`, `flow_pkts_per_sec`, `flow_bytes_per_sec`, `port_entropy`, `dest_port`, `protocol`) and predicts traffic categories with **98%+ accuracy**.
* **Live WebSocket Telemetry Feed**: Real-time Socket.IO event broadcasting delivers live predictions and threat notifications to the dashboard with zero page reloads.
* **IoT Asset Registry Management**: Register, edit, delete, monitor, and assign risk levels (SAFE, LOW, MEDIUM, HIGH, CRITICAL) to smart cameras, sensors, routers, thermostats, locks, and industrial gateways.
* **Explainable ML Diagnostic Playbook**: Provides top contributing flow indicators and actionable security response playbooks for identified threat vectors.
* **Interactive Cyber Threat Analytics**: Visualizes attack vector distributions, threat timelines, targeted asset leaderboards, and protocol ratios powered by Recharts.
* **Machine Learning Center**: Displays live confusion matrices, weighted accuracy/precision/recall/F1 metrics, top 10 feature importances, and one-click model retraining.
* **PDF & CSV Security Report Generator**: Generates exportable security compliance reports and raw CSV traffic datasets.
* **Role-Based Authentication & Audit Trail**: JWT authentication with bcrypt password hashing for Administrators and Security Analysts, supported by audit logs.
* **Automated IoT Traffic Simulator**: Built-in simulator generating synthetic normal and attack flows for testing and live demonstrations.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Socket.IO Client, Axios |
| **Backend API** | Python 3, Flask, Flask-SocketIO, Eventlet/Threading, SQLAlchemy, PyJWT, Werkzeug, ReportLab |
| **Machine Learning** | Scikit-learn (`RandomForestClassifier`), Pandas, NumPy, Joblib, StandardScaler, LabelEncoder |
| **Database** | SQLite (supported by SQLAlchemy ORM; configurable for MySQL / PostgreSQL) |
| **Simulator** | Python Multithreaded Traffic Generator |

---

## 🏗️ System Architecture

```text
                  ┌─────────────────────────────┐
                  │       WEB BROWSER           │
                  │ React 18 Dashboard          │
                  └──────────────┬──────────────┘
                                 │
                                 │ REST API / WebSocket
                                 ▼
                  ┌─────────────────────────────┐
                  │      BACKEND SERVER         │
                  │ Flask + Flask-SocketIO      │
                  │ JWT Authentication          │
                  │ API Route Handlers          │
                  └──────────────┬──────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
       ┌────────────┐     ┌─────────────┐   ┌──────────────┐
       │ IoT Traffic│     │ ML Engine   │   │ Alert Engine │
       │ Simulator  │     │ Random      │   │ Real-time    │
       │ Generator  │     │ Forest      │   │ WebSocket    │
       └─────┬──────┘     └──────┬──────┘   └──────┬───────┘
             │                   │                 │
             └───────────────────┼─────────────────┘
                                 ▼
                       ┌──────────────────┐
                       │    DATABASE      │
                       │ SQLite (SQLAlchemy)│
                       └──────────────────┘
```

---

## ⚙️ Quick Start Installation

### Prerequisites
* Python 3.10+
* Node.js v18+ & npm

### 1. Clone Repository & Run Automated Setup

```bash
# Navigate to project directory
cd /path/to/iot-threat-detection

# Run automated master launcher script
python3 start_system.py
```

`start_system.py` automatically initializes the virtual environment, installs requirements, generates the synthetic dataset, trains the Random Forest model, seeds default admin accounts, and starts the backend API (Port 5000), frontend dev server (Port 5173), and traffic simulator!

### 2. Access the Application

* **Web Dashboard**: `http://localhost:5173`
* **Backend REST API**: `http://localhost:5000/api`
* **WebSocket Feed**: `ws://localhost:5000`

---

## 🔐 Default Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@iotshield.sec` | `admin123` |
| **Security Analyst** | `analyst@iotshield.sec` | `analyst123` |

---

## 📊 Machine Learning Model Training & Evaluation

To train or re-evaluate the Random Forest model manually:

```bash
./venv/bin/python ml/train_model.py
```

### Model Performance Metrics

```text
=======================================================
                MODEL TRAINING SUMMARY                 
=======================================================
 Algorithm    : Random Forest Classifier (v1.0)
 Accuracy     : 100.00%
 Precision    : 100.00%
 Recall       : 100.00%
 F1 Score     : 100.00%
 False Pos    : 0
 False Neg    : 0
=======================================================
```

---

## 📡 REST API Documentation

### Authentication
* `POST /api/auth/login` - Authenticate user & return JWT token.
* `POST /api/auth/register` - Register new security user.
* `GET /api/auth/me` - Fetch authenticated user profile.

### IoT Devices
* `GET /api/devices` - List registered IoT device assets.
* `POST /api/devices` - Register new IoT device.
* `PUT /api/devices/:id` - Update device configuration.
* `DELETE /api/devices/:id` - Delete device asset.

### Traffic & Predictions
* `POST /api/predict` - Submit network flow features for real-time prediction and WebSocket broadcast.
* `GET /api/traffic` - Query historical traffic flows.
* `GET /api/traffic/live` - Fetch recent live traffic stream.

### Threat Management & Reports
* `GET /api/threats` - List identified threat incidents.
* `PUT /api/threats/:id/status` - Update threat status (`Investigating`, `Resolved`, `Ignored`).
* `GET /api/reports/threats?format=pdf` - Export PDF Security Incident Report.
* `GET /api/reports/threats?format=csv` - Export CSV Threat Dataset.

---

## 🧪 Automated Testing

Execute the automated integration test suite:

```bash
./venv/bin/python tests/test_system.py
```

---

## 📚 Academic Project Chapter Documentation Guide

### CHAPTER ONE: Introduction
* **Background**: The proliferation of resource-constrained IoT devices lacking robust perimeter defenses.
* **Statement of the Problem**: Susceptibility of smart devices to DoS, scanning, brute force, and botnet infection.
* **Aim**: Design a real-time Random Forest ML-driven intrusion detection platform with an executive web dashboard.

### CHAPTER TWO: Literature Review
* Survey of IoT network intrusion detection architectures, Random Forest ensemble learning theory, feature selection methodologies, and comparative evaluation against decision trees and SVMs.

### CHAPTER THREE: System Analysis & Design
* Architectural data flow diagrams (DFD), Use Case diagrams, Entity-Relationship (ER) database schema, and Random Forest feature preprocessing workflows.

### CHAPTER FOUR: Implementation, Testing & Results
* Software implementation details (React 18, Flask, Scikit-learn, WebSockets), test case execution tables, Confusion Matrix analysis, and feature importance rankings.

### CHAPTER FIVE: Summary, Conclusion & Recommendations
* Synthesis of project findings, operational benefits for SOC analysts, and recommendations for future deep learning extensions.
