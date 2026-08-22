import React, { useState } from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import {
  FileText,
  Plus,
  Search,
  Printer,
  PawPrint,
  Calendar,
  Activity,
  Pill,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { MedicalRecord, Pet } from '../../types';

interface MedicalRecordsManagerProps {
  onOpenNewConsultation: (petId?: string) => void;
  onSelectPet: (petId: string) => void;
  onPrintRecord: (record: MedicalRecord, pet: Pet) => void;
}

export const MedicalRecordsManager: React.FC<MedicalRecordsManagerProps> = ({
  onOpenNewConsultation,
  onSelectPet,
  onPrintRecord,
}) => {
  const { medicalRecords, pets, searchQuery } = useVeterinary();
  const [selectedPetFilter, setSelectedPetFilter] = useState<string>('all');

  const filteredRecords = medicalRecords.filter((record) => {
    const pet = pets.find((p) => p.id === record.petId);

    // Search query matching
    const matchSearch =
      searchQuery === '' ||
      record.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pet && pet.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (pet && pet.owner.name.toLowerCase().includes(searchQuery.toLowerCase()));

    // Filter by pet
    const matchPet = selectedPetFilter === 'all' || record.petId === selectedPetFilter;

    return matchSearch && matchPet;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Historiales Clínicos & Consultas
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Registro cronológico de anamnesis, constantes fisiológicas, diagnósticos y recetas.
          </p>
        </div>

        <button
          id="btn-new-consultation"
          onClick={() => onOpenNewConsultation()}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors flex items-center gap-2 self-start md:self-auto text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nueva Consulta Médica</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 shrink-0">
          <Filter className="w-3.5 h-3.5 text-indigo-600" /> Filtrar por Paciente:
        </span>
        <select
          value={selectedPetFilter}
          onChange={(e) => setSelectedPetFilter(e.target.value)}
          className="px-3.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-700 max-w-xs"
        >
          <option value="all">Todos los Pacientes ({medicalRecords.length} registros)</option>
          {pets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.species} • Tutor: {p.owner.name.split(' ')[0]})
            </option>
          ))}
        </select>
      </div>

      {/* Records Timeline List */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-500 shadow-sm">
          <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No se encontraron historiales</h3>
          <p className="text-xs text-slate-500 mt-1">Registra la primera atención médica para este paciente.</p>
          <button
            onClick={() => onOpenNewConsultation()}
            className="mt-4 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 shadow-sm"
          >
            + Nueva Consulta
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record) => {
            const pet = pets.find((p) => p.id === record.petId);

            return (
              <div
                key={record.id}
                className="bg-white rounded-3xl border border-slate-100 hover:border-indigo-200 shadow-sm transition-all p-6 space-y-4"
              >
                {/* Record Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                  <div className="flex items-center gap-3.5">
                    {pet?.photoUrl ? (
                      <img
                        src={pet.photoUrl}
                        alt={pet.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-sm shrink-0">
                        {pet?.name.slice(0, 2).toUpperCase() || 'PA'}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (pet) onSelectPet(pet.id);
                          }}
                          className="font-bold text-base text-slate-900 hover:text-indigo-600 transition-colors"
                        >
                          {pet?.name || 'Paciente'}
                        </button>
                        <span className="text-xs text-slate-400 font-medium">({pet?.species} • {pet?.breed})</span>
                        <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[11px] font-bold rounded-md border border-indigo-100">
                          {record.reason}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Tutor: {pet?.owner.name} • Atendido por: <strong className="text-slate-700">{record.veterinarianName}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-xs font-semibold text-slate-400">
                      {record.date} ({record.time} hrs)
                    </span>
                    {pet && (
                      <button
                        onClick={() => onPrintRecord(record, pet)}
                        className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-slate-200"
                        title="Imprimir receta y ficha médica"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-400" />
                        <span>Imprimir</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Vital Signs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 bg-slate-50 rounded-2xl text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Temperatura</span>
                    <strong className="text-slate-800 text-xs font-bold">{record.vitalSigns.temperatureC} °C</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Frec. Cardíaca</span>
                    <strong className="text-slate-800 text-xs font-bold">{record.vitalSigns.heartRateBpm} lpm</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Frec. Resp.</span>
                    <strong className="text-slate-800 text-xs font-bold">{record.vitalSigns.respRateBpm} rpm</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Peso Actual</span>
                    <strong className="text-slate-800 text-xs font-bold">{record.vitalSigns.weightKg} kg</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Cond. Corporal</span>
                    <strong className="text-slate-800 text-xs font-bold">{record.vitalSigns.bodyConditionScore}/5 (Ideal)</strong>
                  </div>
                </div>

                {/* Anamnesis & Diagnosis */}
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="font-bold text-slate-800 block mb-0.5">Anamnesis / Síntomas:</span>
                    <p className="text-slate-600">{record.anamnesis}</p>
                  </div>

                  <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100">
                    <span className="font-bold text-indigo-950 block mb-0.5">Diagnóstico Definitivo:</span>
                    <p className="text-indigo-900 font-bold">{record.diagnosis}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="font-bold text-slate-800 block mb-0.5">Plan Terapéutico:</span>
                    <p className="text-slate-600">{record.treatmentPlan}</p>
                  </div>
                </div>

                {/* Prescriptions (if any) */}
                {record.prescriptions.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-indigo-600" />
                      Fármacos Prescritos ({record.prescriptions.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {record.prescriptions.map((rx) => (
                        <div
                          key={rx.id}
                          className="p-3 bg-white border border-slate-200 rounded-2xl text-xs flex items-center justify-between"
                        >
                          <div>
                            <strong className="text-slate-900 font-bold">{rx.medication}</strong>
                            <p className="text-slate-500 text-[11px]">
                              {rx.dose} • {rx.frequency} ({rx.duration})
                            </p>
                          </div>
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                            Activo
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
