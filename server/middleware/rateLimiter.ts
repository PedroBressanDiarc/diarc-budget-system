import rateLimit from 'express-rate-limit';

/**
 * Rate limiter para tentativas de login
 * Limita a 5 tentativas a cada 15 minutos por IP
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: {
    error: 'Muitas tentativas de login. Por favor, tente novamente em 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true, // Retorna info de rate limit nos headers `RateLimit-*`
  legacyHeaders: false, // Desabilita headers `X-RateLimit-*`
  skipSuccessfulRequests: false, // Conta tentativas bem-sucedidas também
  skipFailedRequests: false, // Conta tentativas falhas
});

/**
 * Rate limiter para APIs gerais
 * Limita a 100 requisições a cada 15 minutos por IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições
  message: {
    error: 'Muitas requisições. Por favor, tente novamente mais tarde.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter para endpoints públicos (cotações)
 * Limita a 10 acessos a cada 15 minutos por IP
 */
export const publicQuotationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 acessos
  message: {
    error: 'Muitas tentativas de acesso. Por favor, tente novamente em 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Usar token como chave em vez de IP (mais preciso)
  keyGenerator: (req) => {
    return req.params.token || req.ip || 'unknown';
  },
});

/**
 * Rate limiter para criação de recursos
 * Limita a 20 criações a cada hora por usuário
 */
export const createResourceLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // 20 criações
  message: {
    error: 'Muitas criações em pouco tempo. Por favor, aguarde antes de criar mais recursos.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter para upload de arquivos
 * Limita a 30 uploads a cada hora por IP
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 30, // 30 uploads
  message: {
    error: 'Muitos uploads em pouco tempo. Por favor, aguarde antes de fazer mais uploads.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter estrito para ações sensíveis
 * Limita a 3 ações a cada 5 minutos por IP
 */
export const strictLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 3, // 3 ações
  message: {
    error: 'Ação bloqueada temporariamente por segurança. Tente novamente em 5 minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
