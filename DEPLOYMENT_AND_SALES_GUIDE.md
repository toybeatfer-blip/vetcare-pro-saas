# 🚀 Guía de Despliegue en la Nube y Comercialización SaaS: VetCare Pro

¡El sistema **VetCare Pro** está 100% verificado, probado y listo para su puesta en producción, subida a la nube y comercialización!

---

## 💎 1. Modelo de Negocio y Precios Configurados

El software opera bajo el modelo **SaaS Multi-Tenant (Renta de Software)**:

| Modalidad | Precio al Cliente | Beneficio para el Creador |
| :--- | :--- | :--- |
| **Prueba Gratuita** | **$0 MXN (30 Días)** | Generación de leads y captación automática |
| **Renta Mensual** | **$599 MXN / mes** | Ingreso recurrente mensual (MRR predecible) |
| **Renta Anual** | **$5,990 MXN / año** | Flujo de caja anticipado + 2 meses gratis de descuento |

---

## ☁️ 2. Opciones Rápidas de Despliegue en la Nube

### Opción A: Despliegue en **Render** (Recomendado - Gratuito o $7/mes)
1. Sube tu código a un repositorio privado de **GitHub** o **GitLab**.
2. Entra a [render.com](https://render.com) y crea un **Web Service**.
3. Conecta tu repositorio.
4. Configura los parámetros:
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. En **Environment Variables**, añade:
   - `NODE_ENV=production`
   - `GEMINI_API_KEY=tu_clave_opcional` (para IA VetCopilot)
6. Haz clic en **Deploy**. ¡Tu software estará online con HTTPS y dominio gratis (`.onrender.com`) en 3 minutos!

---

### Opción B: Despliegue en **Railway** (Muy Rápido y Estable)
1. Entra a [railway.app](https://railway.app).
2. Haz clic en **New Project** > **Deploy from GitHub repo**.
3. Railway detectará automáticamente el `Dockerfile` o `package.json`.
4. Añade tus variables de entorno si lo requieres.
5. Railway te asignará una URL pública con SSL automático.

---

### Opción C: Despliegue con **Docker** en Servidor VPS (DigitalOcean / Linode / AWS / Hostinger)
```bash
# 1. Construir la imagen de producción
docker build -t vetcare-pro:latest .

# 2. Correr el contenedor en el puerto 80/3000
docker run -d -p 80:3000 --name vetcare-app --restart always -e NODE_ENV=production vetcare-pro:latest
```

---

## 👥 3. Cuentas y Accesos por Defecto

### 👑 Super Usuario (Creador / Dueño del Software)
- **Usuario:** `superuser`
- **Contraseña:** `creador123`
- **Acceso:** Panel Maestro SaaS exclusivo con MRR, gestión de arrendatarios, bandeja de pagos 24h, generador de claves y restablecimiento universal de contraseñas.

### 🏥 Administrador de Clínica Demo
- **Usuario:** `admin`
- **Contraseña:** `admin123`
- **Acceso:** Consultas médicas SOAP, recetas, agenda, vacunas, inventario y facturación.

### 👩‍💼 Encargado(a) de Recepción
- **Usuario:** `encargado`
- **Contraseña:** `encargado123`
- **Acceso:** Citas, registro de tutores y mascotas (sin acceso a configuración sensible).

---

## 🔒 4. Funciones de Blindaje y Protección Comercial

1. **Bloqueo Remoto Instantáneo:** Si una veterinaria no paga su cuota mensual, puedes bloquear su acceso desde el Panel del Creador en 1 segundo.
2. **Pasarela de Pago Integrada con Validación en 24h:** Permite a las clínicas pagar con Tarjeta, SPEI o OXXO, enviándote un correo inmediato a `super.admin@vetcare.master.com` y permitiéndote reactivar su software con un solo clic.
3. **Generador de Licencias Criptográficas:** Genera seriales únicos firmados digitalmente (`VET-MENS-...`, `VET-ANUAL-...`).
4. **Respaldo Global JSON:** Descarga copias de seguridad completas de todas las clínicas para asegurar la continuidad de los datos.
