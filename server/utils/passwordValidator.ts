/**
 * Validador de senhas fortes
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Valida se a senha atende aos requisitos de segurança
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  // Mínimo 8 caracteres
  if (password.length < 8) {
    errors.push('A senha deve ter no mínimo 8 caracteres');
  }

  // Máximo 128 caracteres (prevenir DoS)
  if (password.length > 128) {
    errors.push('A senha deve ter no máximo 128 caracteres');
  }

  // Pelo menos uma letra maiúscula
  if (!/[A-Z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra maiúscula');
  }

  // Pelo menos uma letra minúscula
  if (!/[a-z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra minúscula');
  }

  // Pelo menos um número
  if (!/[0-9]/.test(password)) {
    errors.push('A senha deve conter pelo menos um número');
  }

  // Pelo menos um caractere especial
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('A senha deve conter pelo menos um caractere especial (!@#$%^&* etc)');
  }

  // Não pode conter espaços
  if (/\s/.test(password)) {
    errors.push('A senha não pode conter espaços');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Verifica se a senha é comum/fraca (lista de senhas mais usadas)
 */
const commonPasswords = [
  '12345678',
  'password',
  'Password1',
  'Password123',
  '123456789',
  'qwerty123',
  'abc123456',
  'senha123',
  'Senha123',
  'admin123',
  'Admin123',
];

export function isCommonPassword(password: string): boolean {
  return commonPasswords.includes(password);
}

/**
 * Calcula força da senha (0-100)
 */
export function calculatePasswordStrength(password: string): number {
  let strength = 0;

  // Comprimento
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  if (password.length >= 16) strength += 10;

  // Variedade de caracteres
  if (/[a-z]/.test(password)) strength += 15;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 15;

  // Penalidades
  if (isCommonPassword(password)) strength -= 50;
  if (/(.)\1{2,}/.test(password)) strength -= 10; // Caracteres repetidos (aaa, 111)
  if (/^[0-9]+$/.test(password)) strength -= 20; // Apenas números
  if (/^[a-zA-Z]+$/.test(password)) strength -= 20; // Apenas letras

  return Math.max(0, Math.min(100, strength));
}

/**
 * Retorna feedback sobre a força da senha
 */
export function getPasswordStrengthFeedback(strength: number): {
  level: 'weak' | 'fair' | 'good' | 'strong';
  message: string;
  color: string;
} {
  if (strength < 40) {
    return {
      level: 'weak',
      message: 'Senha fraca - Adicione mais caracteres e variedade',
      color: 'red'
    };
  } else if (strength < 60) {
    return {
      level: 'fair',
      message: 'Senha razoável - Pode melhorar',
      color: 'orange'
    };
  } else if (strength < 80) {
    return {
      level: 'good',
      message: 'Senha boa',
      color: 'yellow'
    };
  } else {
    return {
      level: 'strong',
      message: 'Senha forte',
      color: 'green'
    };
  }
}
