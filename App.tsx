
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, DollarSign, FileText, ShoppingBag, Factory, Database, Menu, X, Hexagon, AlertTriangle, LogOut, Shield, Brain } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Finance from './pages/Finance';
import Budgets from './pages/Budgets';
import Orders from './pages/Orders';
import Production from './pages/Production';
import MasterData from './pages/MasterData';
import Intelligence from './pages/Intelligence';
import Login from './pages/Login';
import { checkConnection } from './services/supabase';
import { authService } from './services/auth';
import { storageService } from './services/storage';
import { UserProfile, CompanyProfile } from './types';

type View = 'dashboard' | 'finance' | 'budgets' | 'orders' | 'production' | 'masterdata' | 'intelligence' | 'login';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<{ success: boolean; message?: string } | null>(null);
  
  // Search state to pass between views
  const [autoSearchTerm, setAutoSearchTerm] = useState<string>('');

  useEffect(() => {
    checkSession();
    checkConnection().then(setConnectionStatus);
    loadCompanyProfile();
  }, []);

  const loadCompanyProfile = async () => {
      const profile = await storageService.getCompanyProfile();
      setCompanyProfile(profile);
  };

  const checkSession = async () => {
      setIsAuthLoading(true);
      try {
          const profile = await authService.getCurrentProfile();
          if (profile) {
              setUserProfile(profile);
              setIsAuthenticated(true);
              // Set initial view based on role
              if (currentView === 'login') {
                setCurrentView(profile.role === 'factory' ? 'production' : 'dashboard');
              }
          } else {
              setIsAuthenticated(false);
              setCurrentView('login');
          }
      } catch (e) {
          console.error("Session Check Failed", e);
          setIsAuthenticated(false);
          setCurrentView('login');
      } finally {
          setIsAuthLoading(false);
      }
  };

  const handleLogout = async () => {
      await authService.signOut();
      setIsAuthenticated(false);
      setUserProfile(null);
      setCurrentView('login');
  };

  const handleNavigate = (view: View, searchTerm?: string) => {
      // Security check on navigation
      if (userProfile?.role === 'factory' && view !== 'production') {
          return; // Block navigation for factory users
      }
      setCurrentView(view);
      if (searchTerm) {
          setAutoSearchTerm(searchTerm);
      }
  };

  const getRoleLabel = (role?: string) => {
      if (role === 'admin') return 'ADMINISTRADOR';
      if (role === 'manager') return 'GERENTE';
      if (role === 'factory') return 'OPERADOR';
      return 'COLABORADOR';
  };

  // --- RENDER CONTENT ---
  const renderContent = () => {
      // Factory Restriction
      if (userProfile?.role === 'factory' && currentView !== 'production') {
          return <Production onNavigate={undefined} />;
      }

      switch (currentView) {
          case 'dashboard': return <Dashboard onNavigate={handleNavigate} />;
          case 'finance': return <Finance onNavigate={handleNavigate} />;
          case 'budgets': 
              return <Budgets 
                        onNavigate={handleNavigate} 
                        initialSearch={autoSearchTerm} 
                        clearSearch={() => setAutoSearchTerm('')} 
                      />;
          case 'orders': 
              return <Orders 
                        onNavigate={handleNavigate} 
                        initialSearch={autoSearchTerm} 
                        clearSearch={() => setAutoSearchTerm('')} 
                      />;
          case 'production': return <Production onNavigate={handleNavigate} />;
          case 'intelligence': return <Intelligence />;
          case 'masterdata': return <MasterData onProfileUpdate={loadCompanyProfile} />;
          default: return <Dashboard onNavigate={handleNavigate} />;
      }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: View, icon: any, label: string }) => {
    const isActive = currentView === view;
    return (
        <button
          onClick={() => handleNavigate(view)}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all border-l-2
            ${isActive ? 'bg-zinc-800 border-gold-500 text-gold-500' : 'border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-slate-200 hover:border-zinc-700'}`}
        >
          <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
          {isSidebarOpen && <span className="tracking-wide">{label}</span>}
        </button>
    );
  };

  // --- LAYOUTS ---
  
  if (isAuthLoading) {
      return (
          <div className="h-screen bg-zinc-950 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                  <Hexagon className="text-gold-500 animate-pulse" size={48} />
                  <p className="text-zinc-500 text-xs font-mono uppercase">Carregando Sistema...</p>
              </div>
          </div>
      );
  }

  if (!isAuthenticated || currentView === 'login') {
      return <Login onLoginSuccess={() => { checkSession(); loadCompanyProfile(); }} />;
  }

  // FACTORY LAYOUT
  if (userProfile?.role === 'factory') {
      return (
        <div className="h-screen bg-zinc-950 text-slate-200 flex flex-col">
          <header className="h-16 bg-zinc-900 border-b border-zinc-800 px-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                  {companyProfile?.logoUrl ? (
                      <img src={companyProfile.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
                  ) : (
                      <Factory className="text-gold-500" />
                  )}
                  <h1 className="font-bold text-white tracking-widest uppercase">
                      {companyProfile?.name || 'MODO FÁBRICA'}
                  </h1>
              </div>
              <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                      <p className="text-xs font-bold text-white">{userProfile?.full_name || 'OPERADOR'}</p>
                      <p className="text-[10px] text-zinc-500 uppercase bg-zinc-950 px-1 rounded inline-block border border-zinc-800">Fábrica</p>
                  </div>
                  <button onClick={handleLogout} className="bg-zinc-800 hover:bg-red-900/30 text-white p-2 rounded-sm border border-zinc-700 hover:border-red-800 transition-colors" title="Sair">
                      <LogOut size={18} />
                  </button>
              </div>
          </header>
          <main className="flex-1 overflow-hidden relative">
              <Production onNavigate={undefined} />
          </main>
      </div>
      );
  }

  // ADMIN / MANAGER LAYOUT
  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden text-slate-200">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-zinc-950 border-r border-zinc-800 flex flex-col transition-all duration-300 z-20 print:hidden`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800 bg-zinc-950">
          {isSidebarOpen ? (
            <div className="flex items-center gap-3 overflow-hidden">
               {companyProfile?.logoUrl ? (
                   <img src={companyProfile.logoUrl} alt="Logo" className="w-8 h-8 object-contain shrink-0" />
               ) : (
                   <Hexagon className="text-gold-500 fill-gold-500/10 shrink-0" size={24} />
               )}
               <h1 className="text-lg font-bold text-white tracking-wider truncate">
                   {companyProfile?.name?.toUpperCase() || 'BOTEZINI'}
               </h1>
            </div>
          ) : (
             <div className="mx-auto">
                 {companyProfile?.logoUrl ? (
                   <img src={companyProfile.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
                 ) : (
                   <Hexagon className="text-gold-500" size={24} />
                 )}
             </div>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-zinc-500 hover:text-white shrink-0">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 py-6 space-y-1">
          <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem view="intelligence" icon={Brain} label="Inteligência" />
          <NavItem view="finance" icon={DollarSign} label="Financeiro" />
          <NavItem view="budgets" icon={FileText} label="Orçamentos" />
          <NavItem view="orders" icon={ShoppingBag} label="Pedidos" />
          <NavItem view="production" icon={Factory} label="Fábrica" />
          <NavItem view="masterdata" icon={Database} label="Cadastros" />
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'} mb-4`}>
            <div className={`w-9 h-9 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs ${userProfile?.role === 'admin' ? 'text-gold-500' : 'text-blue-500'}`}>
              {userProfile?.role === 'admin' ? 'AD' : 'MG'}
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate" title={userProfile?.email}>
                    {userProfile?.full_name || getRoleLabel(userProfile?.role)}
                </p>
                <p className="text-xs text-zinc-500 uppercase">{userProfile?.role}</p>
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-red-900/20 text-zinc-400 hover:text-red-400 py-2 rounded-sm border border-zinc-800 transition-colors text-xs font-bold uppercase ${!isSidebarOpen && 'px-0'}`}
          >
            <LogOut size={16} /> {isSidebarOpen && 'Sair'}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-zinc-950 relative">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        <header className="h-16 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-8 print:hidden z-10">
          <h2 className="text-xl font-semibold text-slate-100 uppercase tracking-widest text-sm flex items-center gap-2">
              {currentView === 'masterdata' ? 'Cadastros' : currentView.charAt(0).toUpperCase() + currentView.slice(1)}
              {connectionStatus?.success && <span title="Conexão Segura"><Shield size={14} className="text-emerald-500" /></span>}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-zinc-500 border border-zinc-800 px-3 py-1 rounded bg-zinc-900">SECURE MODE ON</span>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 print:p-0 print:overflow-visible z-10">
           {renderContent()}
        </div>

        {connectionStatus && !connectionStatus.success && (
           <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-red-950/90 border border-red-800 text-red-200 text-xs font-bold py-3 px-6 z-50 flex items-center justify-center gap-3 rounded-sm shadow-xl animate-in slide-in-from-bottom-5">
              <AlertTriangle size={16} className="text-red-500" />
              <span>ERRO DE SEGURANÇA: {connectionStatus.message}</span>
           </div>
        )}
      </main>
    </div>
  );
};

export default App;
