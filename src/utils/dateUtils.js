/**
 * Funções utilitárias para manipulação segura de datas e fusos horários,
 * focadas em evitar bugs de offset UTC e GMT-3 (Brasil).
 */

/**
 * Faz o parse seguro de uma data vinda do backend (ex: "2023-10-25 14:00:00")
 * ignorando o fuso horário local do celular para evitar mostrar "3h antes/depois".
 * @param {string} dateString Data no formato do BD
 * @returns {object} Objeto contendo Date UTC, horas, minutos e time string
 */
export const parseBackendDate = (dateString) => {
  if (!dateString) return null;

  // Troca espaço por T caso venha "YYYY-MM-DD HH:mm:ss"
  const dateStr = dateString.replace(" ", "T");
  // Força que seja interpretado como absoluto UTC
  const when = new Date(dateStr.endsWith("Z") ? dateStr : dateStr + "Z");

  const h = String(when.getUTCHours()).padStart(2, "0");
  const m = String(when.getUTCMinutes()).padStart(2, "0");

  return {
    dateObj: when,
    hour: h,
    minute: m,
    time: `${h}:${m}`,
  };
};

/**
 * Cria a string de data UTC garantindo que ela parta exatamente do fuso -03:00,
 * independente de onde o celular do cliente esteja.
 * @param {Date|string} selectedDate Objeto Date ou string de data (ex: "2023-10-25")
 * @param {string} timeStr Horário escolhido (ex: "14:00")
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
    // Caso seja passado já em string
    dateStr = selectedDate.includes("T") ? selectedDate.split("T")[0] : selectedDate;
  }
  
  const [hourStr, minuteStr] = timeStr.split(":");
  
  // Força o fuso horário de Brasília (-03:00) 
  const scheduled = new Date(`${dateStr}T${hourStr.padStart(2, "0")}:${minuteStr.padStart(2, "0")}:00-03:00`);
  return scheduled.toISOString();
};
