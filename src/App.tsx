import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Users from './components/Users';
import Categories from './components/Categories';
import HomeBanner from './components/HomeBanner';
import PremiumBanner from './components/PremiumBanner';
import TopData from './components/TopData';
import TeraLink from './components/TeraLink';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'categories' | 'users' | 'home-banners' | 'premium-banners' | 'top-data' | 'tera-link'>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <Users />;
      case 'categories':
        return <Categories />;
      case 'home-banners':
        return <HomeBanner />;
      case 'premium-banners':
        return <PremiumBanner />;
      case 'top-data':
        return <TopData />;
      case 'tera-link':
        return <TeraLink />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;