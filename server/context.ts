import type { Request, Response } from "express";
import { verifyToken } from "./auth";
import { getUserById } from "./db";
import type { User } from "../drizzle/schema";

export type AppContext = {
  req: Request;
  res: Response;
  user: User | null;
};

export async function createContext({ req, res }: { req: Request; res: Response }): Promise<AppContext> {
  // Tentar obter token do cookie ou header Authorization
  const token = req.cookies?.auth_token || req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return { req, res, user: null };
  }

  try {
    const payload = await verifyToken(token);
    
    if (!payload) {
      return { req, res, user: null };
    }

    const user = await getUserById(payload.userId);

    if (!user || !user.isActive) {
      return { req, res, user: null };
    }

    return { req, res, user };
  } catch (error) {
    console.error("[Context] Error verifying token:", error);
    return { req, res, user: null };
  }
}
