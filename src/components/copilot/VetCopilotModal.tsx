import React, { useState } from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import { askVetCopilot } from '../../services/geminiService';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Pill,
  Syringe,
  Stethoscope,
  HeartPulse,
  BookOpen,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VetCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  initialPetId?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  isFallback?: boolean;
}

export const VetCopilotModal: React.FC<VetCopilotModalProps> = ({
  isOpen,
  onClose,
  initialQuery,
  initialPetId,
}) => {
  const { pets, inventory, showToast } = useVeterinary();
  const [selectedPetId, setSelectedPetId] = useState<string>(initialPetId || '');
  const [inputQuery, setInputQuery] = useState(initialQuery || '');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `¡Hola! Soy **VetCopilot IA**, tu asistente clínico veterinario especializado.
      
Puedo apoyarte con:
• **Cálculo de Dosis & Posología** según peso y especie
• **Diagnósticos diferenciales** a partir de signos clínicos
• **Recomendaciones de fármacos** basados en el stock de tu farmacia
• **Esquemas de vacunación (WSAVA)** y protocolos preventivos
• **Instrucciones para tutores** en lenguaje claro

¿En qué paciente o caso clínico puedo ayudarte hoy?`,
      timestamp: 'Ahora',
    },
  ]);

  if (!isOpen) return null;

  const selectedPet = pets.find((p) => p.id === selectedPetId);

  const quickPrompts = [
    {
      icon: <Pill className="w-3.5 h-3.5 text-indigo-500" />,
      label: 'Calcular dosis analgésica',
      query: selectedPet
        ? `¿Cuál es la dosis y posología recomendada de Meloxicam y Tramadol para ${selectedPet.name} (${selectedPet.species}, ${selectedPet.breed}) con peso de ${selectedPet.weightKg} kg para dolor postoperatorio?`
        : '¿Cuál es la dosis recomendada de Meloxicam para un canino de 15 kg con dolor articular leve?',
    },
    {
      icon: <Syringe className="w-3.5 h-3.5 text-emerald-500" />,
      label: 'Protocolo de Vacunación',
      query: selectedPet
        ? `Recomienda el calendario de vacunación y desparasitación para ${selectedPet.name} (${selectedPet.species}, edad: ${selectedPet.age} ${selectedPet.ageUnit}).`
        : '¿Cuál es el protocolo de primovacunación canina según las directrices de la WSAVA?',
    },
    {
      icon: <Stethoscope className="w-3.5 h-3.5 text-amber-500" />,
      label: 'Diagnóstico diferencial',
      query: 'Canino macho de 6 años presenta vómitos agudos biliosos, letargia y dolor a la palpación epigástrica. ¿Cuáles son los diagnósticos diferenciales principales?',
    },
    {
      icon: <BookOpen className="w-3.5 h-3.5 text-purple-500" />,
      label: 'Fármacos en stock',
      query: `Tenemos en inventario: ${inventory.slice(0, 6).map((i) => `${i.name} (${i.quantity} disp)`).join(', ')}. ¿Cuáles están indicados para infección respiratoria en caninos?`,
    },
  ];

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await askVetCopilot(text, selectedPet, 'clinical');

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.result,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFallback: response.fallback,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      showToast('Error al consultar VetCopilot IA.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copiado al portapapeles.');
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-100 my-6 max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">VetCopilot Asistente IA Clínico</h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                    Gemini 2.5 Flash
                  </span>
                </div>
                <p className="text-xs text-indigo-200">
                  Soporte diagnóstico, cálculo de dosis y farmacología veterinaria
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Context Selector Bar */}
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shrink-0">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="font-bold text-slate-600 shrink-0">Contexto de Paciente:</span>
              <select
                value={selectedPetId}
                onChange={(e) => setSelectedPetId(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 text-xs focus:border-indigo-500 focus:outline-none"
              >
                <option value="">-- Consulta General / Sin Paciente Específico --</option>
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.species} • {p.breed} • {p.weightKg} kg)
                  </option>
                ))}
              </select>
            </div>

            {selectedPet && (
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="font-bold text-indigo-700">{selectedPet.name}:</span>
                <span>{selectedPet.weightKg} kg</span>
                <span>• {selectedPet.age} {selectedPet.ageUnit}</span>
                <span>• Tutor: {selectedPet.owner.name}</span>
              </div>
            )}
          </div>

          {/* Chat Messages Container */}
          <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50/50">
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  {isAi && (
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 relative group ${
                      isAi
                        ? 'bg-white text-slate-800 border border-slate-200/80 shadow-xs'
                        : 'bg-indigo-600 text-white shadow-xs'
                    }`}
                  >
                    <div className="whitespace-pre-line text-xs font-normal">
                      {msg.text}
                    </div>

                    <div
                      className={`flex items-center justify-between pt-1 border-t text-[10px] ${
                        isAi ? 'border-slate-100 text-slate-400' : 'border-indigo-500/40 text-indigo-200'
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {isAi && (
                        <button
                          onClick={() => handleCopy(msg.text, msg.id)}
                          className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600 font-bold">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {!isAi && (
                    <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-1 font-bold text-xs">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 items-center text-xs text-indigo-600 font-medium py-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3 bg-white rounded-2xl border border-slate-200 text-slate-600 text-xs shadow-xs">
                  Analizando caso clínico y farmacología con Gemini...
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-6 py-2.5 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto shrink-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
              Sugerencias:
            </span>
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(qp.query)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0"
              >
                {qp.icon}
                <span>{qp.label}</span>
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-4 bg-white border-t border-slate-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Escribe tu consulta clínica, síntomas, fármaco o cálculo de posología..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs rounded-2xl transition-colors flex items-center gap-1.5 shadow-sm shadow-indigo-200"
              >
                <Send className="w-4 h-4" />
                <span>Consultar</span>
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
