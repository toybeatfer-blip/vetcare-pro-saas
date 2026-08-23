import React, { useState } from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import {
  Users,
  Search,
  Plus,
  PawPrint,
  Phone,
  User,
  Calendar,
  Stethoscope,
  Syringe,
  AlertTriangle,
  ChevronRight,
  QrCode,
  Trash2,
} from 'lucide-react';
import { SpeciesType, Pet } from '../../types';
import { DeletePatientModal } from './DeletePatientModal';

interface PatientsManagerProps {
  onOpenNewPatient: () => void;
  onSelectPet: (petId: string) => void;
  onOpenNewAppointment: (petId?: string) => void;
  onOpenNewConsultation: (petId?: string) => void;
}

export const PatientsManager: React.FC<PatientsManagerProps> = ({
  onOpenNewPatient,
  onSelectPet,
  onOpenNewAppointment,
  onOpenNewConsultation,
}) => {
  const { pets, vaccines, medicalRecords, searchQuery, openPairingModal, currentUser } = useVeterinary();
  const [speciesFilter, setSpeciesFilter] = useState<string>('all');
  const [petToDelete, setPetToDelete] = useState<Pet | null>(null);

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superuser';

  const filteredPets = pets.filter((pet) => {
    // Search filter
    const matchSearch =
      searchQuery === '' ||
      pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.owner.phone.includes(searchQuery) ||
      (pet.microchipNumber && pet.microchipNumber.includes(searchQuery));

    // Species filter
    const matchSpecies = speciesFilter === 'all' || pet.species === speciesFilter;

    return matchSearch && matchSpecies;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Directorio de Pacientes & Fichas Clínicas
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Expedientes médicos, identificación de mascotas y tutores responsables.
          </p>
        </div>

        <button
          id="btn-register-patient"
          onClick={onOpenNewPatient}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors flex items-center gap-2 self-start md:self-auto text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Registrar Paciente</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-3 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setSpeciesFilter('all')}
            className={`px-4 py-2 rounded-xl transition-all ${
              speciesFilter === 'all' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Todos ({pets.length})
          </button>
          <button
            onClick={() => setSpeciesFilter('Perro')}
            className={`px-4 py-2 rounded-xl transition-all ${
              speciesFilter === 'Perro' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            🐶 Perros ({pets.filter((p) => p.species === 'Perro').length})
          </button>
          <button
            onClick={() => setSpeciesFilter('Gato')}
            className={`px-4 py-2 rounded-xl transition-all ${
              speciesFilter === 'Gato' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            🐱 Gatos ({pets.filter((p) => p.species === 'Gato').length})
          </button>
          <button
            onClick={() => setSpeciesFilter('Conejo')}
            className={`px-4 py-2 rounded-xl transition-all ${
              speciesFilter === 'Conejo' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            🐰 Conejos ({pets.filter((p) => p.species === 'Conejo').length})
          </button>
        </div>
      </div>

      {/* Patients Bento Grid */}
      {filteredPets.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-500 shadow-sm">
          <PawPrint className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No se encontraron pacientes</h3>
          <p className="text-xs text-slate-500 mt-1">Verifica los términos de búsqueda o registra una nueva mascota.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPets.map((pet) => {
            const petVaccines = vaccines.filter((v) => v.petId === pet.id);
            const hasOverdueVaccine = petVaccines.some((v) => v.status === 'vencida');
            const petRecords = medicalRecords.filter((r) => r.petId === pet.id);

            return (
              <div
                key={pet.id}
                className="bg-white rounded-3xl border border-slate-100 hover:border-indigo-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between gap-4 group relative overflow-hidden"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      {pet.photoUrl ? (
                        <img
                          src={pet.photoUrl}
                          alt={pet.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 font-black italic flex items-center justify-center text-xl shrink-0">
                          {pet.name.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3
                            onClick={() => onSelectPet(pet.id)}
                            className="font-bold text-base text-slate-900 group-hover:text-indigo-600 cursor-pointer transition-colors"
                          >
                            {pet.name}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                            {pet.species}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">{pet.breed}</p>
                      </div>
                    </div>

                    {hasOverdueVaccine && (
                      <span
                        className="p-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100"
                        title="Tiene vacunas vencidas"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  {/* Badges / Metrics */}
                  <div className="grid grid-cols-3 gap-2 my-4 p-3 bg-slate-50 rounded-2xl text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Edad</span>
                      <strong className="text-slate-900 text-xs truncate block font-extrabold">{pet.ageDisplay.split(' ')[0]} {pet.ageDisplay.split(' ')[1]}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Peso</span>
                      <strong className="text-slate-900 text-xs font-extrabold">{pet.weightKg} kg</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Consultas</span>
                      <strong className="text-slate-900 text-xs font-extrabold">{petRecords.length}</strong>
                    </div>
                  </div>

                  {/* Owner & Allergies Info */}
                  <div className="space-y-1.5 text-xs text-slate-500">
                    <p className="flex items-center gap-1.5 truncate">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Tutor: <strong className="text-slate-800 font-semibold">{pet.owner.name}</strong></span>
                    </p>
                    <p className="flex items-center gap-1.5 truncate">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Tel: {pet.owner.phone}</span>
                    </p>
                    {pet.allergies.length > 0 && (
                      <p className="text-[11px] text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg font-bold truncate border border-rose-100 mt-1">
                        ⚠️ Alergia: {pet.allergies[0]}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    id={`btn-view-pet-${pet.id}`}
                    onClick={() => onSelectPet(pet.id)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <span>Ver Expediente</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenNewAppointment(pet.id)}
                      className="p-2 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl transition-colors cursor-pointer"
                      title="Agendar Cita"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onOpenNewConsultation(pet.id)}
                      className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-colors cursor-pointer"
                      title="Atender Consulta"
                    >
                      <Stethoscope className="w-4 h-4" />
                    </button>

                    {/* Botón para eliminar paciente y tutor de la base de datos */}
                    <button
                      id={`btn-delete-pet-${pet.id}`}
                      onClick={() => setPetToDelete(pet)}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${
                        isAdmin
                          ? 'bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600'
                          : 'bg-slate-50 hover:bg-amber-50 text-slate-300 hover:text-amber-600'
                      }`}
                      title={
                        isAdmin
                          ? `Eliminar a ${pet.name} y su tutor de la base de datos (Admin)`
                          : `Eliminar paciente (Requiere rol de Administrador)`
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de confirmación para eliminar paciente y tutor */}
      <DeletePatientModal
        isOpen={Boolean(petToDelete)}
        pet={petToDelete}
        onClose={() => setPetToDelete(null)}
        onDeleted={() => setPetToDelete(null)}
      />
    </div>
  );
};
