/**
 * Funções utilitárias para manipulação segura de datas e fusos horários,
 * focadas em manter conformidade total com America/Sao_Paulo e UTC.
 */

const APP_TZ = "America/Sao_Paulo";

/**
 * Faz o parse seguro de uma data vinda do backend (ex: "2026-09-07T15:30:00.000Z" ou "2026-09-07 12:30:00")
 * formatando sempre no fuso oficial de São Paulo (America/Sao_Paulo) sem distorção.
 * @param {Date|string} dateString Data no formato do BD / API
 * @returns {{ dateObj: Date, hour: string, minute: string, time: string } | null}
 */
export const parseBackendDate = (dateString) => {
  if (!dateString) return null;

  let d;
  if (dateString instanceof Date) {
    d = dateString;
  } else if (typeof dateString === "string") {
    const cleanStr = dateString.trim().replace(" ", "T");
    // Se já tiver indicador de fuso (Z ou +XX:XX ou -XX:XX)
    if (cleanStr.endsWith("Z") || /[+-]\d{2}(:\d{2})?$/.test(cleanStr)) {
      d = new Date(cleanStr);
    } else {
      // Se não tiver fuso explícito, assume horário de Brasília (-03:00)
      d = new Date(`${cleanStr}-03:00`);
    }
  } else {
    d = new Date(dateString);
  }

  if (Number.isNaN(d.getTime())) return null;

  // Formata com precisão no fuso de São Paulo
  const timeStr = d.toLocaleTimeString("pt-BR", {
    timeZone: APP_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const [h, m] = timeStr.split(":");

  return {
    dateObj: d,
    hour: h,
    minute: m,
    time: `${h}:${m}`,
  };
};

/**
 * Cria a string de data UTC garantindo que ela parta exatamente do fuso -03:00 de São Paulo,
 * independente de onde o celular do cliente esteja.
 * @param {Date|string} selectedDate Objeto Date ou string de data (ex: "2026-09-07")
 * @param {string} timeStr Horário escolhido (ex: "12:30")
 * @returns {string} String ISO UTC pronta para envio ao backend
 */
export const formatDateForBackend = (selectedDate, timeStr) => {
  let dateStr = "";
  
  if (selectedDate instanceof Date) {
    const year = selectedDate.getFullYear();
    const month = `${selectedDate.getMonth() + 1}`.padStart(2, "0");
    const day = `${selectedDate.getDate()}`.padStart(2, "0");
    dateStr = `${year}-${month}-${day}`;
  } else if (typeof selectedDate === 'string') {
    dateStr = selectedDate.includes("T") ? selectedDate.split("T")[0] : selectedDate;
  }
  
  const [hourStr, minuteStr] = timeStr.split(":");
  
  // Força o fuso horário de Brasília (-03:00) 
  const scheduled = new Date(`${dateStr}T${hourStr.padStart(2, "0")}:${minuteStr.padStart(2, "0")}:00-03:00`);
  return scheduled.toISOString();
};

