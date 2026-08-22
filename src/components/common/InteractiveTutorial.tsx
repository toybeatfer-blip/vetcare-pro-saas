import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Lightbulb,
  Search,
  Users,
  Calendar,
  Pill,
  Wifi,
  Stethoscope,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useVeterinary } from '../../context/VeterinaryContext';

export interface TutorialStep {
  targetId: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  preferredPosition?: 'top' | 'bottom' | 'left' | 'right';
  highlightPadding?: number;
  tip?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    targetId: 'global-search-input',
    title: 'Buscador Global Inteligente',
    description:
      'Localiza en tiempo real fichas de pacientes, tutores, números de microchip, diagnósticos médicos o fármacos del inventario.',
    icon: <Search className="w-5 h-5 text-amber-500" />,
    preferredPosition: 'bottom',
    tip: 'Consejo: Puedes presionar para buscar por nombre de mascota o apellido del tutor.',
  },
  {
    targetId: 'btn-mode-tutor',
    title: 'Conmutador de Portales (Clínica vs Tutor)',
    description:
      'Alterna al instante entre la consola clínica del veterinario y el portal web interactivo que ven los dueños de mascotas.',
    icon: <Stethoscope className="w-5 h-5 text-indigo-500" />,
    preferredPosition: 'bottom',
    tip: 'El Portal Tutor permite a los clientes ver vacunas, recetas y agendar citas en línea.',
  },
  {
    targetId: 'btn-nav-network-status',
    title: 'Certificación de Red y Hora Oficial',
    description:
      'Monitorea el enlace de Internet y la sincronización con servidores de hora mundial NTP para proteger la integridad y validez de las recetas y licencias.',
    icon: <Wifi className="w-5 h-5 text-emerald-500" />,
    preferredPosition: 'bottom',
    tip: 'El sistema valida automáticamente la hora oficial en cada inicio de sesión.',
  },
  {
    targetId: 'btn-nav-copilot',
    title: 'VetCopilot: Asistente Clínico IA',
    description:
      'Tu copiloto con Inteligencia Artificial especializada: calcula dosis exactas por especie y peso, sugiere diagnósticos diferenciales y redacta recomendaciones.',
    icon: <Sparkles className="w-5 h-5 text-purple-500" />,
    preferredPosition: 'bottom',
    tip: 'Haz clic en cualquier momento para resolver dudas clínicas complejas.',
  },
  {
    targetId: 'btn-nav-new-appointment',
    title: 'Agendamiento Rápido de Citas',
    description:
      'Programa consultas, cirugías, desparasitaciones o vacunas con envío directo de avisos por WhatsApp y correo electrónico.',
    icon: <Calendar className="w-5 h-5 text-indigo-500" />,
    preferredPosition: 'bottom',
    tip: 'Las citas confirmadas se sincronizan en el calendario de la clínica.',
  },
  {
    targetId: 'sidebar-tab-patients',
    title: 'Pacientes y Fichas Médicas SOAP',
    description:
      'Administra la base de datos de mascotas: historial clínico completo SOAP, fotos, constantes vitales, vacunas y estudios de imagen.',
    icon: <Users className="w-5 h-5 text-blue-500" />,
    preferredPosition: 'right',
    tip: 'Cada paciente cuenta con su carnet digital y ficha descargable en PDF.',
  },
  {
    targetId: 'sidebar-tab-inventory',
    title: 'Farmacia e Inventario Kárdex',
    description:
      'Control riguroso de existencias, lotes, fechas de vencimiento, alertas de stock mínimo y registro detallado de movimientos de entrada y salida.',
    icon: <Pill className="w-5 h-5 text-amber-500" />,
    preferredPosition: 'right',
    tip: 'Se generan alertas automáticas cuando un medicamento está por agotarse o vencer.',
  },
  {
    targetId: 'btn-nav-user-profile',
    title: 'Control de Usuario y Seguridad',
    description:
      'Accede a tu perfil, cambia contraseñas, consulta tu estado de licencia, o reinicia este tutorial guiado cuando lo necesites.',
    icon: <KeyRound className="w-5 h-5 text-rose-500" />,
    preferredPosition: 'bottom',
    tip: 'Puedes volver a abrir este tutorial en cualquier momento desde el menú de usuario.',
  },
];

interface ElementRect {
  top: number;
  left: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
}

