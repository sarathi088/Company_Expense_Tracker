import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AppContext = createContext();

// Initial Default Locations as per prompt
const DEFAULT_LOCATIONS = [
  { id: 'loc-1', name: 'Sidco', rate: 600, active: true },
  { id: 'loc-2', name: 'Mangal', rate: 700, active: true },
  { id: 'loc-3', name: 'Sidco Beam', rate: 600, active: true },
  { id: 'loc-4', name: 'Sidco Beam Extra', rate: 800, active: true },
  { id: 'loc-5', name: 'Tholilpettai', rate: 1000, active: true },
  { id: 'loc-6', name: 'Waste', rate: 600, active: true }
];

// Helper to get formatted ISO date string for relative days
const getRelativeDateStr = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().split('T')[0];
};

// Initial Sample Loads
const INITIAL_LOADS = [
  {
    id: 'LD-1092',
    locationName: 'Tholilpettai',
    rate: 1000,
    quantity: 15,
    total: 15000,
    date: getRelativeDateStr(0),
    remarks: 'Heavy cargo shipment - Truck TN-38-AX-9912',
    createdBy: 'Admin',
    createdRole: 'Admin'
  },
  {
    id: 'LD-1091',
    locationName: 'Sidco Beam Extra',
    rate: 800,
    quantity: 24,
    total: 19200,
    date: getRelativeDateStr(0),
    remarks: 'Reinforced beam loads for construction site B',
    createdBy: 'Staff',
    createdRole: 'Staff'
  },
  {
    id: 'LD-1090',
    locationName: 'Mangal',
    rate: 700,
    quantity: 32,
    total: 22400,
    date: getRelativeDateStr(1),
    remarks: 'Standard factory delivery',
    createdBy: 'Admin',
    createdRole: 'Admin'
  },
  {
    id: 'LD-1089',
    locationName: 'Sidco',
    rate: 600,
    quantity: 40,
    total: 24000,
    date: getRelativeDateStr(1),
    remarks: 'Warehouse stock transfer',
    createdBy: 'Staff',
    createdRole: 'Staff'
  },
  {
    id: 'LD-1088',
    locationName: 'Tholilpettai',
    rate: 1000,
    quantity: 18,
    total: 18000,
    date: getRelativeDateStr(2),
    remarks: 'Express priority transport',
    createdBy: 'Admin',
    createdRole: 'Admin'
  }
];

