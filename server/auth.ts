import bcrypt from "bcrypt";
import { SignJWT, jwtVerify } from "jose";
import { getUserByEmail, updateUserLastSignIn } from "./db";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default-secret-change-in-production");
const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function generateToken(userId: number, email: string, role: string): Promise<string> {
  const token = await new SignJWT({ userId, email, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // Token válido por 7 dias
    .sign(JWT_SECRET);
  
  return token;
}

export async function verifyToken(token: string): Promise<{ userId: number; email: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as number,
      email: payload.email as string,
      role: payload.role as string,
    };
  } catch (error) {
    console.error("[Auth] Token verification failed:", error);
    return null;
  }
}

export async function authenticateUser(email: string, password: string) {
  const user = await getUserByEmail(email);
  
  if (!user) {
    return { success: false, error: "Usuário não encontrado" };
  }

  if (!user.isActive) {
    return { success: false, error: "Usuário inativo" };
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  
  if (!isPasswordValid) {
    return { success: false, error: "Senha incorreta" };
  }

  // Atualizar último login
  await updateUserLastSignIn(user.id);

  // Gerar token JWT
  const token = await generateToken(user.id, user.email, user.role);

  return {
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}
