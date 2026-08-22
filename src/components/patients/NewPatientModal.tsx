import React, { useState, useRef } from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import { SpeciesType, GenderType, DiagnosticImage, StudyType } from '../../types';
import { X, PawPrint, User, Phone, Mail, MapPin, ShieldAlert, Sparkles, Activity, Upload, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({ isOpen, onClose }) => {
  const { addPet } = useVeterinary();

  // Pet State
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<SpeciesType>('Perro');
  const [breed, setBreed] = useState('');
  const [birthDate, setBirthDate] = useState('2024-01-01');
  const [gender, setGender] = useState<GenderType>('Macho');
  const [isNeutered, setIsNeutered] = useState(true);
  const [weightKg, setWeightKg] = useState<number>(10.0);
  const [microchipNumber, setMicrochipNumber] = useState('');
  const [color, setColor] = useState('');
  const [allergiesInput, setAllergiesInput] = useState('');
  const [chronicConditionsInput, setChronicConditionsInput] = useState('');
  const [notes, setNotes] = useState('');

  // Diagnostic Image (Optional initial upload)
  const [includeInitialStudy, setIncludeInitialStudy] = useState(false);
  const [studyType, setStudyType] = useState<StudyType>('Radiografía Digital');
  const [studyTitle, setStudyTitle] = useState('');
  const [studyRegion, setStudyRegion] = useState('Tórax');
  const [studyFileUrl, setStudyFileUrl] = useState<string | null>(null);
  const [studyFileName, setStudyFileName] = useState('');
  const [studyFormat, setStudyFormat] = useState<'DCM' | 'DICOM' | 'JPG' | 'PNG' | 'WEBP' | 'PDF' | 'MP4' | 'OTRO'>('PNG');
  const [studyFindings, setStudyFindings] = useState('');
  const studyFileRef = useRef<HTMLInputElement | null>(null);

  // Owner State
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [ownerDoc, setOwnerDoc] = useState('');

  if (!isOpen) return null;

  const handleStudyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const ext = file.name.split('.').pop()?.toUpperCase() || 'PNG';
      let format: 'DCM' | 'DICOM' | 'JPG' | 'PNG' | 'WEBP' | 'PDF' | 'MP4' | 'OTRO' = 'PNG';
      if (ext === 'DCM' || ext === 'DICOM') format = 'DCM';
      else if (ext === 'JPG' || ext === 'JPEG') format = 'JPG';
      else if (ext === 'PDF') format = 'PDF';
      else if (ext === 'MP4') format = 'MP4';
      else if (ext === 'WEBP') format = 'WEBP';

      setStudyFileName(file.name);
      setStudyFormat(format);
      if (!studyTitle) setStudyTitle(`Estudio Inicial - ${studyRegion}`);

      const reader = new FileReader();
      reader.onload = (ev) => {
        setStudyFileUrl(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !ownerName.trim() || !ownerPhone.trim()) {
      alert('Por favor llena los campos requeridos (*).');
      return;
    }

    const allergies = allergiesInput
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    const chronicConditions = chronicConditionsInput
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    // Calculate approx age display
    const bDate = new Date(birthDate);
    const now = new Date('2026-08-14');
    let years = now.getFullYear() - bDate.getFullYear();
    let months = now.getMonth() - bDate.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    const ageDisplay = `${years > 0 ? `${years} año${years > 1 ? 's' : ''}` : ''}${
      months > 0 ? ` ${months} mes${months > 1 ? 'es' : ''}` : ''
    }`.trim() || 'Cachorro / Meses';

    // Default sample image according to species
    let samplePhoto = 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80';
    if (species === 'Gato') {
      samplePhoto = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80';
    } else if (species === 'Conejo') {
      samplePhoto = 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=400&q=80';
    }

    const diagnosticImages: DiagnosticImage[] = [];
    if (includeInitialStudy && (studyFileUrl || studyTitle)) {
      diagnosticImages.push({
        id: `study-init-${Date.now()}`,
        petId: '',
        type: studyType,
        title: studyTitle || `Estudio Inicial de ${name}`,
        region: studyRegion,
        date: new Date().toISOString().split('T')[0],
        fileUrl: studyFileUrl || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
        fileName: studyFileName || 'radiografia_ingreso.dcm',
        fileFormat: studyFormat,
        fileSize: '4.5 MB',
        findings: studyFindings || 'Estudio de ingreso general sin anormalidades evidentes.',
        veterinarianName: 'Médico Veterinario de Ingreso',
        uploadedAt: new Date().toISOString().split('T')[0],
      });
    }

    addPet({
      name: name.trim(),
      species,
      breed: breed.trim() || 'Mestizo / Sin definir',
      birthDate,
      ageDisplay,
      gender,
      isNeutered,
      weightKg: Number(weightKg) || 1.0,
      microchipNumber: microchipNumber.trim() || undefined,
      photoUrl: samplePhoto,
      color: color.trim() || undefined,
      allergies,
      chronicConditions,
      notes: notes.trim() || undefined,
      diagnosticImages: diagnosticImages.length > 0 ? diagnosticImages : undefined,
      owner: {
        id: `owner-${Date.now()}`,
        name: ownerName.trim(),
        phone: ownerPhone.trim(),
        email: ownerEmail.trim() || 'contacto@tutor.com',
        address: ownerAddress.trim() || 'Ciudad de México',
        documentId: ownerDoc.trim() || 'DOC-REG-01',
      },
    });

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 border border-slate-100 my-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <PawPrint className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Registrar Nuevo Paciente</h2>
                <p className="text-xs text-slate-500">Ficha de identificación médica y tutor responsable</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Section 1: Datos de la Mascota */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
                <PawPrint className="w-4 h-4" />
                1. Información de la Mascota
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Bruno"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-700/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Especie *</label>
                  <select
                    value={species}
                    onChange={(e) => setSpecies(e.target.value as SpeciesType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white"
                  >
                    <option value="Perro">Perro</option>
                    <option value="Gato">Gato</option>
                    <option value="Conejo">Conejo</option>
                    <option value="Ave">Ave</option>
                    <option value="Reptil">Reptil</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Raza</label>
                  <input
                    type="text"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    placeholder="Ej. Labrador, Mestizo..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fecha Nacimiento</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sexo</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as GenderType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white"
                  >
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Peso (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Esterilizado</label>
                  <select
                    value={isNeutered ? 'si' : 'no'}
                    onChange={(e) => setIsNeutered(e.target.value === 'si')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white"
                  >
                    <option value="si">Sí (Castrado)</option>
                    <option value="no">No (Entero)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Número de Microchip (opcional)</label>
                  <input
                    type="text"
                    value={microchipNumber}
                    onChange={(e) => setMicrochipNumber(e.target.value)}
                    placeholder="Ej. 98514100..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Color / Manto</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Ej. Negro fuego, Blanco atigrado"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alergias Conocidas (separadas por coma)</label>
                  <input
                    type="text"
                    value={allergiesInput}
                    onChange={(e) => setAllergiesInput(e.target.value)}
                    placeholder="Ej. Pollo, Picadura de pulga..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Condiciones Crónicas (separadas por coma)</label>
                  <input
                    type="text"
                    value={chronicConditionsInput}
                    onChange={(e) => setChronicConditionsInput(e.target.value)}
                    placeholder="Ej. Displasia, Sensibilidad digestiva..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Datos del Tutor */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4" />
                2. Información del Tutor (Dueño)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Ej. Mariana López"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    placeholder="+52 55 1234 5678"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    placeholder="tutor@gmail.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dirección Residencial</label>
                  <input
                    type="text"
                    value={ownerAddress}
                    onChange={(e) => setOwnerAddress(e.target.value)}
                    placeholder="Calle, Colonia, Ciudad..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Estudios e Imágenes de Diagnóstico Inicial (Opcional) */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4" />
                  3. Estudio Radiológico / Ultrasonido Inicial (Opcional)
                </h3>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={includeInitialStudy}
                    onChange={(e) => setIncludeInitialStudy(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded-sm focus:ring-teal-500"
                  />
                  <span>Adjuntar estudio de ingreso</span>
                </label>
              </div>

              {includeInitialStudy && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tipo de Estudio</label>
                      <select
                        value={studyType}
                        onChange={(e) => setStudyType(e.target.value as StudyType)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                      >
                        <option value="Radiografía Digital">Radiografía Digital</option>
                        <option value="Ultrasonido Abdominal">Ultrasonido Abdominal</option>
                        <option value="Ecocardiograma">Ecocardiograma</option>
                        <option value="Tomografía (TAC)">Tomografía (TAC)</option>
                        <option value="Resonancia Magnética">Resonancia Magnética</option>
                        <option value="Foto Dermatológica">Foto Dermatológica</option>
                        <option value="Otro Estudio">Otro Estudio</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Título / Proyección</label>
                      <input
                        type="text"
                        value={studyTitle}
                        onChange={(e) => setStudyTitle(e.target.value)}
                        placeholder="Ej. Rx Tórax Lateral"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Región Anatómica</label>
                      <input
                        type="text"
                        value={studyRegion}
                        onChange={(e) => setStudyRegion(e.target.value)}
                        placeholder="Ej. Tórax, Abdomen..."
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Archivo (.dcm, .dicom, .jpg, .png, .webp, .pdf, .mp4)
                    </label>
                    <div
                      onClick={() => studyFileRef.current?.click()}
                      className="p-3 border border-dashed border-teal-300 bg-teal-50/50 rounded-xl text-center cursor-pointer hover:bg-teal-50 transition-colors"
                    >
                      <input
                        ref={studyFileRef}
                        type="file"
                        accept=".dcm,.dicom,.jpg,.jpeg,.png,.webp,.pdf,.mp4"
                        onChange={handleStudyFileChange}
                        className="hidden"
                      />
                      {studyFileUrl ? (
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-teal-900">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{studyFileName} ({studyFormat}) cargado correctamente</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-xs text-teal-800">
                          <Upload className="w-4 h-4" />
                          <span>Haz clic para seleccionar placa de Rayos X o Ultrasonido</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Hallazgos / Diagnóstico Breve</label>
                    <input
                      type="text"
                      value={studyFindings}
                      onChange={(e) => setStudyFindings(e.target.value)}
                      placeholder="Observaciones radiológicas principales..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="btn-save-new-patient"
                className="px-5 py-2.5 text-sm font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-colors"
              >
                Guardar y Crear Ficha
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