export const AppProvider = ({ children }) => {
  // Authentication & Role
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('clt_user');
    return saved ? JSON.parse(saved) : {
      username: 'Admin User',
      email: 'admin@companyload.com',
      role: 'Admin',
      isAuthenticated: true
    };
  });

  // Locations & Rates (Source of Truth: Supabase DB)
  const [locations, setLocations] = useState(DEFAULT_LOCATIONS);

  // Load Records (Source of Truth: Supabase DB)
  const [loads, setLoads] = useState([]);

  // Settings & User (Local UI preferences)
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('clt_settings');
    return saved ? JSON.parse(saved) : {
      companyName: 'Kumar Impex Loads',
      tagline: 'Track Every Load. Manage Every Rupee.',
      currency: '₹',
      logoUrl: '',
      darkMode: false,
      notificationsEnabled: true
    };
  });

  // Active Tab / Navigation
  const [activeTab, setActiveTab] = useState('dashboard');

  // Toast Stack
  const [toasts, setToasts] = useState([]);

  // Modal States
  const [isAddLoadModalOpen, setIsAddLoadModalOpen] = useState(false);

  // Sync with Supabase on mount & setup Real-time listener
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      addToast('Warning: Supabase credentials not found.', 'warning');
      return;
    }

    const fetchSupabaseData = async () => {
      try {
        // 1. Fetch Locations from Supabase
        const { data: dbLocs, error: locError } = await supabase.from('locations').select('*');
        if (locError) {
          console.error('Supabase Locations Fetch Error:', locError.message);
          addToast(`Database Error (Locations): ${locError.message}`, 'error');
        } else if (dbLocs && dbLocs.length > 0) {
          const formattedLocs = dbLocs.map(l => ({
            id: l.id,
            name: l.name,
            rate: Number(l.rate),
            active: l.active !== false
          }));
          setLocations(formattedLocs);
        }

        // 2. Fetch Loads from Supabase
        const { data: dbLoads, error: loadError } = await supabase.from('loads').select('*').order('date', { ascending: false });
        if (loadError) {
          console.error('Supabase Loads Fetch Error:', loadError.message);
          addToast(`Database Error (Loads): ${loadError.message}`, 'error');
        } else if (dbLoads) {
          const formattedLoads = dbLoads.map(l => ({
            id: l.id,
            locationName: l.location_name,
            rate: Number(l.rate),
            quantity: Number(l.quantity),
            total: Number(l.total),
            date: l.date,
            remarks: l.remarks || '',
            createdBy: l.created_by || 'Admin',
            createdRole: l.created_role || 'Admin'
          }));
          setLoads(formattedLoads);
        }
      } catch (err) {
        console.error('Supabase fetch exception:', err.message);
        addToast(`Connection Exception: ${err.message}`, 'error');
      }
    };

    fetchSupabaseData();

    // 1. Polling Fallback (syncs every 3 seconds across all devices)
    const pollInterval = setInterval(() => {
      fetchSupabaseData();
    }, 3000);

    // 2. Subscribe to Realtime Postgres changes
    const channel = supabase
      .channel('realtime-tracker-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loads' }, () => {
        fetchSupabaseData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'locations' }, () => {
        fetchSupabaseData();
      })
      .subscribe((status) => {
        console.log('Supabase Realtime Channel Status:', status);
      });

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, []);

  // Save UI Preferences to localStorage (User session & Dark Mode only)
  useEffect(() => {
    localStorage.setItem('clt_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('clt_settings', JSON.stringify(settings));
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  // Toast Helper
  const addToast = (title, type = 'success') => {
    const id = Date.now() + Math.random().toString();
    const newToast = { id, title, type, timestamp: new Date() };
    setToasts(prev => [newToast, ...prev].slice(0, 5));

    setTimeout(() => {
      removeToast(id);
    }, 3500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Auth Operations
  const login = (username, password, role = 'Admin') => {
    const newUser = {
      username: username || (role === 'Admin' ? 'Admin User' : 'Manager User'),
      email: `${role.toLowerCase()}@companyload.com`,
      role: role,
      isAuthenticated: true
    };
    setUser(newUser);
    addToast(`Signed in successfully as ${role}`, 'success');
  };

  const switchRole = (newRole) => {
    setUser(prev => ({
      ...prev,
      role: newRole,
      username: newRole === 'Admin' ? 'Admin User' : 'Manager User'
    }));
    addToast(`Switched user mode to ${newRole}`, 'info');
  };

  const logout = () => {
    setUser(prev => ({ ...prev, isAuthenticated: false }));
    addToast('Signed out of session', 'info');
  };

  // Load Operations
  const addLoad = async (loadData) => {
    const targetLoc = locations.find(l => l.name.toLowerCase() === (loadData.locationName || '').trim().toLowerCase());
    const rate = targetLoc ? targetLoc.rate : (loadData.rate || 600);
    const quantity = Number(loadData.quantity) || 1;
    const total = quantity * rate;

    const newLoad = {
      id: `LD-${Math.floor(1000 + Math.random() * 9000)}`,
      locationName: (loadData.locationName || '').trim(),
      rate: rate,
      quantity: quantity,
      total: total,
      date: loadData.date || new Date().toISOString().split('T')[0],
      remarks: loadData.remarks || 'Standard Load Entry',
      createdBy: user.username || user.role,
      createdRole: user.role
    };

    setLoads(prev => [newLoad, ...prev]);

    // Push to Supabase directly
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('loads').insert([{
          id: newLoad.id,
          location_name: newLoad.locationName,
          rate: newLoad.rate,
          quantity: newLoad.quantity,
          total: newLoad.total,
          date: newLoad.date,
          remarks: newLoad.remarks,
          created_by: newLoad.createdBy,
          created_role: newLoad.createdRole
        }]);

        if (error) {
          console.error('Supabase load insert error:', error.message);
          addToast(`Supabase DB Error: ${error.message}`, 'error');
        } else {
          addToast(`Synced to Cloud Supabase DB (${newLoad.id})`, 'info');
        }
      } catch (e) {
        console.error('Supabase load insert exception:', e.message);
        addToast(`Supabase Connection Exception: ${e.message}`, 'error');
      }
    } else {
      addToast(`Notice: Supabase Key not detected on runtime`, 'warning');
    }

    addToast(`Load ${newLoad.id} added successfully! (${settings.currency}${total.toLocaleString()})`, 'success');
    return newLoad;
  };

  const editLoad = async (id, updatedData) => {
    if (user.role !== 'Admin') {
      addToast('Only Admin can edit load records', 'error');
      return;
    }

    setLoads(prev => prev.map(l => {
      if (l.id === id) {
        const rate = updatedData.rate !== undefined ? updatedData.rate : l.rate;
        const quantity = updatedData.quantity !== undefined ? updatedData.quantity : l.quantity;
        return {
          ...l,
          ...updatedData,
          total: rate * quantity
        };
      }
      return l;
    }));

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('loads').update({
          location_name: updatedData.locationName,
          rate: updatedData.rate,
          quantity: updatedData.quantity,
          total: (updatedData.rate || 0) * (updatedData.quantity || 1),
          remarks: updatedData.remarks
        }).eq('id', id);
      } catch (e) {
        console.warn('Supabase load edit notice:', e.message);
      }
    }

    addToast(`Load ${id} updated successfully`, 'success');
  };

  const deleteLoad = async (id) => {
    if (user.role !== 'Admin') {
      addToast('Only Admin can delete loads', 'error');
      return;
    }

    setLoads(prev => prev.filter(l => l.id !== id));

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('loads').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase load delete notice:', e.message);
      }
    }

    addToast(`Load ${id} deleted`, 'warning');
  };

  // Location Operations
  const addLocation = async (locData) => {
    if (user.role !== 'Admin') {
      addToast('Only Admin can manage locations', 'error');
      return;
    }

    const exists = locations.some(l => l.name.toLowerCase() === locData.name.trim().toLowerCase());
    if (exists) {
      addToast('Location already exists', 'error');
      return false;
    }

    const newLoc = {
      id: `loc-${Date.now()}`,
      name: locData.name.trim(),
      rate: Number(locData.rate) || 600,
      active: true
    };

    setLocations(prev => [...prev, newLoc]);

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('locations').insert([{
          id: newLoc.id,
          name: newLoc.name,
          rate: newLoc.rate,
          active: true
        }]);
      } catch (e) {
        console.warn('Supabase location insert notice:', e.message);
      }
    }

    addToast(`Location "${newLoc.name}" added at ${settings.currency}${newLoc.rate}/load`, 'success');
    return true;
  };

  const editLocation = async (id, newRate) => {
    if (user.role !== 'Admin') {
      addToast('Only Admin can edit rates', 'error');
      return;
    }

    setLocations(prev => prev.map(l => l.id === id ? { ...l, rate: Number(newRate) } : l));

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('locations').update({ rate: Number(newRate) }).eq('id', id);
      } catch (e) {
        console.warn('Supabase location edit notice:', e.message);
      }
    }

    addToast('Location rate updated successfully', 'success');
  };

  const toggleLocationActive = (id) => {
    if (user.role !== 'Admin') return;
    setLocations(prev => prev.map(l => l.id === id ? { ...l, active: !l.active } : l));
    addToast('Location status updated', 'info');
  };

  const deleteLocation = async (id) => {
    if (user.role !== 'Admin') {
      addToast('Only Admin can delete locations', 'error');
      return;
    }
    setLocations(prev => prev.filter(l => l.id !== id));

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('locations').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase location delete notice:', e.message);
      }
    }

    addToast('Location deleted', 'warning');
  };

  // Theme Toggle
  const toggleDarkMode = () => {
    setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
    addToast(`Switched to ${!settings.darkMode ? 'iOS Dark Glass' : 'iOS Light Glass'} mode`, 'info');
  };

  return (
    <AppContext.Provider value={{
      user,
      login,
      logout,
      switchRole,
      locations,
      addLocation,
      editLocation,
      toggleLocationActive,
      deleteLocation,
      loads,
      addLoad,
      editLoad,
      deleteLoad,
      settings,
      setSettings,
      toggleDarkMode,
      activeTab,
      setActiveTab,
      toasts,
      addToast,
      removeToast,
      isAddLoadModalOpen,
      setIsAddLoadModalOpen
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
