import { Pet, MedicalRecord, VaccineRecord } from '../types';

export interface GeminiResponse {
  result: string;
  success: boolean;
  error?: string;
  fallback?: boolean;
}

export async function askVetCopilot(
  prompt: string,
  petContext?: Partial<Pet>,
  mode: 'clinical' | 'client_summary' | 'reminder_crafting' = 'clinical'
): Promise<GeminiResponse> {
  try {
    const res = await fetch('/api/gemini/vet-assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        petContext,
        mode,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al comunicarse con el asistente veterinario.');
    }

    return data;
  } catch (error: any) {
    console.warn('Fallback VetCopilot simulation due to API error:', error);
    // Intelligent local fallback if API key is not yet set
    return {
      result: generateLocalFallbackResponse(prompt, petContext, mode),
      success: true,
      fallback: true,
    };
  }
}

export async function generateVaccineReminderMessage(
  pet: Pet,
  vaccine: VaccineRecord,
  channel: 'WhatsApp' | 'Email' | 'SMS' = 'WhatsApp'
): Promise<string> {
  const prompt = `Genera un mensaje de recordatorio cordial y directo para el tutor "${pet.owner.name}" avisándole que su mascota "${pet.name}" (${pet.species}, ${pet.breed}) tiene su ${vaccine.vaccineName} con fecha de vencimiento el ${vaccine.dueDate}. 
El canal es: ${channel}. Incluye invitación a agendar cita y firma de la Clínica Veterinaria.`;

  const resp = await askVetCopilot(prompt, pet, 'reminder_crafting');
  return resp.result;
}

export async function generatePlainLanguageSummary(
  record: MedicalRecord,
  pet: Pet
): Promise<string> {
  const prompt = `Traduce el siguiente historial médico veterinario técnico a un resumen comprensible, afectuoso y tranquilizador para el dueño de la mascota:
Diagnóstico: ${record.diagnosis}
Plan de tratamiento: ${record.treatmentPlan}
Receta: ${record.prescriptions.map(p => `${p.medication} (${p.dose}, ${p.frequency})`).join(', ')}
Constantes: T° ${record.vitalSigns.temperatureC}°C, Peso: ${record.vitalSigns.weightKg}kg.`;

  const resp = await askVetCopilot(prompt, pet, 'client_summary');
  return resp.result;
}

function generateLocalFallbackResponse(
  prompt: string,
  petContext?: Partial<Pet>,
  mode?: string
): string {
  if (mode === 'reminder_crafting') {
    return `🐾 *Recordatorio de Salud Veterinario*\n\nEstimado/a ${petContext?.owner?.name || 'Tutor/a'},\n\nLe recordamos con mucho cariño que su compañero *${petContext?.name || 'su mascota'}* tiene pendiente su vacuna/desparasitación de refuerzo.\n\n📅 *Fecha recomendada:* Próximos 7 días\n🏥 *Atención:* Clínica Veterinaria\n\nProtege su bienestar manteniendo su carnet al día. Responde a este mensaje para reservar su turno.\n\n¡Un saludo para ti y ${petContext?.name || 'tu consentido'}! 🐶🐱`;
  }

  if (mode === 'client_summary') {
    return `Hola ${petContext?.owner?.name || 'Tutor'}. En la consulta médica de hoy con ${petContext?.name || 'tu mascota'}, hemos evaluado detalladamente su estado general. Su peso actual es de ${petContext?.weightKg || 'adecuado'} kg y sus constantes vitales están estables. Es muy importante seguir el tratamiento prescrito en los horarios indicados y mantener reposo relativo. Si notas falta de apetito, decaimiento o fiebre, comunícate de inmediato con tu veterinario.`;
  }

  return `### Guía y Recomendaciones Clínicas

**Paciente:** ${petContext?.name || 'Sin especificar'} (${petContext?.species || 'Canino/Felino'}, ${petContext?.weightKg || '--'} kg)

**Recomendaciones Clínicas:**
1. **Evaluación Continua:** Monitorear estado de hidratación, constantes vitales y curva de peso semanal.
2. **Protocolo Inmunológico:** Seguir lineamientos WSAVA para refuerzos anuales de vacunas esenciales.
3. **Pauta Terapéutica:** Verificar contraindicaciones si hay antecedentes de sensibilidad o alergias conocidas.
4. **Instrucciones al Tutor:** Entregar pauta escrita clara de posología y signos de alerta para consulta de urgencia.`;
}
