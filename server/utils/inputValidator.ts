/**
 * Validadores de inputs para prevenir ataques
 */

/**
 * Valida CNPJ
 */
export function isValidCNPJ(cnpj: string): boolean {
  // Remove caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
  
  // Deve ter 14 dígitos
  if (cleanCNPJ.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais (inválido)
  if (/^(\d)\1+$/.test(cleanCNPJ)) return false;
  
  // Validação dos dígitos verificadores
  let size = cleanCNPJ.length - 2;
  let numbers = cleanCNPJ.substring(0, size);
  const digits = cleanCNPJ.substring(size);
  let sum = 0;
  let pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  
  size = size + 1;
  numbers = cleanCNPJ.substring(0, size);
  sum = 0;
  pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === parseInt(digits.charAt(1));
}

/**
 * Valida email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Sanitiza string para prevenir XSS
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Valida tamanho de arquivo (em bytes)
 */
export function isValidFileSize(size: number, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return size > 0 && size <= maxSizeBytes;
}

/**
 * Valida tipo de arquivo por extensão
 */
const allowedExtensions = [
  'pdf', 'doc', 'docx', 'xls', 'xlsx',
  'jpg', 'jpeg', 'png', 'gif',
  'txt', 'csv'
];

export function isValidFileType(filename: string): boolean {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? allowedExtensions.includes(extension) : false;
}

/**
 * Valida tipo MIME de arquivo
 */
const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/gif',
  'text/plain',
  'text/csv'
];

export function isValidMimeType(mimeType: string): boolean {
  return allowedMimeTypes.includes(mimeType);
}

/**
 * Valida URL
 */
export function isValidURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Valida número de telefone brasileiro
 */
export function isValidPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  // 10 dígitos (fixo) ou 11 dígitos (celular)
  return cleanPhone.length === 10 || cleanPhone.length === 11;
}

/**
 * Valida CEP brasileiro
 */
export function isValidCEP(cep: string): boolean {
  const cleanCEP = cep.replace(/[^\d]/g, '');
  return cleanCEP.length === 8;
}

/**
 * Valida valor monetário
 */
export function isValidMoneyValue(value: string): boolean {
  // Aceita formatos: 1234.56, 1.234,56, 1,234.56
  const cleanValue = value.replace(/[^\d.,]/g, '');
  const numberValue = parseFloat(cleanValue.replace(',', '.'));
  return !isNaN(numberValue) && numberValue >= 0;
}

/**
 * Limita tamanho de string (prevenir DoS)
 */
export function limitStringLength(input: string, maxLength: number = 1000): string {
  return input.substring(0, maxLength);
}

/**
 * Valida se string contém apenas caracteres alfanuméricos e alguns especiais
 */
export function isSafeString(input: string): boolean {
  // Permite letras, números, espaços e pontuação básica
  const safeRegex = /^[a-zA-Z0-9\s.,!?@#$%&*()\-_+=\[\]{};:'"/\\|<>àáâãäåèéêëìíîïòóôõöùúûüçñÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÇÑ]*$/;
  return safeRegex.test(input);
}

/**
 * Remove caracteres perigosos de SQL (camada extra além do ORM)
 */
export function sanitizeForSQL(input: string): string {
  return input
    .replace(/['";]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '');
}

/**
 * Valida ID numérico
 */
export function isValidId(id: any): boolean {
  const numId = Number(id);
  return Number.isInteger(numId) && numId > 0;
}

/**
 * Valida array de IDs
 */
export function isValidIdArray(ids: any[]): boolean {
  return Array.isArray(ids) && ids.every(isValidId) && ids.length > 0 && ids.length <= 100;
}
