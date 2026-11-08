import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  UtensilsCrossed,
  Settings,
  LogOut,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Edit2,
  Trash2,
  CalendarDays,
  ArrowRight,
  Globe,
  Bot,
  RefreshCw,
  Search,
  MessageSquare,
  AlertTriangle,
  Armchair,
  Save,
  RotateCcw,
  Check,
  ShoppingBag,
} from 'lucide-react';
import { MenuItem, Reservation, ReservationStatus, RestaurantInfo } from '../types';
import { MenuItemModal } from './MenuItemModal';
import { LOGO_URL } from './Navbar';
import { adminFetch, apiUrl } from '../services/api';
import { motion } from 'motion/react';
import { restaurantImageUrl } from '../utils/restaurantImage';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: string;
}

interface ConfirmModalData {
  isOpen: boolean;
  type: 'delete_reservation' | 'delete_menu' | 'reset_db';
  id: string;
  name?: string;
  title: string;
  description: string;
  confirmLabel: string;
  isDestructive: boolean;
}

interface AdminDashboardProps {
  activeTab?: 'dashboard' | 'reservations' | 'menu' | 'inquiries' | 'settings';
  reservations: Reservation[];
  menuItems: MenuItem[];
  onUpdateReservationStatus: (id: string, status: ReservationStatus) => Promise<void>;
  onDeleteReservation: (id: string) => Promise<void>;
  onToggleAvailability: (id: string) => Promise<void>;
  onSaveMenuItem: (item: Partial<MenuItem>, editId?: string) => Promise<void>;
  onDeleteMenuItem: (id: string) => Promise<void>;
  onRefreshData: () => Promise<void>;
  onLogout: () => void;
  onSwitchToPublic: () => void;
  openChat: () => void;
  adminUser?: { username: string; name: string; role: string } | null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  activeTab,
  reservations,
  menuItems,
  onUpdateReservationStatus,
  onDeleteReservation,
  onToggleAvailability,
  onSaveMenuItem,
  onDeleteMenuItem,
  onRefreshData,
  onLogout,
  onSwitchToPublic,
  openChat,
  adminUser,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Resolve active nav tab from prop or URL
  const resolveActiveNav = (): 'dashboard' | 'reservations' | 'menu' | 'inquiries' | 'settings' => {
    if (activeTab) return activeTab;
    const p = location.pathname;
    if (p.includes('/reservations')) return 'reservations';
    if (p.includes('/menu')) return 'menu';
    if (p.includes('/settings')) return 'settings';
    if (p.includes('/inquiries')) return 'inquiries';
    return 'dashboard';
  };

  const activeNav = resolveActiveNav();

