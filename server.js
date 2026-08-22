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

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
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

  // Smart resolver to find the compiled dist folder anywhere in the repository
  function findDistPath() {
    const candidates = [
      path.resolve(process.cwd(), "dist"),
      path.resolve(__dirname, "dist"),
      path.resolve(process.cwd(), "PROYECTO YABET", "dist"),
      path.resolve(process.cwd(), "Remix-VetCare-Pro---Control-Veterinario-y-Portal-de-Clientes-2026-08-15-bddcb", "dist"),
    ];

    for (const cand of candidates) {
      if (fs.existsSync(cand) && fs.existsSync(path.join(cand, "index.html"))) {
        return cand;
      }
    }

    try {
      const items = fs.readdirSync(process.cwd());
      for (const item of items) {
        const sub = path.resolve(process.cwd(), item, "dist");
        if (fs.existsSync(sub) && fs.existsSync(path.join(sub, "index.html"))) {
          return sub;
        }
      }
    } catch (e) {
      // ignore
    }
    return null;
  }

  const distPath = findDistPath();

  if (distPath) {
    console.log(`Serving static production files from: ${distPath}`);
    app.use("/assets", express.static(path.join(distPath, "assets")));
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    console.log("No compiled dist folder found, searching root for dynamic Vite...");
    
    let appRoot = process.cwd();
    const possibleRoots = [
      process.cwd(),
      __dirname,
      path.resolve(process.cwd(), "PROYECTO YABET"),
      path.resolve(process.cwd(), "Remix-VetCare-Pro---Control-Veterinario-y-Portal-de-Clientes-2026-08-15-bddcb"),
    ];
    for (const r of possibleRoots) {
      if (fs.existsSync(path.join(r, "src", "main.tsx")) || fs.existsSync(path.join(r, "index.html"))) {
        appRoot = r;
        break;
      }
    }

    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      root: appRoot,
      server: { middlewareMode: true, allowedHosts: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VetCare Pro Server running on http://localhost:${PORT}`);
  });
}

startServer();
