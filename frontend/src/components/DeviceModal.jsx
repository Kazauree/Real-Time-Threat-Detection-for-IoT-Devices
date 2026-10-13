import React, { useState, useEffect } from 'react';
import { X, Cpu } from 'lucide-react';
import { devicesAPI } from '../services/api';

const DeviceModal = ({ device, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    device_name: '',
    device_type: 'Smart Camera',
    ip_address: '',
    mac_address: '',
    manufacturer: 'Generic IoT',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (device) {
      setFormData({
        device_name: device.device_name || '',
        device_type: device.device_type || 'Smart Camera',
        ip_address: device.ip_address || '',
        mac_address: device.mac_address || '',
        manufacturer: device.manufacturer || 'Generic IoT',
      });
    }
  }, [device]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (device?.id) {
        await devicesAPI.updateDevice(device.id, formData);
      } else {
        await devicesAPI.createDevice(formData);
      }
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save IoT device details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#151C2C] border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                {device?.id ? 'Edit IoT Device' : 'Register New IoT Device'}
              </h3>
              <p className="text-xs text-slate-400 font-mono">Asset Management Registry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-lg text-xs text-rose-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Device Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Smart-Camera-05"
              value={formData.device_name}
              onChange={(e) => setFormData({ ...formData, device_name: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Device Type</label>
            <select
              value={formData.device_type}
              onChange={(e) => setFormData({ ...formData, device_type: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="Smart Camera">Smart Camera</option>
              <option value="Smart Sensor">Smart Sensor</option>
              <option value="Smart Router">Smart Router</option>
              <option value="Smart Thermostat">Smart Thermostat</option>
              <option value="Smart Lock">Smart Lock</option>
              <option value="IoT Gateway">IoT Gateway</option>
              <option value="Medical IoT">Medical IoT</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">IP Address</label>
              <input
                type="text"
                required
                placeholder="192.168.1.100"
                value={formData.ip_address}
                onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">MAC Address</label>
              <input
                type="text"
                required
                placeholder="00:1A:2B:3C:4D:5E"
                value={formData.mac_address}
                onChange={(e) => setFormData({ ...formData, mac_address: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Manufacturer</label>
            <input
              type="text"
              placeholder="e.g. Hikvision, Cisco, Bosch"
              value={formData.manufacturer}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-lg shadow-cyan-950/50"
            >
              {loading ? 'Saving...' : device?.id ? 'Save Changes' : 'Register Device'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeviceModal;
