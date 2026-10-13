import unittest
import sys
import os
import json

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend")))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import app, seed_database
from models.database import init_db

class TestIoTThreatDetectionSystem(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        app.config['TESTING'] = True
        cls.client = app.test_client()
        seed_database()

    def test_01_backend_health(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("Real-Time Threat Detection System", data["system"])

    def test_02_authentication_flow(self):
        # Admin login
        login_res = self.client.post('/api/auth/login', json={
            "email": "admin@iotshield.sec",
            "password": "admin123"
        })
        self.assertEqual(login_res.status_code, 200)
        data = login_res.get_json()
        self.assertIn("token", data)
        self.assertEqual(data["user"]["role"], "Administrator")
        
        # Access protected endpoint with token
        token = data["token"]
        me_res = self.client.get('/api/auth/me', headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(me_res.status_code, 200)

    def test_03_devices_crud(self):
        # Get devices list
        res = self.client.get('/api/devices')
        self.assertEqual(res.status_code, 200)
        devices = res.get_json()
        self.assertGreaterEqual(len(devices), 1)

    def test_04_realtime_prediction_pipeline(self):
        # DoS attack simulation flow
        payload = {
            "device_id": 1,
            "source_ip": "192.168.1.12",
            "destination_ip": "192.168.1.1",
            "destination_port": 80,
            "protocol": "TCP",
            "source_type": "SIMULATED",
            "features": {
                "flow_duration": 15,
                "packet_count": 4000,
                "byte_count": 240000,
                "pkt_len_mean": 60,
                "pkt_len_std": 2,
                "flow_pkts_per_sec": 266000,
                "flow_bytes_per_sec": 16000000,
                "port_entropy": 0.3,
                "dest_port": 80,
                "protocol": "TCP"
            }
        }
        res = self.client.post('/api/predict', json=payload)
        self.assertEqual(res.status_code, 200)
        result = res.get_json()["result"]
        self.assertEqual(result["prediction"], "DoS")
        self.assertEqual(result["severity"], "CRITICAL")
        self.assertTrue(result["is_threat"])
        self.assertGreater(result["confidence"], 0.8)

    def test_05_dashboard_analytics(self):
        stats_res = self.client.get('/api/dashboard/statistics')
        self.assertEqual(stats_res.status_code, 200)
        stats = stats_res.get_json()
        self.assertGreater(stats["total_devices"], 0)
        self.assertGreater(stats["total_traffic"], 0)

    def test_06_ml_metrics(self):
        metrics_res = self.client.get('/api/ml/metrics')
        self.assertEqual(metrics_res.status_code, 200)
        m = metrics_res.get_json()
        self.assertEqual(m["algorithm"], "RandomForestClassifier")
        self.assertGreaterEqual(m["metrics"]["accuracy"], 0.9)

if __name__ == '__main__':
    unittest.main()
