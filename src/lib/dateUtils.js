/**
 * Formats a date string (e.g. 'YYYY-MM-DD' or ISO string) into 'DD-MM-YYYY' format.
 * Example: '2026-08-01' -> '01-08-2026'
 */
export const formatDateDDMMYYYY = (dateStr) => {
  if (!dateStr) return '';
  const str = String(dateStr).trim();
  const parts = str.split('-');
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      const year = parts[0];
      const month = parts[1].padStart(2, '0');
      const day = parts[2].slice(0, 2).padStart(2, '0');
      return `${day}-${month}-${year}`;
    }
    if (parts[2].length === 4) {
      // Already DD-MM-YYYY
      return str;
    }
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return str;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};
