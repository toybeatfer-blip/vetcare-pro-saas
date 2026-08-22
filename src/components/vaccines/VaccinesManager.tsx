import React, { useState } from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import { VaccineRecord, Pet } from '../../types';
import {
  Syringe,
  Plus,
  Search,
  Filter,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone,
  Calendar,
  User,
} from 'lucide-react';

interface VaccinesManagerProps {
  onOpenApplyVaccine: (petId?: string) => void;
  onOpenReminderModal: (vaccine: VaccineRecord, pet: Pet) => void;
  onSelectPet: (petId: string) => void;
}

export const VaccinesManager: React.FC<VaccinesManagerProps> = ({
  onOpenApplyVaccine,
  onOpenReminderModal,
  onSelectPet,
}) => {
  const { vaccines, pets, searchQuery, sendVaccineReminder } = useVeterinary();
  const [statusFilter, setStatusFilter] = useState<'all' | 'vencida' | 'proxima' | 'vigente'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredVaccines = vaccines.filter((vac) => {
    const pet = pets.find((p) => p.id === vac.petId);

    // Search
    const matchSearch =
      searchQuery === '' ||
      vac.vaccineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pet && pet.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (pet && pet.owner.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (pet && pet.owner.phone.includes(searchQuery));

    // Status
    const matchStatus = statusFilter === 'all' || vac.status === statusFilter;

    // Type
    const matchType = typeFilter === 'all' || vac.type === typeFilter;

    return matchSearch && matchStatus && matchType;
  });

  const overdueCount = vaccines.filter((v) => v.status === 'vencida').length;
  const upcomingCount = vaccines.filter((v) => v.status === 'proxima').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Control de Vacunación & Inmunizaciones
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Calendario de biológicos, alertas de vencimiento y envío automatizado de recordatorios.
          </p>
        </div>

        <button
          id="btn-apply-vaccine"
          onClick={() => onOpenApplyVaccine()}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors flex items-center gap-2 self-start md:self-auto text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Registrar Inmunización</span>
        </button>
      </div>

      {/* Summary Bento KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div
          onClick={() => setStatusFilter('vencida')}
          className={`p-6 rounded-3xl border transition-all cursor-pointer shadow-sm ${
            statusFilter === 'vencida'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20'
              : 'bg-white border-slate-100 hover:border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Vacunas Vencidas</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs shadow-rose-200">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-rose-900 mt-3">{overdueCount}</p>
          <p className="text-xs text-rose-600 font-medium mt-1">Requieren contacto urgente con tutor</p>
        </div>

        <div
          onClick={() => setStatusFilter('proxima')}
          className={`p-6 rounded-3xl border transition-all cursor-pointer shadow-sm ${
            statusFilter === 'proxima'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20'
              : 'bg-white border-slate-100 hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Próximos Refuerzos</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shadow-amber-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-900 mt-3">{upcomingCount}</p>
          <p className="text-xs text-amber-600 font-medium mt-1">Vencen en los próximos 15 días</p>
        </div>

        <div
          onClick={() => setStatusFilter('vigente')}
          className={`p-6 rounded-3xl border transition-all cursor-pointer shadow-sm ${
            statusFilter === 'vigente'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-100 hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Vigentes / Al Día</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs shadow-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-900 mt-3">
            {vaccines.filter((v) => v.status === 'vigente').length}
          </p>
          <p className="text-xs text-emerald-600 font-medium mt-1">Pacientes con protección activa</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              statusFilter === 'all' ? 'bg-white text-indigo-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas ({vaccines.length})
          </button>
          <button
            onClick={() => setStatusFilter('vencida')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              statusFilter === 'vencida' ? 'bg-rose-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Vencidas ({overdueCount})
          </button>
          <button
            onClick={() => setStatusFilter('proxima')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              statusFilter === 'proxima' ? 'bg-amber-500 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Próximas ({upcomingCount})
          </button>
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3.5 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
        >
          <option value="all">Todos los Biológicos</option>
          <option value="vacuna">Vacunas</option>
          <option value="desparasitante_interno">Desparasitantes Internos</option>
          <option value="desparasitante_externo">Desparasitantes Externos</option>
        </select>
      </div>

      {/* Vaccines Bento List */}
      {filteredVaccines.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-500 shadow-sm">
          <Syringe className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No hay registros con este filtro</h3>
          <p className="text-xs text-slate-500 mt-1">Registra una nueva inmunización o ajusta los criterios.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredVaccines.map((vac) => {
            const pet = pets.find((p) => p.id === vac.petId);
            const isOverdue = vac.status === 'vencida';
            const isUpcoming = vac.status === 'proxima';

            return (
              <div
                key={vac.id}
                className={`bg-white rounded-3xl border p-5 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isOverdue
                    ? 'border-rose-200 bg-rose-50/20'
                    : isUpcoming
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                {/* Left Info */}
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                      isOverdue
                        ? 'bg-rose-100 text-rose-700'
                        : isUpcoming
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-indigo-50 text-indigo-700'
                    }`}
                  >
                    <Syringe className="w-6 h-6" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-base text-slate-900">{vac.vaccineName}</strong>
                      <span className="text-xs text-slate-400 font-medium">({vac.type})</span>
                      {isOverdue && (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px] border border-rose-200">
                          Vencida
                        </span>
                      )}
                      {isUpcoming && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px] border border-amber-200">
                          Vence Pronto
                        </span>
                      )}
                      {!isOverdue && !isUpcoming && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                          Vigente
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                      <span>
                        Paciente:{' '}
                        <button
                          onClick={() => {
                            if (pet) onSelectPet(pet.id);
                          }}
                          className="font-bold text-indigo-600 hover:underline"
                        >
                          {pet?.name}
                        </button>{' '}
                        ({pet?.species})
                      </span>
                      <span>•</span>
                      <span>Tutor: {pet?.owner.name} ({pet?.owner.phone})</span>
                      <span>•</span>
                      <span>Lote: <strong className="font-mono text-slate-800">{vac.lotNumber}</strong></span>
                    </div>

                    <p className="text-xs text-slate-400 mt-1">
                      Aplicada el: <strong className="text-slate-700">{vac.applicationDate}</strong> • Próximo Refuerzo:{' '}
                      <strong className={isOverdue ? 'text-rose-700 font-bold' : 'text-indigo-900 font-bold'}>{vac.dueDate}</strong>
                    </p>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center justify-between md:justify-end gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {pet && (
                    <button
                      id={`btn-ai-reminder-${vac.id}`}
                      onClick={() => onOpenReminderModal(vac, pet)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-200" />
                      <span>Redactar Recordatorio IA</span>
                    </button>
                  )}

                  {pet && (
                    <button
                      onClick={() => sendVaccineReminder(pet.id, vac.id, 'WhatsApp')}
                      className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 transition-colors"
                    >
                      WhatsApp Rápido
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
