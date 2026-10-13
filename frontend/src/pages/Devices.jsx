import React, { useState, useEffect } from 'react';
import { Cpu, Search, Plus, Edit, Trash2, Shield, RefreshCw } from 'lucide-react';
import { devicesAPI } from '../services/api';
import SeverityBadge from '../components/SeverityBadge';
import DeviceModal from '../components/DeviceModal';

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, [search, typeFilter, riskFilter]);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await devicesAPI.getDevices({
        search,
        type: typeFilter,
        risk: riskFilter,
      });
      setDevices(res.data);
    } catch (e) {
      console.error('Failed to fetch devices:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this IoT device record?')) {
      try {
        await devicesAPI.deleteDevice(id);
        fetchDevices();
      } catch (e) {
        console.error('Delete device failed:', e);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#151C2C] border border-slate-800 p-5 rounded-xl">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" /> Monitored IoT Device Assets
          </h3>
          <p className="text-xs text-slate-400 font-mono">Registered hardware sensors & gateways</p>
        </div>

        <button
          onClick={() => {
            setSelectedDevice(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition shadow-lg shadow-cyan-950/50"
        >
          <Plus className="w-4 h-4" /> Register New Device
        </button>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by device name, IP address, or MAC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#151C2C] border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-[#151C2C] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
        >
          <option value="">All Device Types</option>
          <option value="Smart Camera">Smart Camera</option>
          <option value="Smart Sensor">Smart Sensor</option>
          <option value="Smart Router">Smart Router</option>
          <option value="Smart Thermostat">Smart Thermostat</option>
          <option value="Smart Lock">Smart Lock</option>
          <option value="IoT Gateway">IoT Gateway</option>
        </select>

        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="bg-[#151C2C] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
        >
          <option value="">All Risk Levels</option>
          <option value="SAFE">SAFE</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
          <option value="CRITICAL">CRITICAL</option>
        </select>
      </div>

      {/* Devices Table */}
      <div className="bg-[#151C2C] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <th className="py-3 px-4">Device Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">MAC Address</th>
                <th className="py-3 px-4">Manufacturer</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500">
                    Loading asset registry...
                  </td>
                </tr>
              ) : devices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500">
                    No IoT devices found matching search criteria.
                  </td>
                </tr>
              ) : (
                devices.map((dev) => (
                  <tr key={dev.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 text-slate-100 font-semibold">{dev.device_name}</td>
                    <td className="py-3 px-4 text-slate-400">{dev.device_type}</td>
                    <td className="py-3 px-4 text-cyan-400">{dev.ip_address}</td>
                    <td className="py-3 px-4 text-slate-400">{dev.mac_address}</td>
                    <td className="py-3 px-4 text-slate-400">{dev.manufacturer}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                        dev.status === 'Online' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30' : 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dev.status === 'Online' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                        {dev.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <SeverityBadge severity={dev.risk_level} />
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedDevice(dev);
                          setShowModal(true);
                        }}
                        className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-cyan-400 transition"
                        title="Edit Device"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(dev.id)}
                        className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-rose-400 transition"
                        title="Delete Device"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <DeviceModal
          device={selectedDevice}
          onClose={() => setShowModal(false)}
          onSaved={fetchDevices}
        />
      )}
    </div>
  );
};

export default Devices;
