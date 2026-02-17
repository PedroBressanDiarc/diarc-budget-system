import { TRPCError } from '@trpc/server';

/**
 * Rate limiter simples em memória para endpoints tRPC
 * Em produção, usar Redis para persistência entre restarts
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Limpa entradas expiradas periodicamente (a cada 5 minutos)
 */
setInterval(() => {
  const now = Date.now();
  // @ts-ignore
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): void {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    // Nova janela de tempo
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return;
  }

  if (entry.count >= maxRequests) {
    const resetInSeconds = Math.ceil((entry.resetTime - now) / 1000);
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: `Muitas requisições. Tente novamente em ${resetInSeconds} segundos.`,
    });
  }

  entry.count++;
}

/**
 * Middleware para rate limiting de endpoints públicos de cotação
 */
export function publicQuotationRateLimit(token: string): void {
  // 10 requisições a cada 15 minutos por token
  checkRateLimit(`quotation:${token}`, 10, 15 * 60 * 1000);
}

/**
 * Middleware para rate limiting de submissão de cotação
 */
export function submitQuotationRateLimit(token: string): void {
  // 5 submissões a cada 15 minutos por token
  checkRateLimit(`submit:${token}`, 5, 15 * 60 * 1000);
}