  const handleNavClick = (tab: 'dashboard' | 'reservations' | 'menu' | 'inquiries' | 'settings') => {
    navigate(`/admin/${tab}`);
  };

  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);

  // Searches & Filters
  const [reservationSearch, setReservationSearch] = useState('');
  const [resStatusFilter, setResStatusFilter] = useState<string>('All');
  const [menuSearch, setMenuSearch] = useState('');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState<string>('All');

  // Contact messages
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);

  // Restaurant settings state
  const [restaurantSettings, setRestaurantSettings] = useState<RestaurantInfo | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Confirmation Modal state (pure serializable data)
  const [confirmModal, setConfirmModal] = useState<ConfirmModalData>({
    isOpen: false,
    type: 'delete_reservation',
    id: '',
    name: '',
    title: '',
    description: '',
    confirmLabel: 'Confirm',
    isDestructive: true,
  });
  const [isProcessingModal, setIsProcessingModal] = useState(false);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  // Load contact messages & restaurant info on mount
  useEffect(() => {
    adminFetch('/api/contact')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setContactMessages(data))
      .catch(() => {});

    fetch(apiUrl('/api/restaurant'))
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setRestaurantSettings(data);
      })
      .catch(() => {});
  }, []);

  // Metrics (Section 3: 6 Recommended Dashboard Cards)
  const totalReservations = reservations.length;
  const pendingCount = reservations.filter((r) => r.status === 'Pending').length;
  const confirmedCount = reservations.filter((r) => r.status === 'Confirmed').length;
  const rejectedCount = reservations.filter((r) => r.status === 'Rejected' || r.status === 'Cancelled').length;
  const seatedCount = reservations.filter((r) => r.status === 'Seated').length;
  const totalMenuItems = menuItems.length;
  const availableMenuItems = menuItems.filter((m) => m.isAvailable).length;

  // Reservation Status Operations (with instant feedback)
  const handleConfirmReservation = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      await onUpdateReservationStatus(id, 'Confirmed');
      showToast('Reservation confirmed!');
    } catch {
      showToast('Could not confirm reservation. Please log in again and retry.');
    }
  };

  const handleRejectReservation = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      await onUpdateReservationStatus(id, 'Rejected');
      showToast('Reservation rejected.');
    } catch {
      showToast('Could not reject reservation. Please log in again and retry.');
    }
  };

  const handleSeatReservation = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      await onUpdateReservationStatus(id, 'Seated');
      showToast('Table seated.');
    } catch {
      showToast('Could not update table status. Please log in again and retry.');
    }
  };

  const handleReinstateReservation = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      await onUpdateReservationStatus(id, 'Pending');
      showToast('Reservation restored to Pending.');
    } catch {
      showToast('Could not restore reservation. Please log in again and retry.');
    }
  };

  // Safe In-App Delete Modals
  const requestDeleteReservation = (id: string, customerName: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setConfirmModal({
      isOpen: true,
      type: 'delete_reservation',
      id,
      name: customerName,
      title: 'Delete Reservation',
      description: `Are you sure you want to delete the reservation for "${customerName}"? This record will be permanently removed.`,
      confirmLabel: 'Delete Record',
      isDestructive: true,
    });
  };

  const requestDeleteMenuItem = (id: string, name: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setConfirmModal({
      isOpen: true,
      type: 'delete_menu',
      id,
      name,
      title: 'Remove Menu Item',
      description: `Are you sure you want to remove "${name}" from the menu? It will disappear from both the public site and kitchen catalog.`,
      confirmLabel: 'Delete Dish',
      isDestructive: true,
    });
  };

  const requestResetDatabase = () => {
    setConfirmModal({
      isOpen: true,
      type: 'reset_db',
      id: 'reset',
      name: 'Database',
      title: 'Reset Database to Seed Data',
      description:
        'This will reset the entire menu, reservations, and restaurant details back to initial demonstration values. All custom modifications will be overwritten.',
      confirmLabel: 'Reset Everything',
      isDestructive: true,
    });
  };

  // Execution of Confirmation Action
  const handleExecuteModalAction = async () => {
    setIsProcessingModal(true);
    try {
      if (confirmModal.type === 'delete_reservation') {
        await onDeleteReservation(confirmModal.id);
        showToast('Reservation deleted.');
      } else if (confirmModal.type === 'delete_menu') {
        await onDeleteMenuItem(confirmModal.id);
        showToast(`"${confirmModal.name || 'Dish'}" removed from menu.`);
      } else if (confirmModal.type === 'reset_db') {
        const res = await adminFetch('/api/seed/reset', { method: 'POST' });
        if (res.ok) {
          await onRefreshData();
          const restRes = await fetch(apiUrl('/api/restaurant'));
          if (restRes.ok) setRestaurantSettings(await restRes.json());
          showToast('Database reset to defaults.');
        }
      }
    } catch (err) {
      console.error('Failed to execute confirm action:', err);
      showToast('Action finished.');
    } finally {
      setIsProcessingModal(false);
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    }
  };

  const handleToggleAvail = async (id: string, name: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const item = menuItems.find((m) => m.id === id);
    const newState = !item?.isAvailable;
    await onToggleAvailability(id);
    showToast(`"${name}" is now ${newState ? 'Available' : 'Not Available'}.`);
  };

  const handleSaveModal = async (itemData: Partial<MenuItem>) => {
    await onSaveMenuItem(itemData, editingMenuItem?.id);
    showToast(editingMenuItem ? 'Menu item updated.' : 'New menu item created.');
  };

  // Save Restaurant Settings
  const handleSaveRestaurantSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantSettings) return;
    setIsSavingSettings(true);
    try {
      const res = await adminFetch('/api/restaurant', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(restaurantSettings),
      });
      if (!res.ok) throw new Error('Failed to update settings');
      const updated = await res.json();
      setRestaurantSettings(updated);
      showToast('Restaurant settings saved successfully.');
    } catch {
      showToast('Failed to save settings.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Filtered Reservations
  const filteredReservations = reservations.filter((r) => {
    const matchesSearch =
      r.customerName.toLowerCase().includes(reservationSearch.toLowerCase()) ||
      r.contactPhone.toLowerCase().includes(reservationSearch.toLowerCase()) ||
      (r.bookingReference?.toLowerCase().includes(reservationSearch.toLowerCase()) ?? false) ||
      r.reservationDate.includes(reservationSearch) ||
      (r.specialRequests && r.specialRequests.toLowerCase().includes(reservationSearch.toLowerCase()));

    const matchesStatus =
      resStatusFilter === 'All'
        ? true
        : resStatusFilter === 'Rejected'
        ? r.status === 'Rejected' || r.status === 'Cancelled'
        : r.status.toLowerCase() === resStatusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Filtered Menu Items
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(menuSearch.toLowerCase());

    const matchesCategory =
      menuCategoryFilter === 'All' ? true : item.category.toLowerCase() === menuCategoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Burgers', 'Pasta', 'Chicken', 'Wraps', 'Sides', 'Drinks', 'Desserts'];

  return (
    <div className="min-h-screen bg-[#F4EFEA] text-stone-900 flex font-sans selection:bg-[#F5B82E]/30 selection:text-stone-950">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl bg-[#141210] border border-[#F5B82E]/40 text-[#F5B82E] font-bold text-xs sm:text-sm shadow-2xl flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-[#F5B82E] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* LEFT SIDEBAR (Matching Section 8 Recommended Sidebar) */}
      {/* ------------------------------------------------------------- */}
      <aside className="w-64 bg-[#141210] text-stone-200 flex flex-col justify-between shrink-0 min-h-screen border-r border-stone-800 hidden md:flex sticky top-0 h-screen">
        <div className="p-6 space-y-7 overflow-y-auto">
          {/* Logo & Admin Panel Title */}
          <div className="text-center space-y-2">
            <button
              onClick={onSwitchToPublic}
              className="inline-block transition-transform duration-300 hover:scale-105 focus:outline-none cursor-pointer"
              title="Return to Public Website"
            >
              <img
                src={LOGO_URL}
                alt="MiniKitchen Logo"
                referrerPolicy="no-referrer"
                className="h-12 w-auto object-contain mx-auto"
              />
            </button>
            <div className="flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5B82E] animate-pulse" />
              <h2 className="text-xs text-stone-400 font-sans tracking-wider font-semibold uppercase">
                Admin Panel
              </h2>
            </div>
            {adminUser && (
              <p className="text-[11px] text-stone-500 truncate px-2">{adminUser.name}</p>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-xs font-semibold">
            {/* Dashboard Link -> /admin/dashboard */}
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left cursor-pointer ${
                activeNav === 'dashboard'
                  ? 'bg-[#F5B82E] text-[#121110] shadow-md font-bold'
                  : 'text-stone-300 hover:bg-[#201c18] hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            {/* Reservations Link -> /admin/reservations */}
            <button
              onClick={() => handleNavClick('reservations')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-left cursor-pointer ${
                activeNav === 'reservations'
                  ? 'bg-[#F5B82E] text-[#121110] shadow-md font-bold'
                  : 'text-stone-300 hover:bg-[#201c18] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4" />
                <span>Reservations</span>
              </div>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* Menu Items Link -> /admin/menu */}
            <button
              onClick={() => handleNavClick('menu')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-left cursor-pointer ${
                activeNav === 'menu'
                  ? 'bg-[#F5B82E] text-[#121110] shadow-md font-bold'
                  : 'text-stone-300 hover:bg-[#201c18] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <UtensilsCrossed className="w-4 h-4" />
                <span>Menu Management</span>
              </div>
              <span className="text-[10px] text-stone-400 font-mono">
                {menuItems.length}
              </span>
            </button>

            {/* Settings Link -> /admin/settings */}
            <button
              onClick={() => handleNavClick('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left cursor-pointer ${
                activeNav === 'settings'
                  ? 'bg-[#F5B82E] text-[#121110] shadow-md font-bold'
                  : 'text-stone-300 hover:bg-[#201c18] hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>

            {/* Contact Inquiries Link */}
            <button
              onClick={() => handleNavClick('inquiries')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-left cursor-pointer ${
                activeNav === 'inquiries'
                  ? 'bg-[#F5B82E] text-[#121110] shadow-md font-bold'
                  : 'text-stone-300 hover:bg-[#201c18] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4" />
                <span>Inquiries</span>
              </div>
              {contactMessages.length > 0 && (
                <span className="text-[10px] text-stone-400 font-mono">
                  {contactMessages.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-6 border-t border-stone-800 space-y-2 text-xs font-semibold">
          <button
            onClick={onSwitchToPublic}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/60 transition-colors cursor-pointer"
          >
            <Globe className="w-4 h-4 text-[#F5B82E]" />
            <span>Public Website</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-stone-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* MAIN ADMIN WORKSPACE */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Mobile Admin Navigation Bar */}
        <div className="md:hidden bg-[#141210] border-b border-stone-800 px-3 py-2.5 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar sticky top-0 z-30">
          <button
            onClick={() => handleNavClick('dashboard')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeNav === 'dashboard'
                ? 'bg-[#F5B82E] text-[#121110]'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => handleNavClick('reservations')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors relative cursor-pointer ${
              activeNav === 'reservations'
                ? 'bg-[#F5B82E] text-[#121110]'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Reservations</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[9px] font-bold">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleNavClick('menu')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeNav === 'menu'
                ? 'bg-[#F5B82E] text-[#121110]'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Menu</span>
          </button>

          <button
            onClick={() => handleNavClick('settings')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeNav === 'settings'
                ? 'bg-[#F5B82E] text-[#121110]'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>

          <button
            onClick={onSwitchToPublic}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-stone-400 hover:text-white whitespace-nowrap ml-auto cursor-pointer"
            title="Public Site"
          >
            <Globe className="w-3.5 h-3.5 text-[#F5B82E]" />
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-stone-400 hover:text-rose-400 whitespace-nowrap cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Top Header */}
        <header className="bg-white border-b border-stone-200 px-4 sm:px-10 py-4 sm:py-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-sans text-xl sm:text-2xl font-bold text-stone-900 tracking-tight capitalize">
              {activeNav === 'menu' ? 'Menu Management' : activeNav === 'inquiries' ? 'Customer Inquiries' : activeNav}
            </h1>
            <p className="text-[11px] sm:text-xs text-stone-500 font-sans">
              MiniKitchen Management Portal &bull; Live Synchronization Active
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-700 font-medium">
              <CalendarDays className="w-3.5 h-3.5 text-[#D4A43C]" />
              <span>Today: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>

            <button
              onClick={async () => {
                await onRefreshData();
                showToast('Data refreshed.');
              }}
              className="p-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer"
              title="Sync Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={onSwitchToPublic}
              className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#F5B82E]" />
              <span className="hidden sm:inline">View Website</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-8 lg:p-10 space-y-8 flex-1 max-w-7xl w-full mx-auto">
          {/* --------------------------------------------------------- */}
          {/* 6 KPI METRIC CARDS (Matching Section 3 Specification Table) */}
          {/* --------------------------------------------------------- */}
          {activeNav === 'dashboard' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {/* Card 1: Total Reservations */}
              <div
                onClick={() => {
                  setResStatusFilter('All');
                  handleNavClick('reservations');
                }}
                className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex flex-col justify-between space-y-2 hover:border-blue-400 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-sans text-2xl font-bold text-stone-900 block group-hover:text-blue-600 transition-colors">
                    {totalReservations}
                  </span>
                  <span className="text-[11px] text-stone-500 font-medium">
                    Total Reservations
                  </span>
                </div>
              </div>

              {/* Card 2: Pending Reservations */}
              <div
                onClick={() => {
                  setResStatusFilter('Pending');
                  handleNavClick('reservations');
                }}
                className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm flex flex-col justify-between space-y-2 hover:border-amber-400 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#f5a623] flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-sans text-2xl font-bold text-stone-900 block group-hover:text-amber-600 transition-colors">
                    {pendingCount}
                  </span>
                  <span className="text-[11px] text-stone-500 font-medium">
                    Pending Requests
                  </span>
                </div>
              </div>

              {/* Card 3: Confirmed Reservations */}
              <div
                onClick={() => {
                  setResStatusFilter('Confirmed');
                  handleNavClick('reservations');
                }}
                className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-sm flex flex-col justify-between space-y-2 hover:border-emerald-400 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-sans text-2xl font-bold text-stone-900 block group-hover:text-emerald-600 transition-colors">
                    {confirmedCount}
                  </span>
                  <span className="text-[11px] text-stone-500 font-medium">
                    Confirmed
                  </span>
                </div>
              </div>

              {/* Card 4: Rejected Reservations */}
              <div
                onClick={() => {
                  setResStatusFilter('Rejected');
                  handleNavClick('reservations');
                }}
                className="bg-white rounded-2xl p-4 border border-rose-200 shadow-sm flex flex-col justify-between space-y-2 hover:border-rose-400 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <XCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-sans text-2xl font-bold text-stone-900 block group-hover:text-rose-600 transition-colors">
                    {rejectedCount}
                  </span>
                  <span className="text-[11px] text-stone-500 font-medium">
                    Rejected Requests
                  </span>
                </div>
              </div>

              {/* Card 5: Total Menu Items */}
              <div
                onClick={() => handleNavClick('menu')}
                className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex flex-col justify-between space-y-2 hover:border-amber-400 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#D4A43C] flex items-center justify-center">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-sans text-2xl font-bold text-stone-900 block group-hover:text-[#D4A43C] transition-colors">
                    {totalMenuItems}
                  </span>
                  <span className="text-[11px] text-stone-500 font-medium">
                    Total Menu Items
                  </span>
                </div>
              </div>

              {/* Card 6: Available Items */}
              <div
                onClick={() => handleNavClick('menu')}
                className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex flex-col justify-between space-y-2 hover:border-emerald-400 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-sans text-2xl font-bold text-stone-900 block group-hover:text-emerald-600 transition-colors">
                    {availableMenuItems}
                  </span>
                  <span className="text-[11px] text-stone-500 font-medium">
                    Available Items
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------- */}
          {/* TAB 1: DASHBOARD VIEW (Recent Reservations & Quick Actions) */}
          {/* --------------------------------------------------------- */}
          {activeNav === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT: Recent Reservations Table (Matching Section 3 Suggested Table) */}
              <div className="lg:col-span-8 bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <div>
                    <h3 className="font-sans text-base font-bold text-stone-900">
                      Recent Reservations
                    </h3>
                    <p className="text-xs text-stone-500">
                      Incoming booking requests from website and AI chatbot
                    </p>
                  </div>
                  <button
                    onClick={() => handleNavClick('reservations')}
                    className="text-xs font-semibold text-stone-500 hover:text-[#f5a623] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>View All ({reservations.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-stone-100 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Booking Ref</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Time</th>
                        <th className="py-2.5 px-3">Guests</th>
                        <th className="py-2.5 px-3">Source</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-xs">
                      {reservations.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-stone-400 text-xs">
                            No reservations yet. Test booking with the public form or AI chatbot.
                          </td>
                        </tr>
                      ) : (
                        reservations.slice(0, 8).map((res) => (
                          <tr key={res.id} className="hover:bg-stone-50/80 transition-colors">
                            <td className="py-3 px-3 font-semibold text-stone-900">
                              <div className="flex items-center gap-1.5">
                                <span>{res.customerName}</span>
                              </div>
                              {res.contactPhone && (
                                <span className="text-[10px] text-stone-400 block font-mono">
                                  {res.contactPhone}
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-3 font-mono font-semibold text-[#9a6500] whitespace-nowrap">
                              {res.bookingReference || '—'}
                            </td>

                            <td className="py-3 px-3 text-stone-600 font-sans whitespace-nowrap">
                              {res.reservationDate}
                            </td>

                            <td className="py-3 px-3 text-stone-600 font-sans whitespace-nowrap">
                              {res.reservationTime}
                            </td>

                            <td className="py-3 px-3 text-stone-600 font-mono">
                              {res.guestCount}
                            </td>

                            <td className="py-3 px-3 whitespace-nowrap">
                              {res.source === 'AI Chatbot' ? (
                                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-[#b45309] text-[10px] font-bold inline-flex items-center gap-1">
                                  <Bot className="w-3 h-3 text-[#f5a623]" />
                                  <span>AI Chatbot</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-medium">
                                  Website
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-3 whitespace-nowrap">
                              {res.status === 'Pending' ? (
                                <motion.span key={`${res.id}-${res.status}`} initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#fef3c7] text-[#b45309] transition-colors duration-300">
                                  Pending
                                </motion.span>
                              ) : res.status === 'Confirmed' ? (
                                <motion.span key={`${res.id}-${res.status}`} initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#d1fae5] text-[#065f46] transition-colors duration-300">
                                  Confirmed
                                </motion.span>
                              ) : res.status === 'Rejected' || res.status === 'Cancelled' ? (
                                <motion.span key={`${res.id}-${res.status}`} initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 transition-colors duration-300">
                                  Rejected
                                </motion.span>
                              ) : (
                                <motion.span key={`${res.id}-${res.status}`} initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 transition-colors duration-300">
                                  Seated
                                </motion.span>
                              )}
                            </td>

                            {/* Section 4 Actions: Confirmed or Rejected */}
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {res.status === 'Pending' && (
                                  <>
                                    <button
                                      onClick={(e) => handleConfirmReservation(res.id, e)}
                                      className="px-2.5 py-1 rounded-lg bg-[#F5B82E] hover:bg-[#e09419] text-[#121110] font-bold text-[11px] transition-colors shadow-sm cursor-pointer"
                                      title="Confirm this reservation"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      onClick={(e) => handleRejectReservation(res.id, e)}
                                      className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-[11px] transition-colors cursor-pointer"
                                      title="Reject this reservation"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}

                                {res.status === 'Confirmed' && (
                                  <>
                                    <button
                                      onClick={(e) => handleSeatReservation(res.id, e)}
                                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                                      title="Mark table as Seated"
                                    >
                                      <Armchair className="w-3 h-3" />
                                      <span>Seat</span>
                                    </button>
                                    <button
                                      onClick={(e) => handleRejectReservation(res.id, e)}
                                      className="p-1 rounded-lg text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                                      title="Reject booking"
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </button>
                                  </>
                                )}

                                {(res.status === 'Rejected' || res.status === 'Cancelled') && (
                                  <button
                                    onClick={(e) => handleReinstateReservation(res.id, e)}
                                    className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-medium transition-colors cursor-pointer"
                                    title="Restore to Pending"
                                  >
                                    Restore
                                  </button>
                                )}

                                <button
                                  onClick={(e) => requestDeleteReservation(res.id, res.customerName, e)}
                                  className="p-1 rounded-lg text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                                  title="Delete record"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* RIGHT: Quick Actions */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
                  <h3 className="font-sans text-base font-bold text-stone-900 border-b border-stone-100 pb-4">
                    Quick Actions
                  </h3>

                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setEditingMenuItem(null);
                        setIsMenuModalOpen(true);
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-[#F5B82E] hover:bg-[#e09419] text-[#121110] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Menu Item</span>
                    </button>

                    <button
                      onClick={() => handleNavClick('menu')}
                      className="w-full py-3 px-4 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <UtensilsCrossed className="w-4 h-4 text-stone-500" />
                      <span>Manage Full Menu ({menuItems.length})</span>
                    </button>

                    {/* AI Chatbot Booking Tester */}
                    <div className="pt-4 border-t border-stone-100 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                          AI Chatbot Assistant
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                          Online
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Test the critical workflow: customer requests a table in AI Chat &rarr; saved as <strong>Pending</strong> &rarr; admin reviews & confirms or rejects.
                      </p>
                      <button
                        onClick={openChat}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#141210] hover:bg-[#241f1a] text-[#F5B82E] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Bot className="w-4 h-4" />
                        <span>Launch AI Assistant &rarr;</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Database Reset Control */}
                <div className="bg-[#141210] text-stone-200 rounded-2xl p-5 border border-stone-800 space-y-3">
                  <div className="flex items-center gap-2 text-stone-300 text-xs font-semibold">
                    <RotateCcw className="w-4 h-4 text-[#F5B82E]" />
                    <span>Demo Data Control</span>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    Restore the initial 23 culinary dishes and sample booking records back to default demo state.
                  </p>
                  <button
                    onClick={requestResetDatabase}
                    className="w-full py-2 px-3 rounded-xl border border-stone-700 hover:border-[#F5B82E] text-stone-300 hover:text-[#F5B82E] text-xs font-medium transition-colors cursor-pointer"
                  >
                    Reset Demo Database
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------- */}
          {/* TAB 2: DEDICATED RESERVATION MANAGEMENT (/admin/reservations) */}
          {/* --------------------------------------------------------- */}
          {activeNav === 'reservations' && (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6">
              {/* Header & Search */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-5">
                <div>
                  <h3 className="font-sans text-lg font-bold text-stone-900">
                    Reservation Management
                  </h3>
                  <p className="text-xs text-stone-500">
                    Review incoming requests, change statuses to Confirmed or Rejected, and seat guests.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search guest, booking ref, phone..."
                      value={reservationSearch}
                      onChange={(e) => setReservationSearch(e.target.value)}
                      className="pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-[#F5B82E] w-56 sm:w-64"
                    />
                  </div>

                  <button
                    onClick={async () => {
                      await onRefreshData();
                      showToast('Reservations refreshed.');
                    }}
                    className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer"
                    title="Refresh List"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status Filter Tabs (All, Pending, Confirmed, Rejected, Seated) */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'All', count: totalReservations },
                  { label: 'Pending', count: pendingCount },
                  { label: 'Confirmed', count: confirmedCount },
                  { label: 'Rejected', count: rejectedCount },
                  { label: 'Seated', count: seatedCount },
                ].map((tab) => (
                  <button
                    key={tab.label}
                    onClick={() => setResStatusFilter(tab.label)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      resStatusFilter === tab.label
                        ? 'bg-[#141210] text-[#F5B82E] shadow-sm'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                        resStatusFilter === tab.label
                          ? 'bg-[#F5B82E] text-[#141210] font-bold'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Full Table */}
              <div className="overflow-x-auto border border-stone-100 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50/80 border-b border-stone-100 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Booking Ref</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4">Guests</th>
                      <th className="py-3 px-4">Source</th>
                      <th className="py-3 px-4">Special Requests</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-xs">
                    {filteredReservations.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-stone-400 text-xs">
                          No reservations match the active filter.
                        </td>
                      </tr>
                    ) : (
                      filteredReservations.map((res) => (
                        <tr key={res.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-stone-900">
                            <div className="flex items-center gap-1.5">
                              <span>{res.customerName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono mt-0.5">
                              {res.contactPhone && <span>{res.contactPhone}</span>}
                              {res.contactEmail && <span>&bull; {res.contactEmail}</span>}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-mono font-semibold text-[#9a6500] whitespace-nowrap">
                            {res.bookingReference || '—'}
                          </td>

                          <td className="py-3.5 px-4 text-stone-700 whitespace-nowrap">
                            {res.reservationDate}
                          </td>

                          <td className="py-3.5 px-4 text-stone-700 whitespace-nowrap">
                            {res.reservationTime}
                          </td>

                          <td className="py-3.5 px-4 font-mono text-stone-700">
                            {res.guestCount} {res.guestCount === 1 ? 'guest' : 'guests'}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {res.source === 'AI Chatbot' ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-[#b45309] text-[10px] font-bold inline-flex items-center gap-1">
                                <Bot className="w-3 h-3 text-[#f5a623]" />
                                <span>AI Chatbot</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-medium">
                                Website
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-stone-600 max-w-xs truncate">
                            {res.specialRequests || <span className="text-stone-300 italic">None</span>}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {res.status === 'Pending' ? (
                              <motion.span key={`${res.id}-${res.status}`} initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#fef3c7] text-[#b45309] transition-colors duration-300">
                                Pending
                              </motion.span>
                            ) : res.status === 'Confirmed' ? (
                              <motion.span key={`${res.id}-${res.status}`} initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#d1fae5] text-[#065f46] transition-colors duration-300">
                                Confirmed
                              </motion.span>
                            ) : res.status === 'Rejected' || res.status === 'Cancelled' ? (
                              <motion.span key={`${res.id}-${res.status}`} initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 transition-colors duration-300">
                                Rejected
                              </motion.span>
                            ) : (
                              <motion.span key={`${res.id}-${res.status}`} initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 transition-colors duration-300">
                                Seated
                              </motion.span>
                            )}
                          </td>

                          {/* Quick State Actions (Confirmed or Rejected) */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {res.status === 'Pending' && (
                                <>
                                  <button
                                    onClick={(e) => handleConfirmReservation(res.id, e)}
                                    className="px-2.5 py-1 rounded-lg bg-[#F5B82E] hover:bg-[#e09419] text-[#121110] font-bold text-[11px] transition-colors shadow-sm cursor-pointer"
                                    title="Approve and confirm booking"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={(e) => handleRejectReservation(res.id, e)}
                                    className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-[11px] transition-colors cursor-pointer"
                                    title="Reject booking"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {res.status === 'Confirmed' && (
                                <>
                                  <button
                                    onClick={(e) => handleSeatReservation(res.id, e)}
                                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                                    title="Seat guests at their table"
                                  >
                                    <Armchair className="w-3 h-3" />
                                    <span>Seat</span>
                                  </button>
                                  <button
                                    onClick={(e) => handleRejectReservation(res.id, e)}
                                    className="p-1 rounded-lg text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                                    title="Reject booking"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}

                              {(res.status === 'Rejected' || res.status === 'Cancelled') && (
                                <button
                                  onClick={(e) => handleReinstateReservation(res.id, e)}
                                  className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-medium transition-colors cursor-pointer"
                                  title="Restore to Pending"
                                >
                                  Restore
                                </button>
                              )}

                              <button
                                onClick={(e) => requestDeleteReservation(res.id, res.customerName, e)}
                                className="p-1 rounded-lg text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Delete record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------- */}
          {/* TAB 3: MENU MANAGEMENT (/admin/menu) */}
          {/* --------------------------------------------------------- */}
          {activeNav === 'menu' && (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6">
              {/* Header & Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-5">
                <div>
                  <h3 className="font-sans text-lg font-bold text-stone-900">
                    Menu Management
                  </h3>
                  <p className="text-xs text-stone-500">
                    Add new items, edit names, descriptions and prices, and change food availability. All changes reflect live.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search menu..."
                      value={menuSearch}
                      onChange={(e) => setMenuSearch(e.target.value)}
                      className="pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-[#F5B82E]"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setEditingMenuItem(null);
                      setIsMenuModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#F5B82E] hover:bg-[#e09419] text-[#121110] font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item</span>
                  </button>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const count =
                    cat === 'All'
                      ? menuItems.length
                      : menuItems.filter((m) => m.category.toLowerCase() === cat.toLowerCase()).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setMenuCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        menuCategoryFilter === cat
                          ? 'bg-[#141210] text-[#F5B82E] shadow-sm'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className="text-[10px] opacity-75 font-mono">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Menu Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredMenuItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div className="relative h-40 bg-stone-100 overflow-hidden">
                      {item.image ? (
                        <img
                          src={restaurantImageUrl(item.image)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                          <UtensilsCrossed className="w-8 h-8" />
                        </div>
                      )}

                      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-[#141210]/85 text-[#F5B82E] text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                        {item.category}
                      </span>

                      {!item.isAvailable && (
                        <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg">
                            Not Available
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-sans text-sm font-bold text-stone-900 leading-snug">
                            {item.name}
                          </h4>
                          <span className="font-sans font-bold text-sm text-stone-900 shrink-0">
                            Rs. {item.price.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {item.dietaryTags && item.dietaryTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {item.dietaryTags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="px-4 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                      {/* Availability Change (Available <-> Not Available) */}
                      <button
                        onClick={(e) => handleToggleAvail(item.id, item.name, e)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          item.isAvailable
                            ? 'bg-[#e6f7ec] text-[#1b7a3e] hover:bg-[#d5f2de]'
                            : 'bg-[#fde8e8] text-[#c81e1e] hover:bg-[#fad1d1]'
                        }`}
                        title="Click to toggle food availability live on public website"
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.isAvailable ? 'bg-[#1b7a3e]' : 'bg-[#c81e1e]'
                          }`}
                        />
                        <span>{item.isAvailable ? 'Available' : 'Not Available'}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        {/* Edit Item (name, price, description, etc.) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingMenuItem(item);
                            setIsMenuModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
                          title="Edit Item"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => requestDeleteMenuItem(item.id, item.name, e)}
                          className="p-1.5 rounded-lg border border-stone-200 hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --------------------------------------------------------- */}
          {/* TAB 4: RESTAURANT SETTINGS (/admin/settings) */}
          {/* --------------------------------------------------------- */}
          {activeNav === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-5">
                <div className="border-b border-stone-100 pb-4">
                  <h3 className="font-sans text-lg font-bold text-stone-900">
                    Restaurant Configuration
                  </h3>
                  <p className="text-xs text-stone-500">
                    Configure restaurant contact details, opening hours, and policies.
                  </p>
                </div>

                {restaurantSettings ? (
                  <form onSubmit={handleSaveRestaurantSettings} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-stone-700">
                          Restaurant Name
                        </label>
                        <input
                          type="text"
                          required
                          value={restaurantSettings.name}
                          onChange={(e) =>
                            setRestaurantSettings({ ...restaurantSettings, name: e.target.value })
                          }
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 text-stone-900 focus:outline-none focus:border-[#F5B82E]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-stone-700">
                          Tagline
                        </label>
                        <input
                          type="text"
                          required
                          value={restaurantSettings.tagline}
                          onChange={(e) =>
                            setRestaurantSettings({ ...restaurantSettings, tagline: e.target.value })
                          }
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 text-stone-900 focus:outline-none focus:border-[#F5B82E]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-stone-700">
                          Contact Phone
                        </label>
                        <input
                          type="text"
                          required
                          value={restaurantSettings.phone}
                          onChange={(e) =>
                            setRestaurantSettings({ ...restaurantSettings, phone: e.target.value })
                          }
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 text-stone-900 focus:outline-none focus:border-[#F5B82E]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-stone-700">
                          Contact Email
                        </label>
                        <input
                          type="email"
                          required
                          value={restaurantSettings.email}
                          onChange={(e) =>
                            setRestaurantSettings({ ...restaurantSettings, email: e.target.value })
                          }
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 text-stone-900 focus:outline-none focus:border-[#F5B82E]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-stone-700">
                        Physical Address
                      </label>
                      <input
                        type="text"
                        required
                        value={restaurantSettings.address}
                        onChange={(e) =>
                          setRestaurantSettings({ ...restaurantSettings, address: e.target.value })
                        }
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 text-stone-900 focus:outline-none focus:border-[#F5B82E]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-stone-700">
                        Opening Hours (Displayed in Footer & AI Assistant)
                      </label>
                      <input
                        type="text"
                        required
                        value={restaurantSettings.openingHours?.weekday || 'Mon – Sun | 11:00 AM – 10:00 PM'}
                        onChange={(e) =>
                          setRestaurantSettings({
                            ...restaurantSettings,
                            openingHours: {
                              ...restaurantSettings.openingHours,
                              weekday: e.target.value,
                              weekend: e.target.value,
                              sunday: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 text-stone-900 focus:outline-none focus:border-[#F5B82E]"
                      />
                    </div>

                    <div className="pt-3 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSavingSettings}
                        className="px-5 py-2.5 rounded-xl bg-[#F5B82E] hover:bg-[#e09419] text-[#121110] font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isSavingSettings ? 'Saving...' : 'Save Restaurant Details'}</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="text-xs text-stone-400">Loading settings...</p>
                )}
              </div>

              {/* Database Maintenance */}
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
                <div className="border-b border-stone-100 pb-3">
                  <h4 className="font-sans text-sm font-bold text-stone-900">
                    System & Database Operations
                  </h4>
                  <p className="text-xs text-stone-500">
                    Reset dishes and reservations back to default demonstration records.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-amber-50/60 border border-amber-200/80">
                  <div className="space-y-1">
                    <span className="font-bold text-xs text-stone-900 block">
                      Reset Demo Database
                    </span>
                    <p className="text-[11px] text-stone-600">
                      Restores all 23 dishes and seed reservation records.
                    </p>
                  </div>

                  <button
                    onClick={requestResetDatabase}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs whitespace-nowrap transition-colors cursor-pointer"
                  >
                    Reset to Defaults
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------- */}
          {/* TAB 5: CONTACT INQUIRIES */}
          {/* --------------------------------------------------------- */}
          {activeNav === 'inquiries' && (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                  <h3 className="font-sans text-lg font-bold text-stone-900">
                    Customer Inquiries & Feedback
                  </h3>
                  <p className="text-xs text-stone-500">
                    Messages submitted via the public Contact Us page.
                  </p>
                </div>
                <span className="text-xs text-stone-500 font-mono">
                  {contactMessages.length} total messages
                </span>
              </div>

              {contactMessages.length === 0 ? (
                <div className="py-12 text-center text-stone-400 text-xs">
                  No customer messages submitted yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {contactMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2 hover:bg-stone-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900 text-sm">{msg.name}</span>
                            <span className="text-xs text-stone-500 font-mono">({msg.email})</span>
                          </div>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-amber-50 text-[#b45309] font-semibold text-[10px]">
                            {msg.subject}
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-stone-700 leading-relaxed bg-white p-3 rounded-lg border border-stone-200/70">
                        {msg.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* IN-APP CONFIRMATION MODAL */}
      {/* ------------------------------------------------------------- */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden text-stone-100 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  confirmModal.isDestructive
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-sans text-base font-bold text-white">
                  {confirmModal.title}
                </h3>
                <span className="text-[11px] text-stone-400">
                  Please confirm this action
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed bg-stone-950/60 p-3.5 rounded-xl border border-stone-800/80">
              {confirmModal.description}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isProcessingModal}
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingModal}
                onClick={handleExecuteModalAction}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-2 ${
                  confirmModal.isDestructive
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-[#F5B82E] hover:bg-[#e09419] text-[#121110]'
                }`}
              >
                {isProcessingModal ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{confirmModal.confirmLabel}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menu Item Create/Edit Modal */}
      <MenuItemModal
        isOpen={isMenuModalOpen}
        onClose={() => setIsMenuModalOpen(false)}
        onSave={handleSaveModal}
        initialItem={editingMenuItem}
      />
    </div>
  );
};
