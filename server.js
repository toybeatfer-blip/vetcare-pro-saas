import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let aiClient = null;
function getGeminiClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Helper to recursively find a file or folder up to 3 levels deep
function findFileOrDirRecursively(startDir, targetName, maxDepth = 3) {
  if (maxDepth <= 0) return null;
  try {
    const entries = fs.readdirSync(startDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      const fullPath = path.join(startDir, entry.name);
      if (entry.name === targetName) {
        return fullPath;
      }
      if (entry.isDirectory()) {
        const found = findFileOrDirRecursively(fullPath, targetName, maxDepth - 1);
        if (found) return found;
      }
    }
  } catch (e) {
    // ignore
  }
  return null;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Multi-tenant database storage directory
  const DATA_DIR = path.resolve(process.cwd(), "data");
  const CLINICS_DIR = path.join(DATA_DIR, "clinics");
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(CLINICS_DIR)) fs.mkdirSync(CLINICS_DIR, { recursive: true });

  const TENANTS_FILE = path.join(DATA_DIR, "tenants.json");
  const PAYMENTS_FILE = path.join(DATA_DIR, "payments.json");
  const DELETED_TENANTS_FILE = path.join(DATA_DIR, "deleted_tenants.json");
  const DEMO_TENANT_IDS = ['tenant-central-local', 'tenant-americas', 'tenant-1', 'tenant-2', 'tenant-sample-1'];

  // Helper to read/write JSON safely
  const readJson = (filePath, fallback = null) => {
    try {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
      }
    } catch (e) {
      console.error(`Error reading ${filePath}:`, e);
    }
    return fallback;
  };

  const writeJson = (filePath, data) => {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
      return true;
    } catch (e) {
      console.error(`Error writing ${filePath}:`, e);
      return false;
    }
  };

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // =========================================================================
  // UNIVERSAL DUAL-CHANNEL CLOUD SYNC & ANTI-DEFAULT SHIELD
  // =========================================================================
  const MASTER_CLOUD_STATE_FILE = path.join(DATA_DIR, "master_cloud_state.json");
  const DEFAULT_PHONES_BLACKLIST = [
    '+52 81 8300 0000', '81 8300 0000', '55 1234 5678', '+52 1 55 1234 5678', '+52 55 1234 5678', '1234 5678', '0000 0000'
  ];
  const DEFAULT_EMAILS_BLACKLIST = [
    'super.admin@vetcare.master.com', 'admin@vetcare.master.com', 'admin@clinica.com', 'licencias@imagis-pacs.cloud'
  ];

  const sanitizeBillingContact = (billing) => {
    const res = { ...(billing || {}) };
    const phone = String(res.supportPhone || '').trim();
    const email = String(res.ownerEmail || '').trim().toLowerCase();
    if (!phone || DEFAULT_PHONES_BLACKLIST.some(d => phone.includes(d))) {
      res.supportPhone = '+52 474 1539891';
    }
    if (!email || DEFAULT_EMAILS_BLACKLIST.some(d => email.includes(d))) {
      res.ownerEmail = 'toybeatfer@gmail.com';
    }
    return res;
  };

  const buildCurrentMasterState = () => {
    const rawMaster = readJson(MASTER_CLOUD_STATE_FILE, null);
    if (rawMaster && rawMaster.tenants) {
      rawMaster.masterBilling = sanitizeBillingContact(rawMaster.masterBilling);
      return rawMaster;
    }

    const tenants = readJson(TENANTS_FILE, []);
    const deletedTenants = readJson(DELETED_TENANTS_FILE, []);
    const paymentRequests = readJson(PAYMENTS_FILE, []);
    const masterBilling = sanitizeBillingContact(readJson(MASTER_BILLING_FILE, null));
    const superUserAccount = readJson(SUPERUSER_FILE, {
      username: "Fernando01",
      name: "Fernando (Super Admin Master)",
      isSuperUser: true,
      email: "toybeatfer@gmail.com",
    });

    const clinicsData = {};
    if (fs.existsSync(CLINICS_DIR)) {
      const files = fs.readdirSync(CLINICS_DIR);
      for (const f of files) {
        if (f.endsWith(".json")) {
          const cId = f.replace(".json", "");
          clinicsData[cId] = readJson(path.join(CLINICS_DIR, f), {});
        }
      }
    }

    const state = {
      tenants: Array.isArray(tenants) ? tenants : [],
      deletedTenants: Array.isArray(deletedTenants) ? deletedTenants : [],
      paymentRequests: Array.isArray(paymentRequests) ? paymentRequests : [],
      masterBilling,
      superUserAccount,
      clinicsData,
      lastUpdated: new Date().toISOString(),
    };
    writeJson(MASTER_CLOUD_STATE_FILE, state);
    return state;
  };

  app.get("/api/sync", (_req, res) => {
    const state = buildCurrentMasterState();
    res.json({ success: true, state, timestamp: new Date().toISOString() });
  });

  app.post("/api/sync", (req, res) => {
    try {
      const incomingState = req.body.state || req.body;
      if (!incomingState || typeof incomingState !== 'object') {
        return res.status(400).json({ success: false, error: "Invalid sync state payload" });
      }

      const currentState = buildCurrentMasterState();
      
      const deletedSet = new Set([...(currentState.deletedTenants || []), ...(incomingState.deletedTenants || [])]);
      const tenantMap = new Map();
      (currentState.tenants || []).forEach(t => { if (t && t.id) tenantMap.set(t.id, t); });
      (incomingState.tenants || []).forEach(t => {
        if (t && t.id) {
          const prev = tenantMap.get(t.id);
          if (!prev) {
            tenantMap.set(t.id, t);
          } else {
            const pTime = new Date(prev.updatedAt || prev.createdAt || 0).getTime();
            const nTime = new Date(t.updatedAt || t.createdAt || 0).getTime();
            tenantMap.set(t.id, nTime >= pTime ? { ...prev, ...t } : { ...t, ...prev });
          }
        }
      });
      const mergedTenants = Array.from(tenantMap.values()).filter(t => !deletedSet.has(t.id));

      const payMap = new Map();
      (currentState.paymentRequests || []).forEach(p => { if (p && p.id) payMap.set(p.id, p); });
      (incomingState.paymentRequests || []).forEach(p => {
        if (p && p.id) {
          const prev = payMap.get(p.id);
          payMap.set(p.id, prev ? { ...prev, ...p } : p);
        }
      });
      const mergedPayments = Array.from(payMap.values());

      const mergedBilling = sanitizeBillingContact({
        ...(currentState.masterBilling || {}),
        ...(incomingState.masterBilling || {})
      });
      const mergedSuperUser = {
        ...(currentState.superUserAccount || {}),
        ...(incomingState.superUserAccount || {}),
        name: "Fernando (Super Admin Master)",
        email: "toybeatfer@gmail.com",
      };

      const allClinicIds = new Set([
        ...Object.keys(currentState.clinicsData || {}),
        ...Object.keys(incomingState.clinicsData || {})
      ]);
      const mergedClinicsData = {};
      for (const cId of allClinicIds) {
        if (deletedSet.has(cId)) continue;
        const curC = currentState.clinicsData?.[cId] || {};
        const incC = incomingState.clinicsData?.[cId] || {};
        const cFile = path.join(CLINICS_DIR, `${cId}.json`);
        
        const mergeArr = (arr1, arr2) => {
          const map = new Map();
          (arr1 || []).forEach(item => { if (item && item.id) map.set(item.id, item); });
          (arr2 || []).forEach(item => {
            if (item && item.id) {
              const prev = map.get(item.id);
              if (!prev) map.set(item.id, item);
              else {
                const t1 = new Date(prev.updatedAt || prev.createdAt || 0).getTime();
                const t2 = new Date(item.updatedAt || item.createdAt || 0).getTime();
                map.set(item.id, t2 >= t1 ? { ...prev, ...item } : { ...item, ...prev });
              }
            }
          });
          return Array.from(map.values());
        };

        const mergedClinic = {
          pets: mergeArr(curC.pets, incC.pets),
          medicalRecords: mergeArr(curC.medicalRecords, incC.medicalRecords),
          vaccines: mergeArr(curC.vaccines, incC.vaccines),
          appointments: mergeArr(curC.appointments, incC.appointments),
          reminders: mergeArr(curC.reminders, incC.reminders),
          inventory: mergeArr(curC.inventory, incC.inventory),
          stockMovements: mergeArr(curC.stockMovements, incC.stockMovements),
          discharges: mergeArr(curC.discharges, incC.discharges),
          products: mergeArr(curC.products, incC.products),
          salesReceipts: mergeArr(curC.salesReceipts, incC.salesReceipts),
          cashShifts: mergeArr(curC.cashShifts, incC.cashShifts),
          activeShift: incC.activeShift !== undefined ? incC.activeShift : curC.activeShift,
          clinicSettings: { ...(curC.clinicSettings || {}), ...(incC.clinicSettings || {}) },
          systemLicense: { ...(curC.systemLicense || {}), ...(incC.systemLicense || {}) },
          updatedAt: new Date().toISOString(),
        };

        mergedClinicsData[cId] = mergedClinic;
        writeJson(cFile, mergedClinic);
      }

      const harmonizedState = {
        tenants: mergedTenants,
        deletedTenants: Array.from(deletedSet),
        paymentRequests: mergedPayments,
        masterBilling: mergedBilling,
        superUserAccount: mergedSuperUser,
        clinicsData: mergedClinicsData,
        lastUpdated: new Date().toISOString(),
      };

      writeJson(MASTER_CLOUD_STATE_FILE, harmonizedState);
      writeJson(TENANTS_FILE, mergedTenants);
      writeJson(DELETED_TENANTS_FILE, Array.from(deletedSet));
      writeJson(PAYMENTS_FILE, mergedPayments);
      writeJson(MASTER_BILLING_FILE, mergedBilling);
      writeJson(SUPERUSER_FILE, mergedSuperUser);

      return res.json({
        success: true,
        state: harmonizedState,
        timestamp: harmonizedState.lastUpdated
      });
    } catch (e) {
      console.error("Error in /api/sync:", e);
      return res.status(500).json({ success: false, error: e.message });
    }
  });

  // 1. Multi-Tenant List & Auto-Poll API
  app.get("/api/tenants", (_req, res) => {
    const rawTenants = readJson(TENANTS_FILE, []);
    const deletedList = readJson(DELETED_TENANTS_FILE, []);
    const deletedIds = Array.isArray(deletedList) ? deletedList : [];
    const tenantsList = Array.isArray(rawTenants) ? rawTenants : [];
    const tenants = tenantsList.filter(t => t && t.id && !deletedIds.includes(t.id) && !DEMO_TENANT_IDS.includes(t.id));
    res.json({ success: true, tenants });
  });

  app.get("/api/deleted-tenants", (_req, res) => {
    const deletedList = readJson(DELETED_TENANTS_FILE, []);
    res.json({ success: true, deletedIds: Array.isArray(deletedList) ? deletedList : [] });
  });

  app.post("/api/tenants/sync-all", (req, res) => {
    const { tenants } = req.body;
    if (Array.isArray(tenants)) {
      const deletedList = readJson(DELETED_TENANTS_FILE, []);
      const deletedIds = Array.isArray(deletedList) ? deletedList : [];
      const existing = readJson(TENANTS_FILE, []);
      const currentList = Array.isArray(existing) ? existing : [];

      const map = new Map();
      currentList.forEach(t => { 
        if (t && t.id && !deletedIds.includes(t.id) && !DEMO_TENANT_IDS.includes(t.id)) {
          map.set(t.id, t);
        }
      });
      tenants.forEach(t => {
        if (t && t.id && !deletedIds.includes(t.id) && !DEMO_TENANT_IDS.includes(t.id)) {
          const prev = map.get(t.id) || {};
          map.set(t.id, { ...prev, ...t });
        }
      });
      const merged = Array.from(map.values());
      writeJson(TENANTS_FILE, merged);
      return res.json({ success: true, tenants: merged, count: merged.length, timestamp: new Date().toISOString() });
    }
    res.status(400).json({ success: false, error: "Invalid tenants payload" });
  });

  app.post("/api/tenants/register", (req, res) => {
    const { tenant } = req.body;
    if (tenant && tenant.id) {
      // Remove from deleted list if re-registered explicitly
      const deletedList = readJson(DELETED_TENANTS_FILE, []);
      if (Array.isArray(deletedList) && deletedList.includes(tenant.id)) {
        writeJson(DELETED_TENANTS_FILE, deletedList.filter(id => id !== tenant.id));
      }

      const existing = readJson(TENANTS_FILE, []);
      const currentList = Array.isArray(existing) ? existing : [];
      const updated = [tenant, ...currentList.filter(t => t.id !== tenant.id)];
      writeJson(TENANTS_FILE, updated);
      return res.json({ success: true, tenant, count: updated.length, timestamp: new Date().toISOString() });
    }
    res.status(400).json({ success: false, error: "Invalid tenant registration payload" });
  });

  app.put("/api/tenants/:tenantId", (req, res) => {
    const tenantId = (req.params.tenantId || "").replace(/[^a-zA-Z0-9_-]/g, "");
    const updates = req.body;
    if (tenantId && updates) {
      const existing = readJson(TENANTS_FILE, []);
      const currentList = Array.isArray(existing) ? existing : [];
      let found = false;
      const updated = currentList.map(t => {
        if (t && t.id === tenantId) {
          found = true;
          return { ...t, ...updates };
        }
        return t;
      });
      if (!found && updates.id) {
        updated.push(updates);
      }
      writeJson(TENANTS_FILE, updated);
      return res.json({ success: true, count: updated.length, timestamp: new Date().toISOString() });
    }
    res.status(400).json({ success: false, error: "Invalid tenant update payload" });
  });

  // 2. Payment Renewal Requests API
  app.get("/api/payment-requests", (_req, res) => {
    const requests = readJson(PAYMENTS_FILE, []);
    res.json({ success: true, requests });
  });

  app.post("/api/payment-requests/sync-all", (req, res) => {
    const { requests } = req.body;
    if (Array.isArray(requests)) {
      const existing = readJson(PAYMENTS_FILE, []);
      const currentList = Array.isArray(existing) ? existing : [];
      const map = new Map();
      currentList.forEach(r => { if (r && r.id) map.set(r.id, r); });
      requests.forEach(r => {
        if (r && r.id) {
          const prev = map.get(r.id) || {};
          map.set(r.id, { ...prev, ...r });
        }
      });
      const merged = Array.from(map.values());
      writeJson(PAYMENTS_FILE, merged);
      return res.json({ success: true, requests: merged, count: merged.length, timestamp: new Date().toISOString() });
    }
    res.status(400).json({ success: false, error: "Invalid requests payload" });
  });

  app.post("/api/payment-requests/create", (req, res) => {
    const { request } = req.body;
    if (request && request.id) {
      const existing = readJson(PAYMENTS_FILE, []);
      const currentList = Array.isArray(existing) ? existing : [];
      const updated = [request, ...currentList.filter(r => r.id !== request.id)];
      writeJson(PAYMENTS_FILE, updated);
      return res.json({ success: true, request, count: updated.length, timestamp: new Date().toISOString() });
    }
    res.status(400).json({ success: false, error: "Invalid payment request payload" });
  });

  // 3. Centralized Multi-Device Clinic Database API
  app.get("/api/clinics/:clinicId/data", (req, res) => {
    const rawId = req.params.clinicId || "default";
    const clinicId = rawId.replace(/[^a-zA-Z0-9_-]/g, "") || "default";
    const clinicFile = path.join(CLINICS_DIR, `${clinicId}.json`);
    const data = readJson(clinicFile, null);
    res.json({ success: true, clinicId, data });
  });

  app.post("/api/clinics/:clinicId/data", (req, res) => {
    const rawId = req.params.clinicId || "default";
    const clinicId = rawId.replace(/[^a-zA-Z0-9_-]/g, "") || "default";
    const clinicFile = path.join(CLINICS_DIR, `${clinicId}.json`);
    const payload = req.body.data || req.body.clinicData || req.body;

    if (payload && typeof payload === "object") {
      const existing = readJson(clinicFile, {});
      const now = new Date().toISOString();

      // Intelligent array merge helper by 'id'
      const mergeArrayById = (existingArr, incomingArr) => {
        const eList = Array.isArray(existingArr) ? existingArr : [];
        const iList = Array.isArray(incomingArr) ? incomingArr : [];
        const map = new Map();
        eList.forEach(item => { if (item && item.id) map.set(item.id, item); });
        iList.forEach(item => {
          if (item && item.id) {
            const prev = map.get(item.id) || {};
            map.set(item.id, { ...prev, ...item });
          }
        });
        return Array.from(map.values());
      };

      // Array replacement if incoming was an explicit deletion/filtering (indicated by replaceArrays flag or when incoming is explicitly provided)
      const shouldMerge = req.body.merge !== false;

      const mergedData = {
        pets: shouldMerge && payload.pets ? mergeArrayById(existing?.pets, payload.pets) : (payload.pets ?? existing?.pets ?? []),
        medicalRecords: shouldMerge && payload.medicalRecords ? mergeArrayById(existing?.medicalRecords, payload.medicalRecords) : (payload.medicalRecords ?? existing?.medicalRecords ?? []),
        vaccines: shouldMerge && payload.vaccines ? mergeArrayById(existing?.vaccines, payload.vaccines) : (payload.vaccines ?? existing?.vaccines ?? []),
        appointments: shouldMerge && payload.appointments ? mergeArrayById(existing?.appointments, payload.appointments) : (payload.appointments ?? existing?.appointments ?? []),
        reminders: shouldMerge && payload.reminders ? mergeArrayById(existing?.reminders, payload.reminders) : (payload.reminders ?? existing?.reminders ?? []),
        inventory: shouldMerge && payload.inventory ? mergeArrayById(existing?.inventory, payload.inventory) : (payload.inventory ?? existing?.inventory ?? []),
        stockMovements: shouldMerge && payload.stockMovements ? mergeArrayById(existing?.stockMovements, payload.stockMovements) : (payload.stockMovements ?? existing?.stockMovements ?? []),
        discharges: shouldMerge && payload.discharges ? mergeArrayById(existing?.discharges, payload.discharges) : (payload.discharges ?? existing?.discharges ?? []),
        products: shouldMerge && payload.products ? mergeArrayById(existing?.products, payload.products) : (payload.products ?? existing?.products ?? []),
        salesReceipts: shouldMerge && payload.salesReceipts ? mergeArrayById(existing?.salesReceipts, payload.salesReceipts) : (payload.salesReceipts ?? existing?.salesReceipts ?? []),
        cashShifts: shouldMerge && payload.cashShifts ? mergeArrayById(existing?.cashShifts, payload.cashShifts) : (payload.cashShifts ?? existing?.cashShifts ?? []),
        activeShift: payload.activeShift !== undefined ? payload.activeShift : existing?.activeShift ?? null,
        clinicSettings: { ...(existing?.clinicSettings || {}), ...(payload.clinicSettings || {}) },
        systemLicense: { ...(existing?.systemLicense || {}), ...(payload.systemLicense || {}) },
        updatedAt: now,
      };

      writeJson(clinicFile, mergedData);

      // Auto-update tenant clinic patientsCount in tenants.json
      if (clinicId && clinicId !== "default") {
        const tenantsList = readJson(TENANTS_FILE, []);
        if (Array.isArray(tenantsList)) {
          let tenantFound = false;
          const updatedTenants = tenantsList.map(t => {
            if (t && t.id === clinicId) {
              tenantFound = true;
              return {
                ...t,
                patientsCount: mergedData.pets.length,
                clinicName: mergedData.clinicSettings?.name || t.clinicName,
                directorName: mergedData.clinicSettings?.directorName || t.directorName,
                phone: mergedData.clinicSettings?.phone || t.phone,
                email: mergedData.clinicSettings?.email || t.email,
              };
            }
            return t;
          });
          if (tenantFound) {
            writeJson(TENANTS_FILE, updatedTenants);
          }
        }
      }

      return res.json({
        success: true,
        clinicId,
        message: "Base de datos sincronizada y guardada centralizadamente en Render",
        data: mergedData,
        timestamp: now,
      });
    }
    res.status(400).json({ success: false, error: "Invalid clinic data payload" });
  });

  // 4. Session Persistence & Audit API on User Logout
  const SESSION_AUDIT_FILE = path.join(DATA_DIR, "session_audit.json");
  const GLOBAL_BACKUP_FILE = path.join(DATA_DIR, "global_session_backup.json");

  app.post("/api/session/save-on-logout", (req, res) => {
    try {
      const { sessionData, userAudit } = req.body;
      const now = new Date().toISOString();

      if (sessionData) {
        // Save global snapshot
        writeJson(GLOBAL_BACKUP_FILE, {
          savedAt: now,
          userAudit: userAudit || null,
          data: sessionData,
        });

        // If clinicId is provided, write to clinic-specific file
        const clinicId = userAudit?.tenantId || sessionData?.clinicSettings?.name?.toLowerCase()?.replace(/[^a-z0-9]/g, "");
        if (clinicId) {
          const clinicFile = path.join(CLINICS_DIR, `${clinicId}.json`);
          writeJson(clinicFile, sessionData);
        }
      }

      // Record audit history
      if (userAudit) {
        const auditRecord = {
          ...userAudit,
          serverTimestamp: now,
        };
        const existingAudits = readJson(SESSION_AUDIT_FILE, []);
        const auditList = Array.isArray(existingAudits) ? existingAudits : [];
        writeJson(SESSION_AUDIT_FILE, [auditRecord, ...auditList.slice(0, 49)]);
      }

      return res.json({
        success: true,
        savedAt: now,
        message: "Todos los cambios generados durante la sesión se han guardado con éxito en la base de datos",
      });
    } catch (err) {
      console.error("Error in /api/session/save-on-logout:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get("/api/session/last-audit", (_req, res) => {
    const audits = readJson(SESSION_AUDIT_FILE, []);
    const last = Array.isArray(audits) && audits.length > 0 ? audits[0] : null;
    res.json({ success: true, lastAudit: last });
  });

  // 4. Delete Tenant and its Isolated Database
  app.delete("/api/tenants/:tenantId", (req, res) => {
    const tenantId = (req.params.tenantId || "").replace(/[^a-zA-Z0-9_-]/g, "");
    
    // 1. Record in deleted blacklist
    if (tenantId) {
      const deletedList = readJson(DELETED_TENANTS_FILE, []);
      const currentDeleted = Array.isArray(deletedList) ? deletedList : [];
      if (!currentDeleted.includes(tenantId)) {
        currentDeleted.push(tenantId);
        writeJson(DELETED_TENANTS_FILE, currentDeleted);
      }
    }

    // 2. Remove from tenants.json
    const existing = readJson(TENANTS_FILE, []);
    const currentList = Array.isArray(existing) ? existing : [];
    const updated = currentList.filter(t => t.id !== tenantId);
    writeJson(TENANTS_FILE, updated);

    // 3. Remove isolated clinic db file
    const clinicFile = path.join(CLINICS_DIR, `${tenantId}.json`);
    if (fs.existsSync(clinicFile)) {
      fs.unlinkSync(clinicFile);
    }

    res.json({ success: true, message: `Clínica ${tenantId} y su base de datos aislada eliminadas definitivamente`, remainingCount: updated.length });
  });

  app.delete("/api/clinics/:clinicId", (req, res) => {
    const clinicId = (req.params.clinicId || "").replace(/[^a-zA-Z0-9_-]/g, "");
    const clinicFile = path.join(CLINICS_DIR, `${clinicId}.json`);
    if (fs.existsSync(clinicFile)) {
      fs.unlinkSync(clinicFile);
    }
    res.json({ success: true, message: `Partición de base de datos de ${clinicId} eliminada` });
  });

  // 5. SuperUser Settings & Master Credentials API
  const SUPERUSER_FILE = path.join(DATA_DIR, "superuser.json");
  const MASTER_BILLING_FILE = path.join(DATA_DIR, "master_billing.json");

  app.get("/api/superuser/settings", (_req, res) => {
    const settings = readJson(SUPERUSER_FILE, {
      username: "Fernando01",
      name: "Fernando (Super Admin Master)",
      isSuperUser: true,
    });
    res.json({ success: true, settings });
  });

  app.post("/api/superuser/settings", (req, res) => {
    const { settings } = req.body;
    if (settings) {
      writeJson(SUPERUSER_FILE, settings);
      return res.json({ success: true, settings, timestamp: new Date().toISOString() });
    }
    res.status(400).json({ success: false, error: "Invalid superuser settings" });
  });

  // 6. Master Billing & Contact Information API
  app.get("/api/master-billing", (_req, res) => {
    const billing = sanitizeBillingContact(readJson(MASTER_BILLING_FILE, null));
    res.json({ success: true, settings: billing });
  });

  app.post("/api/master-billing", (req, res) => {
    const { settings } = req.body;
    if (settings && typeof settings === 'object') {
      const existing = readJson(MASTER_BILLING_FILE, {});
      const merged = sanitizeBillingContact({ ...(existing || {}), ...settings, updatedAt: new Date().toISOString() });
      writeJson(MASTER_BILLING_FILE, merged);
      return res.json({ success: true, settings: merged, timestamp: new Date().toISOString() });
    }
    res.status(400).json({ success: false, error: "Invalid billing settings payload" });
  });

  // Gemini Veterinary Assistant API
  app.post("/api/gemini/vet-assistant", async (req, res) => {
    try {
      const { prompt, petContext, mode } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(503).json({
          error: "GEMINI_API_KEY no está configurada en el servidor.",
          fallback: true,
        });
      }

      let systemInstruction = `Eres "VetCopilot", un asistente veterinario experto de alta precisión clínica para VetCare Pro. 
Habla siempre en español claro, profesional y estructurado.
Ayuda a veterinarios con diagnósticos diferenciales, pautas de dosificación según especie y peso, esquemas de vacunación recomendados (WSAVA), cuidados postquirúrgicos y redacción de informes médicos.
IMPORTANTE: Ofrece recomendaciones estructuradas con advertencias clínicas pertinentes.`;

      if (mode === "client_summary") {
        systemInstruction = `Eres un veterinario empático y cordial que explica diagnósticos, recetas y planes de salud a los tutores de mascotas (dueños).
Usa un lenguaje cálido, sin tecnicismos excesivos pero riguroso, explicando qué le pasa a su mascota, cómo darle sus medicamentos, signos de alarma a vigilar y cuidados en el hogar.`;
      } else if (mode === "reminder_crafting") {
        systemInstruction = `Eres el redactor de comunicaciones de la clínica veterinaria VetCare Pro. 
Genera mensajes empáticos, claros y profesionales para WhatsApp, SMS o correo electrónico para recordar vacunas, desparasitaciones o citas programadas.`;
      }

      let fullPrompt = `Contexto del Paciente:\n${JSON.stringify(petContext || {}, null, 2)}\n\nConsulta:\n${prompt}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: fullPrompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({
        result: response.text || "No se obtuvo respuesta del modelo.",
        success: true,
      });
    } catch (error) {
      console.error("Error in /api/gemini/vet-assistant:", error);
      res.status(500).json({
        error: error?.message || "Error al procesar la solicitud con Gemini.",
        success: false,
      });
    }
  });

  // Mount any available static asset directory (/assets)
  const possibleAssetDirs = [
    path.resolve(process.cwd(), "dist", "assets"),
    path.resolve(process.cwd(), "assets"),
    path.resolve(process.cwd(), "public", "assets"),
    path.resolve(__dirname, "dist", "assets"),
    path.resolve(__dirname, "assets"),
    path.resolve(__dirname, "public", "assets"),
  ];

  for (const assetDir of possibleAssetDirs) {
    if (fs.existsSync(assetDir)) {
      console.log(`Mounting static assets from: ${assetDir}`);
      app.use("/assets", express.static(assetDir, { maxAge: '1d', immutable: true }));
    }
  }

  // Fallback: If /assets/file is requested but file is in root directory
  app.get("/assets/:file", (req, res, next) => {
    const filename = req.params.file;
    const candidates = [
      path.resolve(process.cwd(), filename),
      path.resolve(process.cwd(), "assets", filename),
      path.resolve(process.cwd(), "dist", "assets", filename),
      path.resolve(process.cwd(), "public", "assets", filename),
      path.resolve(__dirname, filename),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) {
        if (filename.endsWith(".js")) res.setHeader("Content-Type", "application/javascript");
        if (filename.endsWith(".css")) res.setHeader("Content-Type", "text/css");
        return res.sendFile(c);
      }
    }
    next();
  });

  // 1. Check if a compiled dist folder exists anywhere in the workspace
  const distDir = findFileOrDirRecursively(process.cwd(), "dist");
  if (distDir && fs.existsSync(path.join(distDir, "index.html"))) {
    console.log(`Serving static production files from: ${distDir}`);
    const assetsSubdir = path.join(distDir, "assets");
    if (fs.existsSync(assetsSubdir)) {
      app.use("/assets", express.static(assetsSubdir, { maxAge: '1d', immutable: true }));
    }
    const publicSubdir = path.join(process.cwd(), "public");
    if (fs.existsSync(publicSubdir)) {
      app.use(express.static(publicSubdir));
    }
    app.use(express.static(distDir));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  } else {
    // 3. Dynamic Vite fallback: locate index.html and main.tsx anywhere recursively
    const indexHtmlPath = findFileOrDirRecursively(process.cwd(), "index.html");
    let appRoot = indexHtmlPath ? path.dirname(indexHtmlPath) : process.cwd();
    console.log(`Dynamic Vite using appRoot: ${appRoot}`);

    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      root: appRoot,
      server: { middlewareMode: true, allowedHosts: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    app.get("*", async (req, res, next) => {
      try {
        const url = req.originalUrl;
        const htmlFile = path.join(appRoot, "index.html");
        if (fs.existsSync(htmlFile)) {
          let template = fs.readFileSync(htmlFile, "utf-8");
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ "Content-Type": "text/html" }).end(template);
        } else {
          res.status(404).send("index.html not found");
        }
      } catch (e) {
        next(e);
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VetCare Pro Server running on http://localhost:${PORT}`);
  });
}

startServer();