export const InteractiveTutorial: React.FC = () => {
  const { isTutorialOpen, closeTutorial, skipTutorialPermanently, isSuperUser, currentUser } = useVeterinary();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<ElementRect | null>(null);
  const [balloonPos, setBalloonPos] = useState<{ top: number; left: number; placement: 'top' | 'bottom' | 'left' | 'right' | 'center' }>({
    top: 0,
    left: 0,
    placement: 'bottom',
  });

  const step = TUTORIAL_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TUTORIAL_STEPS.length - 1;

  // Reset to first step whenever the tutorial is opened
  useEffect(() => {
    if (isTutorialOpen) {
      setCurrentStepIndex(0);
    }
  }, [isTutorialOpen]);

  // Measure and calculate position relative to viewport
  const updateTargetPosition = useCallback(() => {
    if (!step) return;

    const el = document.getElementById(step.targetId);
    if (!el) {
      // Fallback center of screen
      setTargetRect(null);
      setBalloonPos({
        top: window.innerHeight / 2 - 140,
        left: Math.max(16, window.innerWidth / 2 - 170),
        placement: 'center',
      });
      return;
    }

    const rect = el.getBoundingClientRect();
    const padding = step.highlightPadding ?? 8;

    const computedRect: ElementRect = {
      top: Math.max(0, rect.top - padding),
      left: Math.max(0, rect.left - padding),
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
      right: rect.right + padding,
      bottom: rect.bottom + padding,
    };

    setTargetRect(computedRect);

    // Calculate balloon placement
    const balloonWidth = Math.min(360, window.innerWidth - 32);
    const balloonHeight = 240;
    const margin = 14;

    let placement = step.preferredPosition || 'bottom';
    let top = 0;
    let left = 0;

    // Check viewport edges
    if (placement === 'bottom') {
      top = computedRect.bottom + margin;
      left = computedRect.left + computedRect.width / 2 - balloonWidth / 2;

      // If overflows bottom, flip to top
      if (top + balloonHeight > window.innerHeight) {
        placement = 'top';
        top = computedRect.top - balloonHeight - margin;
      }
    } else if (placement === 'right') {
      top = computedRect.top + computedRect.height / 2 - balloonHeight / 2;
      left = computedRect.right + margin;

      // If overflows right, flip to bottom or left
      if (left + balloonWidth > window.innerWidth) {
        placement = 'bottom';
        top = computedRect.bottom + margin;
        left = Math.max(16, computedRect.left);
      }
    } else if (placement === 'top') {
      top = computedRect.top - balloonHeight - margin;
      left = computedRect.left + computedRect.width / 2 - balloonWidth / 2;

      if (top < 10) {
        placement = 'bottom';
        top = computedRect.bottom + margin;
      }
    } else if (placement === 'left') {
      top = computedRect.top + computedRect.height / 2 - balloonHeight / 2;
      left = computedRect.left - balloonWidth - margin;

      if (left < 10) {
        placement = 'bottom';
        top = computedRect.bottom + margin;
        left = Math.max(16, computedRect.left);
      }
    }

    // Clamp horizontal position within viewport
    if (left < 16) left = 16;
    if (left + balloonWidth > window.innerWidth - 16) {
      left = window.innerWidth - balloonWidth - 16;
    }

    // Clamp vertical position within viewport
    if (top < 16) top = 16;
    if (top + balloonHeight > window.innerHeight - 16) {
      top = window.innerHeight - balloonHeight - 16;
    }

    setBalloonPos({ top, left, placement });
  }, [step]);

  // Update position on resize, scroll or step change
  useEffect(() => {
    if (!isTutorialOpen) return;

    // Scroll target element smoothly into view if needed
    const el = document.getElementById(step.targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }

    updateTargetPosition();

    const handleResizeOrScroll = () => {
      updateTargetPosition();
    };

    window.addEventListener('resize', handleResizeOrScroll);
    window.addEventListener('scroll', handleResizeOrScroll, true);

    const timeout = setTimeout(updateTargetPosition, 120);

    return () => {
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll, true);
      clearTimeout(timeout);
    };
  }, [isTutorialOpen, currentStepIndex, step, updateTargetPosition]);

  // Keyboard navigation (Arrow keys & Escape)
  useEffect(() => {
    if (!isTutorialOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeTutorial();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (!isLastStep) {
          setCurrentStepIndex((prev) => prev + 1);
        } else {
          closeTutorial();
        }
      } else if (e.key === 'ArrowLeft') {
        if (!isFirstStep) {
          setCurrentStepIndex((prev) => prev - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTutorialOpen, isFirstStep, isLastStep, closeTutorial]);

  if (!isTutorialOpen || !step || isSuperUser || currentUser?.role === 'superuser') return null;

  const handleNext = () => {
    if (isLastStep) {
      closeTutorial();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  return (
    <AnimatePresence>
      <div
        id="interactive-tutorial-portal"
        className="fixed inset-0 z-[99999] overflow-hidden pointer-events-auto select-none"
      >
        {/* SVG Spotlight Mask Cutout Overlay */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300 ease-out"
          style={{ width: '100vw', height: '100vh' }}
        >
          <defs>
            <mask id="tutorial-spotlight-mask">
              {/* White background covers everything */}
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {/* Black rounded rectangle cuts out the spotlight hole */}
              {targetRect && (
                <rect
                  x={targetRect.left}
                  y={targetRect.top}
                  width={targetRect.width}
                  height={targetRect.height}
                  rx="14"
                  ry="14"
                  fill="black"
                />
              )}
            </mask>
          </defs>

          {/* Semi-transparent dark mask with backdrop blur feel */}
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(15, 23, 42, 0.75)"
            mask="url(#tutorial-spotlight-mask)"
          />
        </svg>

        {/* Highlight Glowing Ring around target */}
        {targetRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: targetRect.top,
              left: targetRect.left,
              width: targetRect.width,
              height: targetRect.height,
              pointerEvents: 'none',
            }}
            className="rounded-2xl border-2 border-amber-400 ring-4 ring-amber-400/30 shadow-[0_0_25px_rgba(251,191,36,0.5)] animate-pulse"
          />
        )}

        {/* Interactive Speech Balloon / Tooltip Card */}
        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, y: balloonPos.placement === 'bottom' ? -10 : 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          style={{
            position: 'absolute',
            top: balloonPos.top,
            left: balloonPos.left,
            maxWidth: '360px',
            width: 'calc(100vw - 32px)',
          }}
          className="bg-white rounded-3xl shadow-2xl border-2 border-amber-400/80 p-5 z-50 text-slate-900 pointer-events-auto"
        >
          {/* Balloon Pointer Arrow */}
          {balloonPos.placement === 'bottom' && (
            <div className="absolute -top-2.5 left-8 w-5 h-5 bg-white border-t-2 border-l-2 border-amber-400 transform rotate-45" />
          )}
          {balloonPos.placement === 'top' && (
            <div className="absolute -bottom-2.5 left-8 w-5 h-5 bg-white border-b-2 border-r-2 border-amber-400 transform rotate-45" />
          )}
          {balloonPos.placement === 'right' && (
            <div className="absolute top-8 -left-2.5 w-5 h-5 bg-white border-b-2 border-l-2 border-amber-400 transform rotate-45" />
          )}
          {balloonPos.placement === 'left' && (
            <div className="absolute top-8 -right-2.5 w-5 h-5 bg-white border-t-2 border-r-2 border-amber-400 transform rotate-45" />
          )}

          {/* Balloon Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shadow-xs shrink-0">
                {step.icon || <HelpCircle className="w-5 h-5 text-amber-600" />}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900">
                    Paso {currentStepIndex + 1} de {TUTORIAL_STEPS.length}
                  </span>
                </div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight leading-tight mt-0.5">
                  {step.title}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                id="btn-skip-tutorial-header"
                onClick={skipTutorialPermanently}
                className="text-[10px] font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                title="Omitir permanentemente para siempre"
              >
                Omitir
              </button>
              <button
                type="button"
                id="btn-close-tutorial-x"
                onClick={closeTutorial}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Cerrar tutorial"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Balloon Body Description */}
          <p className="text-xs text-slate-600 leading-relaxed font-medium mb-3">
            {step.description}
          </p>

          {/* Helpful Tip Box */}
          {step.tip && (
            <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-start gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span className="leading-snug">{step.tip}</span>
            </div>
          )}

          {/* Progress Indicators & Navigation Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
            {/* Step Dots */}
            <div className="flex items-center gap-1">
              {TUTORIAL_STEPS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentStepIndex
                      ? 'w-5 bg-amber-500'
                      : idx < currentStepIndex
                      ? 'bg-amber-300'
                      : 'bg-slate-200 hover:bg-slate-300'
                  }`}
                  title={`Ir al paso ${idx + 1}`}
                />
              ))}
            </div>

            {/* Next / Back Buttons */}
            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <button
                  type="button"
                  id="btn-tutorial-prev"
                  onClick={handlePrev}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Anterior</span>
                </button>
              )}

              <button
                type="button"
                id="btn-tutorial-next"
                onClick={handleNext}
                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer ${
                  isLastStep
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                    : 'bg-slate-900 hover:bg-slate-950 text-amber-300 shadow-slate-900/30'
                }`}
              >
                <span>{isLastStep ? '¡Entendido, Empezar!' : 'Siguiente'}</span>
                {isLastStep ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Permanent Skip Footer Bar */}
          <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100/80">
            <button
              type="button"
              id="btn-skip-tutorial-permanently"
              onClick={skipTutorialPermanently}
              className="text-[11px] font-bold text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-rose-50"
              title="No volver a abrir este tutorial en futuros inicios de sesión"
            >
              <EyeOff className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600" />
              <span>Omitir tutorial permanentemente</span>
            </button>

            <span className="text-[10px] text-slate-400">
              Disponible en menú de usuario
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
