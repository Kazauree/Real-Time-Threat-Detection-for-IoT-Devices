import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import LiveTraffic from './pages/LiveTraffic';
import Threats from './pages/Threats';
import Analytics from './pages/Analytics';
import MachineLearning from './pages/MachineLearning';
import Reports from './pages/Reports';
import SecurityLogs from './pages/SecurityLogs';

const MainContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [showLogin, setShowLogin] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center text-cyan-400 font-mono text-sm">
        Initializing IoT Cybersecurity Monitoring Platform...
      </div>
    );
  }

  if (!isAuthenticated) {
    return showLogin ? <Login /> : <Welcome onGetStarted={() => setShowLogin(true)} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard onNavigate={(page) => setActivePage(page)} />;
      case 'devices':
        return <Devices />;
      case 'traffic':
        return <LiveTraffic />;
      case 'threats':
        return <Threats />;
      case 'analytics':
        return <Analytics />;
      case 'ml':
        return <MachineLearning />;
      case 'reports':
        return <Reports />;
      case 'logs':
        return <SecurityLogs />;
      default:
        return <Dashboard onNavigate={(page) => setActivePage(page)} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0B0F17]">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar activePage={activePage} />
        <main className="p-6 flex-1 max-w-7xl w-full mx-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <MainContent />
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
