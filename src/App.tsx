import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { MenuItem, Reservation, ReservationStatus } from './types';
import { INITIAL_DEMO_MENU, MenuItemData } from './data/demoMenu';
import { Navbar, ActivePage } from './components/Navbar';
import { Home } from './pages/Home';
import { Menu } from './pages/Menu';
import { Reserve } from './pages/Reserve';
import { Contact } from './pages/Contact';
import { AIChatbot } from './components/AIChatbot';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { WelcomeOverlay } from './components/WelcomeOverlay';
import { GlobalFoodBackdrop } from './components/GlobalFoodBackdrop';
import { adminFetch, apiUrl } from './services/api';

function MiniKitchenMain() {
  const location = useLocation();
  const navigate = useNavigate();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  // Welcome page animation state (always show on fresh visit)
  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    const hasSeen = sessionStorage.getItem('mk_welcome_dismissed');
    return !hasSeen;
  });

  // Modals & Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Admin authentication state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('mk_admin_token'));
  });
  const [adminUser, setAdminUser] = useState<{ username: string; name: string; role: string } | null>(() => {
    const raw = localStorage.getItem('mk_admin_user');
    return raw ? JSON.parse(raw) : null;
  });

  // Calculate current activePage & view from URL
  const pathname = location.pathname;
  let activePage: ActivePage = 'home';
  if (pathname.startsWith('/menu')) activePage = 'menu';
  else if (pathname.startsWith('/reserve') || pathname.startsWith('/reservations')) activePage = 'reserve';
  else if (pathname.startsWith('/contact')) activePage = 'contact';

  const currentView: 'public' | 'admin' = pathname.startsWith('/admin') ? 'admin' : 'public';

  // Fetch initial data from server
  const loadData = useCallback(async () => {
    try {
      const hasAdminToken = Boolean(localStorage.getItem('mk_admin_token'));
      const [menuRes, resRes] = await Promise.all([
        fetch(apiUrl('/api/menu')),
        hasAdminToken ? adminFetch('/api/reservations') : Promise.resolve(null),
      ]);

      if (menuRes.ok) {
        const menuData = await menuRes.json();
        setMenuItems(menuData);
      }

      if (resRes?.ok) {
        const reservationsData = await resRes.json();
        setReservations(reservationsData);
      }
    } catch (err) {
      console.error('Failed to load restaurant data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const handleExpiredAdminSession = () => {
      setIsAdminLoggedIn(false);
      setAdminUser(null);
      setReservations([]);
      if (location.pathname.startsWith('/admin')) {
        navigate('/admin/login', { replace: true });
      }
    };

    window.addEventListener('mk-admin-session-expired', handleExpiredAdminSession);
    return () => window.removeEventListener('mk-admin-session-expired', handleExpiredAdminSession);
  }, [location.pathname, navigate]);

  // Handler: Update Reservation Status (Pending -> Confirmed, etc.)
  const handleUpdateReservationStatus = async (id: string, status: ReservationStatus) => {
    const previousStatus = reservations.find((reservation) => reservation.id === id)?.status;
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );

    try {
      const res = await adminFetch(`/api/reservations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error('Failed to update reservation status.');
      const updated = await res.json();
      setReservations((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (err) {
      if (previousStatus) {
        setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status: previousStatus } : r)));
      }
      console.error('Error persisting reservation status:', err);
      throw err;
    }
  };

  // Handler: Delete Reservation
  const handleDeleteReservation = async (id: string) => {
    const deletedReservation = reservations.find((reservation) => reservation.id === id);
    setReservations((prev) => prev.filter((r) => r.id !== id));

    try {
      const res = await adminFetch(`/api/reservations/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete reservation.');
    } catch (err) {
      console.error('Error deleting reservation on server:', err);
      if (deletedReservation) setReservations((prev) => [deletedReservation, ...prev]);
      throw err;
    }
  };

  // Handler: Fast Toggle Menu Item Availability
  const handleToggleAvailability = async (id: string) => {
    const previousAvailability = menuItems.find((item) => item.id === id)?.isAvailable;
    // 1. Optimistically toggle local state immediately
    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isAvailable: !item.isAvailable } : item))
    );

    try {
      const res = await adminFetch(`/api/menu/${id}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!res.ok) throw new Error('Failed to update menu availability.');
      const updatedItem = await res.json();
      setMenuItems((prev) => prev.map((item) => (item.id === id ? updatedItem : item)));
    } catch (err) {
      console.error('Error persisting availability toggle:', err);
      if (previousAvailability !== undefined) {
        setMenuItems((prev) => prev.map((item) => (item.id === id ? { ...item, isAvailable: previousAvailability } : item)));
      }
      throw err;
    }
  };

  // Handler: Add or Edit Menu Item
  const handleSaveMenuItem = async (itemData: Partial<MenuItem>, editId?: string) => {
    try {
      const url = editId ? `/api/menu/${editId}` : '/api/menu';
      const method = editId ? 'PUT' : 'POST';

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });

      if (!res.ok) throw new Error('Failed to save menu item');
      const savedItem = await res.json();

      if (editId) {
        setMenuItems((prev) =>
          prev.map((item) => (item.id === editId ? savedItem : item))
        );
      } else {
        setMenuItems((prev) => [...prev, savedItem]);
      }
    } catch (err) {
      console.error('Error saving menu item:', err);
      throw err;
    }
  };

  // Handler: Delete Menu Item
  const handleDeleteMenuItem = async (id: string) => {
    const deletedItem = menuItems.find((item) => item.id === id);
    setMenuItems((prev) => prev.filter((item) => item.id !== id));

    try {
      const res = await adminFetch(`/api/menu/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete menu item.');
    } catch (err) {
      console.error('Error deleting menu item on server:', err);
      if (deletedItem) setMenuItems((prev) => [...prev, deletedItem]);
      throw err;
    }
  };

  // Handler: New Reservation created via Website or AI Chatbot
  const handleReservationCreated = (newRes: Reservation) => {
    setReservations((prev) => [newRes, ...prev.filter((r) => r.id !== newRes.id)]);
  };

  // Admin Login Handler
  const handleLoginSuccess = (admin: { username: string; name: string; role: string }) => {
    setIsAdminLoggedIn(true);
    setAdminUser(admin);
    setIsAdminModalOpen(false);
    void loadData();
    navigate('/admin/dashboard');
  };

  // Admin Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('mk_admin_token');
    localStorage.removeItem('mk_admin_user');
    setIsAdminLoggedIn(false);
    setAdminUser(null);
    setReservations([]);
    navigate('/');
  };

  const handleOpenAdmin = () => {
    if (isAdminLoggedIn) {
      navigate('/admin/dashboard');
    } else {
      navigate('/admin/login');
    }
  };

  const handleExplore = () => {
    setShowWelcome(false);
    sessionStorage.setItem('mk_welcome_dismissed', 'true');
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReserveWelcome = () => {
    setShowWelcome(false);
    sessionStorage.setItem('mk_welcome_dismissed', 'true');
    navigate('/reservations');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    sessionStorage.setItem('mk_welcome_dismissed', 'true');
  };

  const handleReplayWelcome = () => {
    setShowWelcome(true);
  };

  const handleNavigation = (page: ActivePage) => {
    if (page === 'home') navigate('/');
    else if (page === 'reserve') navigate('/reservations');
    else navigate(`/${page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pendingReservationsCount = reservations.filter((r) => r.status === 'Pending').length;

  // Sync menu items from live server or fallback demo items
  const activeMenuData: MenuItemData[] = menuItems.length > 0
    ? menuItems.map((m) => ({
        id: m.id,
        name: m.name,
        category: m.category,
        description: m.description,
        price: m.price,
        isAvailable: m.isAvailable,
        image: m.image || '',
        dietaryTags: m.dietaryTags,
      }))
    : INITIAL_DEMO_MENU;

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col font-sans selection:bg-[#D4A43C]/20 selection:text-[#F5B82E]">
      <GlobalFoodBackdrop />

      {/* Cinematic Welcome Page Animation with Floating Food Elements */}
      <WelcomeOverlay
        isOpen={showWelcome}
        onExplore={handleExplore}
        onReserve={handleReserveWelcome}
        onClose={handleCloseWelcome}
      />

      {/* Top Navbar - only show on public pages */}
      {!pathname.startsWith('/admin') && (
        <Navbar
          currentView={currentView}
          setCurrentView={(view) => {
            if (view === 'admin') navigate('/admin/dashboard');
            else navigate('/');
          }}
          activePage={activePage}
          setActivePage={handleNavigation}
          openAdminModal={handleOpenAdmin}
          isAdminLoggedIn={isAdminLoggedIn}
          pendingCount={pendingReservationsCount}
          onReplayWelcome={handleReplayWelcome}
        />
      )}

      {/* Real Multi-Page Route Outlet */}
      <Routes>
        {/* 1. Dedicated Homepage */}
        <Route
          path="/"
          element={
            <main className="flex-1">
              <Home
                popularMenuData={activeMenuData}
                onOpenAdmin={handleOpenAdmin}
                onOpenChat={() => setIsChatOpen(true)}
                onNavigateMenu={() => handleNavigation('menu')}
                onNavigateReserve={() => handleNavigation('reserve')}
                onNavigate={handleNavigation}
                onReplayWelcome={handleReplayWelcome}
              />
            </main>
          }
        />

        {/* 2. Dedicated Menu Page */}
        <Route
          path="/menu"
          element={
            <main className="flex-1">
              <Menu
                menuItems={activeMenuData}
                loading={loading}
                onRefresh={loadData}
                onOpenAdmin={handleOpenAdmin}
                onOpenChat={() => setIsChatOpen(true)}
                onNavigate={handleNavigation}
              />
            </main>
          }
        />

        {/* 3. Dedicated Table Reservation Page (matches both /reservations and /reserve) */}
        <Route
          path="/reservations"
          element={
            <main className="flex-1">
              <Reserve
                onReservationSubmitted={handleReservationCreated}
                onOpenAdmin={handleOpenAdmin}
                onOpenChat={() => setIsChatOpen(true)}
                onNavigate={handleNavigation}
              />
            </main>
          }
        />
        <Route path="/reserve" element={<Navigate to="/reservations" replace />} />

        {/* 4. Dedicated Contact Us Page */}
        <Route
          path="/contact"
          element={
            <main className="flex-1">
              <Contact
                onOpenAdmin={handleOpenAdmin}
                onOpenChat={() => setIsChatOpen(true)}
                onNavigate={handleNavigation}
              />
            </main>
          }
        />

        {/* 5. Dedicated Admin Login Route */}
        <Route
          path="/admin/login"
          element={
            <main className="flex-1 flex items-center justify-center min-h-[70vh] p-4 bg-[#0D0D0D]">
              <AdminLoginModal
                isOpen={true}
                onClose={() => navigate('/')}
                onLoginSuccess={handleLoginSuccess}
              />
            </main>
          }
        />

        {/* 6. Admin Routes Specified in Assignment */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        
        <Route
          path="/admin/dashboard"
          element={
            isAdminLoggedIn ? (
              <AdminDashboard
                activeTab="dashboard"
                reservations={reservations}
                menuItems={menuItems}
                onUpdateReservationStatus={handleUpdateReservationStatus}
                onDeleteReservation={handleDeleteReservation}
                onToggleAvailability={handleToggleAvailability}
                onSaveMenuItem={handleSaveMenuItem}
                onDeleteMenuItem={handleDeleteMenuItem}
                onRefreshData={loadData}
                onLogout={handleLogout}
                onSwitchToPublic={() => navigate('/')}
                openChat={() => setIsChatOpen(true)}
                adminUser={adminUser}
              />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />

        <Route
          path="/admin/reservations"
          element={
            isAdminLoggedIn ? (
              <AdminDashboard
                activeTab="reservations"
                reservations={reservations}
                menuItems={menuItems}
                onUpdateReservationStatus={handleUpdateReservationStatus}
                onDeleteReservation={handleDeleteReservation}
                onToggleAvailability={handleToggleAvailability}
                onSaveMenuItem={handleSaveMenuItem}
                onDeleteMenuItem={handleDeleteMenuItem}
                onRefreshData={loadData}
                onLogout={handleLogout}
                onSwitchToPublic={() => navigate('/')}
                openChat={() => setIsChatOpen(true)}
                adminUser={adminUser}
              />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />

        <Route
          path="/admin/menu"
          element={
            isAdminLoggedIn ? (
              <AdminDashboard
                activeTab="menu"
                reservations={reservations}
                menuItems={menuItems}
                onUpdateReservationStatus={handleUpdateReservationStatus}
                onDeleteReservation={handleDeleteReservation}
                onToggleAvailability={handleToggleAvailability}
                onSaveMenuItem={handleSaveMenuItem}
                onDeleteMenuItem={handleDeleteMenuItem}
                onRefreshData={loadData}
                onLogout={handleLogout}
                onSwitchToPublic={() => navigate('/')}
                openChat={() => setIsChatOpen(true)}
                adminUser={adminUser}
              />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />

        <Route
          path="/admin/settings"
          element={
            isAdminLoggedIn ? (
              <AdminDashboard
                activeTab="settings"
                reservations={reservations}
                menuItems={menuItems}
                onUpdateReservationStatus={handleUpdateReservationStatus}
                onDeleteReservation={handleDeleteReservation}
                onToggleAvailability={handleToggleAvailability}
                onSaveMenuItem={handleSaveMenuItem}
                onDeleteMenuItem={handleDeleteMenuItem}
                onRefreshData={loadData}
                onLogout={handleLogout}
                onSwitchToPublic={() => navigate('/')}
                openChat={() => setIsChatOpen(true)}
                adminUser={adminUser}
              />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />

        <Route
          path="/admin/inquiries"
          element={
            isAdminLoggedIn ? (
              <AdminDashboard
                activeTab="inquiries"
                reservations={reservations}
                menuItems={menuItems}
                onUpdateReservationStatus={handleUpdateReservationStatus}
                onDeleteReservation={handleDeleteReservation}
                onToggleAvailability={handleToggleAvailability}
                onSaveMenuItem={handleSaveMenuItem}
                onDeleteMenuItem={handleDeleteMenuItem}
                onRefreshData={loadData}
                onLogout={handleLogout}
                onSwitchToPublic={() => navigate('/')}
                openChat={() => setIsChatOpen(true)}
                adminUser={adminUser}
              />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />

        {/* Fallback to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Floating AI Chatbot Concierge Widget on Public Pages */}
      {currentView === 'public' && (
        <AIChatbot
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          onOpen={() => setIsChatOpen(true)}
          onReservationCreated={handleReservationCreated}
        />
      )}

      {/* Admin Login Modal (Triggered from Navbar) */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MiniKitchenMain />
    </BrowserRouter>
  );
}
