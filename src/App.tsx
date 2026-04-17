/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, Component } from 'react';
import { 
  Home, 
  Utensils, 
  Brain, 
  MessageSquare, 
  Menu, 
  Globe, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  User, 
  Settings, 
  Lock, 
  Eye, 
  EyeOff,
  ShieldCheck, 
  PlusCircle, 
  ArrowRight,
  Plus,
  Minus,
  X,
  AlertCircle,
  Users,
  Check,
  Trash2,
  Footprints,
  Heart,
  Moon,
  Zap,
  Lightbulb,
  Quote,
  Camera,
  Flashlight,
  Image as ImageIcon,
  CheckCircle2,
  Pencil,
  Send,
  Smile,
  ArrowLeft,
  Navigation,
  Activity,
  Apple,
  Droplets,
  Clock,
  Flame,
  Leaf,
  Bell,
  Video,
  Phone,
  Coffee,
  Cookie,
  Trophy,
  Loader2,
  Star,
  Milk,
  Search,
  Dumbbell,
  Edit2,
  Image,
  LogOut,
  Sun,
  Shield,
  FileText,
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  Filter,
  Database,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { ErrorBoundary } from './components/ErrorBoundary';
import { supabaseService } from './services/supabaseService';
import { supabase } from './lib/supabase';
import { 
  Language, 
  Role, 
  UserStats, 
  UserProfile, 
  MealItem, 
  FoodCombo, 
  AssignedUser 
} from './types';
import { 
  INDIAN_LANGUAGES, 
  MAIN_LANGUAGES,
  TRANSLATIONS, 
  INITIAL_USER_STATS, 
  MOCK_ASSIGNED_USERS, 
  MOCK_COACHES,
  FOOD_COMBOS,
  MOCK_USER_STATS,
  MOTIVATIONS,
  FOOD_FACTS
} from './constants';

// --- AI Translation Hook ---
const useDynamicTranslations = (language: Language) => {
  const [translations, setTranslations] = useState<Record<string, string> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (language === 'English') {
      setTranslations(TRANSLATIONS['English']);
      return;
    }

    const fetchTranslations = async () => {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("Gemini API Key is missing. Falling back to English.");
        setTranslations(TRANSLATIONS['English']);
        return;
      }

      setIsLoading(true);
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Translate the following UI labels into ${language}. 
          Return ONLY a valid JSON object with the exact same keys as the provided labels.
          Labels: ${JSON.stringify(TRANSLATIONS['English'])}`,
          config: { responseMimeType: "application/json" }
        });
        
        if (response.text) {
          const text = response.text.replace(/```json|```/g, '').trim();
          setTranslations(JSON.parse(text));
        }
      } catch (error) {
        console.error("Translation error:", error);
        setTranslations(TRANSLATIONS['English']); // Fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranslations();
  }, [language]);

  return { translations, isLoading };
};

// --- Components ---

const CongratsPopup = ({ 
translations, onClose }: { translations: Record<string, string>; onClose: () => void }) => (
  <div className="fixed inset-0 bg-on-surface/10 backdrop-blur-xl z-50 flex items-center justify-center p-6" onClick={onClose}>
    <motion.div 
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      className="bg-surface-container-lowest rounded-[3rem] p-10 max-w-sm w-full shadow-ambient text-center space-y-6"
    >
      <div className="w-24 h-24 bg-tertiary-container rounded-full flex items-center justify-center mx-auto">
        <Trophy className="w-12 h-12 text-on-tertiary-container" />
      </div>
      <h3 className="text-3xl font-extrabold text-on-surface tracking-tight">
        {translations['congrats_message'] || 'You have done a great job!!'}
      </h3>
      <button 
        onClick={onClose}
        className="w-full h-16 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold shadow-lg"
      >
        {translations['close'] || 'Close'}
      </button>
    </motion.div>
  </div>
);

const TopAppBar = ({ 
  onMenuClick, 
  language, 
  onLanguageChange,
  translations,
  syncStatus
}: { 
  onMenuClick?: () => void; 
  language: Language;
  onLanguageChange: (lang: Language) => void;
  translations?: Record<string, string>;
  syncStatus?: 'synced' | 'syncing' | 'error';
}) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const t = translations || TRANSLATIONS[language] || TRANSLATIONS['English'];

  return (
    <header className="fixed top-0 w-full z-50 px-2 md:px-8 py-3 md:py-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center bg-surface/40 backdrop-blur-3xl rounded-full px-4 md:px-8 py-2 md:py-4 shadow-ambient border border-white/10">
        <div className="flex items-center gap-3 md:gap-6">
          <button onClick={onMenuClick} className="p-2 md:p-3 rounded-full bg-surface-container-lowest shadow-sm hover:bg-surface-container transition-all active:scale-95">
            <Menu className="w-4 h-4 md:w-6 md:h-6 text-primary" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-lg md:text-2xl font-black text-primary tracking-tighter">VitalityTrack</h1>
            {syncStatus && (
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  syncStatus === 'synced' ? 'bg-green-500' : 
                  syncStatus === 'syncing' ? 'bg-primary animate-pulse' : 
                  'bg-error'
                }`} />
                <span className="text-[8px] font-black uppercase tracking-widest opacity-40">
                  {syncStatus === 'synced' ? 'Synced' : 
                   syncStatus === 'syncing' ? 'Syncing...' : 
                   'Sync Error'}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-2 md:gap-3 px-3 md:px-6 py-1.5 md:py-3 rounded-full bg-surface-container-lowest shadow-sm hover:bg-surface-container transition-all active:scale-95"
          >
            <span className="text-on-surface text-[8px] md:text-sm font-black tracking-widest uppercase">{language}</span>
            <Globe className="w-3 h-3 md:w-5 md:h-5 text-primary" />
          </button>
          
          <AnimatePresence>
            {showLangMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-4 w-64 max-h-[70vh] overflow-y-auto bg-surface-container-lowest rounded-[2.5rem] shadow-ambient z-[60] p-4 space-y-2"
              >
                {MAIN_LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      onLanguageChange(lang);
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-6 py-4 rounded-2xl text-sm font-black transition-all ${
                      language === lang ? 'bg-primary text-on-primary shadow-lg' : 'hover:bg-surface-container'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

const SideMenu = ({ 
  isOpen, 
  onClose, 
  onTabChange, 
  role,
  language, 
  translations 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onTabChange: (tab: string) => void; 
  role: Role;
  language: Language;
  translations?: Record<string, string>;
}) => {
  const t = translations || TRANSLATIONS[language] || TRANSLATIONS['English'];
  
  const menuItems = [
    { id: 'home', label: t['home'], icon: Home },
    ...(role === 'coach' ? [{ id: 'coach', label: t['coach_dashboard'], icon: Brain }] : []),
    ...(role === 'owner' ? [{ id: 'owner', label: 'Owner Dashboard', icon: Shield }] : []),
    { id: 'log', label: t['food'] || 'Food', icon: Utensils },
    { id: 'profile', label: t['profile'] || 'Profile', icon: User },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-surface-container-lowest z-[101] shadow-ambient p-8 flex flex-col"
          >
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-black text-primary tracking-tighter">VitalityTrack</h2>
              <button onClick={onClose} className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    onClose();
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-[1.5rem] hover:bg-surface-container transition-all group"
                >
                  <div className="w-10 h-10 bg-surface-container rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-all shrink-0">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-lg font-black tracking-tight">{item.label}</span>
                </button>
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const BottomNavBar = ({ 
  activeTab, 
  onTabChange, 
  role, 
  language,
  translations,
  userName
}: { 
  activeTab: string; 
  onTabChange: (tab: string) => void; 
  role: Role;
  language: Language;
  translations?: Record<string, string>;
  userName?: string;
}) => {
  const t = translations || TRANSLATIONS[language] || TRANSLATIONS['English'];
  
  const userTabs = [
    { id: 'home', label: t['home'], icon: Home },
    { id: 'log', label: t['log_meal'], icon: Utensils },
    { id: 'profile', label: t['profile'] || 'Profile', icon: User },
  ];

  const coachTabs = [
    { id: 'home', label: t['home'], icon: Home },
    { id: 'coach', label: t['coach_dashboard'], icon: Brain },
    { id: 'log', label: t['log_meal'], icon: Utensils },
    { id: 'profile', label: t['profile'] || 'Profile', icon: User },
  ];

  const ownerTabs = [
    { id: 'home', label: t['home'], icon: Home },
    { id: 'owner', label: userName || 'Owner', icon: Shield },
    { id: 'log', label: t['log_meal'], icon: Utensils },
    { id: 'profile', label: t['profile'] || 'Profile', icon: User },
  ];

  const tabs = role === 'user' ? userTabs : role === 'coach' ? coachTabs : ownerTabs;

  return (
    <nav className="fixed bottom-4 md:bottom-10 left-1/2 -translate-x-1/2 w-[92%] max-w-xl z-50">
      <div className="bg-surface/40 backdrop-blur-3xl rounded-full shadow-ambient flex justify-around items-center p-1.5 md:p-3 relative overflow-hidden border border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-14 md:h-16 transition-all duration-500 rounded-full group max-w-[70px] md:max-w-[80px] ${
                isActive 
                  ? 'bg-primary text-on-primary shadow-lg scale-105 md:scale-110' 
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <Icon className={`w-6 h-6 md:w-7 md:h-7 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              {isActive && (
                <motion.span 
                  layoutId="nav-label"
                  className="absolute -bottom-8 md:-bottom-10 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-primary whitespace-nowrap"
                >
                  {tab.label}
                </motion.span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// --- Screens ---

const LoginScreen = ({ 
  onLogin, 
  language,
  translations,
  error,
  isAuthReady,
  userProfile
}: { 
  onLogin: (role: Role, pin: string, name: string) => void;
  language: Language;
  translations?: Record<string, string>;
  error?: string | null;
  isAuthReady: boolean;
  userProfile: UserProfile | null;
}) => {
  const [step, setStep] = useState<'role' | 'name' | 'pin'>('role');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [name, setName] = useState(userProfile?.name || '');
  const [pin, setPin] = useState(userProfile?.pin || '');
  const [showPin, setShowPin] = useState(false);
  const [showForgotPopup, setShowForgotPopup] = useState(false);
  const t = translations || TRANSLATIONS[language] || TRANSLATIONS['English'];

  useEffect(() => {
    if (isAuthReady) {
      if (userProfile) {
        setName(userProfile.name);
        setPin(userProfile.pin);
        setSelectedRole(userProfile.role);
      }
    }
  }, [isAuthReady, userProfile]);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setStep('name');
  };

  const handleForgotClick = () => {
    setShowForgotPopup(true);
  };

  const handleNameSubmit = () => {
    if (name.trim()) {
      setStep('pin');
    }
  };

  const handlePinSubmit = () => {
    if (pin.length >= 4 && selectedRole) {
      onLogin(selectedRole, pin, name);
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPin(val);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center pt-24 md:pt-40 px-6 md:px-10 pb-32">
      <div className="text-center mb-12 md:mb-24 space-y-6 md:space-y-8 max-w-2xl">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-8xl font-black text-on-surface tracking-tighter leading-[0.9]"
        >
          {t['welcome']}
        </motion.h2>
      </div>

      <AnimatePresence mode="wait">
        {step === 'role' && (
          <motion.div 
            key="role"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="w-full max-w-xl space-y-12"
          >
            <button 
              onClick={() => handleRoleSelect('user')}
              className="w-full bg-primary-container/30 p-6 md:p-14 rounded-[2.5rem] md:rounded-[4.5rem] text-left group hover:bg-primary-container/50 transition-all relative overflow-hidden border border-primary-container/20 flex items-center gap-6 md:gap-10"
            >
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="w-16 h-16 md:w-20 md:h-20 bg-surface-container-lowest rounded-full flex items-center justify-center shadow-ambient group-hover:scale-110 transition-transform duration-500 shrink-0">
                <User className="w-8 h-8 md:w-10 md:h-10 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl md:text-4xl font-black text-on-primary-container mb-1 md:mb-2 tracking-tighter">{t['enter_user']}</h3>
                <p className="text-on-primary-container/60 text-sm md:text-xl mb-4 md:mb-6 font-bold leading-tight max-w-xs">{t['user_desc']}</p>
                <div className="flex items-center gap-3 text-on-primary-container font-black text-lg md:text-2xl tracking-tight">
                  Get started <ArrowRight className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-3 transition-transform duration-500" />
                </div>
              </div>
            </button>

            <button 
              onClick={() => handleRoleSelect('coach')}
              className="w-full bg-secondary-container/30 p-6 md:p-14 rounded-[2.5rem] md:rounded-[4.5rem] text-left group hover:bg-secondary-container/50 transition-all relative overflow-hidden border border-secondary-container/20 flex items-center gap-6 md:gap-10"
            >
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="w-16 h-16 md:w-20 md:h-20 bg-surface-container-lowest rounded-full flex items-center justify-center shadow-ambient group-hover:scale-110 transition-transform duration-500 shrink-0">
                <Settings className="w-8 h-8 md:w-10 md:h-10 text-secondary" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl md:text-4xl font-black text-on-secondary-container mb-1 md:mb-2 tracking-tighter">{t['enter_coach']}</h3>
                <p className="text-on-secondary-container/60 text-sm md:text-xl mb-4 md:mb-6 font-bold leading-tight max-w-xs">{t['coach_desc']}</p>
                <div className="flex items-center gap-3 text-on-secondary-container font-black text-lg md:text-2xl tracking-tight">
                  Manage clients <ArrowRight className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-3 transition-transform duration-500" />
                </div>
              </div>
            </button>

            <button 
              onClick={() => handleRoleSelect('owner')}
              className="w-full bg-tertiary-container/30 p-6 md:p-14 rounded-[2.5rem] md:rounded-[4.5rem] text-left group hover:bg-tertiary-container/50 transition-all relative overflow-hidden border border-tertiary-container/20 flex items-center gap-6 md:gap-10"
            >
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-tertiary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="w-16 h-16 md:w-20 md:h-20 bg-surface-container-lowest rounded-full flex items-center justify-center shadow-ambient group-hover:scale-110 transition-transform duration-500 shrink-0">
                <Shield className="w-8 h-8 md:w-10 md:h-10 text-tertiary" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl md:text-4xl font-black text-on-tertiary-container mb-1 md:mb-2 tracking-tighter">{t['enter_owner']}</h3>
                <p className="text-on-tertiary-container/60 text-sm md:text-xl mb-4 md:mb-6 font-bold leading-tight max-w-xs">{t['owner_desc']}</p>
                <div className="flex items-center gap-3 text-on-tertiary-container font-black text-lg md:text-2xl tracking-tight">
                  Full Access <ArrowRight className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-3 transition-transform duration-500" />
                </div>
              </div>
            </button>
          </motion.div>
        )}

        {step === 'name' && (
          <motion.div 
            key="name"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-xl"
          >
            <div className="bg-surface-container-lowest p-8 md:p-20 pt-20 md:pt-32 rounded-[3rem] md:rounded-[5rem] space-y-8 md:space-y-12 shadow-ambient border border-surface-container/50 relative">
              <button 
                onClick={() => setStep('role')}
                className="absolute top-6 left-6 p-3 rounded-full bg-surface-container hover:bg-surface-container-high transition-all active:scale-95"
              >
                <ArrowLeft className="w-5 h-5 text-primary" />
              </button>
              <div className="space-y-3 md:space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/40 ml-4">
                  {selectedRole === 'owner' ? t['enter_name'] : t['account_id']}
                </p>
                <div className="relative group">
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                    placeholder={selectedRole === 'owner' ? t['name_placeholder'] : 'Unique ID'}
                    className="w-full bg-surface-container/30 border-none rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 text-2xl md:text-4xl font-black focus:ring-8 focus:ring-primary/5 transition-all placeholder:text-on-surface-variant/10"
                  />
                </div>
              </div>

              <button 
                onClick={handleNameSubmit}
                disabled={!name.trim()}
                className={`w-full h-16 md:h-24 rounded-[2rem] md:rounded-[2.5rem] font-black text-lg md:text-2xl flex items-center justify-center gap-4 md:gap-6 transition-all duration-500 shadow-ambient active:scale-[0.97] ${
                  name.trim() ? 'bg-on-surface text-surface-container-lowest' : 'bg-surface-container text-on-surface-variant/20 cursor-not-allowed'
                }`}
              >
                {t['confirm_continue']} <ArrowRight className="w-6 h-6 md:w-8 md:h-8" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'pin' && (
          <motion.div 
            key="pin"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-xl"
          >
            <div className="bg-surface-container-lowest p-8 md:p-20 pt-20 md:pt-32 rounded-[3rem] md:rounded-[5rem] space-y-8 md:space-y-12 shadow-ambient border border-surface-container/50 relative">
              <button 
                onClick={() => setStep('name')}
                className="absolute top-6 left-6 p-3 rounded-full bg-surface-container hover:bg-surface-container-high transition-all active:scale-95"
              >
                <ArrowLeft className="w-5 h-5 text-primary" />
              </button>
              <div className="text-center space-y-2 md:space-y-4">
                <h2 className="text-3xl md:text-5xl font-black text-primary tracking-tighter leading-none">
                  {t['hi'] || 'Hi'} {name}!
                </h2>
                <p className="text-on-surface-variant/60 text-base md:text-xl font-bold tracking-tight">{t['secure_auth']}</p>
              </div>

              <div className="space-y-6">
                <div className="relative">
                  <input 
                    type={showPin ? "text" : "password"} 
                    value={pin}
                    onChange={handlePinChange}
                    onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
                    placeholder="••••"
                    className={`w-full bg-surface-container/30 border-none rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 text-3xl md:text-5xl font-black focus:ring-8 focus:ring-primary/5 transition-all placeholder:text-on-surface-variant/10 ${!showPin ? 'tracking-[1.2em]' : 'tracking-tight'}`}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 text-on-surface-variant/20 hover:text-primary/60 transition-colors"
                  >
                    {showPin ? <EyeOff className="w-6 h-6 md:w-10 md:h-10" /> : <Eye className="w-8 h-8 md:w-10 md:h-10" />}
                  </button>
                </div>
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-error text-center font-black text-sm md:text-lg bg-error/10 py-4 rounded-2xl"
                  >
                    {error}
                  </motion.p>
                )}
                <p className="text-[10px] text-on-surface-variant/40 font-black uppercase tracking-widest ml-4">{t['pin_hint']}</p>
              </div>

              <div className="space-y-6 md:space-y-8">
                <button 
                  onClick={handlePinSubmit}
                  disabled={pin.length < 4}
                  className={`w-full h-16 md:h-24 rounded-[2rem] md:rounded-[2.5rem] font-black text-lg md:text-2xl flex items-center justify-center gap-4 md:gap-6 transition-all duration-500 shadow-ambient active:scale-[0.97] ${
                    pin.length >= 4 ? 'bg-on-surface text-surface-container-lowest' : 'bg-surface-container text-on-surface-variant/20 cursor-not-allowed'
                  }`}
                >
                  {t['confirm_continue']} <Lock className="w-6 h-6 md:w-8 md:h-8" />
                </button>

                <button 
                  onClick={handleForgotClick}
                  className="w-full text-secondary/60 font-black flex items-center justify-center gap-3 md:gap-4 text-base md:text-xl hover:text-secondary transition-colors"
                >
                  {t['forgot_id_pin'] || 'Forgot your ID or PIN?'} <span className="w-5 h-5 md:w-8 md:h-8 rounded-full border-2 md:border-4 border-current flex items-center justify-center text-[8px] md:text-xs">?</span>
                </button>
              </div>

              <AnimatePresence>
                {showForgotPopup && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-on-surface/10 backdrop-blur-2xl"
                  >
                    <div className="bg-surface-container-lowest p-14 rounded-[4rem] shadow-ambient max-w-sm w-full text-center space-y-10 border border-surface-container/50">
                      <div className="w-24 h-24 bg-primary-container/50 rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <ShieldCheck className="w-12 h-12 text-on-primary-container" />
                      </div>
                      <p className="text-2xl font-black text-on-surface leading-tight tracking-tighter">
                        {selectedRole === 'user' 
                          ? (t['forgot_id_user'] || 'Coordinate with your coach for ID.')
                          : (t['forgot_id_coach'] || 'Coordinate with developers for new ID.')
                        }
                      </p>
                      <button 
                        onClick={() => setShowForgotPopup(false)}
                        className="w-full h-20 bg-on-surface text-surface-container-lowest rounded-full font-black text-xl shadow-ambient active:scale-[0.95] transition-transform"
                      >
                        {t['close'] || 'Close'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

const UserDashboard = ({ 
  stats, 
  language, 
  onAddWater,
  translations,
  userName,
  userProfile,
  onUpdateMetrics,
  onUpdateEnergyLevel,
  checkIns = [],
  onUpdateCheckIn,
  supplements = [],
  onAddSupplement,
  onToggleSupplement,
  onDeleteSupplement,
  newSupplementName,
  setNewSupplementName,
  newSupplementTime,
  setNewSupplementTime,
  showAddSupplement,
  setShowAddSupplement,
  cameraInputRef,
  fileInputRef,
  handleFileUpload,
  isAIProcessing,
  setSelectedMealType,
  selectedMealType,
  selectedDate,
  onDateChange
}: { 
  stats: UserStats; 
  language: Language;
  onAddWater: (amount: number) => void;
  translations?: Record<string, string>;
  userName?: string;
  userProfile?: UserProfile | null;
  onUpdateMetrics?: (height: number, weight: number) => void;
  onUpdateEnergyLevel?: (level: number) => void;
  checkIns?: UserStats['checkIns'];
  onUpdateCheckIn?: (id: string) => void;
  supplements?: UserStats['supplements'];
  onAddSupplement?: () => void;
  onToggleSupplement?: (id: string) => void;
  onDeleteSupplement?: (id: string) => void;
  newSupplementName: string;
  setNewSupplementName: (val: string) => void;
  newSupplementTime: string;
  setNewSupplementTime: (val: string) => void;
  showAddSupplement: boolean;
  setShowAddSupplement: (val: boolean) => void;
  cameraInputRef: React.RefObject<HTMLInputElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isAIProcessing: boolean;
  setSelectedMealType: (type: string) => void;
  selectedMealType: string | null;
  selectedDate: string;
  onDateChange: (date: string) => void;
}) => {
  const t = translations || TRANSLATIONS[language] || TRANSLATIONS['English'];
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [motivation, setMotivation] = useState('');
  const [foodFact, setFoodFact] = useState('');
  const [height, setHeight] = useState(userProfile?.height?.toString() || '');
  const [weight, setWeight] = useState(userProfile?.weight?.toString() || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditingMetrics, setIsEditingMetrics] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  useEffect(() => {
    if (userProfile?.height !== undefined && userProfile?.height !== null) {
      setHeight(userProfile.height.toString());
    }
    
    // 1. First, try to find weight for the specifically selected date in history
    const historicalWeight = userProfile?.weightHistory?.find(log => 
      new Date(log.date).toISOString().split('T')[0] === selectedDate
    );
    
    if (historicalWeight) {
      setWeight(historicalWeight.weight.toString());
    } else {
      // 2. If no entry for this specific date, show the LAST globally updated weight from the profile
      // This ensures that "tomorrow" or "later today" it still shows the previous value
      if (userProfile?.weight !== undefined && userProfile?.weight !== null) {
        setWeight(userProfile.weight.toString());
      }
    }
  }, [userProfile?.height, userProfile?.weight, userProfile?.weightHistory, selectedDate]);

  const calculateBMI = (h: string, w: string) => {
    const heightNum = parseFloat(h);
    const weightNum = parseFloat(w);
    if (heightNum > 0 && weightNum > 0) {
      const heightInMeters = heightNum / 100;
      return (weightNum / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return null;
  };

  const bmiValue = calculateBMI(height, weight);
  const bmiNum = bmiValue ? parseFloat(bmiValue) : 0;

  const getBMIDetails = (val: number) => {
    if (val === 0) return { label: '--', color: 'bg-surface-container', text: 'text-on-surface', percent: 0 };
    
    // Calculate percentage for a 15-40 scale
    const min = 15;
    const max = 40;
    const percent = Math.min(Math.max(((val - min) / (max - min)) * 100, 0), 100);

    if (val < 18.5) return { label: t['underweight'], color: 'bg-blue-400', text: 'text-blue-400', percent };
    if (val < 25) return { label: t['normal'], color: 'bg-green-500', text: 'text-green-500', percent };
    if (val < 30) return { label: t['overweight'], color: 'bg-orange-500', text: 'text-orange-500', percent };
    return { label: t['obese'], color: 'bg-red-500', text: 'text-red-500', percent };
  };

  const bmiDetails = getBMIDetails(bmiNum);

  useEffect(() => {
    const randomMotivation = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];
    const randomFact = FOOD_FACTS[Math.floor(Math.random() * FOOD_FACTS.length)];
    setMotivation(randomMotivation);
    setFoodFact(randomFact);
  }, []);

  const handleSaveAll = () => {
    setIsUpdating(true);
    // Always call onUpdateMetrics to ensure history and profile stay in sync 
    // even if weight hasn't changed (creating a new daily record)
    if (onUpdateMetrics) {
      onUpdateMetrics(parseFloat(height) || 0, parseFloat(weight) || 0);
    }
    
    setTimeout(() => {
      setIsUpdating(false);
      setIsEditingMetrics(false);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    }, 1000);
  };

  return (
    <main className="pt-20 md:pt-32 px-4 md:px-8 pb-32 md:pb-40 max-w-7xl mx-auto space-y-10 md:space-y-24">
      {/* Welcome Section - Organic Asymmetry */}
      <section className="flex flex-col md:flex-row items-start justify-between gap-6 md:gap-12 px-2 md:px-0">
        <div className="max-w-2xl space-y-1 md:space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-8xl font-black tracking-tighter leading-[0.9]"
          >
            {t['hi'] || 'Hi'}, <span className="text-primary">{userName || 'User'}</span>
          </motion.h1>
          <div 
            className="flex flex-wrap items-center gap-4 md:gap-8 cursor-pointer group/date"
            onClick={() => {
              if (dateInputRef.current) {
                if ('showPicker' in dateInputRef.current) {
                  dateInputRef.current.showPicker();
                } else {
                  dateInputRef.current.click();
                }
              }
            }}
          >
            <p className="text-lg md:text-2xl font-bold text-on-surface-variant opacity-60 tracking-tight group-hover/date:opacity-100 transition-opacity">
              {new Date(selectedDate).toLocaleDateString(language === 'Hindi' ? 'hi-IN' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <div className="relative">
              <input 
                ref={dateInputRef}
                type="date" 
                value={selectedDate}
                min={new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => onDateChange(e.target.value)}
                className="bg-surface-container-low border-none rounded-2xl px-6 py-3 text-sm md:text-base font-black text-primary shadow-sm focus:ring-4 focus:ring-primary/10 cursor-pointer transition-all hover:bg-surface-container w-full"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full animate-pulse pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Daily Update - Vocal Hierarchy (Moved to top) */}
      <section className="space-y-6 md:space-y-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8 px-2 md:px-6">
          <div className="space-y-2">
            <h2 className="text-xl md:text-5xl font-black tracking-tight">{t['health_snapshot']}</h2>
            <p className="text-sm md:text-2xl font-bold text-on-surface-variant opacity-60 tracking-tight">
              {stats.hydration.current >= stats.hydration.target && stats.calories.current <= stats.calories.target && stats.calories.current > 0
                ? 'You are crushing your goals today!' 
                : stats.hydration.current >= stats.hydration.target 
                ? 'Hydration goal met! Keep it up.' 
                : 'Stay hydrated! You can do it.'}
            </p>
          </div>
          
          {/* Personal Metrics Input */}
          <div className="bg-surface-container-low p-3 md:p-6 rounded-2xl md:rounded-[2.5rem] flex flex-wrap items-center gap-2 md:gap-4 shadow-sm border border-surface-container">
            {isEditingMetrics ? (
              <>
                <div className="flex items-center gap-2 md:gap-3">
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-40">Weight (kg)</span>
                  <input 
                    type="number" 
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveAll()}
                    className="w-16 md:w-20 bg-surface-container border-none rounded-lg md:rounded-xl p-2 font-black text-center focus:ring-2 focus:ring-primary/20"
                    placeholder="70"
                  />
                </div>
                <button 
                  onClick={handleSaveAll}
                  disabled={isUpdating || !weight}
                  className={`px-4 md:px-6 py-2 rounded-lg md:rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${
                    isUpdating ? 'bg-primary/20 text-primary' : 'bg-primary text-on-primary hover:shadow-lg active:scale-95'
                  }`}
                >
                  {isUpdating ? 'Updating...' : t['set']}
                </button>
                {isUpdating && <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin text-primary" />}
              </>
            ) : (
              <div className="flex items-center gap-6 md:gap-8 px-2 md:px-4">
                <div className="flex flex-col">
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-40">Weight</span>
                  <span className="text-lg md:text-xl font-black">{weight || '--'} kg</span>
                </div>
                <button 
                  onClick={() => setIsEditingMetrics(true)}
                  className="p-2 md:p-3 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                  title={t['edit']}
                >
                  <Pencil className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Hydration - Tactile & Calm */}
        <div className="mx-1 md:mx-6 bg-surface-container-lowest rounded-[2rem] md:rounded-[4rem] p-5 md:p-16 shadow-ambient relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between z-10 relative gap-6 md:gap-16">
            <div className="flex-1 space-y-5 md:space-y-10 w-full">
              <div className="space-y-1 md:space-y-4">
                <h3 className="text-lg md:text-4xl font-black tracking-tight">{t['stay_hydrated']}</h3>
                <div className="space-y-0.5 md:space-y-2">
                  <p className="text-sm md:text-2xl font-bold text-on-surface-variant opacity-60">
                    {Math.round((stats.hydration.current / (stats.hydration.target || 1)) * 100)}% of your goal for today.
                  </p>
                  <p className="text-base md:text-3xl font-black text-secondary flex items-center gap-2 md:gap-3">
                    <Milk className="w-4 h-4 md:w-8 md:h-8" />
                    {Number((stats.hydration.current / 0.5).toFixed(1))} / {Math.ceil((stats.hydration.target || 0) / 0.5)} {t['bottles']}
                    <span className="text-[8px] md:text-sm font-bold opacity-40 uppercase tracking-widest ml-1 md:ml-2">({t['bottles_needed']})</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 md:gap-6">
                <button 
                  onClick={() => onAddWater(0.1)}
                  className="h-12 md:h-20 px-4 md:px-10 bg-secondary-container text-on-secondary-container rounded-xl md:rounded-[2rem] font-black text-sm md:text-xl active:scale-95 transition-all flex items-center gap-2 md:gap-4 hover:shadow-lg"
                >
                  <Plus className="w-4 h-4 md:w-8 md:h-8" /> +100ml
                </button>
                <button 
                  onClick={() => onAddWater(0.25)}
                  className="h-12 md:h-20 px-5 md:px-12 bg-secondary text-on-secondary rounded-xl md:rounded-[2rem] font-black text-sm md:text-xl shadow-xl active:scale-95 transition-all flex items-center gap-2 md:gap-4 hover:brightness-110"
                >
                  <Plus className="w-4 h-4 md:w-8 md:h-8" /> +250ml
                </button>
                <button 
                  onClick={() => onAddWater(1.0)}
                  className="h-12 md:h-20 px-5 md:px-12 bg-primary text-on-primary rounded-xl md:rounded-[2rem] font-black text-sm md:text-xl shadow-xl active:scale-95 transition-all flex items-center gap-2 md:gap-4 hover:brightness-110"
                >
                  <Plus className="w-4 h-4 md:w-8 md:h-8" /> +1000ml
                </button>
              </div>
            </div>
            <div className="flex gap-2 md:gap-6 flex-wrap justify-center max-w-md">
              {Array.from({ length: Math.ceil((stats.hydration.target || 0) / 0.5) }).map((_, i) => {
                const fill = Math.min(Math.max((stats.hydration.current / 0.5) - i, 0), 1);
                return (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-3 h-1.5 bg-secondary/20 rounded-t-sm mb-[-1px] z-10" />
                    <div className={`w-8 md:w-14 h-20 md:h-32 bg-secondary-container rounded-t-[0.8rem] md:rounded-t-[1.5rem] rounded-b-lg md:rounded-b-2xl relative overflow-hidden shadow-inner border-2 border-secondary/10 ${fill === 0 ? 'opacity-30' : ''}`}>
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${fill * 100}%` }}
                        className="absolute bottom-0 w-full bg-secondary shadow-[0_-4px_12px_rgba(0,0,0,0.1)] transition-all duration-1000 ease-out" 
                      />
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-2 bg-white/20 rounded-full" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="absolute -right-40 -bottom-40 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[150px]" />
        </div>

        {/* BMI Row - Dedicated Horizontal Scale */}
        {bmiValue && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-2 md:mx-6 p-6 md:p-8 bg-surface-container-low rounded-[2rem] md:rounded-[3rem] border border-surface-container space-y-6 md:space-y-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-3 md:gap-4">
                <h3 className="text-[10px] md:text-sm font-black uppercase tracking-widest opacity-40">{t['bmi']}</h3>
                <span className={`text-3xl md:text-5xl font-black ${bmiDetails.text}`}>{bmiValue}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-base md:text-xl font-black ${bmiDetails.text}`}>{bmiDetails.label}</span>
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-30">Body Mass Index</span>
              </div>
            </div>
            
            <div className="relative h-6 w-full bg-surface-container rounded-full overflow-hidden flex">
              {/* Background Segments for visual guide */}
              <div className="h-full bg-blue-400/10 flex-[3.5] border-r border-background/20" />
              <div className="h-full bg-green-500/10 flex-[6.5] border-r border-background/20" />
              <div className="h-full bg-orange-500/10 flex-[5] border-r border-background/20" />
              <div className="h-full bg-red-500/10 flex-[10]" />
              
              {/* Indicator */}
              <motion.div 
                initial={{ left: 0 }}
                animate={{ left: `${bmiDetails.percent}%` }}
                className={`absolute top-0 bottom-0 w-1.5 shadow-xl z-10 ${bmiDetails.color}`}
                style={{ transform: 'translateX(-50%)' }}
              >
                <div className={`absolute -top-2 -bottom-2 -left-1 -right-1 blur-md ${bmiDetails.color} opacity-40`} />
              </motion.div>
            </div>
            
            <div className="relative h-10 text-[10px] font-black uppercase tracking-widest opacity-30">
              <div className="absolute left-0 flex flex-col items-center">
                <span>15</span>
                <span className="mt-1 whitespace-nowrap">{t['underweight']}</span>
              </div>
              <div className="absolute flex flex-col items-center -translate-x-1/2" style={{ left: '14%' }}>
                <span>18.5</span>
                <span className="mt-1 whitespace-nowrap">{t['normal']}</span>
              </div>
              <div className="absolute flex flex-col items-center -translate-x-1/2" style={{ left: '40%' }}>
                <span>25</span>
                <span className="mt-1 whitespace-nowrap">{t['overweight']}</span>
              </div>
              <div className="absolute flex flex-col items-center -translate-x-1/2" style={{ left: '60%' }}>
                <span>30</span>
                <span className="mt-1 whitespace-nowrap">{t['obese']}</span>
              </div>
              <div className="absolute right-0 flex flex-col items-center">
                <span>40</span>
                <span className="mt-1 whitespace-nowrap">Max</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Weight Tracking Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-2 md:mx-6 p-6 md:p-12 bg-surface-container-lowest rounded-[2.5rem] md:rounded-[4rem] border border-surface-container shadow-ambient space-y-8 md:space-y-10"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
            <div className="space-y-1 md:space-y-2">
              <h3 className="text-[10px] md:text-sm font-black uppercase tracking-widest opacity-40">{t['weight_tracking']}</h3>
              <div className="flex items-baseline gap-2 md:gap-3">
                <span className="text-3xl md:text-5xl font-black text-on-surface">{userProfile?.weight || weight || '--'}</span>
                <span className="text-base md:text-xl font-bold opacity-30 uppercase tracking-widest">kg</span>
              </div>
            </div>
            
            {userProfile?.weightHistory && userProfile.weightHistory.length > 1 && (
              <div className="flex items-center gap-4 bg-surface-container p-4 rounded-3xl">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  userProfile.weightHistory[userProfile.weightHistory.length - 1].weight < userProfile.weightHistory[0].weight 
                    ? 'bg-green-500/10 text-green-500' 
                    : 'bg-orange-500/10 text-orange-500'
                }`}>
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{t['weight_change']}</p>
                  <p className="text-lg font-black">
                    {(userProfile.weightHistory[userProfile.weightHistory.length - 1].weight - userProfile.weightHistory[0].weight).toFixed(1)} kg
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="h-[300px] w-full">
            {userProfile?.weightHistory && userProfile.weightHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userProfile.weightHistory.map(log => ({
                  ...log,
                  formattedDate: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                }))}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis 
                    dataKey="formattedDate" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 900, opacity: 0.3 }}
                    dy={10}
                  />
                  <YAxis 
                    hide 
                    domain={['dataMin - 5', 'dataMax + 5']} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '24px', 
                      border: 'none', 
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                      padding: '16px'
                    }}
                    itemStyle={{ fontWeight: 900, color: 'var(--color-primary)' }}
                    labelStyle={{ fontWeight: 900, marginBottom: '4px', opacity: 0.4 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="var(--color-primary)" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorWeight)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center bg-surface-container/20 rounded-[3rem] border-2 border-dashed border-surface-container">
                <Activity className="w-12 h-12 opacity-10 mb-4" />
                <p className="text-sm font-black uppercase tracking-widest opacity-20">{t['no_history_yet'] || 'No weight history yet'}</p>
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Energy Level Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-2 md:mx-6 p-6 md:p-12 bg-surface-container-low rounded-[2.5rem] md:rounded-[4rem] border border-surface-container shadow-ambient space-y-8 md:space-y-10"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
            <div className="space-y-1 md:space-y-2">
              <h3 className="text-[10px] md:text-sm font-black uppercase tracking-widest opacity-40">{t['energy_level']}</h3>
              <p className="text-lg md:text-xl font-bold text-on-surface-variant opacity-60 tracking-tight">{t['how_is_energy']}</p>
            </div>
            <div className="flex items-center gap-3 md:gap-4 bg-surface-container p-3 md:p-4 rounded-2xl md:rounded-3xl">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Zap className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-40">{t['current_stats']}</p>
                <p className="text-base md:text-lg font-black">{stats.energyLevel || 5} / 10</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="relative h-12 w-full bg-surface-container rounded-full overflow-hidden flex items-center px-2">
              <input 
                type="range" 
                min="1" 
                max="10" 
                step="1"
                value={stats.energyLevel || 5}
                onChange={(e) => onUpdateEnergyLevel && onUpdateEnergyLevel(parseInt(e.target.value))}
                className="w-full h-full opacity-0 cursor-pointer z-10"
              />
              <motion.div 
                className="absolute left-2 h-8 bg-primary rounded-full shadow-lg pointer-events-none"
                initial={false}
                animate={{ width: `calc(${((stats.energyLevel || 5) - 1) / 9 * 100}% + ${((10 - (stats.energyLevel || 5)) / 9) * 32}px)` }}
                style={{ minWidth: '32px' }}
              />
            </div>
          </div>
        </motion.div>

        {/* Daily Check-in Section (Moved from Food Page) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-2 md:mx-6 bg-surface-container-lowest p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-ambient border-2 border-primary/10 space-y-6 md:space-y-8"
        >
          <div className="flex items-center justify-between bg-primary/10 p-4 rounded-2xl border border-primary/20">
            <h3 className="text-[10px] md:text-sm font-black uppercase tracking-[0.3em] text-primary">{t['check_in_title'] || 'Daily Check-in'}</h3>
            <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            {checkIns.map((ci) => (
              <button
                key={ci.id}
                onClick={() => onUpdateCheckIn(ci.id)}
                className={`flex flex-col items-center gap-3 md:gap-4 p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border transition-all duration-500 ${
                  ci.checked 
                    ? 'bg-primary/10 border-primary shadow-sm' 
                    : 'bg-surface-container/30 border-surface-container/50 hover:bg-surface-container/50'
                }`}
              >
                <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                  ci.checked 
                    ? 'bg-primary border-primary' 
                    : 'border-on-surface-variant/20'
                }`}>
                  {ci.checked && <Check className="w-4 h-4 md:w-5 md:h-5 text-on-primary" />}
                </div>
                <span className={`text-[10px] md:text-xs font-black uppercase tracking-widest transition-colors ${
                  ci.checked ? 'text-primary' : 'opacity-40'
                }`}>
                  {t[ci.id] || ci.label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Supplements Section (Moved from Food Page) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-2 md:mx-6 bg-surface-container-lowest p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-ambient border-2 border-primary/10 space-y-6 md:space-y-8"
        >
          <div className="flex items-center justify-between bg-primary/10 p-4 rounded-2xl border border-primary/20">
            <div className="space-y-1">
              <h3 className="text-[10px] md:text-sm font-black uppercase tracking-[0.3em] text-primary">{t['supplements'] || 'Supplements'}</h3>
              <p className="text-xl md:text-3xl font-black tracking-tight">{t['daily_routine']}</p>
            </div>
            <button 
              onClick={() => setShowAddSupplement(!showAddSupplement)}
              className="bg-primary text-on-primary w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
            >
              <Plus className={`w-6 h-6 md:w-8 md:h-8 transition-transform duration-500 ${showAddSupplement ? 'rotate-45' : ''}`} />
            </button>
          </div>

          <AnimatePresence>
            {showAddSupplement && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 md:p-12 bg-surface-container/30 rounded-[2.5rem] md:rounded-[4rem] border border-surface-container/50 space-y-8 md:space-y-12 shadow-2xl">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <h4 className="text-2xl md:text-4xl font-black tracking-tighter">New Supplement</h4>
                      <p className="text-xs md:text-sm font-bold opacity-40">Add to your daily routine</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                    <div className="space-y-3">
                      <label className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-40 ml-3">Supplement Name</label>
                      <input 
                        type="text"
                        value={newSupplementName}
                        onChange={(e) => setNewSupplementName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onAddSupplement()}
                        placeholder="e.g. Omega-3"
                        className="w-full bg-surface-container-lowest p-5 md:p-7 rounded-2xl md:rounded-[2rem] font-black text-lg md:text-xl focus:ring-4 ring-primary/10 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-40 ml-3">Time</label>
                      <input 
                        type="text"
                        value={newSupplementTime}
                        onChange={(e) => setNewSupplementTime(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onAddSupplement()}
                        placeholder="e.g. 8:00 AM"
                        className="w-full bg-surface-container-lowest p-5 md:p-7 rounded-2xl md:rounded-[2rem] font-black text-lg md:text-xl focus:ring-4 ring-primary/10 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={onAddSupplement}
                    className="w-full bg-primary text-on-primary py-6 md:py-8 rounded-2xl md:rounded-[2rem] font-black text-xl md:text-2xl shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all"
                  >
                    Add to Routine
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
            {supplements.map((s) => (
              <div 
                key={s.id}
                className={`group flex items-center justify-between p-6 md:p-8 rounded-[2.5rem] md:rounded-[3.5rem] border transition-all duration-500 hover:shadow-ambient ${
                  s.checked 
                    ? 'bg-primary/10 border-primary/30' 
                    : 'bg-surface-container/30 border-surface-container/50'
                }`}
              >
                <div className="flex items-center gap-6 md:gap-8">
                  <button 
                    onClick={() => onToggleSupplement?.(s.id)}
                    className={`w-10 h-10 md:w-14 md:h-14 rounded-2xl md:rounded-[1.5rem] border-2 flex items-center justify-center transition-all duration-500 ${
                      s.checked 
                        ? 'bg-primary border-primary shadow-lg' 
                        : 'border-on-surface-variant/20 hover:border-primary/50'
                    }`}
                  >
                    {s.checked && <Check className="w-6 h-6 md:w-8 md:h-8 text-on-primary" />}
                  </button>
                  <div className="space-y-1">
                    <p className={`font-black text-lg md:text-2xl tracking-tight transition-colors ${s.checked ? 'text-primary' : 'text-on-surface'}`}>{s.name}</p>
                    <div className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest opacity-30">
                      <Clock className="w-3 h-3 md:w-4 md:h-4" />
                      {s.time}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => onDeleteSupplement?.(s.id)}
                  className="w-10 h-10 md:w-14 md:h-14 bg-surface-container-lowest rounded-full flex items-center justify-center text-error opacity-0 group-hover:opacity-100 transition-all hover:bg-error/10"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            {supplements.length === 0 && !showAddSupplement && (
              <div className="col-span-full py-16 md:py-24 flex flex-col items-center justify-center bg-surface-container/10 rounded-[2.5rem] md:rounded-[4rem] border-2 border-dashed border-surface-container">
                <p className="text-[10px] md:text-sm font-black uppercase tracking-widest opacity-30">No supplements added yet</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Photo Actions - 4 Meal Sections */}
        <div className="mx-2 md:mx-6 bg-surface-container-lowest p-6 md:p-12 rounded-[2.5rem] md:rounded-[4.5rem] shadow-ambient border border-surface-container/50 space-y-8 md:space-y-12 relative overflow-hidden">
          <div className="space-y-6 md:space-y-8">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-[10px] md:text-sm font-black uppercase tracking-[0.3em] opacity-40">{t['log_meal'] || 'Log Your Meals'}</h3>
              <Utensils className="w-5 h-5 md:w-6 md:h-6 opacity-20" />
            </div>
            
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 transition-opacity duration-500 ${isAIProcessing ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
              {[
                { id: 'breakfast', label: t['breakfast'] || 'Breakfast', icon: Coffee, color: 'primary' },
                { id: 'lunch', label: t['lunch'] || 'Lunch', icon: Utensils, color: 'secondary' },
                { id: 'snacks', label: t['snacks'] || 'Snacks', icon: Cookie, color: 'tertiary' },
                { id: 'dinner', label: t['dinner'] || 'Dinner', icon: Moon, color: 'primary' }
              ].map((meal) => (
                <div key={meal.id} className="bg-surface-container/30 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-surface-container/50 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 md:w-14 md:h-14 bg-${meal.color}/10 rounded-2xl flex items-center justify-center text-${meal.color}`}>
                      <meal.icon className="w-5 h-5 md:w-7 md:h-7" />
                    </div>
                    <h4 className="font-black text-lg md:text-2xl tracking-tight">{meal.label}</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <button 
                      onClick={() => {
                        setSelectedMealType(meal.id);
                        setTimeout(() => cameraInputRef.current?.click(), 0);
                      }}
                      className="flex flex-col items-center justify-center gap-2 p-4 bg-surface-container-lowest rounded-2xl md:rounded-3xl hover:bg-primary/5 transition-all active:scale-[0.95] border border-surface-container shadow-sm"
                    >
                      <Camera className="w-5 h-5 text-primary" />
                      <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-60">{t['take_photo']}</span>
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedMealType(meal.id);
                        setTimeout(() => fileInputRef.current?.click(), 0);
                      }}
                      className="flex flex-col items-center justify-center gap-2 p-4 bg-surface-container-lowest rounded-2xl md:rounded-3xl hover:bg-secondary/5 transition-all active:scale-[0.95] border border-surface-container shadow-sm"
                    >
                      <ImageIcon className="w-5 h-5 text-secondary" />
                      <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-60">{t['upload_photo'] || 'Upload'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Hidden Inputs */}
          <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            ref={cameraInputRef}
            className="hidden"
            onChange={handleFileUpload}
          />
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileUpload}
          />

          {isAIProcessing && (
            <div className="absolute inset-0 bg-surface/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-4 z-20">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="font-black uppercase tracking-widest text-primary">Analysing {selectedMealType}...</p>
            </div>
          )}
        </div>

        {/* Final Save Button */}
        <div className="flex justify-center pt-10 md:pt-20">
          <button 
            onClick={handleSaveAll}
            disabled={isUpdating}
            className={`w-full md:w-auto px-12 py-6 rounded-[2rem] font-black text-xl uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-4 ${
              showSaveSuccess 
                ? 'bg-green-500 text-white' 
                : 'bg-on-surface text-surface-container-lowest hover:scale-105 active:scale-95'
            }`}
          >
            {isUpdating ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : showSaveSuccess ? (
              <Check className="w-8 h-8" />
            ) : (
              <CheckCircle2 className="w-8 h-8" />
            )}
            {isUpdating ? 'Saving...' : showSaveSuccess ? 'Saved!' : t['save_changes'] || 'Save Daily Progress'}
          </button>
        </div>
      </section>
    </main>
  );
};

const LogMealScreen = ({ 
  language, 
  onLogMeal,
  onDeleteMeal,
  translations,
  meals = [],
  stats,
  mealName,
  setMealName,
  kcal,
  setKcal,
  protein,
  setProtein,
  carbs,
  setCarbs,
  fats,
  setFats,
  fiber,
  setFiber,
  isAIProcessing,
  aiError,
  setAiError,
  isEditable,
  setIsEditable,
  uploadedImage,
  setUploadedImage,
  selectedDate
}: { 
  language: Language;
  onLogMeal: () => void;
  onDeleteMeal?: (id: string) => void;
  translations?: Record<string, string>;
  meals?: UserStats['meals'];
  stats: UserStats;
  mealName: string;
  setMealName: (val: string) => void;
  kcal: string;
  setKcal: (val: string) => void;
  protein: string;
  setProtein: (val: string) => void;
  carbs: string;
  setCarbs: (val: string) => void;
  fats: string;
  setFats: (val: string) => void;
  fiber: string;
  setFiber: (val: string) => void;
  isAIProcessing: boolean;
  aiError: string | null;
  setAiError: (val: string | null) => void;
  isEditable: boolean;
  setIsEditable: (val: boolean) => void;
  uploadedImage: string | null;
  setUploadedImage: (val: string | null) => void;
  selectedDate: string;
}) => {
  const t = translations || TRANSLATIONS[language] || TRANSLATIONS['English'];

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const handleLog = () => {
    onLogMeal();
  };

  return (
    <div className="min-h-screen bg-surface">
      <main className="pt-20 md:pt-40 px-4 md:px-16 max-w-7xl mx-auto space-y-12 md:y-24 pb-48">
        {/* Header Section - Organic Asymmetry */}
        <div className="relative">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3 md:space-y-6 max-w-2xl"
          >
            <div className="flex items-center gap-4">
              <p className="text-[8px] md:text-xs font-black uppercase tracking-[0.5em] text-primary/40 ml-2">{t['log_meal']}</p>
              {!isToday && (
                <span className="bg-primary/10 text-primary text-[8px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  {new Date(selectedDate).toLocaleDateString(language === 'Hindi' ? 'hi-IN' : 'en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] text-on-surface">
              {isToday ? (t['tell_us_what_ate'] || 'Tell us what all you ate today') : `Logging for ${new Date(selectedDate).toLocaleDateString(language === 'Hindi' ? 'hi-IN' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
            </h2>
          </motion.div>
          
          {/* Decorative Element */}
          <div className="absolute -top-10 -right-10 w-48 h-48 md:w-64 md:h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
        </div>

        <div className="max-w-4xl mx-auto space-y-12">
          {/* Meal Name Input - Only visible when logging */}
          {(mealName || isAIProcessing) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface-container-lowest p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border-2 border-primary shadow-ambient space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] md:text-sm font-black uppercase tracking-[0.3em] text-primary">{t['meal_name'] || 'Meal Name'}</h3>
                {!isAIProcessing && (
                  <button 
                    onClick={() => {
                      setMealName('');
                      setKcal('');
                      setProtein('');
                      setCarbs('');
                      setFats('');
                      setFiber('');
                      setUploadedImage(null);
                    }}
                    className="text-error font-bold text-xs uppercase tracking-widest hover:underline"
                  >
                    {t['cancel'] || 'Cancel'}
                  </button>
                )}
              </div>
              <input 
                type="text"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                placeholder={t['meal_placeholder'] || 'What did you eat?'}
                className="w-full bg-transparent border-none p-0 text-2xl md:text-4xl font-black tracking-tighter focus:ring-0 placeholder:opacity-20"
                disabled={isAIProcessing}
              />
              {isAIProcessing && (
                <div className="flex items-center gap-3 text-primary animate-pulse">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-xs font-black uppercase tracking-widest">{t['analysing_meal'] || 'Analysing...'}</span>
                </div>
              )}
            </motion.div>
          )}

          {/* Nutrition Overview (Moved from Dashboard) */}
          <div className="grid grid-cols-1 gap-6 md:gap-10">
            {/* Daily Calories Progress */}
            <div className="bg-surface-container-lowest rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-12 shadow-ambient flex flex-col justify-between border border-surface-container/50">
              <div className="space-y-6 md:space-y-8">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-14 md:h-14 bg-primary-container rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm">
                    <Flame className="w-5 h-5 md:w-7 md:h-7 text-on-primary-container" />
                  </div>
                  <h3 className="text-xs md:text-sm font-black text-on-surface-variant uppercase tracking-[0.2em]">{t['daily_calories']}</h3>
                </div>
                <div className="space-y-1 md:space-y-2">
                  {(mealName || isAIProcessing) ? (
                    <div className="space-y-2">
                      <p className="text-xs font-black uppercase tracking-widest opacity-40">{t['kcal'] || 'kcal'}</p>
                      <input 
                        type="number"
                        value={kcal}
                        onChange={(e) => setKcal(e.target.value)}
                        className="text-4xl md:text-6xl font-black tracking-tighter text-primary bg-transparent border-none p-0 focus:ring-0 w-full"
                        placeholder="0"
                        disabled={isAIProcessing}
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-4xl md:text-6xl font-black tracking-tighter text-on-surface">
                        {stats.calories.current.toLocaleString()}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm md:text-xl font-extrabold text-primary">/ {stats.calories.target.toLocaleString()}</span>
                        <span className="text-[10px] md:text-xs font-bold text-on-surface-variant opacity-40 uppercase tracking-widest">{t['kcal']}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-6 md:mt-8 h-3 md:h-4 bg-surface-container rounded-full overflow-hidden p-0.5 shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((stats.calories.current / (stats.calories.target || 1)) * 100, 100)}%` }}
                  className="h-full bg-primary rounded-full shadow-sm" 
                />
              </div>
            </div>
          </div>

          {/* Macro Breakdown (Moved from Dashboard) - Restructured to Columns */}
          <div className="space-y-6">
            {[
              { label: t['protein'], current: stats.protein.current, target: stats.protein.target, color: 'secondary', icon: Zap, value: protein, setter: setProtein },
              { label: t['carbs'], current: stats.carbs.current, target: stats.carbs.target, color: 'tertiary', icon: Utensils, value: carbs, setter: setCarbs },
              { label: t['fats'], current: stats.fats.current, target: stats.fats.target, color: 'primary', icon: Droplets, value: fats, setter: setFats },
              { label: t['fiber'], current: stats.fiber.current, target: stats.fiber.target, color: 'secondary', icon: Leaf, value: fiber, setter: setFiber },
            ].map((macro, i) => (
              <div key={i} className={`bg-surface-container-lowest rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-ambient border transition-all duration-500 flex flex-col gap-6 ${ (mealName || isAIProcessing) ? 'border-primary/30 ring-1 ring-primary/10' : 'border-surface-container/50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 md:w-12 md:h-12 bg-${macro.color}-container rounded-xl flex items-center justify-center`}>
                      <macro.icon className={`w-5 h-5 md:w-6 md:h-6 text-on-${macro.color}-container`} />
                    </div>
                    <h3 className="text-xs md:text-sm font-black text-on-surface-variant uppercase tracking-[0.2em]">{macro.label}</h3>
                  </div>
                  <div className="text-right">
                    {(mealName || isAIProcessing) ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="number"
                          value={macro.value}
                          onChange={(e) => macro.setter(e.target.value)}
                          className="w-20 md:w-32 bg-surface-container/50 p-2 rounded-xl text-right font-black text-xl md:text-2xl focus:ring-2 focus:ring-primary border-none"
                          placeholder="0"
                          disabled={isAIProcessing}
                        />
                        <span className="text-sm font-bold opacity-40">g</span>
                      </div>
                    ) : (
                      <p className="text-2xl md:text-3xl font-black tracking-tight">{macro.current}g <span className="text-sm opacity-40 font-bold">/ {macro.target}g</span></p>
                    )}
                  </div>
                </div>
                <div className="h-3 md:h-4 bg-surface-container rounded-full overflow-hidden p-0.5 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((macro.current / (macro.target || 1)) * 100, 100)}%` }}
                    className={`h-full bg-${macro.color} rounded-full shadow-sm`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Save Button - Only visible when logging */}
          {(mealName || isAIProcessing) && !isAIProcessing && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky bottom-24 z-20 px-4"
            >
              <button 
                onClick={handleLog}
                className="w-full bg-primary text-on-primary py-6 md:py-10 rounded-2xl md:rounded-[3rem] font-black text-xl md:text-3xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 border-4 border-on-primary/10"
              >
                <CheckCircle2 className="w-6 h-6 md:w-10 md:h-10" />
                {t['confirm_save'] || 'Save this meal'}
              </button>
            </motion.div>
          )}

          {/* Recent Meals List */}
          <div className="space-y-6 md:space-y-8">
            <div className="flex items-center justify-between px-4 md:px-6">
              <h3 className="text-[10px] md:text-sm font-black uppercase tracking-[0.3em] opacity-40">{t['recent_meals'] || 'Recent Meals'}</h3>
              <Clock className="w-5 h-5 md:w-6 md:h-6 opacity-20" />
            </div>

            <div className="space-y-4 md:gap-6">
              {meals.map((meal) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={meal.id}
                  className="group bg-surface-container-lowest p-4 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-surface-container/50 shadow-sm hover:shadow-ambient transition-all duration-500 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4 md:gap-8">
                    <div className="w-12 h-12 md:w-20 md:h-20 bg-primary/5 rounded-2xl md:rounded-[2rem] flex items-center justify-center">
                      <Utensils className="w-6 h-6 md:w-10 md:h-10 text-primary opacity-40" />
                    </div>
                    <div className="space-y-1 md:space-y-2">
                      <p className="font-black text-lg md:text-2xl tracking-tight">{meal.name}</p>
                      <div className="flex flex-wrap items-center gap-2 md:gap-4">
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-widest bg-primary/10 text-primary px-2 md:px-3 py-1 rounded-full">{meal.kcal} {t['kcal']}</span>
                        <span className="text-[8px] md:text-[10px] font-bold opacity-30 uppercase tracking-widest">{meal.time}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => onDeleteMeal?.(meal.id)}
                    className="w-10 h-10 md:w-14 md:h-14 bg-surface-container-lowest rounded-full flex items-center justify-center text-error opacity-0 group-hover:opacity-100 transition-all hover:bg-error/10"
                  >
                    <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </motion.div>
              ))}
              {meals.length === 0 && (
                <div className="py-12 md:py-24 flex flex-col items-center justify-center bg-surface-container/10 rounded-[2.5rem] md:rounded-[4rem] border-2 border-dashed border-surface-container">
                  <Utensils className="w-12 h-12 md:w-20 md:h-20 opacity-10 mb-4 md:mb-6" />
                  <p className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-30">{t['no_meals_yet'] || 'No meals logged'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const CoachDashboard = ({ 
  language,
  translations,
  userName,
  coachProfile,
  assignedUsers,
  onUpdateUserStats,
  onUpdateUserMeal,
  onUpdateUserFeedback
}: { 
  language: Language;
  translations?: Record<string, string>;
  userName?: string;
  coachProfile: UserProfile | null;
  assignedUsers: AssignedUser[];
  onUpdateUserStats: (userId: string, updates: Partial<UserStats>) => void;
  onUpdateUserMeal: (userId: string, mealId: string, updates: Partial<UserStats['meals'][0]>) => void;
  onUpdateUserFeedback: (userId: string, feedback: string) => void;
}) => {
  const [selectedUser, setSelectedUser] = useState<AssignedUser | null>(null);
  const [editingGoal, setEditingGoal] = useState<{ type: string; value: string } | null>(null);
  const [editingMeal, setEditingMeal] = useState<{ mealId: string; field: string; value: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tempFeedback, setTempFeedback] = useState('');
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  const t = translations || TRANSLATIONS[language] || TRANSLATIONS['English'];

  const coachUsers = assignedUsers.filter(u => u.coachId === coachProfile?.id);
  const filteredUsers = coachUsers.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Overall Report Stats
  const activeToday = coachUsers.filter(u => u.stats.calories.current > 0).length;

  const getGoalColor = (current: number, target: number) => {
    if (target === 0) return 'bg-surface-container';
    const percent = (current / target) * 100;
    if (percent >= 90) return 'bg-emerald-500'; 
    if (percent >= 80) return 'bg-emerald-300'; 
    return 'bg-error';
  };

  const handleGoalUpdate = (type: string, value: string) => {
    if (!selectedUser) return;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    const updates: any = {};
    if (type === 'calories') updates.calories = { ...selectedUser.stats.calories, target: numValue };
    if (type === 'hydration') updates.hydration = { ...selectedUser.stats.hydration, target: numValue };
    if (type === 'protein') updates.protein = { ...selectedUser.stats.protein, target: numValue };
    if (type === 'carbs') updates.carbs = { ...selectedUser.stats.carbs, target: numValue };
    if (type === 'fats') updates.fats = { ...selectedUser.stats.fats, target: numValue };
    if (type === 'fiber') updates.fiber = { ...selectedUser.stats.fiber, target: numValue };

    onUpdateUserStats(selectedUser.id, updates);
    
    // Update local state for immediate feedback
    setSelectedUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        stats: {
          ...prev.stats,
          ...updates
        }
      };
    });
    setEditingGoal(null);
  };

  const handleMealUpdate = (mealId: string, field: string, value: string) => {
    if (!selectedUser) return;
    const numValue = parseFloat(value);
    if (isNaN(numValue) && field !== 'name') return;

    const updates: any = { [field]: field === 'name' ? value : numValue };
    onUpdateUserMeal(selectedUser.id, mealId, updates);

    // Update local state
    setSelectedUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        meals: prev.meals?.map(m => m.id === mealId ? { ...m, ...updates } : m),
        stats: {
          ...prev.stats,
          meals: prev.stats.meals.map(m => m.id === mealId ? { ...m, ...updates } : m)
        }
      };
    });
    setEditingMeal(null);
  };

  const handleSaveFeedback = () => {
    if (!selectedUser) return;
    setIsSavingFeedback(true);
    onUpdateUserFeedback(selectedUser.id, tempFeedback);
    setTimeout(() => {
      setIsSavingFeedback(false);
      setSelectedUser(prev => prev ? { ...prev, feedback: tempFeedback } : null);
    }, 800);
  };

  useEffect(() => {
    if (selectedUser) {
      setTempFeedback(selectedUser.feedback || '');
    }
  }, [selectedUser]);

  if (selectedUser) {
    return (
      <main className="pt-20 md:pt-32 px-4 md:px-8 max-w-7xl mx-auto space-y-8 md:space-y-16 pb-40">
        <button 
          onClick={() => setSelectedUser(null)}
          className="group flex items-center gap-3 text-primary font-black text-sm md:text-lg uppercase tracking-widest"
        >
          <div className="w-8 h-8 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:-translate-x-2 transition-transform">
            <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
          </div>
          {t['back_to_users']}
        </button>

        <div className="bg-surface-container-lowest rounded-[2rem] md:rounded-[4rem] p-6 md:p-16 shadow-ambient space-y-8 md:space-y-16">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-10 text-center md:text-left">
            <img 
              src={selectedUser.avatar} 
              alt={selectedUser.name} 
              className="w-20 h-20 md:w-32 md:h-32 rounded-[1.2rem] md:rounded-[2.5rem] object-cover shadow-lg"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-1 md:space-y-2">
              <h3 className="text-2xl md:text-5xl font-extrabold tracking-tighter leading-none">{selectedUser.name}</h3>
              <p className="text-base md:text-2xl font-bold text-on-surface-variant opacity-60">{selectedUser.status}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Calories */}
            <div className="space-y-6">
              <div className="flex justify-between items-end px-2">
                <p className="text-sm font-black uppercase tracking-widest opacity-40">{t['daily_calories']}</p>
                <div className="flex items-center gap-2">
                  {editingGoal?.type === 'calories' ? (
                    <input 
                      type="number"
                      value={editingGoal.value}
                      onChange={(e) => setEditingGoal({ ...editingGoal, value: e.target.value })}
                      onBlur={() => handleGoalUpdate('calories', editingGoal.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleGoalUpdate('calories', editingGoal.value)}
                      className="w-24 bg-surface-container p-1 rounded font-black text-right"
                      autoFocus
                    />
                  ) : (
                    <p 
                      className="text-2xl font-black cursor-pointer hover:text-primary transition-colors"
                      onClick={() => setEditingGoal({ type: 'calories', value: selectedUser.stats.calories.target.toString() })}
                    >
                      {selectedUser.stats.calories.current} <span className="text-sm opacity-40">/ {selectedUser.stats.calories.target} kcal</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="h-6 bg-surface-container rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((selectedUser.stats.calories.current / selectedUser.stats.calories.target) * 100, 100)}%` }}
                  className={`h-full transition-all duration-1000 ${getGoalColor(selectedUser.stats.calories.current, selectedUser.stats.calories.target)}`}
                />
              </div>
            </div>

            {/* Water */}
            <div className="space-y-6">
              <div className="flex justify-between items-end px-2">
                <p className="text-sm font-black uppercase tracking-widest opacity-40">{t['water_intake']}</p>
                <div className="flex items-center gap-2">
                  {editingGoal?.type === 'hydration' ? (
                    <input 
                      type="number"
                      step="0.1"
                      value={editingGoal.value}
                      onChange={(e) => setEditingGoal({ ...editingGoal, value: e.target.value })}
                      onBlur={() => handleGoalUpdate('hydration', editingGoal.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleGoalUpdate('hydration', editingGoal.value)}
                      className="w-24 bg-surface-container p-1 rounded font-black text-right"
                      autoFocus
                    />
                  ) : (
                    <p 
                      className="text-2xl font-black cursor-pointer hover:text-primary transition-colors"
                      onClick={() => setEditingGoal({ type: 'hydration', value: selectedUser.stats.hydration.target.toString() })}
                    >
                      {selectedUser.stats.hydration.current} <span className="text-sm opacity-40">/ {selectedUser.stats.hydration.target} L</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="h-6 bg-surface-container rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((selectedUser.stats.hydration.current / selectedUser.stats.hydration.target) * 100, 100)}%` }}
                  className={`h-full transition-all duration-1000 ${getGoalColor(selectedUser.stats.hydration.current, selectedUser.stats.hydration.target)}`}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-16 border-t border-surface-container">
            {/* Detailed Nutrition */}
            <div className="lg:col-span-5 space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-3xl font-extrabold tracking-tight">{t['nutrition_details']}</h4>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { id: 'protein', label: t['protein'], value: selectedUser.stats.protein.current, target: selectedUser.stats.protein.target, color: 'primary' },
                  { id: 'carbs', label: t['carbs'], value: selectedUser.stats.carbs.current, target: selectedUser.stats.carbs.target, color: 'secondary' },
                  { id: 'fats', label: t['fats'], value: selectedUser.stats.fats.current, target: selectedUser.stats.fats.target, color: 'tertiary' },
                  { id: 'fiber', label: t['fiber'], value: selectedUser.stats.fiber.current, target: selectedUser.stats.fiber.target, color: 'primary' },
                ].map((stat, i) => (
                  <div key={i} className="bg-surface-container-low p-8 rounded-[2.5rem] space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{stat.label}</p>
                    <p className={`text-3xl font-black text-${stat.color}`}>{stat.value}g</p>
                    {editingGoal?.type === stat.id ? (
                      <input 
                        type="number"
                        value={editingGoal.value}
                        onChange={(e) => setEditingGoal({ ...editingGoal, value: e.target.value })}
                        onBlur={() => handleGoalUpdate(stat.id, editingGoal.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleGoalUpdate(stat.id, editingGoal.value)}
                        className="w-full bg-surface-container p-1 rounded font-black text-xs"
                        autoFocus
                      />
                    ) : (
                      <p 
                        className="text-xs font-bold opacity-40 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => setEditingGoal({ type: stat.id, value: stat.target.toString() })}
                      >
                        of {stat.target}g
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Meals */}
            <div className="lg:col-span-7 space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary-container rounded-full flex items-center justify-center">
                  <Utensils className="w-6 h-6 text-secondary" />
                </div>
                <h4 className="text-3xl font-extrabold tracking-tight">{t['daily_meals']}</h4>
              </div>
              {selectedUser.meals && selectedUser.meals.length > 0 ? (
                <div className="space-y-6">
                  {selectedUser.meals.map((meal) => (
                    <div key={meal.id} className="bg-surface-container-low p-8 rounded-[3rem] space-y-6 hover:shadow-ambient transition-all">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          {editingMeal?.mealId === meal.id && editingMeal.field === 'name' ? (
                            <input 
                              type="text"
                              value={editingMeal.value}
                              onChange={(e) => setEditingMeal({ ...editingMeal, value: e.target.value })}
                              onBlur={() => handleMealUpdate(meal.id, 'name', editingMeal.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleMealUpdate(meal.id, 'name', editingMeal.value)}
                              className="text-2xl font-extrabold tracking-tight bg-surface-container p-1 rounded w-full"
                              autoFocus
                            />
                          ) : (
                            <p 
                              className="text-2xl font-extrabold tracking-tight cursor-pointer hover:text-primary transition-colors"
                              onClick={() => setEditingMeal({ mealId: meal.id, field: 'name', value: meal.name })}
                            >
                              {meal.name}
                            </p>
                          )}
                          <p className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
                            <Clock className="w-4 h-4" /> {meal.time}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {editingMeal?.mealId === meal.id && editingMeal.field === 'kcal' ? (
                            <input 
                              type="number"
                              value={editingMeal.value}
                              onChange={(e) => setEditingMeal({ ...editingMeal, value: e.target.value })}
                              onBlur={() => handleMealUpdate(meal.id, 'kcal', editingMeal.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleMealUpdate(meal.id, 'kcal', editingMeal.value)}
                              className="w-20 bg-primary text-on-primary px-2 py-1 rounded-full text-sm font-black"
                              autoFocus
                            />
                          ) : (
                            <div 
                              className="bg-primary text-on-primary px-6 py-2 rounded-full text-sm font-black shadow-sm cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => setEditingMeal({ mealId: meal.id, field: 'kcal', value: meal.kcal.toString() })}
                            >
                              {meal.kcal} kcal
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-6 text-xs font-black uppercase tracking-widest opacity-60">
                        {[
                          { id: 'protein', label: 'P', value: meal.protein },
                          { id: 'carbs', label: 'C', value: meal.carbs },
                          { id: 'fats', label: 'F', value: meal.fats },
                          { id: 'fiber', label: 'Fib', value: meal.fiber },
                        ].map((field) => (
                          <div key={field.id} className="flex items-center gap-1">
                            <span>{field.label}:</span>
                            {editingMeal?.mealId === meal.id && editingMeal.field === field.id ? (
                              <input 
                                type="number"
                                value={editingMeal.value}
                                onChange={(e) => setEditingMeal({ ...editingMeal, value: e.target.value })}
                                onBlur={() => handleMealUpdate(meal.id, field.id, editingMeal.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleMealUpdate(meal.id, field.id, editingMeal.value)}
                                className="w-12 bg-surface-container p-0.5 rounded text-center"
                                autoFocus
                              />
                            ) : (
                              <span 
                                className="cursor-pointer hover:text-primary transition-colors"
                                onClick={() => setEditingMeal({ mealId: meal.id, field: field.id, value: field.value.toString() })}
                              >
                                {field.value}g
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-surface-container rounded-[3rem] p-16 text-center border-4 border-dashed border-surface-container-high">
                  <p className="text-on-surface-variant font-black text-xl opacity-20 uppercase tracking-widest">{t['no_meals_today'] || 'No meals logged'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Coach Feedback Section */}
          <div className="pt-16 border-t border-surface-container space-y-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-3xl font-extrabold tracking-tight">Coach Feedback</h4>
              </div>
              <button 
                onClick={() => setShowFullAnalysis(true)}
                className="px-8 py-4 bg-surface-container hover:bg-surface-container-high rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3"
              >
                <BarChart3 className="w-5 h-5" />
                View Full Analysis
              </button>
            </div>
            
            <div className="bg-surface-container-low p-8 md:p-12 rounded-[3rem] space-y-8">
              <textarea 
                value={tempFeedback}
                onChange={(e) => setTempFeedback(e.target.value)}
                placeholder="Enter your feedback for the user here..."
                className="w-full bg-surface-container/30 border-none rounded-[2rem] p-8 text-lg font-bold min-h-[200px] focus:ring-8 focus:ring-primary/5 transition-all outline-none"
              />
              <div className="flex justify-end">
                <button 
                  onClick={handleSaveFeedback}
                  disabled={isSavingFeedback}
                  className="px-12 py-5 bg-on-surface text-surface rounded-[2rem] font-black text-lg shadow-ambient active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50"
                >
                  {isSavingFeedback ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-6 h-6" />
                      Save Feedback
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Full Analysis Modal */}
        <AnimatePresence>
          {showFullAnalysis && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-surface/80 backdrop-blur-2xl z-[100] flex items-center justify-center p-4 md:p-10"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-surface-container-lowest w-full max-w-5xl max-h-[90vh] rounded-[3rem] md:rounded-[5rem] shadow-ambient overflow-hidden flex flex-col"
              >
                <div className="p-8 md:p-12 border-b border-surface-container flex justify-between items-center">
                  <h3 className="text-3xl md:text-5xl font-black tracking-tighter">Full Analysis: {selectedUser.name}</h3>
                  <button 
                    onClick={() => setShowFullAnalysis(false)}
                    className="p-4 bg-surface-container rounded-full hover:bg-surface-container-high transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 md:p-16 space-y-16">
                  {/* User Inputs Section */}
                  <section className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <h4 className="text-2xl font-black tracking-tight">User Inputs</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="bg-surface-container-low p-8 rounded-[2.5rem] space-y-4">
                        <p className="text-xs font-black uppercase tracking-widest opacity-40">Energy Level</p>
                        <div className="flex items-center gap-4">
                          <div className="text-5xl font-black text-primary">{selectedUser.stats.energyLevel || '--'}</div>
                          <div className="flex-1 h-3 bg-surface-container rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${(selectedUser.stats.energyLevel || 0) * 10}%` }} 
                            />
                          </div>
                        </div>
                      </div>
                      <div className="bg-surface-container-low p-8 rounded-[2.5rem] space-y-4">
                        <p className="text-xs font-black uppercase tracking-widest opacity-40">Weight</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-black text-primary">{selectedUser.weight || '--'}</span>
                          <span className="text-xl font-bold opacity-40">kg</span>
                        </div>
                      </div>
                      <div className="bg-surface-container-low p-8 rounded-[2.5rem] space-y-4">
                        <p className="text-xs font-black uppercase tracking-widest opacity-40">Daily Check-ins</p>
                        <div className="flex flex-wrap gap-2">
                          {INITIAL_USER_STATS.checkIns.map(initialCi => {
                            const ci = selectedUser.stats.checkIns?.find(c => c.id === initialCi.id) || initialCi;
                            return (
                              <div key={ci.id} className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${ci.checked ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface/20'}`}>
                                {t[ci.id] || ci.label}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-surface-container-low p-8 rounded-[2.5rem] space-y-6">
                        <p className="text-xs font-black uppercase tracking-widest opacity-40">Logged Meals</p>
                        <div className="space-y-4">
                          {selectedUser.stats.meals.length > 0 ? selectedUser.stats.meals.map(meal => (
                            <div key={meal.id} className="flex justify-between items-center p-4 bg-surface-container rounded-2xl">
                              <div>
                                <p className="font-black">{meal.name}</p>
                                <p className="text-[10px] font-bold opacity-40">{meal.time}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-black text-primary">{meal.kcal} kcal</p>
                                <p className="text-[10px] font-bold opacity-40">P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fats}g</p>
                              </div>
                            </div>
                          )) : (
                            <p className="text-sm font-bold opacity-30 italic">No meals logged</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-8">
                        <div className="bg-surface-container-low p-8 rounded-[2.5rem] space-y-6">
                          <p className="text-xs font-black uppercase tracking-widest opacity-40">Supplements</p>
                          <div className="space-y-3">
                            {selectedUser.stats.supplements.length > 0 ? selectedUser.stats.supplements.map(s => (
                              <div key={s.id} className="flex items-center justify-between p-4 bg-surface-container rounded-2xl">
                                <div className="flex items-center gap-3">
                                  <div className={`w-2 h-2 rounded-full ${s.checked ? 'bg-primary' : 'bg-on-surface/10'}`} />
                                  <span className={`font-black ${s.checked ? 'text-on-surface' : 'opacity-30'}`}>{s.name}</span>
                                </div>
                                <span className="text-[10px] font-bold opacity-40">{s.time}</span>
                              </div>
                            )) : (
                              <p className="text-sm font-bold opacity-30 italic">No supplements logged</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Coach Inputs Section */}
                  <section className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                        <Brain className="w-6 h-6 text-secondary" />
                      </div>
                      <h4 className="text-2xl font-black tracking-tight">Coach Inputs (Targets)</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="bg-surface-container-low p-8 rounded-[2.5rem] space-y-4">
                        <p className="text-xs font-black uppercase tracking-widest opacity-40">Target Energy Level</p>
                        <div className="flex items-center gap-4">
                          <div className="text-5xl font-black text-secondary">{selectedUser.stats.targetEnergyLevel || '--'}</div>
                          <div className="flex-1 h-3 bg-surface-container rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-secondary" 
                              style={{ width: `${(selectedUser.stats.targetEnergyLevel || 0) * 10}%` }} 
                            />
                          </div>
                        </div>
                      </div>
                      <div className="bg-surface-container-low p-8 rounded-[2.5rem] space-y-4">
                        <p className="text-xs font-black uppercase tracking-widest opacity-40">Target Weight</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-black text-secondary">{selectedUser.targetWeight || '--'}</span>
                          <span className="text-xl font-bold opacity-40">kg</span>
                        </div>
                      </div>
                      <div className="bg-surface-container-low p-8 rounded-[2.5rem] space-y-4">
                        <p className="text-xs font-black uppercase tracking-widest opacity-40">Required Check-ins</p>
                        <div className="flex flex-wrap gap-2">
                          {INITIAL_USER_STATS.checkIns.map(initialCi => {
                            const ci = selectedUser.stats.checkIns?.find(c => c.id === initialCi.id) || initialCi;
                            return (
                              <div key={ci.id} className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-secondary/10 text-secondary">
                                {t[ci.id] || ci.label}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {[
                        { label: 'Calories', value: selectedUser.stats.calories.target, unit: 'kcal' },
                        { label: 'Hydration', value: selectedUser.stats.hydration.target, unit: 'L' },
                        { label: 'Protein', value: selectedUser.stats.protein.target, unit: 'g' },
                        { label: 'Carbs', value: selectedUser.stats.carbs.target, unit: 'g' },
                        { label: 'Fats', value: selectedUser.stats.fats.target, unit: 'g' },
                        { label: 'Fiber', value: selectedUser.stats.fiber.target, unit: 'g' },
                      ].map((target, i) => (
                        <div key={i} className="bg-surface-container-low p-6 rounded-3xl text-center">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{target.label}</p>
                          <p className="text-2xl font-black text-secondary">{target.value} <span className="text-xs opacity-40">{target.unit}</span></p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Feedback Section */}
                  <section className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-tertiary/10 rounded-xl flex items-center justify-center">
                        <Quote className="w-6 h-6 text-tertiary" />
                      </div>
                      <h4 className="text-2xl font-black tracking-tight">Coach Feedback</h4>
                    </div>
                    <div className="bg-tertiary/5 p-10 rounded-[3rem] border border-tertiary/10 italic text-xl font-bold text-on-surface-variant leading-relaxed">
                      "{selectedUser.feedback || 'No feedback provided yet.'}"
                    </div>
                  </section>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    );
  }

  return (
    <main className="pt-24 md:pt-32 px-6 md:px-8 max-w-7xl mx-auto space-y-12 md:space-y-20 pb-40">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-primary/50 ml-1">{t['coach_dashboard']}</p>
          <h1 className="text-5xl md:text-8xl font-extrabold text-on-surface tracking-tighter leading-[0.9]">
            {t['hi']} <span className="text-primary">{userName || 'Coach'}</span>
          </h1>
        </motion.div>
        
        <div className="flex flex-wrap gap-4">
          <div className="bg-surface-container-lowest px-6 py-4 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Active Today</p>
              <p className="text-xl font-black">{activeToday}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-on-surface-variant opacity-20 group-focus-within:text-primary group-focus-within:opacity-100 transition-all" />
            <input 
              type="text"
              placeholder="Search members by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-lowest p-6 pl-16 rounded-[2rem] font-bold shadow-sm focus:ring-4 ring-primary/5 outline-none transition-all"
            />
          </div>
          <button className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-sm hover:bg-surface-container transition-all">
            <Filter className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredUsers.map((user, i) => (
          <motion.button
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setSelectedUser(user)}
            className="bg-surface-container-lowest p-10 rounded-[3rem] shadow-sm hover:shadow-ambient transition-all text-left flex items-center gap-8 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors" />
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-24 h-24 rounded-[2rem] object-cover shadow-md group-hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 space-y-1 z-10">
              <h3 className="font-black text-lg leading-tight tracking-tight group-hover:text-primary transition-colors">{user.name}</h3>
              <p className="text-sm font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">{user.stats.calories.target} kcal goal</p>
              <div className="pt-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedUser(user);
                    setShowFullAnalysis(true);
                  }}
                  className="px-4 py-2 bg-primary/10 text-primary rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  Analysis
                </button>
              </div>
            </div>
            <ChevronRight className="w-8 h-8 text-primary opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all z-10" />
          </motion.button>
        ))}
      </div>

      {/* Overall Team Report */}
      <section className="pt-16 border-t border-surface-container space-y-10">
        <div className="flex items-center gap-4 px-2">
          <div className="w-12 h-12 bg-primary-container rounded-2xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-3xl font-extrabold tracking-tight">Overall Team Report</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-8">
          <div className="bg-surface-container-lowest p-10 rounded-[3rem] shadow-sm space-y-6">
            <h4 className="text-lg font-black opacity-40 uppercase tracking-widest">Growth Metrics</h4>
            <div className="space-y-4">
              {[
                { label: 'Member Retention', value: '98%', trend: '+2%' },
                { label: 'Goal Success Rate', value: '84%', trend: '+5%' },
                { label: 'Weekly Activity', value: '1,240 mins', trend: '+12%' },
              ].map((m, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-surface-container rounded-2xl">
                  <span className="font-bold">{m.label}</span>
                  <div className="text-right">
                    <p className="font-black">{m.value}</p>
                    <p className="text-[10px] font-black text-emerald-500">{m.trend}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
);
};

const OwnerDashboard = ({ 
  language,
  translations,
  userName,
  assignedUsers,
  coaches,
  userCredentials,
  onPromoteUser,
  onAssignCoach,
  onCreateUser,
  onDeleteUser
}: { 
  language: Language;
  translations?: Record<string, string>;
  userName?: string;
  assignedUsers: AssignedUser[];
  coaches: { id: string; name: string; avatar: string }[];
  userCredentials: Record<string, string>;
  onPromoteUser: (userId: string) => void;
  onAssignCoach: (userId: string, coachId: string | null) => void;
  onCreateUser: (role: Role, name: string, pin: string) => void;
  onDeleteUser: (userId: string, role: Role) => void;
}) => {
  const [selectedUser, setSelectedUser] = useState<AssignedUser | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserPin, setNewUserPin] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('user');
  const [confirmAction, setConfirmAction] = useState<{ type: string; id: string; role?: Role; name: string } | null>(null);
  const [showCoachSelector, setShowCoachSelector] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'directory' | 'analysis'>('directory');
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);

  const t = translations || TRANSLATIONS[language] || TRANSLATIONS['English'];

  // Calculations for Daily Report & Analysis
  const totalUsers = assignedUsers.length;
  const totalCoaches = coaches.length;
  const activeToday = assignedUsers.filter(u => u.stats.calories.current > 0).length;
  
  const improvingMembers = assignedUsers.filter(u => {
    const calPercent = (u.stats.calories.current / u.stats.calories.target) * 100;
    const waterPercent = (u.stats.hydration.current / u.stats.hydration.target) * 100;
    return calPercent >= 70 && waterPercent >= 70;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserPin) return;
    onCreateUser(newUserRole, newUserName, newUserPin);
    setNewUserName('');
    setNewUserPin('');
    setShowCreateForm(false);
  };

  const getGoalColor = (current: number, target: number) => {
    if (target === 0) return 'bg-surface-container';
    const percent = (current / target) * 100;
    if (percent >= 90) return 'bg-emerald-500'; 
    if (percent >= 80) return 'bg-emerald-300'; 
    return 'bg-error';
  };

  if (selectedUser) {
    return (
      <main className="pt-24 md:pt-32 px-6 md:px-8 max-w-7xl space-y-10 md:space-y-16 pb-40 text-left">
        <button 
          onClick={() => setSelectedUser(null)}
          className="group flex items-center gap-4 text-tertiary font-black text-base md:text-lg uppercase tracking-widest"
        >
          <div className="w-10 h-10 md:w-12 md:h-12 bg-tertiary/10 rounded-full flex items-center justify-center group-hover:-translate-x-2 transition-transform">
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          {t['back_to_users']}
        </button>

        <div className="bg-surface-container-lowest rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-16 shadow-ambient space-y-10 md:space-y-16">
          <div className="flex flex-col md:flex-row items-start gap-6 md:gap-10 text-left">
            <img 
              src={selectedUser.avatar} 
              alt={selectedUser.name} 
              className="w-24 h-24 md:w-32 md:h-32 rounded-[1.5rem] md:rounded-[2.5rem] object-cover shadow-lg"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-1 md:space-y-2">
              <h3 className="text-3xl md:text-5xl font-extrabold tracking-tighter leading-none">{selectedUser.name}</h3>
              <p className="text-lg md:text-2xl font-bold text-on-surface-variant opacity-60">{selectedUser.status}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Calories */}
            <div className="space-y-6">
              <div className="flex justify-between items-end px-2">
                <p className="text-sm font-black uppercase tracking-widest opacity-40">{t['daily_calories']}</p>
                <p className="text-2xl font-black">{selectedUser.stats.calories.current} <span className="text-sm opacity-40">/ {selectedUser.stats.calories.target} kcal</span></p>
              </div>
              <div className="h-6 bg-surface-container rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((selectedUser.stats.calories.current / selectedUser.stats.calories.target) * 100, 100)}%` }}
                  className={`h-full transition-all duration-1000 ${getGoalColor(selectedUser.stats.calories.current, selectedUser.stats.calories.target)}`}
                />
              </div>
            </div>

            {/* Water */}
            <div className="space-y-6">
              <div className="flex justify-between items-end px-2">
                <p className="text-sm font-black uppercase tracking-widest opacity-40">{t['water_intake']}</p>
                <p className="text-2xl font-black">{selectedUser.stats.hydration.current} <span className="text-sm opacity-40">/ {selectedUser.stats.hydration.target} L</span></p>
              </div>
              <div className="h-6 bg-surface-container rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((selectedUser.stats.hydration.current / selectedUser.stats.hydration.target) * 100, 100)}%` }}
                  className={`h-full transition-all duration-1000 ${getGoalColor(selectedUser.stats.hydration.current, selectedUser.stats.hydration.target)}`}
                />
              </div>
            </div>

            {/* Energy Level */}
            <div className="space-y-6">
              <div className="flex justify-between items-end px-2">
                <p className="text-sm font-black uppercase tracking-widest opacity-40">{t['energy_level']}</p>
                <p className="text-2xl font-black">{selectedUser.stats.energyLevel || 5} <span className="text-sm opacity-40">/ 10</span></p>
              </div>
              <div className="relative h-6 w-full bg-surface-container rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${((selectedUser.stats.energyLevel || 5) / 10) * 100}%` }}
                  className="h-full bg-tertiary transition-all duration-1000"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-16 border-t border-surface-container">
            {/* Detailed Nutrition */}
            <div className="lg:col-span-5 space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-tertiary-container rounded-full flex items-center justify-center">
                  <Activity className="w-6 h-6 text-tertiary" />
                </div>
                <h4 className="text-3xl font-extrabold tracking-tight">{t['nutrition_details']}</h4>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: t['protein'], value: selectedUser.stats.protein.current, target: selectedUser.stats.protein.target, color: 'primary' },
                  { label: t['carbs'], value: selectedUser.stats.carbs.current, target: selectedUser.stats.carbs.target, color: 'secondary' },
                  { label: t['fats'], value: selectedUser.stats.fats.current, target: selectedUser.stats.fats.target, color: 'tertiary' },
                  { label: t['fiber'], value: selectedUser.stats.fiber.current, target: selectedUser.stats.fiber.target, color: 'primary' },
                ].map((stat, i) => (
                  <div key={i} className="bg-surface-container-low p-8 rounded-[2.5rem] space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{stat.label}</p>
                    <p className={`text-3xl font-black text-${stat.color}`}>{stat.value}g</p>
                    <p className="text-xs font-bold opacity-40">of {stat.target}g</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Meals */}
            <div className="lg:col-span-7 space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary-container rounded-full flex items-center justify-center">
                  <Utensils className="w-6 h-6 text-secondary" />
                </div>
                <h4 className="text-3xl font-extrabold tracking-tight">{t['daily_meals']}</h4>
              </div>
              {selectedUser.meals && selectedUser.meals.length > 0 ? (
                <div className="space-y-6">
                  {selectedUser.meals.map((meal) => (
                    <div key={meal.id} className="bg-surface-container-low p-8 rounded-[3rem] space-y-6 hover:shadow-ambient transition-all">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-2xl font-extrabold tracking-tight">{meal.name}</p>
                          <p className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
                            <Clock className="w-4 h-4" /> {meal.time}
                          </p>
                        </div>
                        <div className="bg-primary text-on-primary px-6 py-2 rounded-full text-sm font-black shadow-sm">
                          {meal.kcal} kcal
                        </div>
                      </div>
                      <div className="flex gap-6 text-xs font-black uppercase tracking-widest opacity-60">
                        <span>P: {meal.protein}g</span>
                        <span>C: {meal.carbs}g</span>
                        <span>F: {meal.fats}g</span>
                        <span>Fib: {meal.fiber}g</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-surface-container rounded-[3rem] p-16 text-left border-4 border-dashed border-surface-container-high">
                  <p className="text-on-surface-variant font-black text-xl opacity-20 uppercase tracking-widest">{t['no_meals_today'] || 'No meals logged'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Coach Feedback Section for Owner */}
          <div className="pt-16 border-t border-surface-container space-y-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-3xl font-extrabold tracking-tight">Coach Feedback</h4>
              </div>
              <button 
                onClick={() => setShowFullAnalysis(true)}
                className="px-8 py-4 bg-surface-container hover:bg-surface-container-high rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3"
              >
                <BarChart3 className="w-5 h-5" />
                View Full Analysis
              </button>
            </div>
            <div className="bg-tertiary/5 p-10 rounded-[3rem] border border-tertiary/10 italic text-xl font-bold text-on-surface-variant leading-relaxed">
              "{selectedUser.feedback || 'No feedback provided yet.'}"
            </div>
          </div>
        </div>

        {/* Full Analysis Modal for Owner */}
        <AnimatePresence>
          {showFullAnalysis && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-surface/80 backdrop-blur-2xl z-[100] flex items-center justify-center p-4 md:p-10"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-surface-container-lowest w-full max-w-5xl max-h-[90vh] rounded-[3rem] md:rounded-[5rem] shadow-ambient overflow-hidden flex flex-col"
              >
                <div className="p-8 md:p-12 border-b border-surface-container flex justify-between items-center">
                  <h3 className="text-3xl md:text-5xl font-black tracking-tighter">Full Analysis: {selectedUser.name}</h3>
                  <button 
                    onClick={() => setShowFullAnalysis(false)}
                    className="p-4 bg-surface-container rounded-full hover:bg-surface-container-high transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 md:p-16 space-y-16">
                  {/* User Inputs Section */}
                  <section className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <h4 className="text-2xl font-black tracking-tight">User Inputs</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="bg-surface-container-low p-8 rounded-[2.5rem] space-y-4">
                        <p className="text-xs font-black uppercase tracking-widest opacity-40">Energy Level</p>
                        <div className="flex items-center gap-4">
                          <div className="text-5xl font-black text-primary">{selectedUser.stats.energyLevel || '--'}</div>
                          <div className="flex-1 h-3 bg-surface-container rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${(selectedUser.stats.energyLevel || 0) * 10}%` }} 
                            />
                          </div>
                        </div>
                      </div>
                      <div className="bg-surface-container-low p-8 rounded-[2.5rem] space-y-4">
                        <p className="text-xs font-black uppercase tracking-widest opacity-40">Weight</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-black text-primary">{selectedUser.weight || '--'}</span>
                          <span className="text-xl font-bold opacity-40">kg</span>
                        </div>
                      </div>
                      <div className="bg-surface-container-low p-8 rounded-[2.5rem] space-y-4">
                        <p className="text-xs font-black uppercase tracking-widest opacity-40">Daily Check-ins</p>
                        <div className="flex flex-wrap gap-2">
                          {INITIAL_USER_STATS.checkIns.map(initialCi => {
                            const ci = selectedUser.stats.checkIns?.find(c => c.id === initialCi.id) || initialCi;
                            return (
                              <div key={ci.id} className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${ci.checked ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface/20'}`}>
                                {t[ci.id] || ci.label}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-surface-container-low p-8 rounded-[2.5rem] space-y-6">
                        <p className="text-xs font-black uppercase tracking-widest opacity-40">Logged Meals</p>
                        <div className="space-y-4">
                          {selectedUser.stats.meals.length > 0 ? selectedUser.stats.meals.map(meal => (
                            <div key={meal.id} className="flex justify-between items-center p-4 bg-surface-container rounded-2xl">
                              <div>
                                <p className="font-black">{meal.name}</p>
                                <p className="text-[10px] font-bold opacity-40">{meal.time}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-black text-primary">{meal.kcal} kcal</p>
                                <p className="text-[10px] font-bold opacity-40">P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fats}g</p>
                              </div>
                            </div>
                          )) : (
                            <p className="text-sm font-bold opacity-30 italic">No meals logged</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-8">
                        <div className="bg-surface-container-low p-8 rounded-[2.5rem] space-y-6">
                          <p className="text-xs font-black uppercase tracking-widest opacity-40">Supplements</p>
                          <div className="space-y-3">
                            {selectedUser.stats.supplements.length > 0 ? selectedUser.stats.supplements.map(s => (
                              <div key={s.id} className="flex items-center justify-between p-4 bg-surface-container rounded-2xl">
                                <div className="flex items-center gap-3">
                                  <div className={`w-2 h-2 rounded-full ${s.checked ? 'bg-primary' : 'bg-on-surface/10'}`} />
                                  <span className={`font-black ${s.checked ? 'text-on-surface' : 'opacity-30'}`}>{s.name}</span>
                                </div>
                                <span className="text-[10px] font-bold opacity-40">{s.time}</span>
                              </div>
                            )) : (
                              <p className="text-sm font-bold opacity-30 italic">No supplements logged</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Coach Inputs Section */}
                  <section className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                        <Brain className="w-6 h-6 text-secondary" />
                      </div>
                      <h4 className="text-2xl font-black tracking-tight">Coach Inputs (Targets)</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="bg-surface-container-low p-8 rounded-[2.5rem] space-y-4">
                        <p className="text-xs font-black uppercase tracking-widest opacity-40">Target Energy Level</p>
                        <div className="flex items-center gap-4">
                          <div className="text-5xl font-black text-secondary">{selectedUser.stats.targetEnergyLevel || '--'}</div>
                          <div className="flex-1 h-3 bg-surface-container rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-secondary" 
                              style={{ width: `${(selectedUser.stats.targetEnergyLevel || 0) * 10}%` }} 
                            />
                          </div>
                        </div>
                      </div>
                      <div className="bg-surface-container-low p-8 rounded-[2.5rem] space-y-4">
                        <p className="text-xs font-black uppercase tracking-widest opacity-40">Target Weight</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-black text-secondary">{selectedUser.targetWeight || '--'}</span>
                          <span className="text-xl font-bold opacity-40">kg</span>
                        </div>
                      </div>
                      <div className="bg-surface-container-low p-8 rounded-[2.5rem] space-y-4">
                        <p className="text-xs font-black uppercase tracking-widest opacity-40">Required Check-ins</p>
                        <div className="flex flex-wrap gap-2">
                          {INITIAL_USER_STATS.checkIns.map(initialCi => {
                            const ci = selectedUser.stats.checkIns?.find(c => c.id === initialCi.id) || initialCi;
                            return (
                              <div key={ci.id} className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-secondary/10 text-secondary">
                                {t[ci.id] || ci.label}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {[
                        { label: 'Calories', value: selectedUser.stats.calories.target, unit: 'kcal' },
                        { label: 'Hydration', value: selectedUser.stats.hydration.target, unit: 'L' },
                        { label: 'Protein', value: selectedUser.stats.protein.target, unit: 'g' },
                        { label: 'Carbs', value: selectedUser.stats.carbs.target, unit: 'g' },
                        { label: 'Fats', value: selectedUser.stats.fats.target, unit: 'g' },
                        { label: 'Fiber', value: selectedUser.stats.fiber.target, unit: 'g' },
                      ].map((target, i) => (
                        <div key={i} className="bg-surface-container-low p-6 rounded-3xl text-center">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{target.label}</p>
                          <p className="text-2xl font-black text-secondary">{target.value} <span className="text-xs opacity-40">{target.unit}</span></p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Feedback Section */}
                  <section className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-tertiary/10 rounded-xl flex items-center justify-center">
                        <Quote className="w-6 h-6 text-tertiary" />
                      </div>
                      <h4 className="text-2xl font-black tracking-tight">Coach Feedback</h4>
                    </div>
                    <div className="bg-tertiary/5 p-10 rounded-[3rem] border border-tertiary/10 italic text-xl font-bold text-on-surface-variant leading-relaxed">
                      "{selectedUser.feedback || 'No feedback provided yet.'}"
                    </div>
                  </section>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    );
  }

  return (
    <main className="pt-24 md:pt-32 px-6 md:px-8 max-w-7xl space-y-10 md:space-y-16 pb-40 text-left">
      <section className="space-y-6">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-tertiary/50 ml-1">Owner Dashboard</p>
          <h1 className="text-5xl md:text-8xl font-extrabold text-on-surface tracking-tighter leading-[0.9]">
            {t['hi']} <span className="text-tertiary">{userName || 'Owner'}</span>
          </h1>
        </motion.div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2 pt-6 md:pt-10">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t['system_overview']}</h2>
          <button 
            onClick={() => setShowCreateForm(true)}
            className="bg-tertiary text-on-tertiary px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:scale-105 transition-transform shadow-lg"
          >
            <Plus className="w-6 h-6" />
            {t['create_account']}
          </button>
        </div>
      </section>

      {/* Create Account Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateForm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-surface-container-lowest w-full max-w-md rounded-[3rem] p-10 shadow-2xl space-y-8"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-3xl font-black tracking-tight">{t['create_account']}</h3>
                <button onClick={() => setShowCreateForm(false)} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest opacity-40 ml-2">{t['role']}</label>
                  <div className="flex gap-2">
                    {(['user', 'coach'] as Role[]).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setNewUserRole(role)}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${newUserRole === role ? 'bg-tertiary text-on-tertiary shadow-md' : 'bg-surface-container hover:bg-surface-container-high'}`}
                      >
                        {role === 'user' ? t['member'] : t['coach_label']}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest opacity-40 ml-2">{t['enter_name']}</label>
                  <input 
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full bg-surface-container p-4 rounded-2xl font-bold focus:ring-2 ring-tertiary outline-none"
                    placeholder="Full Name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest opacity-40 ml-2">{t['pin']} (4 digits)</label>
                  <input 
                    type="password"
                    maxLength={4}
                    value={newUserPin}
                    onChange={(e) => setNewUserPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-surface-container p-4 rounded-2xl font-bold focus:ring-2 ring-tertiary outline-none tracking-[1em] text-center"
                    placeholder="••••"
                    required
                  />
                </div>
                <button type="submit" className="w-full bg-tertiary text-on-tertiary py-5 rounded-2xl font-black text-xl shadow-lg hover:scale-[1.02] transition-transform">
                  {t['confirm']}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmAction && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmAction(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="relative bg-surface-container-lowest w-full max-w-sm rounded-[3rem] p-10 text-left space-y-6 shadow-2xl"
            >
              <div className="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight">{t['are_you_sure']}</h3>
                <p className="text-on-surface-variant opacity-60 font-medium">
                  {confirmAction.type === 'delete' ? t['action_irreversible'] : `Promote ${confirmAction.name} to Coach?`}
                </p>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 py-4 rounded-2xl font-bold bg-surface-container hover:bg-surface-container-high transition-colors"
                >
                  {t['cancel']}
                </button>
                <button 
                  onClick={() => {
                    if (confirmAction.type === 'delete') {
                      onDeleteUser(confirmAction.id, confirmAction.role || 'user');
                    } else if (confirmAction.type === 'promote') {
                      onPromoteUser(confirmAction.id);
                    }
                    setConfirmAction(null);
                  }}
                  className="flex-1 py-4 rounded-2xl font-bold bg-error text-on-error shadow-lg hover:brightness-110 transition-all"
                >
                  {t['confirm']}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="space-y-16">
        {/* Daily Report & Stats */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="space-y-2">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter">{t['daily_report'] || 'Daily Report'}</h2>
              <p className="text-on-surface-variant opacity-60 font-bold text-lg">Real-time system health and growth</p>
            </div>
            <div className="flex bg-surface-container p-2 rounded-2xl">
              <button 
                onClick={() => setActiveView('directory')}
                className={`px-6 py-3 rounded-xl font-black text-sm transition-all ${activeView === 'directory' ? 'bg-primary text-on-primary shadow-lg' : 'hover:bg-surface-container-high'}`}
              >
                Directory
              </button>
              <button 
                onClick={() => setActiveView('analysis')}
                className={`px-6 py-3 rounded-xl font-black text-sm transition-all ${activeView === 'analysis' ? 'bg-primary text-on-primary shadow-lg' : 'hover:bg-surface-container-high'}`}
              >
                Analysis
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'Total Members', value: totalUsers, icon: Users, color: 'primary', growth: '+12%' },
              { label: 'Active Today', value: activeToday, icon: Activity, color: 'secondary', growth: '+5%' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-surface-container-lowest p-8 rounded-[2.5rem] shadow-sm space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div className={`w-12 h-12 bg-${stat.color}/10 rounded-2xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                  </div>
                  <div className="flex items-center gap-1 text-emerald-500 font-black text-xs">
                    <TrendingUp className="w-3 h-3" />
                    {stat.growth}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{stat.label}</p>
                  <p className="text-4xl font-black tracking-tight">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div className="bg-surface-container-lowest p-8 md:p-12 rounded-[3rem] shadow-sm space-y-8">
              <h3 className="text-2xl font-black tracking-tight">Improving Members</h3>
              <div className="space-y-6">
                {improvingMembers.slice(0, 4).map((user, i) => (
                  <div key={user.id} className="flex items-center gap-4">
                    <img src={user.avatar} className="w-12 h-12 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm">{user.name}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: '85%' }} />
                        </div>
                        <span className="text-[10px] font-black text-emerald-500">85%</span>
                      </div>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => {
                    if (improvingMembers.length > 0) {
                      setSelectedUser(improvingMembers[0]);
                      setShowFullAnalysis(true);
                    }
                  }}
                  className="w-full py-4 rounded-2xl bg-surface-container hover:bg-surface-container-high font-black text-xs uppercase tracking-widest transition-all"
                >
                  View Full Analysis
                </button>
              </div>
            </div>
          </div>
        </section>

        {activeView === 'directory' ? (
          <div className="space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] shadow-sm space-y-2 border border-surface-container">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">System Health</p>
                <p className="text-3xl font-black text-emerald-500">Optimal</p>
              </div>
              <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] shadow-sm space-y-2 border border-surface-container">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">New Members (7d)</p>
                <p className="text-3xl font-black text-primary">+24</p>
              </div>
              <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] shadow-sm space-y-2 border border-surface-container">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Coach Capacity</p>
                <p className="text-3xl font-black text-secondary">82%</p>
              </div>
            </div>

            <div className="relative group max-w-2xl">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-on-surface-variant opacity-20 group-focus-within:text-primary group-focus-within:opacity-100 transition-all" />
              <input 
                type="text"
                placeholder="Search directory..."
                className="w-full bg-surface-container-lowest p-6 pl-16 rounded-[2rem] font-bold shadow-sm focus:ring-4 ring-primary/5 outline-none transition-all"
              />
            </div>

            {/* Members List */}
            <section className="space-y-8">
          <div className="flex items-center gap-4 px-2">
            <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-3xl font-extrabold tracking-tight">{t['manage_users']}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {assignedUsers.map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-surface-container-lowest p-8 rounded-[3rem] shadow-sm hover:shadow-ambient transition-all space-y-6 group relative"
              >
                <div className="flex items-center gap-6">
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-20 h-20 rounded-[1.5rem] object-cover shadow-md cursor-pointer"
                    onClick={() => setSelectedUser(user)}
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-base leading-tight tracking-tight">{user.name}</h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest">ID: {user.id}</p>
                      <p className="text-[10px] font-bold text-tertiary uppercase tracking-widest">PIN: {userCredentials[user.id] || '••••'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-surface-container">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{t['coach_label']}</p>
                      <p className="font-bold text-sm">
                        {coaches.find(c => c.id === user.coachId)?.name || t['no_coach']}
                      </p>
                    </div>
                    <button 
                      onClick={() => setShowCoachSelector(showCoachSelector === user.id ? null : user.id)}
                      className="p-3 bg-surface-container rounded-xl hover:bg-tertiary/10 hover:text-tertiary transition-all"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                  </div>

                  {showCoachSelector === user.id && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-surface-container rounded-2xl p-4 space-y-2 overflow-hidden"
                    >
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">{t['select_coach']}</p>
                      <div className="grid grid-cols-1 gap-2">
                        <button 
                          onClick={() => {
                            onAssignCoach(user.id, null);
                            setShowCoachSelector(null);
                          }}
                          className="w-full text-left p-3 rounded-xl hover:bg-surface-container-high font-bold text-sm flex items-center justify-between"
                        >
                          {t['no_coach']}
                          {!user.coachId && <Check className="w-4 h-4 text-emerald-500" />}
                        </button>
                        {coaches.map(coach => (
                          <button 
                            key={coach.id}
                            onClick={() => {
                              onAssignCoach(user.id, coach.id);
                              setShowCoachSelector(null);
                            }}
                            className="w-full text-left p-3 rounded-xl hover:bg-surface-container-high font-bold text-sm flex items-center justify-between"
                          >
                            {coach.name}
                            {user.coachId === coach.id && <Check className="w-4 h-4 text-emerald-500" />}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => {
                        setSelectedUser(user);
                        setShowFullAnalysis(true);
                      }}
                      className="flex-1 bg-primary/10 text-primary py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-2"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Analysis
                    </button>
                    <button 
                      onClick={() => setConfirmAction({ type: 'promote', id: user.id, name: user.name })}
                      className="flex-1 bg-tertiary/10 text-tertiary py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-tertiary hover:text-on-tertiary transition-all"
                    >
                      {t['promote_to_coach']}
                    </button>
                    <button 
                      onClick={() => setConfirmAction({ type: 'delete', id: user.id, role: 'user', name: user.name })}
                      className="p-3 bg-error/10 text-error rounded-xl hover:bg-error hover:text-on-error transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Coaches List */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 px-2">
            <div className="w-10 h-10 bg-tertiary-container rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-tertiary" />
            </div>
            <h3 className="text-3xl font-extrabold tracking-tight">{t['manage_coaches']}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coaches.map((coach, i) => (
              <motion.div
                key={coach.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-surface-container-lowest p-8 rounded-[3rem] shadow-sm hover:shadow-ambient transition-all flex items-center gap-6 group relative"
              >
                <img 
                  src={coach.avatar} 
                  alt={coach.name} 
                  className="w-20 h-20 rounded-[1.5rem] object-cover shadow-md"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-base leading-tight tracking-tight">{coach.name}</h4>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">ID: {coach.id}</p>
                    <p className="text-[10px] font-bold text-tertiary uppercase tracking-widest">PIN: {userCredentials[coach.id] || '••••'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setConfirmAction({ type: 'delete', id: coach.id, role: 'coach', name: coach.name })}
                  className="p-4 bg-error/10 text-error rounded-2xl hover:bg-error hover:text-on-error transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    ) : (
          <div className="space-y-16">
            <section className="space-y-8">
              <div className="flex items-center gap-4 px-2">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-3xl font-extrabold tracking-tight">Performance Analysis</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-8">
                <div className="bg-surface-container-lowest p-10 rounded-[3rem] shadow-sm space-y-8">
                  <h4 className="text-xl font-black opacity-40 uppercase tracking-widest">Top Performers</h4>
                  <div className="space-y-6">
                    {improvingMembers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-surface-container rounded-3xl">
                        <div className="flex items-center gap-4">
                          <img src={user.avatar} className="w-12 h-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-sm">{user.name}</p>
                            <p className="text-[10px] font-bold opacity-40">Consistency: 94%</p>
                          </div>
                        </div>
                        <div className="text-emerald-500 font-black text-sm">+12.4%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
};

const ProfileScreen = ({ 
  userProfile,
  stats,
  language,
  onLanguageChange,
  translations,
  darkMode,
  onDarkModeToggle,
  onSignOut,
  onUpdateHealthGoal,
  onUpdateProfile,
  onAvatarUpload,
  avatarCameraInputRef,
  avatarFileInputRef,
  syncStatus,
  syncError,
  onTestConnection
}: { 
  userProfile: UserProfile | null;
  stats: UserStats;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  translations?: Record<string, string>;
  darkMode: boolean;
  onDarkModeToggle: () => void;
  onSignOut: () => void;
  onUpdateHealthGoal: (goal: string) => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  avatarCameraInputRef: React.RefObject<HTMLInputElement | null>;
  avatarFileInputRef: React.RefObject<HTMLInputElement | null>;
  syncStatus?: 'synced' | 'syncing' | 'error';
  syncError?: string | null;
  onTestConnection?: () => Promise<{ success: boolean; message: string }>;
}) => {
  const [showAllGoals, setShowAllGoals] = useState(false);
  const [showAllLangs, setShowAllLangs] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [isEditingHeight, setIsEditingHeight] = useState(false);
  const [tempWeight, setTempWeight] = useState(userProfile?.weight?.toString() || '');
  const [tempHeight, setTempHeight] = useState(userProfile?.height?.toString() || '');
  const [customGoal, setCustomGoal] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [localHealthGoals, setLocalHealthGoals] = useState<string[]>(userProfile?.healthGoals || []);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const t = translations || TRANSLATIONS[language] || TRANSLATIONS['English'];

  useEffect(() => {
    if (userProfile?.healthGoals) {
      setLocalHealthGoals(userProfile.healthGoals);
    }
  }, [userProfile?.healthGoals]);

  useEffect(() => {
    if (userProfile?.weight !== undefined && userProfile?.weight !== null) {
      setTempWeight(userProfile.weight.toString());
    }
    if (userProfile?.height !== undefined && userProfile?.height !== null) {
      setTempHeight(userProfile.height.toString());
    }
  }, [userProfile?.weight, userProfile?.height]);

  if (!userProfile) return null;

  const handleToggleLocalGoal = (goal: string) => {
    setLocalHealthGoals(prev => 
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const handleSaveGoals = async () => {
    setIsSaving(true);
    try {
      await onUpdateProfile({ healthGoals: localHealthGoals });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const HEALTH_GOALS = [
    { id: 'weight_loss', label: 'Weight Loss' },
    { id: 'weight_gain', label: 'Weight Gain' },
    { id: 'diabetes_reversal', label: 'Diabetes Reversal' },
    { id: 'skin_improvement', label: 'Skin Improvement' },
    { id: 'gut_health', label: 'Gut Health Improvement' },
    { id: 'knee_pain', label: 'Knee Pain' },
    { id: 'migraine', label: 'Migraine' },
    { id: 'weakness', label: 'Weakness' },
    { id: 'slip_disorder', label: 'Slip Disorder' },
    { id: 'kidney_disorder', label: 'Kidney Disorder' },
    { id: 'other', label: 'Other' }
  ];

  const displayedGoals = showAllGoals ? HEALTH_GOALS : HEALTH_GOALS.slice(0, 5);
  const displayedLangs = showAllLangs ? INDIAN_LANGUAGES : INDIAN_LANGUAGES.slice(0, 5);

  return (
    <main className="pt-24 md:pt-40 px-6 md:px-16 max-w-4xl mx-auto space-y-12 pb-48">
      <div className="text-center space-y-6">
        <div className="relative inline-block group">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            ref={avatarCameraInputRef}
            onChange={onAvatarUpload}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={avatarFileInputRef}
            onChange={onAvatarUpload}
          />
          <img 
            src={userProfile.avatar || `https://i.pravatar.cc/150?u=${userProfile.id}`} 
            alt={userProfile.name} 
            className="w-32 h-32 md:w-48 md:h-48 rounded-[3rem] object-cover shadow-ambient border-4 border-white transition-transform group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <button 
            onClick={() => {
              avatarFileInputRef.current?.click();
            }}
            className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary text-on-primary rounded-2xl flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
          >
            <Camera className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-2">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter">{userProfile.name}</h2>
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm font-black uppercase tracking-[0.4em] text-primary opacity-60">{userProfile.role}</p>
            {userProfile.coachName && (
              <p className="text-xs font-bold opacity-40">Coach: {userProfile.coachName}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-surface-container-lowest p-10 rounded-[3rem] shadow-ambient space-y-6 border-2 border-primary/10">
          <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary">Personal Info</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-bold opacity-60">Weight</span>
              {isEditingWeight ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={tempWeight}
                    onChange={(e) => setTempWeight(e.target.value)}
                    className="w-20 p-2 bg-surface-container/30 rounded-xl font-black text-sm border-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                  <button 
                    onClick={() => {
                      onUpdateProfile({ weight: parseFloat(tempWeight) });
                      setIsEditingWeight(false);
                    }}
                    className="p-2 bg-primary text-on-primary rounded-xl"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="font-black text-xl">{userProfile.weight} kg</span>
                  <button onClick={() => setIsEditingWeight(true)} className="p-2 hover:bg-surface-container rounded-xl transition-colors">
                    <Edit2 className="w-4 h-4 opacity-40" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold opacity-60">Height</span>
              {isEditingHeight ? (
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={tempHeight}
                      onChange={(e) => setTempHeight(e.target.value)}
                      className="w-20 p-2 bg-surface-container/30 rounded-xl font-black text-sm border-none focus:ring-2 focus:ring-primary"
                      autoFocus
                    />
                    <button 
                      onClick={() => {
                        onUpdateProfile({ height: parseFloat(tempHeight) });
                        setIsEditingHeight(false);
                      }}
                      className="p-2 bg-primary text-on-primary rounded-xl"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="font-black text-xl">{userProfile.height} cm</span>
                    <button onClick={() => setIsEditingHeight(true)} className="p-2 hover:bg-surface-container rounded-xl transition-colors">
                      <Edit2 className="w-4 h-4 opacity-40" />
                    </button>
                  </div>
                )}
              </div>
            <div className="pt-4 border-t border-surface-container/30 space-y-4">
              <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20">
                <h3 className="text-sm font-black uppercase tracking-widest text-primary block">Health Goal</h3>
              </div>
              <div className="flex flex-col gap-2">
                {displayedGoals.map((goal) => (
                  <React.Fragment key={goal.id}>
                    {goal.id === 'other' && localHealthGoals.filter(g => !HEALTH_GOALS.find(hg => hg.id === g)).map((customG, idx) => (
                      <button
                        key={`custom-${idx}`}
                        onClick={() => handleToggleLocalGoal(customG)}
                        className="px-6 py-4 rounded-2xl text-sm font-medium transition-all text-left bg-primary text-on-primary shadow-lg mb-2"
                      >
                        {customG}
                      </button>
                    ))}
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          if (goal.id === 'other') {
                            setShowCustomInput(!showCustomInput);
                          } else {
                            handleToggleLocalGoal(goal.id);
                          }
                        }}
                        className={`w-full px-6 py-4 rounded-2xl text-sm font-medium transition-all text-left ${
                          localHealthGoals.includes(goal.id) 
                            ? 'bg-primary text-on-primary shadow-lg' 
                            : 'bg-surface-container/30 hover:bg-surface-container'
                        }`}
                      >
                        {goal.label}
                      </button>
                      {goal.id === 'other' && showCustomInput && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="p-4 bg-surface-container/50 rounded-2xl space-y-3"
                        >
                          <input 
                            type="text" 
                            value={customGoal}
                            onChange={(e) => setCustomGoal(e.target.value)}
                            placeholder="What is your goal?"
                            className="w-full p-3 bg-surface-container-lowest rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary outline-none"
                          />
                          <button 
                            onClick={() => {
                              if (customGoal.trim()) {
                                handleToggleLocalGoal(customGoal.trim());
                                setCustomGoal('');
                                setShowCustomInput(false);
                              }
                            }}
                            className="w-full py-3 bg-primary text-on-primary rounded-xl text-xs font-black uppercase tracking-widest shadow-sm"
                          >
                            Add Custom Goal
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </React.Fragment>
                ))}
                {/* Display custom goals if 'Other' is not in displayedGoals */}
                {!displayedGoals.find(g => g.id === 'other') && localHealthGoals.filter(g => !HEALTH_GOALS.find(hg => hg.id === g)).map((customG, idx) => (
                  <button
                    key={`custom-hidden-${idx}`}
                    onClick={() => handleToggleLocalGoal(customG)}
                    className="px-6 py-4 rounded-2xl text-sm font-medium transition-all text-left bg-primary text-on-primary shadow-lg"
                  >
                    {customG}
                  </button>
                ))}
                <button
                  onClick={() => setShowAllGoals(!showAllGoals)}
                  className="px-6 py-4 rounded-2xl text-sm font-black bg-surface-container/30 hover:bg-surface-container text-primary flex items-center justify-center gap-2"
                >
                  {showAllGoals ? 'Less' : 'More'} {showAllGoals ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {/* Save Button for Health Goals */}
                <button
                  onClick={handleSaveGoals}
                  disabled={isSaving || JSON.stringify(localHealthGoals) === JSON.stringify(userProfile.healthGoals || [])}
                  className={`mt-4 w-full py-5 rounded-[1.5rem] font-black text-lg uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 ${
                    saveSuccess 
                      ? 'bg-tertiary text-on-tertiary'
                      : JSON.stringify(localHealthGoals) !== JSON.stringify(userProfile.healthGoals || [])
                        ? 'bg-on-surface text-surface-container-lowest'
                        : 'bg-surface-container text-on-surface-variant/20 cursor-not-allowed'
                  }`}
                >
                  {isSaving ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : saveSuccess ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6" />
                  )}
                  {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : t['save_changes'] || 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-10 rounded-[3rem] shadow-ambient space-y-6 border-2 border-primary/10">
          <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary">Goals</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-bold opacity-60">Water Goal</span>
              <div className="text-right">
                <span className="font-black text-xl block">{stats.hydration.current} / {stats.hydration.target} L</span>
                <span className="text-[10px] font-black uppercase opacity-40">reached</span>
              </div>
            </div>
            <div className="pt-4 border-t border-surface-container/30 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-bold opacity-60">Daily Calories</span>
                <div className="text-right">
                  <span className="font-black text-xl block">{stats.calories.current} / {stats.calories.target} kcal</span>
                  <span className="text-[10px] font-black uppercase opacity-40">reached</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold opacity-60">Protein Goal</span>
                <div className="text-right">
                  <span className="font-black text-xl block">{stats.protein.current} / {stats.protein.target}g</span>
                  <span className="text-[10px] font-black uppercase opacity-40">reached</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold opacity-60">Carbs Goal</span>
                <div className="text-right">
                  <span className="font-black text-xl block">{stats.carbs.current} / {stats.carbs.target}g</span>
                  <span className="text-[10px] font-black uppercase opacity-40">reached</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold opacity-60">Fats Goal</span>
                <div className="text-right">
                  <span className="font-black text-xl block">{stats.fats.current} / {stats.fats.target}g</span>
                  <span className="text-[10px] font-black uppercase opacity-40">reached</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold opacity-60">Fiber Goal</span>
                <div className="text-right">
                  <span className="font-black text-xl block">{stats.fiber.current} / {stats.fiber.target}g</span>
                  <span className="text-[10px] font-black uppercase opacity-40">reached</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BMI History Graph */}
      {userProfile.role !== 'coach' && (
        <div className="bg-surface-container-lowest p-10 rounded-[3rem] shadow-ambient space-y-8 border-2 border-primary/10">
          <div className="flex items-center justify-between bg-primary/10 p-6 rounded-[2rem] border border-primary/20">
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-widest text-primary">BMI History</h3>
              <p className="text-xl font-black tracking-tight">Last 7 Days</p>
            </div>
            <Activity className="w-8 h-8 text-primary" />
          </div>

          <div className="h-[300px] w-full">
            {userProfile.weightHistory && userProfile.weightHistory.length > 0 && userProfile.height > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={(userProfile.weightHistory || [])
                  .filter(log => {
                    const logDate = new Date(log.date);
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    return logDate >= sevenDaysAgo;
                  })
                  .map(log => ({
                    ...log,
                    bmi: parseFloat((log.weight / Math.pow(userProfile.height / 100, 2)).toFixed(1)),
                    formattedDate: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                  }))}>
                  <defs>
                    <linearGradient id="colorBmi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis 
                    dataKey="formattedDate" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 900, opacity: 0.3 }}
                    dy={10}
                  />
                  <YAxis 
                    hide 
                    domain={['dataMin - 1', 'dataMax + 1']} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '24px', 
                      border: 'none', 
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                      padding: '16px'
                    }}
                    itemStyle={{ fontWeight: 900, color: 'var(--color-primary)' }}
                    labelStyle={{ fontWeight: 900, marginBottom: '4px', opacity: 0.4 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="bmi" 
                    stroke="var(--color-primary)" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorBmi)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center bg-surface-container/20 rounded-[3rem] border-2 border-dashed border-surface-container">
                <Activity className="w-12 h-12 opacity-10 mb-4" />
                <p className="text-sm font-black uppercase tracking-widest opacity-20">No BMI data for the last 7 days</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Section (Moved inside Profile) */}
      <div className="bg-surface-container-lowest p-10 rounded-[3rem] shadow-ambient space-y-10">
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/40 ml-2">{t['settings']}</p>
          <h3 className="text-3xl font-black tracking-tight">Preferences</h3>
        </div>

        {/* Language Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-secondary-container rounded-2xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-secondary" />
            </div>
            <h4 className="text-2xl font-black tracking-tight">{t['language']}</h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {displayedLangs.map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className={`px-6 py-4 rounded-2xl text-sm font-black transition-all ${
                  language === lang ? 'bg-primary text-on-primary shadow-lg' : 'bg-surface-container/30 hover:bg-surface-container'
                }`}
              >
                {lang}
              </button>
            ))}
            <button
              onClick={() => setShowAllLangs(!showAllLangs)}
              className="px-6 py-4 rounded-2xl text-sm font-black bg-surface-container/30 hover:bg-surface-container text-primary flex items-center justify-center gap-2"
            >
              {showAllLangs ? 'Less' : 'More'} {showAllLangs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Security Section */}
        <div className="pt-10 border-t border-surface-container/50 space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-tertiary-container rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-tertiary" />
            </div>
            <h4 className="text-2xl font-black tracking-tight">Security & Privacy</h4>
          </div>
          <div className="space-y-4">
            <a 
              href="https://example.com/privacy-policy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between p-6 bg-surface-container/30 rounded-3xl hover:bg-surface-container transition-colors"
            >
              <div className="flex items-center gap-4">
                <Lock className="w-5 h-5 opacity-40" />
                <span className="font-bold">Privacy Policy</span>
              </div>
              <ChevronRight className="w-5 h-5 opacity-40" />
            </a>
            <button className="w-full flex items-center justify-between p-6 bg-surface-container/30 rounded-3xl hover:bg-surface-container transition-colors">
              <div className="flex items-center gap-4">
                <FileText className="w-5 h-5 opacity-40" />
                <span className="font-bold">Terms of Service</span>
              </div>
              <ChevronRight className="w-5 h-5 opacity-40" />
            </button>
          </div>
        </div>

        {/* Database Connection Section */}
        <div className="pt-10 border-t border-surface-container/50 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                syncStatus === 'synced' ? 'bg-green-500/10' : 
                syncStatus === 'syncing' ? 'bg-primary/10' : 
                'bg-error/10'
              }`}>
                <Database className={`w-6 h-6 ${
                  syncStatus === 'synced' ? 'text-green-500' : 
                  syncStatus === 'syncing' ? 'text-primary' : 
                  'text-error'
                }`} />
              </div>
              <div className="space-y-1">
                <h4 className="text-2xl font-black tracking-tight">Supabase Connection</h4>
                <p className="text-sm font-bold opacity-40">
                  {syncStatus === 'synced' ? 'All data is safely stored in the cloud' : 
                   syncStatus === 'syncing' ? 'Saving changes to Supabase...' : 
                   'Connection error detected'}
                </p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
              syncStatus === 'synced' ? 'bg-green-500/10 text-green-500' : 
              syncStatus === 'syncing' ? 'bg-primary/10 text-primary' : 
              'bg-error/10 text-error'
            }`}>
              {syncStatus}
            </div>
          </div>

          {syncError && (
            <div className="p-6 bg-error/5 border border-error/10 rounded-3xl space-y-2">
              <div className="flex items-center gap-2 text-error">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">Sync Error</span>
              </div>
              <p className="text-sm font-bold opacity-60">{syncError}</p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <button 
              onClick={async () => {
                if (onTestConnection) {
                  setIsTesting(true);
                  const result = await onTestConnection();
                  setTestResult(result);
                  setIsTesting(false);
                  setTimeout(() => setTestResult(null), 5000);
                }
              }}
              disabled={isTesting}
              className="w-full flex items-center justify-center gap-4 p-6 bg-surface-container/30 rounded-3xl font-bold hover:bg-surface-container transition-all"
            >
              {isTesting ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
              {isTesting ? 'Testing Connection...' : 'Test Database Connection'}
            </button>

            {testResult && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-3xl flex items-center gap-4 ${
                  testResult.success ? 'bg-green-500/10 text-green-500' : 'bg-error/10 text-error'
                }`}
              >
                {testResult.success ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <p className="text-sm font-bold">{testResult.message}</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Sign Out Section */}
        <div className="pt-10 border-t border-surface-container/50">
          <button 
            onClick={onSignOut}
            className="w-full flex items-center justify-center gap-4 p-8 bg-error/10 text-error rounded-[2rem] font-black text-xl hover:bg-error/20 transition-all active:scale-[0.98]"
          >
            <LogOut className="w-6 h-6" />
            Sign Out
          </button>
        </div>
      </div>
    </main>
  );
};

// --- Main App ---

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userRole, setUserRole] = useState<Role>('user');
  const [activeTab, setActiveTab] = useState('home');
  const [language, setLanguage] = useState<Language>('English');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [statsMap, setStatsMap] = useState<Record<string, UserStats>>({});
  const [assignedUsers, setAssignedUsers] = useState<AssignedUser[]>(MOCK_ASSIGNED_USERS);
  const [coaches, setCoaches] = useState<{ id: string; name: string; avatar: string }[]>(MOCK_COACHES);
  const [userCredentials, setUserCredentials] = useState<Record<string, string>>({
    'user_1': '1234',
    'user_2': '1234',
    'user_3': '1234',
    'coach_sarah': '1234',
    'coach_mike': '1234',
    'owner': '0000'
  });
  const [foodCombos, setFoodCombos] = useState<FoodCombo[]>(FOOD_COMBOS);
  const [showCongrats, setShowCongrats] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // LogMealScreen State (Moved to App for sharing)
  const [mealName, setMealName] = useState('');
  const [kcal, setKcal] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [fiber, setFiber] = useState('');
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isEditable, setIsEditable] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [newSupplementName, setNewSupplementName] = useState('');
  const [newSupplementTime, setNewSupplementTime] = useState('');
  const [showAddSupplement, setShowAddSupplement] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const avatarFileInputRef = React.useRef<HTMLInputElement>(null);
  const avatarCameraInputRef = React.useRef<HTMLInputElement>(null);

  // --- Supabase Persistence Initialization ---
  useEffect(() => {
    const testSupabase = async () => {
      const result = await supabaseService.testConnection();
      console.log("Supabase Connection Test:", result);
      if (!result.success) {
        setLoginError(`Supabase Connection Error: ${result.message}`);
      }
    };
    testSupabase();
  }, []);

  useEffect(() => {
    const initApp = async () => {
      const savedUserId = localStorage.getItem('vitality_user_id');
      if (savedUserId) {
        try {
          const profile = await supabaseService.getProfile(savedUserId);
          if (profile) {
            // Fetch weight history
            const weightHistory = await supabaseService.getWeightHistory(savedUserId);
            
            // Map snake_case from DB to camelCase in app
            const mappedProfile: UserProfile = {
              id: profile.id,
              name: profile.name,
              role: profile.role,
              pin: profile.pin,
              waterGoal: profile.water_goal || 0,
              height: profile.height || 0,
              weight: profile.weight || 0,
              healthGoals: profile.health_goals || [],
              coachId: profile.coach_id,
              email: profile.email,
              avatar: profile.avatar_url,
              weightHistory: weightHistory || []
            };
            setUserProfile(mappedProfile);
            setUserRole(profile.role);
            setIsLoggedIn(true);

            // Fetch stats for current date
            const stats = await supabaseService.getStats(savedUserId, selectedDate, profile.role);
            if (stats) {
              setStatsMap(prev => ({
                ...prev,
                [`${savedUserId}_${selectedDate}`]: stats
              }));
            }
          }
        } catch (error) {
          console.error("Error initializing from Supabase:", error);
        }
      }
      setIsAuthReady(true);
    };
    initApp();
  }, [selectedDate]);

  // Sync profile to Supabase
  useEffect(() => {
    if (userProfile) {
      setSyncStatus('syncing');
      supabaseService.saveProfile(userProfile)
        .then(() => {
          setSyncStatus('synced');
          setSyncError(null);
        })
        .catch(err => {
          console.error("Error saving profile to Supabase:", err);
          setSyncStatus('error');
          setSyncError(err.message || "Failed to sync profile");
        });
      localStorage.setItem('vitality_user_profile', JSON.stringify(userProfile));
    } else {
      localStorage.removeItem('vitality_user_profile');
    }
  }, [userProfile]);

  // Sync stats to Supabase for ANY logged in person (User, Coach, or Owner)
  useEffect(() => {
    if (userProfile && Object.keys(statsMap).length > 0) {
      const currentStats = statsMap[`${userProfile.id}_${selectedDate}`];
      if (currentStats) {
        setSyncStatus('syncing');
        supabaseService.saveStats(userProfile.id, selectedDate, currentStats, userRole)
          .then(() => {
            setSyncStatus('synced');
            setSyncError(null);
          })
          .catch(err => {
            console.error("Error saving stats to Supabase:", err);
            setSyncStatus('error');
            setSyncError(err.message || "Failed to sync stats");
          });
      }
      localStorage.setItem('vitality_stats_map', JSON.stringify(statsMap));
    }
  }, [statsMap, selectedDate, userProfile]);

  // Fetch all users for coach/owner
  useEffect(() => {
    if (isLoggedIn && (userRole === 'coach' || userRole === 'owner')) {
      const fetchAllData = async () => {
        try {
          const profiles = await supabaseService.getAllProfiles();
          if (profiles) {
            const mappedUsers: AssignedUser[] = await Promise.all(profiles.map(async (p) => {
              const stats = await supabaseService.getStats(p.id, selectedDate, p.role);
              return {
                id: p.id,
                name: p.name,
                avatar: p.avatar_url || `https://i.pravatar.cc/150?u=${p.id}`,
                lastLog: 'Today',
                status: 'optimal',
                stats: stats || INITIAL_USER_STATS,
                coachId: p.coach_id,
                feedback: p.feedback,
                weight: p.weight
              };
            }));
            setAssignedUsers(mappedUsers);
            
            // Also update coaches list for owner dashboard
            const coachesFromProfiles = profiles
              .filter(p => p.role === 'coach')
              .map(p => ({
                id: p.id,
                name: p.name,
                avatar: p.avatar_url || `https://i.pravatar.cc/150?u=${p.id}`
              }));
            if (coachesFromProfiles.length > 0) {
              setCoaches(coachesFromProfiles);
            }
          }
        } catch (error) {
          console.error("Error fetching all profiles:", error);
        }
      };
      fetchAllData();
    }
  }, [isLoggedIn, userRole, selectedDate]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAIProcessing(true);
    setAiError(null);
    setIsEditable(false);
    
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const fullDataUrl = event.target?.result?.toString();
        if (!fullDataUrl) return;
        
        setUploadedImage(fullDataUrl);
        const base64Data = fullDataUrl.split(',')[1];
        if (!base64Data) return;

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          setAiError("Gemini API Key is missing. Please check your environment variables.");
          setIsAIProcessing(false);
          return;
        }

        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            {
              inlineData: {
                data: base64Data,
                mimeType: file.type,
              },
            },
            {
              text: `Analyze this meal image and estimate its nutritional values. 
              1. Identify the food items and their estimated portions.
              2. Calculate the total nutritional values (Calories, Protein, Carbs, Fats, Fiber).
              3. Return ONLY a valid JSON object with the following keys: name, kcal, protein, carbs, fats, fiber. 
              Use numbers for nutritional values. 
              Example: {"name": "Grilled Chicken Salad", "kcal": 350, "protein": 30, "carbs": 10, "fats": 15, "fiber": 5}`,
            },
          ],
          config: { responseMimeType: "application/json" }
        });

        if (response.text) {
          try {
            const text = response.text.replace(/```json|```/g, '').trim();
            const data = JSON.parse(text);
            const mealPrefix = selectedMealType ? `${selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}: ` : '';
            setMealName(data.name ? `${mealPrefix}${data.name}` : (selectedMealType ? `${selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)} Meal` : 'Uploaded Meal'));
            setKcal(data.kcal?.toString() || '0');
            setProtein(data.protein?.toString() || '0');
            setCarbs(data.carbs?.toString() || '0');
            setFats(data.fats?.toString() || '0');
            setFiber(data.fiber?.toString() || '0');
            
            // Switch to log tab to show results if on home
            if (activeTab === 'home') {
              setActiveTab('log');
            }
          } catch (parseError) {
            console.error("JSON Parse error:", parseError);
            setAiError("Failed to parse AI response. You can enter details manually.");
            setIsEditable(true);
            if (activeTab === 'home') setActiveTab('log');
          }
        } else {
          setAiError("AI returned an empty response. Please try again or enter manually.");
          setIsEditable(true);
          if (activeTab === 'home') setActiveTab('log');
        }
      };
      reader.onerror = () => {
        setAiError("Failed to read the image file.");
        setIsAIProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("AI Analysis error:", error);
      setAiError("An error occurred during analysis. Please check your connection.");
      setIsEditable(true);
      if (activeTab === 'home') setActiveTab('log');
    } finally {
      setIsAIProcessing(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile) return;

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const fullDataUrl = event.target?.result?.toString();
        if (!fullDataUrl) return;

        const updatedProfile = { ...userProfile, avatar: fullDataUrl };
        setUserProfile(updatedProfile);
        
        await supabaseService.saveProfile(updatedProfile);
        
        // Update assigned users list immediately if in coach/owner view
        if (userRole === 'coach' || userRole === 'owner') {
          setAssignedUsers(prev => prev.map(u => u.id === userProfile.id ? { ...u, avatar: fullDataUrl } : u));
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Avatar upload error:", error);
    }
  };

  const handleAddSupplementInternal = () => {
    if (newSupplementName && newSupplementTime) {
      handleAddSupplement(newSupplementName, newSupplementTime);
      setNewSupplementName('');
      setNewSupplementTime('');
      setShowAddSupplement(false);
    }
  };

  const handleLogMealInternal = () => {
    const name = mealName || 'Custom Meal';
    const k = parseFloat(kcal) || 0;
    const p = parseFloat(protein) || 0;
    const c = parseFloat(carbs) || 0;
    const f = parseFloat(fats) || 0;
    const fib = parseFloat(fiber) || 0;

    handleLogMeal(name, k, p, c, f, fib);

    // Reset
    setMealName('');
    setKcal('');
    setProtein('');
    setCarbs('');
    setFats('');
    setFiber('');
    setUploadedImage(null);
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSignOut = async () => {
    localStorage.removeItem('vitality_user_profile');
    setIsLoggedIn(false);
    setUserRole('user');
    setUserProfile(null);
    setActiveTab('home');
    setShowMenu(false);
  };

  const statsKey = userProfile ? `${userProfile.id}_${selectedDate}` : '';
  const rawStats = statsKey ? (statsMap[statsKey] || INITIAL_USER_STATS) : INITIAL_USER_STATS;

  // Recalculate targets based on weight if it's a new or empty log entry
  const getStatsWithProfileTargets = (baseStats: UserStats): UserStats => {
    if (!userProfile) return baseStats;
    
    const updatedStats = { ...baseStats };

    // 1. FILL WEIGHT: If stats.weight is missing/empty, take it from current profile
    if (!updatedStats.weight && userProfile.weight) {
      updatedStats.weight = userProfile.weight;
    }

    // 2. FILL TARGETS: Only apply current targets if targets are 0 (likely new day)
    if (updatedStats.calories.target === 0 && userProfile.weight) {
      const weight = userProfile.weight;
      updatedStats.hydration.target = userProfile.waterGoal || parseFloat((weight * 0.033).toFixed(2));
      updatedStats.calories.target = Math.round(weight * 30);
      updatedStats.protein.target = Math.round(weight * 2);
      updatedStats.fats.target = Math.round(weight * 0.9);
      updatedStats.fiber.target = Math.round((updatedStats.calories.target / 1000) * 14);
      
      const proteinKcal = updatedStats.protein.target * 4;
      const fatsKcal = updatedStats.fats.target * 9;
      updatedStats.carbs.target = Math.round((updatedStats.calories.target - proteinKcal - fatsKcal) / 4);
    }

    return updatedStats;
  };

  const currentStatsWithTargets = getStatsWithProfileTargets(rawStats);

  const userStats = {
    ...currentStatsWithTargets,
    checkIns: INITIAL_USER_STATS.checkIns.map(initialCi => {
      const existingCi = currentStatsWithTargets.checkIns?.find(ci => ci.id === initialCi.id);
      return existingCi || initialCi;
    })
  };

  const { translations: dynamicTranslations, isLoading: isTranslating } = useDynamicTranslations(language);
  const t = dynamicTranslations || TRANSLATIONS[language] || TRANSLATIONS['English'];

  const handleLogin = async (role: Role, pin: string, idOrName: string) => {
    setLoginError(null);
    
    try {
      // Try to find user in Supabase first
      const existingProfile = await supabaseService.findProfile(idOrName, pin, role);

      if (existingProfile) {
        const mappedProfile: UserProfile = {
          id: existingProfile.id,
          name: existingProfile.name,
          role: existingProfile.role,
          pin: existingProfile.pin,
          waterGoal: existingProfile.water_goal || 0,
          height: existingProfile.height || 0,
          weight: existingProfile.weight || 0,
          healthGoals: existingProfile.health_goals || [],
          coachId: existingProfile.coach_id,
          email: existingProfile.email
        };
        setUserProfile(mappedProfile);
        setUserRole(role);
        setIsLoggedIn(true);
        localStorage.setItem('vitality_user_id', mappedProfile.id);
        return;
      }

      // If not found and it's a new login, create a new ID
      let userId = `user_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
      
      const profile: UserProfile = {
        id: userId,
        name: idOrName,
        role: role,
        pin: pin,
        waterGoal: 0,
        weight: 0,
        height: 0,
        weightHistory: [],
        healthGoals: [],
        email: undefined
      };

      await supabaseService.saveProfile(profile);
      setUserProfile(profile);
      setUserRole(role);
      setIsLoggedIn(true);
      localStorage.setItem('vitality_user_id', userId);
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = error?.message || error?.details || "Please check your connection.";
      setLoginError(`Failed to login: ${errorMessage}`);
    }
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'security') {
      setIsLoggedIn(false);
      setActiveTab('home');
      return;
    }
    setActiveTab(tab);
  };

  const handleAddWater = async (amount: number) => {
    if (!userProfile) return;
    const statsPath = `users/${userProfile.id}/stats/${selectedDate}`;
    const currentStats = userStats;
    
    const newCurrent = parseFloat((currentStats.hydration.current + amount).toFixed(2));
    let newTarget = currentStats.hydration.target;
    
    if (currentStats.hydration.current < currentStats.hydration.target && newCurrent >= currentStats.hydration.target) {
      setShowCongrats(true);
    }

    if (currentStats.hydration.current >= currentStats.hydration.target) {
      newTarget = parseFloat((newTarget + amount).toFixed(2));
    }

    const updatedStats = {
      ...currentStats,
      hydration: {
        ...currentStats.hydration,
        current: newCurrent,
        target: newTarget
      }
    };

    setStatsMap(prev => ({
      ...prev,
      [`${userProfile.id}_${selectedDate}`]: updatedStats
    }));
  };

  const handleLogMeal = async (name: string, kcal: number, protein: number, carbs: number, fats: number, fiber: number) => {
    if (!userProfile) return;
    const statsPath = `users/${userProfile.id}/stats/${selectedDate}`;
    const currentStats = userStats;

    const newMeal = {
      id: Date.now().toString(),
      name,
      kcal,
      protein,
      carbs,
      fats,
      fiber,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedStats = {
      ...currentStats,
      calories: { ...currentStats.calories, current: currentStats.calories.current + kcal },
      protein: { ...currentStats.protein, current: currentStats.protein.current + protein },
      carbs: { ...currentStats.carbs, current: currentStats.carbs.current + carbs },
      fats: { ...currentStats.fats, current: currentStats.fats.current + fats },
      fiber: { ...currentStats.fiber, current: currentStats.fiber.current + (fiber || 0) },
      meals: [newMeal, ...currentStats.meals]
    };

    setStatsMap(prev => ({
      ...prev,
      [`${userProfile.id}_${selectedDate}`]: updatedStats
    }));
    setActiveTab('home');
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (!userProfile) return;
    const statsPath = `users/${userProfile.id}/stats/${selectedDate}`;
    const currentStats = userStats;
    const mealToDelete = currentStats.meals.find(m => m.id === mealId);
    if (!mealToDelete) return;

    const updatedStats = {
      ...currentStats,
      calories: { ...currentStats.calories, current: Math.max(0, currentStats.calories.current - mealToDelete.kcal) },
      protein: { ...currentStats.protein, current: Math.max(0, currentStats.protein.current - mealToDelete.protein) },
      carbs: { ...currentStats.carbs, current: Math.max(0, currentStats.carbs.current - mealToDelete.carbs) },
      fats: { ...currentStats.fats, current: Math.max(0, currentStats.fats.current - mealToDelete.fats) },
      fiber: { ...currentStats.fiber, current: Math.max(0, currentStats.fiber.current - (mealToDelete.fiber || 0)) },
      meals: currentStats.meals.filter(m => m.id !== mealId)
    };

    setStatsMap(prev => ({
      ...prev,
      [`${userProfile.id}_${selectedDate}`]: updatedStats
    }));
  };

  const handleUpdateEnergyLevel = async (level: number) => {
    if (!userProfile) return;
    const statsPath = `users/${userProfile.id}/stats/${selectedDate}`;
    const currentStats = userStats;
    
    setStatsMap(prev => ({
      ...prev,
      [`${userProfile.id}_${selectedDate}`]: {
        ...currentStats,
        energyLevel: level
      }
    }));
  };

  const handleUpdateMetrics = async (height: number, weight: number) => {
    if (!userProfile) return;
    const statsPath = `users/${userProfile.id}/stats/${selectedDate}`;
    const profilePath = `users/${userProfile.id}`;
    
    const calculatedWaterGoal = parseFloat((weight * 0.033).toFixed(2));
    const calculatedCalories = Math.round(weight * 30);
    const calculatedProtein = Math.round(weight * 2);
    const calculatedFats = Math.round(weight * 0.9);
    const calculatedFiber = Math.round((calculatedCalories / 1000) * 14);
    const proteinKcal = calculatedProtein * 4;
    const fatsKcal = calculatedFats * 9;
    const calculatedCarbs = Math.round((calculatedCalories - proteinKcal - fatsKcal) / 4);

    const isToday = selectedDate === new Date().toISOString().split('T')[0];
    const logDate = isToday ? new Date().toISOString() : `${selectedDate}T12:00:00.000Z`;

    const newWeightLog = {
      id: Math.random().toString(36).substr(2, 9),
      weight,
      date: logDate
    };

    const history = userProfile.weightHistory || [];
    const lastEntry = history[history.length - 1];
    const isNewDay = lastEntry ? new Date(lastEntry.date).toDateString() !== new Date().toDateString() : true;
    const isDifferentWeight = lastEntry ? lastEntry.weight !== weight : true;

    let newHistory = history;
    if (isNewDay || isDifferentWeight) {
      newHistory = [...history, newWeightLog];
      supabaseService.saveWeightLog(userProfile.id, weight, newWeightLog.date)
        .catch(err => console.error("Error saving weight log to Supabase:", err));
    }

    const currentStats = userStats;

    const updatedProfile = {
      ...userProfile,
      height,
      weight,
      waterGoal: calculatedWaterGoal,
      weightHistory: newHistory
    };

    const updatedStats = {
      ...currentStats,
      weight,
      calories: { ...currentStats.calories, target: calculatedCalories },
      protein: { ...currentStats.protein, target: calculatedProtein },
      carbs: { ...currentStats.carbs, target: calculatedCarbs },
      fats: { ...currentStats.fats, target: calculatedFats },
      fiber: { ...currentStats.fiber, target: calculatedFiber },
      hydration: {
        ...currentStats.hydration,
        target: calculatedWaterGoal
      }
    };

    setUserProfile(updatedProfile);
    setStatsMap(prev => ({
      ...prev,
      [`${userProfile.id}_${selectedDate}`]: updatedStats
    }));
  };

  const handleUpdateCheckIn = async (checkInId: string) => {
    if (!userProfile) return;
    const currentStats = userStats;

    setStatsMap(prev => ({
      ...prev,
      [`${userProfile.id}_${selectedDate}`]: {
        ...currentStats,
        checkIns: currentStats.checkIns.map(ci => 
          ci.id === checkInId ? { ...ci, checked: !ci.checked } : ci
        )
      }
    }));
  };

  const handleUpdateHealthGoal = async (goal: string) => {
    if (!userProfile) return;
    const profilePath = `users/${userProfile.id}`;
    const currentGoals = userProfile.healthGoals || [];
    const newGoals = currentGoals.includes(goal)
      ? currentGoals.filter(g => g !== goal)
      : [...currentGoals, goal];

    setUserProfile(prev => prev ? { ...prev, healthGoals: newGoals } : null);
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    if (!userProfile) return;
    
    const newProfile = { ...userProfile, ...updates };
    const weight = newProfile.weight || 0;
    const height = newProfile.height || 0;

    if (updates.weight !== undefined || updates.height !== undefined) {
      const calculatedWaterGoal = parseFloat((weight * 0.033).toFixed(2));
      const calculatedCalories = Math.round(weight * 30);
      const calculatedProtein = Math.round(weight * 2);
      const calculatedFats = Math.round(weight * 0.9);
      const calculatedFiber = Math.round((calculatedCalories / 1000) * 14);
      const proteinKcal = calculatedProtein * 4;
      const fatsKcal = calculatedFats * 9;
      const calculatedCarbs = Math.round((calculatedCalories - proteinKcal - fatsKcal) / 4);

      const currentStats = userStats;
      
      const updatedStats = {
        ...currentStats,
        weight,
        calories: { ...currentStats.calories, target: calculatedCalories },
        protein: { ...currentStats.protein, target: calculatedProtein },
        carbs: { ...currentStats.carbs, target: calculatedCarbs },
        fats: { ...currentStats.fats, target: calculatedFats },
        fiber: { ...currentStats.fiber, target: calculatedFiber },
        hydration: {
          ...currentStats.hydration,
          target: calculatedWaterGoal
        }
      };

      setStatsMap(prev => ({
        ...prev,
        [`${userProfile.id}_${selectedDate}`]: updatedStats
      }));

      // Update the profile with the new water goal
      updates.waterGoal = calculatedWaterGoal;

      // If weight changed, log it to history
      if (updates.weight !== undefined && updates.weight !== userProfile.weight) {
        const isToday = selectedDate === new Date().toISOString().split('T')[0];
        const logDate = isToday ? new Date().toISOString() : `${selectedDate}T12:00:00.000Z`;

        const newWeightLog = {
          id: Math.random().toString(36).substr(2, 9),
          weight: updates.weight,
          date: logDate
        };
        const history = userProfile.weightHistory || [];
        updates.weightHistory = [...history, newWeightLog];
        
        supabaseService.saveWeightLog(userProfile.id, updates.weight, newWeightLog.date)
          .catch(err => console.error("Error saving weight log to Supabase:", err));
      }
    }

    setUserProfile(prev => prev ? { ...prev, ...updates } : null);
  };

  const handleAddSupplement = async (name: string, time: string) => {
    if (!userProfile) return;
    const statsPath = `users/${userProfile.id}/stats/${selectedDate}`;
    const currentStats = userStats;
    const newSupplement = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      time,
      checked: false
    };

    setStatsMap(prev => ({
      ...prev,
      [`${userProfile.id}_${selectedDate}`]: {
        ...currentStats,
        supplements: [...currentStats.supplements, newSupplement]
      }
    }));
  };

  const handleToggleSupplement = async (id: string) => {
    if (!userProfile) return;
    const statsPath = `users/${userProfile.id}/stats/${selectedDate}`;
    const currentStats = userStats;

    setStatsMap(prev => ({
      ...prev,
      [`${userProfile.id}_${selectedDate}`]: {
        ...currentStats,
        supplements: currentStats.supplements.map(s => 
          s.id === id ? { ...s, checked: !s.checked } : s
        )
      }
    }));
  };

  const handleDeleteSupplement = async (id: string) => {
    if (!userProfile) return;
    const statsPath = `users/${userProfile.id}/stats/${selectedDate}`;
    const currentStats = userStats;

    setStatsMap(prev => ({
      ...prev,
      [`${userProfile.id}_${selectedDate}`]: {
        ...currentStats,
        supplements: currentStats.supplements.filter(s => s.id !== id)
      }
    }));
  };

  const handleCoachUpdateUserStats = async (userId: string, updates: Partial<UserStats>) => {
    const statsKey = `${userId}_${selectedDate}`;
    const currentStats = statsMap[statsKey] || INITIAL_USER_STATS;
    
    setStatsMap(prev => ({
      ...prev,
      [statsKey]: {
        ...currentStats,
        ...updates
      }
    }));
  };
  
  const handleCoachUpdateUserFeedback = async (userId: string, feedback: string) => {
    setAssignedUsers(prev => prev.map(u => u.id === userId ? { ...u, feedback } : u));
  };

  const handleCoachUpdateUserMeal = async (userId: string, mealId: string, updates: Partial<UserStats['meals'][0]>) => {
    const statsKey = `${userId}_${selectedDate}`;
    const currentStats = statsMap[statsKey] || INITIAL_USER_STATS;
    const updatedMeals = currentStats.meals.map(m => m.id === mealId ? { ...m, ...updates } : m);
    
    const totals = updatedMeals.reduce((acc, meal) => ({
      kcal: acc.kcal + meal.kcal,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fats: acc.fats + meal.fats,
      fiber: acc.fiber + meal.fiber,
    }), { kcal: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 });

    const newStats = {
      ...currentStats,
      meals: updatedMeals,
      calories: { ...currentStats.calories, current: totals.kcal },
      protein: { ...currentStats.protein, current: totals.protein },
      carbs: { ...currentStats.carbs, current: totals.carbs },
      fats: { ...currentStats.fats, current: totals.fats },
      fiber: { ...currentStats.fiber, current: totals.fiber },
    };

    setStatsMap(prev => ({
      ...prev,
      [statsKey]: newStats
    }));
  };

  const handlePromoteUser = async (userId: string) => {
    setAssignedUsers(prev => prev.map(u => u.id === userId ? { ...u, role: 'coach' } : u));
  };

  const handleAssignCoach = async (userId: string, coachId: string | null) => {
    setAssignedUsers(prev => prev.map(u => u.id === userId ? { ...u, coachId: coachId || undefined } : u));
  };

  const handleCreateUser = async (role: Role, name: string, pin: string) => {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newProfile: UserProfile = {
      id,
      name,
      role,
      pin,
      waterGoal: 0,
      weight: 0,
      height: 0,
      weightHistory: [],
      healthGoals: [],
    };

    try {
      await supabaseService.saveProfile(newProfile);
      
      const assignedUser: AssignedUser = {
        id,
        name,
        avatar: `https://i.pravatar.cc/150?u=${id}`,
        lastLog: 'Never',
        status: 'incomplete',
        stats: INITIAL_USER_STATS,
        coachId: userProfile?.id,
      };
      setAssignedUsers(prev => [...prev, assignedUser]);
    } catch (error) {
      console.error("Error creating user in Supabase:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setAssignedUsers(prev => prev.filter(u => u.id !== userId));
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
            <Zap className="w-10 h-10 text-primary" />
          </div>
          <p className="text-xl font-black tracking-tighter opacity-40 animate-pulse">Initializing VitalityTrack...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginScreen 
      onLogin={handleLogin} 
      language={language} 
      translations={t} 
      error={loginError} 
      isAuthReady={isAuthReady}
      userProfile={userProfile}
    />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-on-surface font-sans">
      <TopAppBar 
        language={language} 
        onLanguageChange={setLanguage} 
        onMenuClick={() => setShowMenu(true)}
        translations={t}
        syncStatus={syncStatus}
      />

      <SideMenu 
        isOpen={showMenu}
        onClose={() => setShowMenu(false)}
        onTabChange={handleTabChange}
        role={userRole}
        language={language}
        translations={t}
      />
      
      {isTranslating && (
        <div className="fixed top-0 left-0 w-full h-1 bg-primary/20 z-[100]">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            className="h-full bg-primary"
          />
        </div>
      )}

      {showCongrats && (
        <CongratsPopup 
          translations={t}
          onClose={() => setShowCongrats(false)}
        />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {userRole === 'user' ? (
            <>
              {activeTab === 'home' && (
                <UserDashboard 
                  stats={userStats} 
                  language={language} 
                  onAddWater={handleAddWater} 
                  translations={t} 
                  userName={userProfile?.name} 
                  userProfile={userProfile}
                  onUpdateMetrics={handleUpdateMetrics}
                  onUpdateEnergyLevel={handleUpdateEnergyLevel}
                  checkIns={userStats.checkIns}
                  onUpdateCheckIn={handleUpdateCheckIn}
                  supplements={userStats.supplements}
                  onAddSupplement={handleAddSupplementInternal}
                  onToggleSupplement={handleToggleSupplement}
                  onDeleteSupplement={handleDeleteSupplement}
                  newSupplementName={newSupplementName}
                  setNewSupplementName={setNewSupplementName}
                  newSupplementTime={newSupplementTime}
                  setNewSupplementTime={setNewSupplementTime}
                  showAddSupplement={showAddSupplement}
                  setShowAddSupplement={setShowAddSupplement}
                  cameraInputRef={cameraInputRef}
                  fileInputRef={fileInputRef}
                  handleFileUpload={handleFileUpload}
                  isAIProcessing={isAIProcessing}
                  setSelectedMealType={setSelectedMealType}
                  selectedMealType={selectedMealType}
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                />
              )}
              {activeTab === 'log' && (
                <LogMealScreen 
                  language={language} 
                  onLogMeal={handleLogMealInternal} 
                  onDeleteMeal={handleDeleteMeal}
                  translations={t} 
                  meals={userStats.meals}
                  stats={userStats}
                  mealName={mealName}
                  setMealName={setMealName}
                  kcal={kcal}
                  setKcal={setKcal}
                  protein={protein}
                  setProtein={setProtein}
                  carbs={carbs}
                  setCarbs={setCarbs}
                  fats={fats}
                  setFats={setFats}
                  fiber={fiber}
                  setFiber={setFiber}
                  isAIProcessing={isAIProcessing}
                  aiError={aiError}
                  setAiError={setAiError}
                  isEditable={isEditable}
                  setIsEditable={setIsEditable}
                  uploadedImage={uploadedImage}
                  setUploadedImage={setUploadedImage}
                  selectedDate={selectedDate}
                />
              )}
              {activeTab === 'profile' && (
                <ProfileScreen 
                  userProfile={userProfile} 
                  stats={userStats} 
                  language={language} 
                  onLanguageChange={setLanguage}
                  translations={t} 
                  darkMode={darkMode}
                  onDarkModeToggle={() => setDarkMode(!darkMode)}
                  onSignOut={handleSignOut}
                  onUpdateHealthGoal={handleUpdateHealthGoal}
                  onUpdateProfile={handleUpdateProfile}
                  onAvatarUpload={handleAvatarUpload}
                  avatarCameraInputRef={avatarCameraInputRef}
                  avatarFileInputRef={avatarFileInputRef}
                  syncStatus={syncStatus}
                  syncError={syncError}
                  onTestConnection={() => supabaseService.testConnection()}
                />
              )}
            </>
          ) : userRole === 'coach' ? (
            <>
              {activeTab === 'home' && (
                <UserDashboard 
                  stats={userStats} 
                  language={language} 
                  onAddWater={handleAddWater} 
                  translations={t} 
                  userName={userProfile?.name} 
                  userProfile={userProfile}
                  onUpdateMetrics={handleUpdateMetrics}
                  onUpdateEnergyLevel={handleUpdateEnergyLevel}
                  checkIns={userStats.checkIns}
                  onUpdateCheckIn={handleUpdateCheckIn}
                  supplements={userStats.supplements}
                  onAddSupplement={handleAddSupplementInternal}
                  onToggleSupplement={handleToggleSupplement}
                  onDeleteSupplement={handleDeleteSupplement}
                  newSupplementName={newSupplementName}
                  setNewSupplementName={setNewSupplementName}
                  newSupplementTime={newSupplementTime}
                  setNewSupplementTime={setNewSupplementTime}
                  showAddSupplement={showAddSupplement}
                  setShowAddSupplement={setShowAddSupplement}
                  cameraInputRef={cameraInputRef}
                  fileInputRef={fileInputRef}
                  handleFileUpload={handleFileUpload}
                  isAIProcessing={isAIProcessing}
                  setSelectedMealType={setSelectedMealType}
                  selectedMealType={selectedMealType}
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                />
              )}
              {activeTab === 'coach' && (
                <CoachDashboard 
                  language={language} 
                  translations={t} 
                  userName={userProfile?.name} 
                  coachProfile={userProfile}
                  assignedUsers={assignedUsers}
                  onUpdateUserStats={handleCoachUpdateUserStats}
                  onUpdateUserMeal={handleCoachUpdateUserMeal}
                  onUpdateUserFeedback={handleCoachUpdateUserFeedback}
                />
              )}
              {activeTab === 'log' && (
                <LogMealScreen 
                  language={language} 
                  onLogMeal={handleLogMealInternal} 
                  onDeleteMeal={handleDeleteMeal}
                  translations={t} 
                  meals={userStats.meals}
                  stats={userStats}
                  mealName={mealName}
                  setMealName={setMealName}
                  kcal={kcal}
                  setKcal={setKcal}
                  protein={protein}
                  setProtein={setProtein}
                  carbs={carbs}
                  setCarbs={setCarbs}
                  fats={fats}
                  setFats={setFats}
                  fiber={fiber}
                  setFiber={setFiber}
                  isAIProcessing={isAIProcessing}
                  aiError={aiError}
                  setAiError={setAiError}
                  isEditable={isEditable}
                  setIsEditable={setIsEditable}
                  uploadedImage={uploadedImage}
                  setUploadedImage={setUploadedImage}
                  selectedDate={selectedDate}
                />
              )}
              {activeTab === 'profile' && (
                <ProfileScreen 
                  userProfile={userProfile} 
                  stats={userStats} 
                  language={language} 
                  onLanguageChange={setLanguage}
                  translations={t} 
                  darkMode={darkMode}
                  onDarkModeToggle={() => setDarkMode(!darkMode)}
                  onSignOut={handleSignOut}
                  onUpdateHealthGoal={handleUpdateHealthGoal}
                  onUpdateProfile={handleUpdateProfile}
                  onAvatarUpload={handleAvatarUpload}
                  avatarCameraInputRef={avatarCameraInputRef}
                  avatarFileInputRef={avatarFileInputRef}
                  syncStatus={syncStatus}
                  syncError={syncError}
                  onTestConnection={() => supabaseService.testConnection()}
                />
              )}
            </>
          ) : (
            <>
              {activeTab === 'home' && (
                <UserDashboard 
                  stats={userStats} 
                  language={language} 
                  onAddWater={handleAddWater} 
                  translations={t} 
                  userName={userProfile?.name} 
                  userProfile={userProfile}
                  onUpdateMetrics={handleUpdateMetrics}
                  onUpdateEnergyLevel={handleUpdateEnergyLevel}
                  checkIns={userStats.checkIns}
                  onUpdateCheckIn={handleUpdateCheckIn}
                  supplements={userStats.supplements}
                  onAddSupplement={handleAddSupplementInternal}
                  onToggleSupplement={handleToggleSupplement}
                  onDeleteSupplement={handleDeleteSupplement}
                  newSupplementName={newSupplementName}
                  setNewSupplementName={setNewSupplementName}
                  newSupplementTime={newSupplementTime}
                  setNewSupplementTime={setNewSupplementTime}
                  showAddSupplement={showAddSupplement}
                  setShowAddSupplement={setShowAddSupplement}
                  cameraInputRef={cameraInputRef}
                  fileInputRef={fileInputRef}
                  handleFileUpload={handleFileUpload}
                  isAIProcessing={isAIProcessing}
                  setSelectedMealType={setSelectedMealType}
                  selectedMealType={selectedMealType}
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                />
              )}
              {activeTab === 'owner' && (
                <OwnerDashboard 
                  language={language} 
                  translations={t} 
                  userName={userProfile?.name} 
                  assignedUsers={assignedUsers}
                  coaches={coaches}
                  userCredentials={userCredentials}
                  onPromoteUser={handlePromoteUser}
                  onAssignCoach={handleAssignCoach}
                  onCreateUser={handleCreateUser}
                  onDeleteUser={handleDeleteUser}
                />
              )}
              {activeTab === 'log' && (
                <LogMealScreen 
                  language={language} 
                  onLogMeal={handleLogMealInternal} 
                  onDeleteMeal={handleDeleteMeal}
                  translations={t} 
                  meals={userStats.meals}
                  stats={userStats}
                  mealName={mealName}
                  setMealName={setMealName}
                  kcal={kcal}
                  setKcal={setKcal}
                  protein={protein}
                  setProtein={setProtein}
                  carbs={carbs}
                  setCarbs={setCarbs}
                  fats={fats}
                  setFats={setFats}
                  fiber={fiber}
                  setFiber={setFiber}
                  isAIProcessing={isAIProcessing}
                  aiError={aiError}
                  setAiError={setAiError}
                  isEditable={isEditable}
                  setIsEditable={setIsEditable}
                  uploadedImage={uploadedImage}
                  setUploadedImage={setUploadedImage}
                  selectedDate={selectedDate}
                />
              )}
              {activeTab === 'profile' && (
                <ProfileScreen 
                  userProfile={userProfile} 
                  stats={userStats} 
                  language={language} 
                  onLanguageChange={setLanguage}
                  translations={t} 
                  darkMode={darkMode}
                  onDarkModeToggle={() => setDarkMode(!darkMode)}
                  onSignOut={handleSignOut}
                  onUpdateHealthGoal={handleUpdateHealthGoal}
                  onUpdateProfile={handleUpdateProfile}
                  onAvatarUpload={handleAvatarUpload}
                  avatarCameraInputRef={avatarCameraInputRef}
                  avatarFileInputRef={avatarFileInputRef}
                  syncStatus={syncStatus}
                  syncError={syncError}
                  onTestConnection={() => supabaseService.testConnection()}
                />
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <BottomNavBar 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        role={userRole}
        language={language}
        translations={t}
        userName={userProfile?.name}
      />
    </div>
    </ErrorBoundary>
  );
};

export default App;
