import React, { useState } from 'react';
import { DiagnosticImage, Pet } from '../../types';
import { useVeterinary } from '../../context/VeterinaryContext';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Sun,
  Download,
  Printer,
  FileText,
  Calendar,
  User,
  Stethoscope,
  Activity,
  Maximize2,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DiagnosticImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  study: DiagnosticImage | null;
  pet: Pet;
  onDelete?: (studyId: string) => void;
}

export const DiagnosticImageViewerModal: React.FC<DiagnosticImageViewerModalProps> = ({
  isOpen,
  onClose,
  study,
  pet,
  onDelete,
}) => {
  const { clinicSettings } = useVeterinary();
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isInverted, setIsInverted] = useState<boolean>(false);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);

  if (!isOpen || !study) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(3, prev + 0.25));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.5, prev - 0.25));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleToggleInvert = () => setIsInverted((prev) => !prev);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setIsInverted(false);
    setBrightness(100);
    setContrast(100);
  };

  const handlePrintStudy = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Informe de Imagenología - ${pet.name} - ${study.title}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 30px; color: #1e293b; line-height: 1.5; }
            .header { border-bottom: 2px solid #0f766e; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; }
            .clinic-name { font-size: 20px; font-weight: bold; color: #0f766e; }
            .badge { display: inline-block; padding: 4px 8px; background: #e6fffa; color: #047481; border-radius: 4px; font-weight: bold; font-size: 12px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; background: #f8fafc; padding: 15px; border-radius: 8px; font-size: 13px; }
            .study-box { margin-bottom: 20px; }
            .study-box h3 { font-size: 14px; text-transform: uppercase; color: #0f766e; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; margin-bottom: 8px; }
            .study-box p { font-size: 13px; margin: 0 0 10px 0; }
            .img-container { text-align: center; margin: 20px 0; }
            .img-container img { max-width: 100%; max-height: 400px; border-radius: 6px; border: 1px solid #cbd5e1; }
            .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 11px; text-align: center; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="clinic-name">${clinicSettings.name}</div>
              <div style="font-size: 12px; color: #64748b;">${clinicSettings.slogan}</div>
              <div style="font-size: 11px; color: #64748b;">${clinicSettings.address} • Tel: ${clinicSettings.phone}</div>
            </div>
            <div style="text-align: right;">
              <span class="badge">${study.type}</span>
              <div style="font-size: 12px; margin-top: 5px; color: #64748b;">Fecha: ${study.date}</div>
            </div>
          </div>

          <div class="info-grid">
            <div>
              <strong>Paciente:</strong> ${pet.name} (${pet.species} - ${pet.breed})<br/>
              <strong>Edad / Sexo:</strong> ${pet.ageDisplay} • ${pet.gender}<br/>
              <strong>Microchip:</strong> ${pet.microchipNumber || 'Sin microchip'}
            </div>
            <div>
              <strong>Tutor:</strong> ${pet.owner.name}<br/>
              <strong>Teléfono:</strong> ${pet.owner.phone}<br/>
              <strong>Médico / Radiólogo:</strong> ${study.veterinarianName}
            </div>
          </div>

          <div class="study-box">
            <h3>Estudio Realizado</h3>
            <p><strong>${study.title}</strong> (${study.region})</p>
          </div>

          <div class="study-box">
            <h3>Hallazgos Radiológicos / Ultrasonográficos</h3>
            <p>${study.findings || 'Sin hallazgos patológicos descritos.'}</p>
          </div>

          ${study.conclusion ? `
          <div class="study-box" style="background: #f0fdf4; padding: 12px; border-radius: 6px; border: 1px solid #bbf7d0;">
            <h3 style="color: #166534; border-bottom: none; margin-bottom: 4px;">Conclusión Diagnóstica</h3>
            <p style="color: #14532d; font-weight: bold;">${study.conclusion}</p>
          </div>
          ` : ''}

          <div class="img-container">
            <img src="${study.fileUrl}" alt="${study.title}" />
            <div style="font-size: 11px; color: #94a3b8; margin-top: 5px;">Archivo: ${study.fileName} (${study.fileFormat})</div>
          </div>

          <div class="footer">
            Responsable Sanitario: ${clinicSettings.directorName} • Cédula Profesional: ${clinicSettings.directorLicense}<br/>
            Documento emitido electrónicamente por ${clinicSettings.name || 'VetCare Pro'}.
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  const isVideo = study.fileFormat === 'MP4' || study.fileName.toLowerCase().endsWith('.mp4');
  const isPdf = study.fileFormat === 'PDF' || study.fileName.toLowerCase().endsWith('.pdf');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl max-w-6xl w-full max-h-[94vh] flex flex-col overflow-hidden text-white"
        >
          {/* Viewer Top Bar */}
          <div className="p-4 sm:p-5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center font-black shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-black text-white">{study.title}</h3>
                  <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 text-[10px] font-bold border border-teal-500/30 uppercase tracking-wider">
                    {study.type}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-bold border border-slate-700 font-mono">
                    {study.fileFormat} • {study.fileSize || 'Estudio'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Paciente: <strong className="text-slate-200">{pet.name}</strong> • Región: {study.region} • Fecha: {study.date}
                </p>
              </div>
            </div>

            {/* Viewer Controls */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {!isPdf && !isVideo && (
                <>
                  <button
                    onClick={handleZoomOut}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Reducir zoom (-)"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono text-slate-400 px-1 font-bold">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Aumentar zoom (+)"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleRotate}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Rotar 90°"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleToggleInvert}
                    className={`p-2 rounded-xl border transition-colors ${
                      isInverted
                        ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
                    }`}
                    title="Invertir Negativo (Modo Negatoscopio Radiológico)"
                  >
                    <Sun className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-2.5 py-1 text-xs rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  >
                    100%
                  </button>
                </>
              )}

              <button
                onClick={handlePrintStudy}
                className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                title="Imprimir informe clínico con membrete"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Informe</span>
              </button>

              <a
                href={study.fileUrl}
                download={study.fileName}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Descargar archivo original"
              >
                <Download className="w-4 h-4" />
              </a>

              {onDelete && (
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar el estudio "${study.title}" de ${pet.name}?`)) {
                      onDelete(study.id);
                      onClose();
                    }
                  }}
                  className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/50 transition-colors"
                  title="Eliminar este estudio"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors ml-1"
                title="Cerrar visor"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Viewer Main Stage + Sidebar Grid */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
            {/* Interactive Image / Media Canvas */}
            <div className="lg:col-span-2 bg-black/90 p-4 flex items-center justify-center overflow-auto min-h-[350px] relative border-b lg:border-b-0 lg:border-r border-slate-800">
              {isVideo ? (
                <video
                  src={study.fileUrl}
                  controls
                  autoPlay
                  loop
                  className="max-h-[68vh] max-w-full rounded-xl border border-slate-800"
                />
              ) : isPdf ? (
                <div className="text-center p-8 bg-slate-800/80 rounded-2xl border border-slate-700 max-w-md">
                  <FileText className="w-16 h-16 text-teal-400 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-white mb-1">{study.fileName}</h4>
                  <p className="text-xs text-slate-400 mb-4">Documento / Informe PDF Clínico</p>
                  <a
                    href={study.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2"
                  >
                    <Maximize2 className="w-4 h-4" /> Abrir PDF en pestaña nueva
                  </a>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full h-full min-h-[400px]">
                  <img
                    src={study.fileUrl}
                    alt={study.title}
                    referrerPolicy="no-referrer"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      filter: `${isInverted ? 'invert(100%) hue-rotate(180deg) contrast(120%)' : 'none'}`,
                      transition: 'transform 0.15s ease-out',
                    }}
                    className="max-h-[68vh] max-w-full object-contain rounded-lg shadow-2xl select-none"
                  />
                </div>
              )}

              {/* Format tag overlay */}
              <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs border border-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-mono text-slate-300 flex items-center gap-2">
                <span>{study.fileName}</span>
                <span className="text-teal-400">• Formato {study.fileFormat}</span>
              </div>
            </div>

            {/* Clinical Details & Findings Sidebar */}
            <div className="p-5 sm:p-6 bg-slate-900/95 overflow-y-auto space-y-5 text-xs">
              {/* Study Summary */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
                <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-teal-400" />
                  Datos del Estudio
                </h4>
                <div className="grid grid-cols-2 gap-3 text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Tipo de Estudio:</span>
                    <strong className="text-white text-xs">{study.type}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Región Anatómica:</span>
                    <strong className="text-white text-xs">{study.region}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Fecha Realización:</span>
                    <span className="text-slate-200">{study.date}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Médico / Radiólogo:</span>
                    <span className="text-slate-200">{study.veterinarianName}</span>
                  </div>
                </div>
              </div>

              {/* Clinical Findings */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-400" />
                  Hallazgos Imagenológicos
                </h4>
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {study.findings || 'No se registraron notas de hallazgos adicionales.'}
                </div>
              </div>

              {/* Diagnosis / Conclusion */}
              {study.conclusion && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Conclusión / Diagnóstico Presuntivo
                  </h4>
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-200 font-semibold leading-relaxed">
                    {study.conclusion}
                  </div>
                </div>
              )}

              {/* Patient Badge */}
              <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-800 space-y-2 text-slate-400">
                <div className="flex items-center gap-3">
                  {pet.photoUrl ? (
                    <img
                      src={pet.photoUrl}
                      alt={pet.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-teal-800/60 text-white font-bold flex items-center justify-center">
                      {pet.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h5 className="font-bold text-white text-sm">{pet.name}</h5>
                    <p className="text-[11px] text-slate-400">
                      {pet.species} • {pet.breed} • {pet.weightKg} kg
                    </p>
                  </div>
                </div>
                <p className="text-[11px] pt-1 border-t border-slate-800">
                  Tutor: <strong className="text-slate-300">{pet.owner.name}</strong> ({pet.owner.phone})
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
