import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { verifyToken } from "../auth";
import { getUserById } from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Tentar obter token do cookie ou header Authorization
    const token = opts.req.cookies?.auth_token || opts.req.headers.authorization?.replace("Bearer ", "");

    if (token) {
      const payload = await verifyToken(token);
      
      if (payload) {
        const foundUser = await getUserById(payload.userId);
        
        if (foundUser && foundUser.isActive) {
          user = foundUser;
        }
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    console.error("[Context] Authentication error:", error);
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
