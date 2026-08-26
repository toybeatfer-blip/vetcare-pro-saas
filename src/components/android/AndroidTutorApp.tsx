import React, { useState, useMemo } from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import { Pet, VaccineRecord, MedicalRecord, Appointment } from '../../types';
import {
  Home,
  QrCode,
  Calendar,
  Syringe,
  Pill,
  Sparkles,
  Bell,
  PhoneCall,
  ShieldCheck,
  Heart,
  ChevronRight,
  User,
  CheckCircle2,
  Clock,
  MapPin,
  AlertTriangle,
  FileText,
  Activity,
  Send,
  Download,
  Share2,
  Smartphone,
  Maximize2,
  Minimize2,
  RefreshCw,
  Plus,
  ArrowRight,
  Flame,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { askVetCopilot } from '../../services/geminiService';
import { AndroidQrPassportModal } from './AndroidQrPassportModal';
import { AndroidSosModal } from './AndroidSosModal';
import { AndroidNotificationShade, AndroidNotification } from './AndroidNotificationShade';
import { AndroidBookAppointmentModal } from './AndroidBookAppointmentModal';

export const AndroidTutorApp: React.FC = () => {
  const {
    pets,
    vaccines,
    medicalRecords,
    appointments,
    clinicSettings,
    setViewMode,
    showToast,
  } = useVeterinary();

  // Active Selected Tutor Pet
  const [activePetId, setActivePetId] = useState<string>(pets[0]?.id || 'pet-1');
  const [currentTab, setCurrentTab] = useState<'home' | 'passport' | 'health' | 'appointments' | 'ai'>('home');

  // Frame presentation mode: 'frame' (Google Pixel shell) vs 'fullscreen' (fluid)
  const [deviceFrameMode, setDeviceFrameMode] = useState<'frame' | 'fullscreen'>('frame');

  // Modals state
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isNotifShadeOpen, setIsNotifShadeOpen] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  // Taken medicines state { [prescriptionId]: boolean }
  const [takenMeds, setTakenMeds] = useState<{ [id: string]: boolean }>({});

  // Simulated Android Notifications
  const [notifications, setNotifications] = useState<AndroidNotification[]>([
    {
      id: 'notif-1',
      title: 'Vacuna Próxima para Max',
      body: 'Recuerda que Max tiene programada su vacuna Séxtuple Canina este mes.',
      time: '12:30',
      type: 'vaccine',
    },
    {
      id: 'notif-2',
      title: 'Recordatorio de Medicación',
      body: 'Hora de suministrar Meloxicam 0.5ml con comida suave.',
      time: '10:00',
      type: 'medication',
    },
    {
      id: 'notif-3',
      title: 'Cita Confirmada en Clínica',
      body: 'Tu cita con Dr. Alejandro Soto está agendada.',
      time: 'Ayer',
      type: 'appointment',
    },
  ]);

  // AI Chat State inside Android
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: `¡Hola! Soy tu asistente veterinario de ${clinicSettings.name || 'tu clínica'} 🐾 ¿Tienes alguna duda sobre la alimentación, síntomas o cuidados de tu mascota?`,
      time: '13:40',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Current selected pet data
  const currentPet = pets.find((p) => p.id === activePetId) || pets[0];
  const petVaccines = vaccines.filter((v) => v.petId === currentPet?.id);
  const petRecords = medicalRecords.filter((r) => r.petId === currentPet?.id);
  const petAppointments = appointments.filter((a) => a.petId === currentPet?.id);

  // Active Prescriptions for current pet
  const activePrescriptions = useMemo(() => {
    return petRecords.flatMap((r) => r.prescriptions).filter((p) => p.isActive);
  }, [petRecords]);

  // Protection Health Score (WSAVA aligned calculation)
  const overdueCount = petVaccines.filter((v) => v.status === 'vencida').length;
  let healthScore = 98;
  if (overdueCount > 0) healthScore -= overdueCount * 25;
  if (petRecords.length === 0) healthScore -= 10;
  healthScore = Math.max(35, Math.min(100, healthScore));

  const handleSimulatePushNotification = () => {
    const newNotif: AndroidNotification = {
      id: Date.now().toString(),
      title: `🔔 Alerta de Salud: ${currentPet.name}`,
      body: `Revisión preventiva: ${currentPet.name} tiene ${petVaccines.length} vacunas registradas en su carnet oficial de ${clinicSettings.name || 'la clínica'}.`,
      time: 'Ahora',
      type: 'ai',
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setIsNotifShadeOpen(true);
    showToast('Notificación push Android recibida.', 'info');
  };

  const handleToggleMedTaken = (prescId: string, medName: string) => {
    const isNowTaken = !takenMeds[prescId];
    setTakenMeds((prev) => ({ ...prev, [prescId]: isNowTaken }));
    if (isNowTaken) {
      showToast(`¡Dosis de ${medName} marcada como suministrada!`, 'success');
    }
  };

  const handleSendAiMessage = async (textToSend?: string) => {
    const query = (textToSend || chatInput).trim();
    if (!query || isAiLoading) return;

    const userMsg = {
      sender: 'user' as const,
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsAiLoading(true);

    try {
      const response = await askVetCopilot(
        `Eres el asistente veterinario para tutores de mascotas de ${clinicSettings.name || 'la clínica veterinaria'}.
Responde en tono cálido, empático y profesional a la siguiente consulta del tutor sobre su mascota ${currentPet.name} (${currentPet.species}, ${currentPet.breed}, ${currentPet.weightKg}kg):
Consulta: "${query}"
Recomienda acudir a consulta si detectas signos de alarma.`,
        currentPet,
        'client_summary'
      );

      const aiMsg = {
        sender: 'ai' as const,
        text: response.result,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      showToast('Error al consultar VetAI.', 'error');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSharePassport = () => {
    const text = `🐾 Carnet de Salud Digital - ${clinicSettings.name || 'Clínica Veterinaria'}\nMascota: ${currentPet.name} (${currentPet.species})\nTutor: ${currentPet.owner.name}\nMicrochip: ${currentPet.microchipNumber || 'REG-2026'}\nVacunas al día: ${petVaccines.length}\nClínica: ${clinicSettings.name || 'Clínica Veterinaria'}`;
    navigator.clipboard.writeText(text);
    showToast('Enlace de carnet copiado al portapapeles.', 'success');
  };

  if (!currentPet) {
    return (
      <div className="max-w-md mx-auto p-8 my-12 bg-white rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
          <Smartphone className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-black text-slate-900">App Android de Pacientes</h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          Aún no hay pacientes registrados en esta clínica. Registra a tu primera mascota desde el Software Clínico para visualizar su Carnet Digital y App Android en tiempo real.
        </p>
        <button
          onClick={() => setViewMode('admin')}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <span>Ir al Software Clínico</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center py-4 px-2 sm:px-4">
      {/* Top Controls Bar for testing & environment */}
      <div className="w-full max-w-4xl bg-white border border-slate-200/80 rounded-2xl p-3 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>App Android para Tutores</span>
              <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Material 3 • PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Vista activa: {currentPet.owner.name} ({currentPet.name})
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tutor switcher */}
          <select
            value={currentPet.id}
            onChange={(e) => setActivePetId(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            {pets.map((p) => (
              <option key={p.id} value={p.id}>
                👤 {p.owner.name.split(' ')[0]} ({p.name})
              </option>
            ))}
          </select>

          {/* Simulate Push Notification */}
          <button
            onClick={handleSimulatePushNotification}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl flex items-center gap-1 transition-colors"
            title="Probar notificación push de Android"
          >
            <Bell className="w-3.5 h-3.5 text-indigo-600" />
            <span>Simular Push</span>
          </button>

          {/* Toggle Device Frame vs Fullscreen */}
          <button
            onClick={() => setDeviceFrameMode(deviceFrameMode === 'frame' ? 'fullscreen' : 'frame')}
            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl flex items-center gap-1 transition-colors"
          >
            {deviceFrameMode === 'frame' ? (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pantalla Completa</span>
              </>
            ) : (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Marco Pixel 8</span>
              </>
            )}
          </button>

          {/* Return to Admin Clinic */}
          <button
            onClick={() => setViewMode('admin')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-colors"
          >
            Volver a Clínica
          </button>
        </div>
      </div>

      {/* ANDROID DEVICE CONTAINER */}
      <div
        className={`transition-all duration-300 ${
          deviceFrameMode === 'frame'
            ? 'w-full max-w-[420px] rounded-[48px] p-3.5 bg-slate-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] border-4 border-slate-800 relative'
            : 'w-full max-w-2xl rounded-3xl p-0 bg-slate-950 shadow-xl overflow-hidden'
        }`}
      >
        {/* Device Outer Buttons (Simulated Pixel 8) */}
        {deviceFrameMode === 'frame' && (
          <>
            {/* Power Button */}
            <div className="absolute -right-5 top-28 w-1.5 h-12 bg-slate-700 rounded-r-md" />
            {/* Volume Rocker */}
            <div className="absolute -right-5 top-44 w-1.5 h-20 bg-slate-700 rounded-r-md" />
          </>
        )}

        {/* ANDROID SCREEN VIEWPORT */}
        <div className="bg-slate-900 text-slate-100 rounded-[38px] overflow-hidden flex flex-col h-[780px] relative font-sans select-none">
          {/* ANDROID SYSTEM STATUS BAR */}
          <div className="pt-2 px-6 pb-1 bg-slate-950/80 backdrop-blur-sm flex items-center justify-between text-[11px] text-slate-300 shrink-0 z-30">
            {/* Left Time */}
            <span className="font-bold tracking-tight">13:42</span>

            {/* Center Camera Punch-Hole */}
            <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-800 mx-auto" />

            {/* Right Icons: WiFi, 5G, Battery */}
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <span>5G</span>
              <div className="w-3.5 h-2 border border-slate-300 rounded-[2px] p-[1px] flex items-center">
                <div className="w-full h-full bg-emerald-400 rounded-[1px]" />
              </div>
              <span className="font-bold">94%</span>
            </div>
          </div>

          {/* ANDROID APP TOP BAR */}
          <div className="px-4 py-3 bg-gradient-to-b from-slate-950 to-slate-900 border-b border-white/5 flex items-center justify-between shrink-0 z-20">
            {/* Tutor avatar & greeting */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-yellow-300 flex items-center justify-center text-slate-950 font-black text-xs shadow-md shadow-amber-500/20">
                {currentPet.owner.name.charAt(0)}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider leading-none truncate max-w-[140px]">
                  {clinicSettings.name || 'Tutor de Mascota'}
                </span>
                <span className="text-xs font-extrabold text-white">
                  {currentPet.owner.name.split(' ')[0]}
                </span>
              </div>
            </div>

            {/* Right actions: QR Shortcut, SOS & Notifications Bell */}
            <div className="flex items-center gap-1.5">
              {/* QR Passport Icon */}
              <button
                onClick={() => setIsQrModalOpen(true)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 text-indigo-300 flex items-center justify-center transition-colors"
                title="Pasaporte Sanitario QR"
              >
                <QrCode className="w-4 h-4" />
              </button>

              {/* SOS Urgencias */}
              <button
                onClick={() => setIsSosModalOpen(true)}
                className="w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center transition-transform active:scale-95 shadow-sm shadow-rose-600/50"
                title="Línea de Urgencia 24h"
              >
                <PhoneCall className="w-3.5 h-3.5" />
              </button>

              {/* Notification Shade Trigger */}
              <button
                onClick={() => setIsNotifShadeOpen(true)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 text-slate-200 flex items-center justify-center relative transition-colors"
                title="Notificaciones Android"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                )}
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500" />
                )}
              </button>
            </div>
          </div>

          {/* MAIN SCROLLABLE APP BODY */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/95">
            {/* Pet Switcher Horizontal Carousel */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {pets.map((p) => {
                const isSelected = p.id === currentPet.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActivePetId(p.id)}
                    className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-102 border border-indigo-400'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    <img
                      src={p.photoUrl || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&auto=format&fit=crop&q=80'}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span>{p.name}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: HOME DASHBOARD */}
            {currentTab === 'home' && (
              <div className="space-y-4">
                {/* Hero Pet Health Card */}
                <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border border-indigo-500/30 shadow-xl relative overflow-hidden">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={currentPet.photoUrl || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&auto=format&fit=crop&q=80'}
                        alt={currentPet.name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-400 shadow-md"
                      />
                      <div>
                        <h2 className="text-base font-extrabold text-white flex items-center gap-1.5">
                          {currentPet.name}
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        </h2>
                        <p className="text-[11px] text-slate-400">
                          {currentPet.species} • {currentPet.breed}
                        </p>
                        <p className="text-[10px] font-mono text-indigo-300 mt-0.5">
                          Chip: {currentPet.microchipNumber || 'CHIP-2026-MX'}
                        </p>
                      </div>
                    </div>

                    {/* Health Score Pill */}
                    <div className="text-right">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                        <Activity className="w-3 h-3" />
                        <span>{healthScore}% Salud</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        {currentPet.weightKg} kg • {currentPet.ageDisplay}
                      </span>
                    </div>
                  </div>

                  {/* Micro Quick Stats Bar */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-center">
                    <div className="p-2 rounded-xl bg-white/5">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Vacunas</span>
                      <span className="text-xs font-bold text-white">
                        {petVaccines.length} al día
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-white/5">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Citas</span>
                      <span className="text-xs font-bold text-white">
                        {petAppointments.length} registradas
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-white/5">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Tratamientos</span>
                      <span className="text-xs font-bold text-indigo-300">
                        {activePrescriptions.length} activos
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4 Quick Android Action Buttons */}
                <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                  <button
                    onClick={() => setIsBookModalOpen(true)}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl flex flex-col items-center gap-1.5 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-slate-200">Pedir Cita</span>
                  </button>

                  <button
                    onClick={() => setIsQrModalOpen(true)}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl flex flex-col items-center gap-1.5 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-600/30 text-emerald-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-slate-200">Carnet QR</span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('health')}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl flex flex-col items-center gap-1.5 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-600/30 text-amber-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Pill className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-slate-200">Recetas</span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('ai')}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl flex flex-col items-center gap-1.5 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-slate-200">VetAI Chat</span>
                  </button>
                </div>

                {/* Upcoming Appointment Card */}
                <div className="p-3.5 bg-slate-800/80 border border-white/10 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Próxima Cita Veterinaria
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                      Confirmada
                    </span>
                  </div>

                  {petAppointments.length > 0 ? (
                    <div className="flex items-center justify-between text-xs pt-1">
                      <div>
                        <h4 className="font-bold text-white">{petAppointments[0].reason}</h4>
                        <p className="text-[11px] text-slate-400">
                          {petAppointments[0].date} a las {petAppointments[0].time} hrs
                        </p>
                        <p className="text-[10px] text-indigo-300 mt-0.5">
                          {petAppointments[0].veterinarianName}
                        </p>
                      </div>
                      <button
                        onClick={() => setCurrentTab('appointments')}
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs pt-1">
                      <p className="text-slate-400 text-xs">No hay citas pendientes agendadas.</p>
                      <button
                        onClick={() => setIsBookModalOpen(true)}
                        className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-[11px] font-bold"
                      >
                        Agendar
                      </button>
                    </div>
                  )}
                </div>

                {/* Today's Active Medications Tracker */}
                {activePrescriptions.length > 0 && (
                  <div className="p-3.5 bg-slate-800/80 border border-white/10 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5" />
                        Tratamientos del Día
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {Object.values(takenMeds).filter(Boolean).length}/{activePrescriptions.length} tomas
                      </span>
                    </div>

                    <div className="space-y-2">
                      {activePrescriptions.map((p) => {
                        const isTaken = takenMeds[p.id];
                        return (
                          <div
                            key={p.id}
                            className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                              isTaken
                                ? 'bg-emerald-950/40 border-emerald-500/30 text-slate-300'
                                : 'bg-slate-900 border-white/5 text-white'
                            }`}
                          >
                            <div>
                              <span className={`font-bold block ${isTaken ? 'line-through text-slate-400' : 'text-white'}`}>
                                {p.medication}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {p.dose} • {p.frequency}
                              </span>
                            </div>

                            <button
                              onClick={() => handleToggleMedTaken(p.id, p.medication)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                                isTaken
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-indigo-600 text-white hover:bg-indigo-500'
                              }`}
                            >
                              {isTaken ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Tomada</span>
                                </>
                              ) : (
                                <span>Tomar Dosis</span>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Daily Pet Wellness Tip Card */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/60 to-slate-900 border border-purple-500/20 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-purple-200">Consejo Veterinario del Día</h4>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                      Mantén a {currentPet.name} hidratado y verifica que su cartilla de vacunación esté vigente antes de paseos en parques.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DIGITAL PASSPORT / VACCINES */}
            {currentTab === 'passport' && (
              <div className="space-y-4">
                {/* Passport QR Quick Access */}
                <div
                  onClick={() => setIsQrModalOpen(true)}
                  className="p-4 bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/30 rounded-3xl text-center cursor-pointer hover:border-indigo-400 transition-all group"
                >
                  <QrCode className="w-12 h-12 text-indigo-300 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="text-sm font-bold text-white">Pasaporte Sanitario Oficial QR</h3>
                  <p className="text-[11px] text-indigo-200 mt-0.5">
                    Toca para mostrar el código QR de check-in en clínica
                  </p>
                </div>

                {/* Vaccines List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="font-bold uppercase tracking-wider text-slate-400">
                      Esquema de Inmunización
                    </span>
                    <span className="text-[11px] text-indigo-300 font-semibold">
                      {petVaccines.length} aplicadas
                    </span>
                  </div>

                  {petVaccines.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      No hay vacunas registradas para esta mascota.
                    </div>
                  ) : (
                    petVaccines.map((vac) => (
                      <div
                        key={vac.id}
                        className="p-3 bg-slate-800/80 border border-white/10 rounded-2xl flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                            <Syringe className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white">{vac.vaccineName}</h4>
                            <p className="text-[10px] text-slate-400">
                              Lote: {vac.lotNumber} • {vac.brand}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              Aplicada: {vac.applicationDate}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              vac.status === 'vencida'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {vac.status === 'vencida' ? 'Refuerzo Pendiente' : 'Al Día'}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            Refuerzo: {vac.dueDate}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Share Passport Button */}
                <button
                  onClick={handleSharePassport}
                  className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Compartir Cartilla por WhatsApp</span>
                </button>
              </div>
            )}

            {/* TAB 3: HEALTH RECORDS & PRESCRIPTIONS */}
            {currentTab === 'health' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="font-bold uppercase tracking-wider text-slate-400">
                    Historial Clínico ({petRecords.length})
                  </span>
                </div>

                {petRecords.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    No hay consultas previas registradas.
                  </div>
                ) : (
                  petRecords.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3.5 bg-slate-800/80 border border-white/10 rounded-2xl space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{rec.reason}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{rec.date}</span>
                      </div>

                      <p className="text-[11px] text-slate-300">
                        <strong className="text-indigo-300">Diagnóstico:</strong> {rec.diagnosis}
                      </p>

                      {rec.prescriptions.length > 0 && (
                        <div className="p-2 bg-slate-900/60 rounded-xl space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">
                            Receta Médica:
                          </span>
                          {rec.prescriptions.map((pr) => (
                            <div key={pr.id} className="text-[11px] text-slate-300">
                              • <strong>{pr.medication}</strong> ({pr.dose}, {pr.frequency} por {pr.duration})
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-white/5">
                        <span>Médico: {rec.veterinarianName}</span>
                        <span>Temp: {rec.vitalSigns.temperatureC}°C</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 4: APPOINTMENTS */}
            {currentTab === 'appointments' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="font-bold uppercase tracking-wider text-slate-400">
                    Citas Programadas
                  </span>
                  <button
                    onClick={() => setIsBookModalOpen(true)}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nueva Cita</span>
                  </button>
                </div>

                {petAppointments.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="font-bold text-slate-300">No tienes citas agendadas</p>
                    <button
                      onClick={() => setIsBookModalOpen(true)}
                      className="mt-3 px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl"
                    >
                      Agendar Cita Ahora
                    </button>
                  </div>
                ) : (
                  petAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-3.5 bg-slate-800/80 border border-white/10 rounded-2xl space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{apt.reason}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                          {apt.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-300 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{apt.date} a las {apt.time} hrs</span>
                      </div>

                      <div className="text-[11px] text-slate-400">
                        Especialista: {apt.veterinarianName}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 5: VET AI CHAT */}
            {currentTab === 'ai' && (
              <div className="flex flex-col h-[520px] space-y-3">
                {/* Chat header */}
                <div className="p-3 bg-purple-950/40 border border-purple-500/20 rounded-2xl flex items-center gap-2.5 shrink-0">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">VetAI Asistente para Tutores</h4>
                    <p className="text-[10px] text-purple-300">Asistencia veterinaria 24/7 con Gemini</p>
                  </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto space-y-2.5 p-1">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-indigo-600 text-white rounded-tr-xs'
                            : 'bg-slate-800 text-slate-200 border border-white/10 rounded-tl-xs'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.text}</p>
                        <span className="text-[9px] text-slate-400 block mt-1 text-right">
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  ))}

                  {isAiLoading && (
                    <div className="flex justify-start">
                      <div className="p-3 bg-slate-800 text-slate-300 rounded-2xl text-xs flex items-center gap-2 border border-white/10">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                        <span>VetAI está analizando...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick query chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none">
                  {['¿Cómo desparasitar?', 'Dieta recomendada', 'Cuidados post vacuna'].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendAiMessage(chip)}
                      className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-[10px] text-purple-300 rounded-lg whitespace-nowrap border border-white/5 transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Input box */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendAiMessage();
                  }}
                  className="flex items-center gap-1.5 shrink-0 pt-1"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Escribe una pregunta para VetAI..."
                    className="flex-1 px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isAiLoading}
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* ANDROID MATERIAL 3 BOTTOM NAVIGATION BAR */}
          <div className="px-2 py-2 bg-slate-950 border-t border-white/10 flex items-center justify-around text-[10px] shrink-0 z-20">
            <button
              onClick={() => setCurrentTab('home')}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
                currentTab === 'home'
                  ? 'text-indigo-400 font-bold bg-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Inicio</span>
            </button>

            <button
              onClick={() => setCurrentTab('passport')}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
                currentTab === 'passport'
                  ? 'text-indigo-400 font-bold bg-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Carnet QR</span>
            </button>

            <button
              onClick={() => setCurrentTab('health')}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
                currentTab === 'health'
                  ? 'text-indigo-400 font-bold bg-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Salud</span>
            </button>

            <button
              onClick={() => setCurrentTab('appointments')}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
                currentTab === 'appointments'
                  ? 'text-indigo-400 font-bold bg-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Citas</span>
            </button>

            <button
              onClick={() => setCurrentTab('ai')}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
                currentTab === 'ai'
                  ? 'text-purple-400 font-bold bg-purple-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>VetAI</span>
            </button>
          </div>

          {/* ANDROID GESTURE NAVIGATION PILL */}
          <div className="py-1.5 bg-slate-950 flex justify-center shrink-0">
            <div className="w-28 h-1 bg-slate-600 rounded-full" />
          </div>

          {/* SLIDABLE NOTIFICATION SHADE OVERLAY */}
          <AndroidNotificationShade
            isOpen={isNotifShadeOpen}
            onClose={() => setIsNotifShadeOpen(false)}
            notifications={notifications}
            onDismiss={(id) => setNotifications((prev) => prev.filter((n) => n.id !== id))}
            onClearAll={() => setNotifications([])}
          />
        </div>
      </div>

      {/* QR Passport Modal */}
      <AndroidQrPassportModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        pet={currentPet}
        vaccines={petVaccines}
        onShare={handleSharePassport}
      />

      {/* SOS Emergency Modal */}
      <AndroidSosModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
      />

      {/* Book Appointment Modal */}
      <AndroidBookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        pet={currentPet}
      />
    </div>
  );
};
