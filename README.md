# 🐾 VetCare Pro — Software de Gestión Clínica Veterinaria & Portal de Tutores

**VetCare Pro** es una plataforma integral SaaS (Software as a Service) diseñada para la administración integral de clínicas, hospitales y consultorios veterinarios, venta en mostrador (Pet Shop & Farmacia), control de turnos de caja y carnet digital interactivo para tutores de mascotas.

---

## 🚀 Características Principales

### 🩺 1. Gestión Clínica & Expedientes Médicos
- **Consultas SOAP Digitales:** Diagnóstico, plan de tratamiento, signos vitales y evolución clínica.
- **Recetas Médicas Profesionales:** Generación automática con membrete, cédula del médico director y envío directo por WhatsApp.
- **Fichas de Pacientes:** Historial completo por especie (caninos, felinos, aves, roedores, exóticos), peso y microchip.
- **Módulo de Alta Médica:** Resumen de egreso post-consulta o post-quirúrgico.

### 💉 2. Carnet de Vacunación & Avisos Automatizados
- Carnet digital de vacunas y desparasitaciones con semáforo de estado (Al día, Próxima, Vencida).
- Alertas de dosis próximas y recordatorios 1-clic por WhatsApp.

### 🛍️ 3. Pet Shop, Alimentos, Accesorios & Múltiples Almacenes
- Catálogo de productos con categoría, presentación, costo de adquisición y precio de venta con cálculo automático de margen de ganancia.
- Control de inventario en **5 Almacenes/Ubicaciones** (Tienda mostrador, Bodega central, Consultorios, etc.).
- Transferencias de stock entre almacenes en tiempo real.

### 💰 4. Control de Turnos, Arqueo & Corte Diario de Caja
- **Apertura de Turno:** Fondo inicial con sugerencias rápidas ($300, $500, $1,000, $1,500, $2,000 MXN).
- **POS Unificado:** Cobro conjunto de productos de tienda y servicios médicos (Consultas generales, urgencias 24/7 y vacunas por paciente).
- **Cierre de Turno & Arqueo:** Registro de efectivo físico contado, cálculo de sobrante/faltante e impresión de Ticket de Corte Z térmico (58mm/80mm) y tamaño carta.

### 📱 5. Portal para Tutores & App Móvil Android
- Carnet digital de salud y pasaporte de vacunación accesible vía código QR.
- Agendamiento de citas médicas y botón SOS de emergencias 24h.

### ⚡ 6. Consola Master de Administración (Super Usuario)
- Control centralizado de clínicas arrendatarias (Tenants).
- Generador de licencias y números de serie mensuales y anuales.
- Bloqueo y activación de planes con periodo de gracia configurable.

---

## 🛠️ Instalación y Puesta en Marcha

### Requisitos Previos
- **Node.js** v18 o superior
- **npm** v9 o superior

### 1. Clonar el Repositorio
```bash
git clone https://github.com/TU_USUARIO/TU_REPOSITORIO.git
cd PROYECTO-YABET
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno (Opcional)
Crea un archivo `.env` en la raíz del proyecto si deseas habilitar la IA de VetCopilot:
```env
PORT=3000
GEMINI_API_KEY=tu_api_key_de_gemini
```

### 4. Compilar para Producción
```bash
npm run build
```

### 5. Iniciar el Servidor
```bash
npm start
```
El sistema estará disponible en: **`http://localhost:3000`**

---

## 🔑 Credenciales de Acceso Predeterminadas

| Rol | Usuario | Contraseña | Descripción |
|---|---|---|---|
| **⚡ Super Administrador** | `Fernando01` | `Bazzoka1313AS.` | Dueño del software, Consola Master y gestión de clínicas |
| **👑 Administrador Clínica** | `admin` | `admin123` | Control total de la clínica, finanzas y parámetros |
| **👤 Encargado / Recepción** | `encargado` | `encargado123` | Modo operativo: Citas, consultas, Pet Shop y caja |

---

## ☁️ Despliegue en la Nube (Render, Railway, Heroku)

1. Conecta este repositorio a tu cuenta de **Render** o proveedor SaaS favorito.
2. Configuración en Render:
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node server.js`
   - **Port:** `3000` (o `$PORT`)
3. VetCare Pro se desplegará de forma automatizada y con soporte SSL/HTTPS nativo.

---

© 2026 VetCare Pro — Plataforma SaaS para Clínicas Veterinarias. Todos los derechos reservados.