import React, { useState, useRef } from 'react';
import { Pet, DiagnosticImage, StudyType } from '../../types';
import { useVeterinary } from '../../context/VeterinaryContext';
import {
  Upload,
  FileImage,
  Film,
  FileText,
  Activity,
  Plus,
  Calendar,
  User,
  Stethoscope,
  Eye,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { DiagnosticImageViewerModal } from './DiagnosticImageViewerModal';

interface DiagnosticStudiesTabProps {
  pet: Pet;
}

const STUDY_TYPES: StudyType[] = [
  'Radiografía Digital',
  'Ultrasonido Abdominal',
  'Ecocardiograma',
  'Tomografía (TAC)',
  'Resonancia Magnética',
  'Endoscopía',
  'Foto Dermatológica',
  'Otro Estudio',
];

export const DiagnosticStudiesTab: React.FC<DiagnosticStudiesTabProps> = ({ pet }) => {
  const { addDiagnosticStudy, deleteDiagnosticStudy, showToast, clinicSettings } = useVeterinary();

  const [isUploading, setIsUploading] = useState(false);
  const [selectedStudyForViewer, setSelectedStudyForViewer] = useState<DiagnosticImage | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // New Study Form State
  const [studyType, setStudyType] = useState<StudyType>('Radiografía Digital');
  const [title, setTitle] = useState('');
  const [region, setRegion] = useState('Tórax');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [veterinarianName, setVeterinarianName] = useState(clinicSettings.directorName || 'Dra. Valeria Hernández M.');
  const [findings, setFindings] = useState('');
  const [conclusion, setConclusion] = useState('');

  // File Upload State
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileFormat, setFileFormat] = useState<'DCM' | 'DICOM' | 'JPG' | 'PNG' | 'WEBP' | 'PDF' | 'MP4' | 'OTRO'>('PNG');
  const [fileSize, setFileSize] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const studies = pet.diagnosticImages || [];

  const handleFileProcess = (file: File) => {
    const ext = file.name.split('.').pop()?.toUpperCase() || 'OTRO';
    let format: 'DCM' | 'DICOM' | 'JPG' | 'PNG' | 'WEBP' | 'PDF' | 'MP4' | 'OTRO' = 'OTRO';

    if (ext === 'DCM' || ext === 'DICOM') format = 'DCM';
    else if (ext === 'JPG' || ext === 'JPEG') format = 'JPG';
    else if (ext === 'PNG') format = 'PNG';
    else if (ext === 'WEBP') format = 'WEBP';
    else if (ext === 'PDF') format = 'PDF';
    else if (ext === 'MP4' || ext === 'MOV' || ext === 'AVI') format = 'MP4';

    setFileName(file.name);
    setFileFormat(format);
    setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);

    // Suggest title if empty
    if (!title) {
      if (format === 'DCM' || studyType.includes('Radiografía')) {
        setTitle(`Radiografía de ${region}`);
      } else if (studyType.includes('Ultrasonido')) {
        setTitle(`Ecografía de ${region}`);
      } else {
        setTitle(`Estudio ${studyType} - ${region}`);
      }
    }

    // Read File as Data URL (or fallback for DICOM/PDF)
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setFileUrl(result);
    };

    if (file.type.startsWith('image/') || file.type.startsWith('video/') || file.type === 'application/pdf') {
      reader.readAsDataURL(file);
    } else {
      // For .dcm or custom formats, use high-contrast radiograph visual placeholder or data URL
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // Sample medical image loader helper
  const handleLoadSampleStudy = (type: 'rx' | 'eco') => {
    if (type === 'rx') {
      setStudyType('Radiografía Digital');
      setTitle('Radiografía Lateral de Columna y Pelvis');
      setRegion('Columna y Pelvis');
      setFileName('estudio_columna_pelvis.dcm');
      setFileFormat('DCM');
      setFileSize('14.2 MB');
      setFileUrl('https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80');
      setFindings('Alineación vertebral lumbosacra conservada. Espacios intervertebrales L5-L6 y L6-L7 homogéneos. Sin osteofitos puenteantes.');
      setConclusion('Estudio radiológico sin evidencia de espondilosis deformante.');
    } else {
      setStudyType('Ultrasonido Abdominal');
      setTitle('Ultrasonido Abdominal y Exploración Esplénica');
      setRegion('Abdomen Superior');
      setFileName('eco_bazo_higado.png');
      setFileFormat('PNG');
      setFileSize('5.6 MB');
      setFileUrl('https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1200&q=80');
      setFindings('Parénquima esplénico homogéneo, bordes lisos y regulares. Eje vascular esplénico sin trombos ni dilataciones.');
      setConclusion('Ecografía esplénica y hepática normal.');
    }
  };

  const handleSaveStudy = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileUrl && !fileName) {
      showToast('Por favor selecciona o arrastra un archivo de imagen/estudio.', 'warning');
      return;
    }

    if (!title.trim()) {
      showToast('Por favor asigna un título o motivo al estudio.', 'warning');
      return;
    }

    addDiagnosticStudy(pet.id, {
      petId: pet.id,
      type: studyType,
      title: title.trim(),
      region: region.trim() || 'General',
      date,
      fileUrl: fileUrl || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
      fileName: fileName || `${title.toLowerCase().replace(/\s+/g, '_')}.${fileFormat.toLowerCase()}`,
      fileFormat,
      fileSize: fileSize || '3.5 MB',
      findings: findings.trim() || 'Estudio sin hallazgos patológicos relevantes.',
      conclusion: conclusion.trim() || undefined,
      veterinarianName,
    });

    // Reset Form
    setIsUploading(false);
    setFileUrl(null);
    setFileName('');
    setTitle('');
    setFindings('');
    setConclusion('');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-teal-50/80 border border-teal-200/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-teal-950">
                Estudios de Imagenología Médica
              </h3>
              <p className="text-xs text-teal-800">
                Radiografías (DICOM/Rayos X), Ultrasonidos, TAC, Ecocardiogramas y Estudios Clínicos
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsUploading(!isUploading)}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-xs cursor-pointer ${
            isUploading
              ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              : 'bg-teal-700 hover:bg-teal-800 text-white'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>{isUploading ? 'Ocultar Formulario' : 'Cargar Nuevo Estudio'}</span>
        </button>
      </div>

      {/* Upload & Form Drawer */}
      {isUploading && (
        <form onSubmit={handleSaveStudy} className="p-5 sm:p-6 rounded-3xl bg-slate-900 text-white border border-slate-700 shadow-xl space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-teal-400" />
              <h4 className="text-sm font-bold text-white">Cargar Imagen Radiológica / Ultrasonido</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Carga rápida de demostración:</span>
              <button
                type="button"
                onClick={() => handleLoadSampleStudy('rx')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-lg text-[10px] font-bold border border-slate-700"
              >
                + Rayos X Demo
              </button>
              <button
                type="button"
                onClick={() => handleLoadSampleStudy('eco')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-lg text-[10px] font-bold border border-slate-700"
              >
                + Ultrasonido Demo
              </button>
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Archivo del Estudio (Formatos: .dcm, .dicom, .jpg, .png, .webp, .pdf, .mp4) *
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-teal-400 bg-teal-950/40 text-teal-200'
                  : fileUrl
                  ? 'border-emerald-500/80 bg-emerald-950/20 text-emerald-300'
                  : 'border-slate-700 hover:border-teal-500 bg-slate-800/60 text-slate-400'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".dcm,.dicom,.jpg,.jpeg,.png,.webp,.pdf,.mp4,.mov"
                onChange={handleFileChange}
                className="hidden"
              />

              {fileUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  <div>
                    <p className="text-sm font-bold text-white">{fileName}</p>
                    <p className="text-xs text-emerald-300 font-mono">
                      Formato detectado: {fileFormat} • Tamaño: {fileSize}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 underline mt-1">Haz clic para cambiar archivo</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-white">
                    Arrastra aquí tu archivo o haz clic para examinar
                  </p>
                  <p className="text-xs text-slate-400 max-w-md">
                    Compatible con archivos DICOM médicos (.dcm, .dicom), imágenes de alta definición (.jpg, .png, .webp), reportes .pdf o videos de ecografía (.mp4).
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Tipo de Estudio *</label>
              <select
                value={studyType}
                onChange={(e) => setStudyType(e.target.value as StudyType)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-semibold focus:outline-none focus:border-teal-400"
              >
                {STUDY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Título del Estudio / Proyección *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Radiografía Tórax Lateral y VD"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Región Anatómica *</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="Ej. Tórax, Abdomen, Columna..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Fecha de Realización *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-300 mb-1">Médico / Especialista Radiólogo</label>
              <input
                type="text"
                value={veterinarianName}
                onChange={(e) => setVeterinarianName(e.target.value)}
                placeholder="Nombre del médico o centro de diagnóstico"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-400"
              />
            </div>
          </div>

          {/* Clinical Findings and Diagnosis */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Hallazgos Radiológicos / Ultrasonográficos *
              </label>
              <textarea
                rows={3}
                required
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
                placeholder="Describe las estructuras observadas, silueta de órganos, ecogenicidad, densidad ósea, simetría..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-400 mb-1">
                Conclusión Diagnóstica / Presunción Clínica
              </label>
              <input
                type="text"
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                placeholder="Ej. Compatible con displasia de cadera grado 1 / Sin alteraciones agudas"
                className="w-full px-3 py-2 bg-slate-800 border border-emerald-800/80 rounded-xl text-emerald-200 text-xs focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsUploading(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardar Estudio en Expediente</span>
            </button>
          </div>
        </form>
      )}

      {/* Studies Gallery & List */}
      {studies.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-50 border border-slate-200/80">
          <div className="w-14 h-14 rounded-2xl bg-teal-100/70 text-teal-700 mx-auto flex items-center justify-center mb-3">
            <FileImage className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-800 mb-1">
            No hay estudios de imagen registrados para {pet.name}
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
            Carga placas de rayos X, ultrasonidos abdominales o reportes de laboratorio en formatos DICOM (.dcm), JPG, PNG, PDF o video para mantener su expediente radiológico al día.
          </p>
          <button
            type="button"
            onClick={() => {
              setIsUploading(true);
              handleLoadSampleStudy('rx');
            }}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Cargar Primer Estudio de Imagen</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {studies.map((study) => {
            const isDicom = study.fileFormat === 'DCM' || study.fileName.toLowerCase().endsWith('.dcm');
            const isVideo = study.fileFormat === 'MP4';
            const isPdf = study.fileFormat === 'PDF';

            return (
              <div
                key={study.id}
                className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
              >
                <div>
                  {/* Thumbnail / Image Preview Container */}
                  <div
                    onClick={() => setSelectedStudyForViewer(study)}
                    className="h-44 w-full rounded-2xl bg-slate-950 overflow-hidden relative cursor-pointer border border-slate-800 group-hover:border-teal-600 transition-colors flex items-center justify-center"
                  >
                    {isVideo ? (
                      <div className="text-center text-white">
                        <Film className="w-10 h-10 text-teal-400 mx-auto mb-1" />
                        <span className="text-[11px] font-bold">Video de Ecografía / Cine-loop</span>
                      </div>
                    ) : isPdf ? (
                      <div className="text-center text-white p-4">
                        <FileText className="w-10 h-10 text-teal-400 mx-auto mb-1" />
                        <span className="text-xs font-bold block">{study.fileName}</span>
                        <span className="text-[10px] text-slate-400">Documento PDF</span>
                      </div>
                    ) : (
                      <img
                        src={study.fileUrl}
                        alt={study.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}

                    {/* Format and Type Badges */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-black border border-white/20 font-mono uppercase">
                        {study.fileFormat}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-teal-600/90 backdrop-blur-xs text-white text-[10px] font-bold">
                        {study.region}
                      </span>
                    </div>

                    {/* View overlay trigger */}
                    <div className="absolute inset-0 bg-teal-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white">
                      <div className="px-3 py-1.5 rounded-xl bg-teal-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg">
                        <Eye className="w-4 h-4" />
                        <span>Abrir en Visor Médico</span>
                      </div>
                    </div>
                  </div>

                  {/* Study Info */}
                  <div className="mt-3">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {study.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium mt-1">
                      <span>{study.type}</span>
                      <span>•</span>
                      <span>{study.date}</span>
                      <span>•</span>
                      <span>{study.veterinarianName}</span>
                    </div>

                    {/* Findings snippet */}
                    <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {study.findings}
                    </p>

                    {study.conclusion && (
                      <p className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200 mt-2">
                        Diagnóstico: {study.conclusion}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {study.fileName} {study.fileSize ? `(${study.fileSize})` : ''}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedStudyForViewer(study)}
                      className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-xl text-xs transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver Estudio</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`¿Eliminar el estudio "${study.title}" de ${pet.name}?`)) {
                          deleteDiagnosticStudy(pet.id, study.id);
                        }
                      }}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Eliminar estudio"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox / DICOM Viewer Modal */}
      {selectedStudyForViewer && (
        <DiagnosticImageViewerModal
          isOpen={Boolean(selectedStudyForViewer)}
          onClose={() => setSelectedStudyForViewer(null)}
          study={selectedStudyForViewer}
          pet={pet}
          onDelete={(studyId) => {
            deleteDiagnosticStudy(pet.id, studyId);
            setSelectedStudyForViewer(null);
          }}
        />
      )}
    </div>
  );
};
