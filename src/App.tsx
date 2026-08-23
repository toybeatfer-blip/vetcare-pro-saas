import React, { useState } from 'react';
import { VeterinaryProvider, useVeterinary } from './context/VeterinaryContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Toast } from './components/common/Toast';
import { VeterinaryDashboard } from './components/dashboard/VeterinaryDashboard';
import { AppointmentsManager } from './components/appointments/AppointmentsManager';
import { NewAppointmentModal } from './components/appointments/NewAppointmentModal';
import { PatientsManager } from './components/patients/PatientsManager';
import { NewPatientModal } from './components/patients/NewPatientModal';
import { PatientDetailModal } from './components/patients/PatientDetailModal';
import { MedicalRecordsManager } from './components/medical-records/MedicalRecordsManager';
import { NewConsultationModal } from './components/medical-records/NewConsultationModal';
import { PrintableMedicalSheet } from './components/medical-records/PrintableMedicalSheet';
import { VaccinesManager } from './components/vaccines/VaccinesManager';
import { ApplyVaccineModal } from './components/vaccines/ApplyVaccineModal';
import { VaccineReminderGeneratorModal } from './components/vaccines/VaccineReminderGeneratorModal';
import { InventoryManager } from './components/inventory/InventoryManager';
import { PetShopManager } from './components/petshop/PetShopManager';
import { VetCopilotModal } from './components/copilot/VetCopilotModal';
import { ClientHealthPortal } from './components/portal/ClientHealthPortal';
import { AndroidTutorApp } from './components/android/AndroidTutorApp';
import { AndroidPairingQrModal } from './components/android/AndroidPairingQrModal';
import { ClinicSettingsModal } from './components/settings/ClinicSettingsModal';
import { LoginPortalModal } from './components/auth/LoginPortalModal';
import { LicenseLockModal } from './components/license/LicenseLockModal';
import { LicenseManagementModal } from './components/license/LicenseManagementModal';
import { MasterTenantsManagement } from './components/admin/MasterTenantsManagement';
import { SuperUserMasterPanel } from './components/admin/SuperUserMasterPanel';
import { OfflineBarrierModal } from './components/common/OfflineBarrierModal';
import { NetworkDiagnosticsModal } from './components/common/NetworkDiagnosticsModal';
import { InteractiveTutorial } from './components/common/InteractiveTutorial';
import { SavingSessionModal } from './components/common/SavingSessionModal';
import { MedicalRecord, Pet, VaccineRecord } from './types';

const MainAppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    viewMode,
    toastMessage,
    hideToast,
    pets,
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    isPairingModalOpen,
    closePairingModal,
    pairingModalPetId,
    isLoginModalOpen,
    setIsLoginModalOpen,
    isAuthenticated,
    isLicenseLocked,
    isLicenseModalOpen,
    setIsLicenseModalOpen,
    isOnline,
    checkInternetNow,
    isNetworkDiagnosticsOpen,
    setIsNetworkDiagnosticsOpen,
    currentUser,
    isSuperUser,
    isSavingSessionOnLogout,
    saveProgressStep,
  } = useVeterinary();

  const [creatorViewMode, setCreatorViewMode] = useState<'master' | 'clinic'>('master');

  // Modals state
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [appointmentPetId, setAppointmentPetId] = useState<string | undefined>(undefined);

  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);

  const [isNewConsultationOpen, setIsNewConsultationOpen] = useState(false);
  const [consultationPetId, setConsultationPetId] = useState<string | undefined>(undefined);

  const [isApplyVaccineOpen, setIsApplyVaccineOpen] = useState(false);
  const [vaccinePetId, setVaccinePetId] = useState<string | undefined>(undefined);

  const [selectedPetDetailId, setSelectedPetDetailId] = useState<string | null>(null);

  const [reminderModalVaccine, setReminderModalVaccine] = useState<VaccineRecord | null>(null);
  const [reminderModalPet, setReminderModalPet] = useState<Pet | null>(null);

  const [printableRecord, setPrintableRecord] = useState<MedicalRecord | null>(null);
  const [printablePet, setPrintablePet] = useState<Pet | null>(null);

  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // Handlers
  const handleOpenNewAppointment = (petId?: string) => {
    setAppointmentPetId(petId);
    setIsNewAppointmentOpen(true);
  };

  const handleOpenNewConsultation = (petId?: string) => {
    setConsultationPetId(petId);
    setIsNewConsultationOpen(true);
  };

  const handleOpenApplyVaccine = (petId?: string) => {
    setVaccinePetId(petId);
    setIsApplyVaccineOpen(true);
  };

  const handleSelectPet = (petId: string) => {
    setSelectedPetDetailId(petId);
  };

  const handlePrintRecord = (record: MedicalRecord, pet: Pet) => {
    setPrintableRecord(record);
    setPrintablePet(pet);
  };

  const handleOpenReminderModal = (vaccine: VaccineRecord, pet: Pet) => {
    setReminderModalVaccine(vaccine);
    setReminderModalPet(pet);
  };

  // DEDICATED MASTER SAAS CREATOR PORTAL VIEW FOR SUPER USER
  if ((currentUser?.role === 'superuser' || isSuperUser) && creatorViewMode === 'master') {
    return (
      <>
        <SuperUserMasterPanel onSwitchToClinicView={() => setCreatorViewMode('clinic')} />
        <LoginPortalModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        <OfflineBarrierModal isOpen={!isOnline} onRetry={checkInternetNow} />
        <NetworkDiagnosticsModal isOpen={isNetworkDiagnosticsOpen} onClose={() => setIsNetworkDiagnosticsOpen(false)} />
        {toastMessage && <Toast message={toastMessage.text} type={toastMessage.type} onClose={hideToast} />}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col font-sans text-[#1E293B] antialiased selection:bg-indigo-200">
      {/* Top Banner when Super User is in Clinic Inspection Mode */}
      {(currentUser?.role === 'superuser' || isSuperUser) && (
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between border-b border-purple-800 shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="text-amber-300 font-black">👑 Modo Inspección de Clínica (Super Usuario Master)</span>
            <span className="text-slate-400 hidden sm:inline">— Viendo interfaz como veterinario</span>
          </div>
          <button
            type="button"
            id="btn-return-to-master-panel"
            onClick={() => setCreatorViewMode('master')}
            className="px-3.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl transition-all cursor-pointer shadow-md text-xs"
          >
            ← Volver al Panel Maestro del Creador
          </button>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        onOpenNewAppointment={() => handleOpenNewAppointment()}
        onOpenNewPatient={() => setIsNewPatientOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Only in Admin Clinic Mode) */}
        {viewMode === 'admin' && (
          <Sidebar />
        )}

        {/* Content Viewport */}
        <main className={`flex-1 overflow-y-auto ${viewMode === 'android' ? 'p-2 sm:p-4 bg-slate-900/90' : 'p-4 sm:p-6 lg:p-8 bg-slate-50'}`}>
          <div className="max-w-7xl mx-auto">
            {viewMode === 'android' ? (
              <AndroidTutorApp />
            ) : viewMode === 'tutor' || activeTab === 'portal' ? (
              <ClientHealthPortal onOpenNewAppointment={handleOpenNewAppointment} />
            ) : (
              <>
                {activeTab === 'dashboard' && (
                  <VeterinaryDashboard
                    onOpenNewAppointment={() => handleOpenNewAppointment()}
                    onOpenNewPatient={() => setIsNewPatientOpen(true)}
                    onOpenNewConsultation={(petId) => handleOpenNewConsultation(petId)}
                    onOpenApplyVaccine={(petId) => handleOpenApplyVaccine(petId)}
                    onSelectPet={handleSelectPet}
                    onOpenCopilot={() => setIsCopilotOpen(true)}
                  />
                )}

                {activeTab === 'appointments' && (
                  <AppointmentsManager
                    onOpenNewAppointment={() => handleOpenNewAppointment()}
                    onOpenNewConsultation={(petId) => handleOpenNewConsultation(petId)}
                    onSelectPet={handleSelectPet}
                  />
                )}

                {activeTab === 'patients' && (
                  <PatientsManager
                    onOpenNewPatient={() => setIsNewPatientOpen(true)}
                    onSelectPet={handleSelectPet}
                    onOpenNewAppointment={(petId) => handleOpenNewAppointment(petId)}
                    onOpenNewConsultation={(petId) => handleOpenNewConsultation(petId)}
                  />
                )}

                {activeTab === 'records' && (
                  <MedicalRecordsManager
                    onOpenNewConsultation={(petId) => handleOpenNewConsultation(petId)}
                    onSelectPet={handleSelectPet}
                    onPrintRecord={handlePrintRecord}
                  />
                )}

                {activeTab === 'vaccines' && (
                  <VaccinesManager
                    onOpenApplyVaccine={(petId) => handleOpenApplyVaccine(petId)}
                    onOpenReminderModal={handleOpenReminderModal}
                    onSelectPet={handleSelectPet}
                  />
                )}

                {activeTab === 'inventory' && <InventoryManager />}

                {activeTab === 'petshop' && <PetShopManager />}

                {activeTab === 'master_tenants' && <MasterTenantsManagement />}

                {activeTab === 'copilot' && (
                  <div className="space-y-4">
                    <InventoryManager />
                    {/* Auto open copilot modal */}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <NewAppointmentModal
        isOpen={isNewAppointmentOpen}
        onClose={() => setIsNewAppointmentOpen(false)}
        initialPetId={appointmentPetId}
      />

      <NewPatientModal
        isOpen={isNewPatientOpen}
        onClose={() => setIsNewPatientOpen(false)}
      />

      <NewConsultationModal
        isOpen={isNewConsultationOpen}
        onClose={() => setIsNewConsultationOpen(false)}
        initialPetId={consultationPetId}
        onPrintAfterSave={(record) => {
          const pet = pets.find((p) => p.id === record.petId);
          if (pet) {
            handlePrintRecord(record, pet);
          }
        }}
      />

      <ApplyVaccineModal
        isOpen={isApplyVaccineOpen}
        onClose={() => setIsApplyVaccineOpen(false)}
        initialPetId={vaccinePetId}
      />

      <PatientDetailModal
        isOpen={!!selectedPetDetailId}
        petId={selectedPetDetailId}
        onClose={() => setSelectedPetDetailId(null)}
        onOpenNewConsultation={(petId) => {
          setSelectedPetDetailId(null);
          handleOpenNewConsultation(petId);
        }}
        onOpenApplyVaccine={(petId) => {
          setSelectedPetDetailId(null);
          handleOpenApplyVaccine(petId);
        }}
        onPrintRecord={handlePrintRecord}
      />

      <VaccineReminderGeneratorModal
        isOpen={!!reminderModalVaccine}
        vaccine={reminderModalVaccine}
        pet={reminderModalPet}
        onClose={() => {
          setReminderModalVaccine(null);
          setReminderModalPet(null);
        }}
      />

      <PrintableMedicalSheet
        isOpen={!!printableRecord}
        record={printableRecord}
        pet={printablePet}
        onClose={() => {
          setPrintableRecord(null);
          setPrintablePet(null);
        }}
      />

      <VetCopilotModal
        isOpen={isCopilotOpen || activeTab === 'copilot'}
        onClose={() => {
          setIsCopilotOpen(false);
          if (activeTab === 'copilot') {
            setActiveTab('dashboard');
          }
        }}
      />

      {/* Global Android App QR Pairing Modal */}
      <AndroidPairingQrModal
        isOpen={isPairingModalOpen}
        onClose={closePairingModal}
        initialPetId={pairingModalPetId}
      />

      {/* Global Business & Clinic Settings Modal */}
      <ClinicSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* User Login & Authentication Portal Modal */}
      <LoginPortalModal
        isOpen={isLoginModalOpen || !isAuthenticated}
        onClose={() => setIsLoginModalOpen(false)}
        canClose={isAuthenticated}
      />

      {/* Global License Management Modal */}
      <LicenseManagementModal
        isOpen={isLicenseModalOpen}
        onClose={() => setIsLicenseModalOpen(false)}
      />

      {/* Full Blocking Screen for Monthly / Annual Rental License Lock (Only for authenticated clinic users) */}
      <LicenseLockModal isOpen={isLicenseLocked && !!currentUser && currentUser.role !== 'superuser'} />

      {/* Full Blocking Screen for Offline Enforcement */}
      <OfflineBarrierModal
        isOpen={!isOnline}
        onRetry={checkInternetNow}
      />

      {/* Network & Time Diagnostics Modal */}
      <NetworkDiagnosticsModal
        isOpen={isNetworkDiagnosticsOpen}
        onClose={() => setIsNetworkDiagnosticsOpen(false)}
      />

      {/* Interactive Onboarding Tutorial with Balloon Tooltips */}
      <InteractiveTutorial />

      {/* Visual Feedback Modal for Database Persistence on User Logout */}
      <SavingSessionModal
        isOpen={isSavingSessionOnLogout}
        stepMessage={saveProgressStep}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage.text}
          type={toastMessage.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <VeterinaryProvider>
      <MainAppContent />
    </VeterinaryProvider>
  );
}
