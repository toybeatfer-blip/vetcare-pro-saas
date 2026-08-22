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

  // 1. Multi-Tenant List & Auto-Poll API
  app.get("/api/tenants", (_req, res) => {
    const tenants = readJson(TENANTS_FILE, null);
    res.json({ success: true, tenants });
  });

  app.post("/api/tenants/sync-all", (req, res) => {
    const { tenants } = req.body;
    if (Array.isArray(tenants)) {
      writeJson(TENANTS_FILE, tenants);
      return res.json({ success: true, count: tenants.length, timestamp: new Date().toISOString() });
    }
    res.status(400).json({ success: false, error: "Invalid tenants payload" });
  });

  app.post("/api/tenants/register", (req, res) => {
    const { tenant } = req.body;
    if (tenant && tenant.id) {
      const existing = readJson(TENANTS_FILE, []);
      const currentList = Array.isArray(existing) ? existing : [];
      const updated = [tenant, ...currentList.filter(t => t.id !== tenant.id)];
      writeJson(TENANTS_FILE, updated);
      return res.json({ success: true, tenant, count: updated.length, timestamp: new Date().toISOString() });
    }
    res.status(400).json({ success: false, error: "Invalid tenant registration payload" });
  });

  // 2. Payment Renewal Requests API
  app.get("/api/payment-requests", (_req, res) => {
    const requests = readJson(PAYMENTS_FILE, []);
    res.json({ success: true, requests });
  });

  app.post("/api/payment-requests/sync-all", (req, res) => {
    const { requests } = req.body;
    if (Array.isArray(requests)) {
      writeJson(PAYMENTS_FILE, requests);
      return res.json({ success: true, count: requests.length, timestamp: new Date().toISOString() });
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

  // 3. Isolated Clinic Database Partition API
  app.get("/api/clinics/:clinicId/data", (req, res) => {
    const clinicId = (req.params.clinicId || "").replace(/[^a-zA-Z0-9_-]/g, "");
    const clinicFile = path.join(CLINICS_DIR, `${clinicId}.json`);
    const data = readJson(clinicFile, null);
    res.json({ success: true, clinicId, data });
  });

  app.post("/api/clinics/:clinicId/data", (req, res) => {
    const clinicId = (req.params.clinicId || "").replace(/[^a-zA-Z0-9_-]/g, "");
    const clinicFile = path.join(CLINICS_DIR, `${clinicId}.json`);
    const payload = req.body.data || req.body.clinicData || req.body;
    if (payload && (payload.pets || payload.clinicSettings || req.body.data || req.body.clinicData)) {
      const dataToSave = req.body.data || req.body.clinicData || payload;
      writeJson(clinicFile, dataToSave);
      return res.json({ success: true, clinicId, message: "Base de datos de clínica guardada de forma aislada", timestamp: new Date().toISOString() });
    }
    res.status(400).json({ success: false, error: "Invalid clinic data payload" });
  });

  // 4. Delete Tenant and its Isolated Database
  app.delete("/api/tenants/:tenantId", (req, res) => {
    const tenantId = (req.params.tenantId || "").replace(/[^a-zA-Z0-9_-]/g, "");
    
    // Remove from tenants.json
    const existing = readJson(TENANTS_FILE, []);
    const currentList = Array.isArray(existing) ? existing : [];
    const updated = currentList.filter(t => t.id !== tenantId);
    writeJson(TENANTS_FILE, updated);

    // Remove isolated clinic db file
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
  app.get("/api/superuser/settings", (_req, res) => {
    const settings = readJson(SUPERUSER_FILE, {
      username: "creator",
      name: "Creador del Sistema",
      isSuperUser: true,
      masterBillingCard: {
        bankName: "BBVA México",
        beneficiaryName: "VetCare Pro SaaS",
        accountOrCardNumber: "4152 3138 9012 3456",
        clabe: "012180001234567890"
      }
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

  // Direct root asset handler for .js and .css files
  app.use(express.static(process.cwd()));

  // 1. Check if a compiled dist folder exists anywhere in the workspace
  const distDir = findFileOrDirRecursively(process.cwd(), "dist");
  if (distDir && fs.existsSync(path.join(distDir, "index.html"))) {
    console.log(`Serving static production files from: ${distDir}`);
    const assetsSubdir = path.join(distDir, "assets");
    if (fs.existsSync(assetsSubdir)) {
      app.use("/assets", express.static(assetsSubdir, { maxAge: '1d', immutable: true }));
    }
    app.use(express.static(distDir));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  } else if (
    fs.existsSync(path.resolve(process.cwd(), "index.html")) &&
    fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf8").includes("/assets/index-")
  ) {
    const rootIndexHtml = path.resolve(process.cwd(), "index.html");
    console.log("Root index.html is pre-compiled. Serving static site from root directory.");
    app.use(express.static(process.cwd()));
    app.get("*", (_req, res) => {
      res.sendFile(rootIndexHtml);
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
