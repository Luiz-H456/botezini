
import { z } from 'zod';

// --- DATE MANIPULATION (Real Time) ---
export const getNow = () => new Date();

export const getTodayStr = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

// --- DATE HELPERS (Pure Functions) ---

export const addMonths = (dateStr: string, count: number): string => {
    if (!dateStr || !dateStr.includes('-')) return dateStr;
    const [y, m, d] = dateStr.split('-').map(Number);
    
    const totalMonths = (y * 12) + (m - 1) + count;
    const newY = Math.floor(totalMonths / 12);
    const newM = (totalMonths % 12) + 1;
    
    const daysInTargetMonth = new Date(newY, newM, 0).getDate();
    const safeDay = Math.min(d, daysInTargetMonth);
    
    return `${newY}-${String(newM).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;
};

/**
 * Define um dia específico para uma data string, garantindo que não estoure o mês.
 * Ex: setDayPreservingMonth('2023-02-15', 31) -> '2023-02-28'
 */
export const setDayPreservingMonth = (dateStr: string, targetDay: number): string => {
    const [y, m] = dateStr.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const safeDay = Math.min(targetDay, daysInMonth);
    return `${y}-${String(m).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;
};

export const addBusinessDays = (dateStr: string, daysToAdd: number): string => {
    if (!dateStr) return '';
    const currentDate = new Date(dateStr + 'T12:00:00');
    let added = 0;
    
    while (added < daysToAdd) {
        currentDate.setDate(currentDate.getDate() + 1);
        const dayOfWeek = currentDate.getDay(); 
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            added++;
        }
    }
    
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(currentDate.getDate()).padStart(2, '0');
    
    return `${y}-${m}-${d}`;
};

export const countBusinessDays = (startDateStr: string, endDateStr: string): number => {
    if (!startDateStr || !endDateStr) return 0;
    const start = new Date(startDateStr + 'T12:00:00');
    const end = new Date(endDateStr + 'T12:00:00');
    let count = 0;
    const cur = new Date(start);

    if (end <= start) return 0;

    while (cur < end) {
        cur.setDate(cur.getDate() + 1);
        const day = cur.getDay(); 
        if (day !== 0 && day !== 6) {
            count++;
        }
    }
    return count;
};

export const isDateInPeriod = (targetDate: string, period: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'QUARTER' | 'SEMESTER' | 'ALL', referenceDate: string = getTodayStr()): boolean => {
    if (!targetDate || period === 'ALL') return true;
    
    const target = targetDate.substring(0, 10);
    const ref = referenceDate.substring(0, 10);

    if (period === 'DAY') return target === ref;

    const [tY, tM] = target.split('-').map(Number);
    const [rY, rM] = ref.split('-').map(Number);

    if (period === 'MONTH') return tY === rY && tM === rM;
    if (period === 'YEAR') return tY === rY;
    
    if (period === 'QUARTER') {
         const qStart = Math.floor((rM - 1) / 3) * 3 + 1;
         return tY === rY && tM >= qStart && tM < qStart + 3;
    }
    
    if (period === 'SEMESTER') {
         const sStart = Math.floor((rM - 1) / 6) * 6 + 1;
         return tY === rY && tM >= sStart && tM < sStart + 6;
    }
    
    if (period === 'WEEK') {
        const refObj = new Date(ref + 'T12:00:00');
        const dayOfWeek = refObj.getDay(); 
        const msPerDay = 86400000;
        const refTime = refObj.getTime();
        const startMs = refTime - (dayOfWeek * msPerDay);
        const endMs = startMs + (6 * msPerDay);
        const targetTime = new Date(target + 'T12:00:00').getTime();
        return targetTime >= startMs && targetTime <= endMs;
    }
    
    return false;
};

export const isBudgetExpired = (dateString: string, validityDays: number): boolean => {
    if (!dateString) return false;
    const creationTime = new Date(dateString + 'T12:00:00').getTime();
    const todayTime = new Date(getTodayStr() + 'T12:00:00').getTime();
    const daysDiff = (todayTime - creationTime) / (1000 * 60 * 60 * 24);
    return daysDiff > validityDays;
};

// --- FORMATTERS ---

export const maskCNPJ = (v: string) => {
  return v.replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .substr(0, 18);
};

export const maskPhone = (v: string) => {
  return v.replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d)(\d{4})$/, '$1-$2')
    .substr(0, 15);
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const cleanDate = dateString.substring(0, 10);
  if (cleanDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = cleanDate.split('-');
    return `${day}/${month}/${year}`;
  }
  return dateString;
};

// --- SCHEMAS (ZOD) ---
export const clientSchema = z.object({
  companyName: z.string().min(2, "Nome obrigatório"),
  category: z.string().optional(),
  cnpj: z.string().optional(),
  contactPerson: z.string().optional(),
  email: z.string().optional(), 
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const supplierSchema = z.object({
  companyName: z.string().min(2, "Nome obrigatório"),
  category: z.string().optional(),
  cnpj: z.string().optional(),
  contactPerson: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  sku: z.string().optional(),
  category: z.string().optional(),
  priceTier1: z.number().optional(),
  priceTier2: z.number().optional(),
  priceTier3: z.number().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});
