import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMockContext(user: AuthenticatedUser | null = null): { ctx: TrpcContext; cookies: Map<string, string> } {
  const cookies = new Map<string, string>();

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
      cookies: Object.fromEntries(cookies),
    } as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string) => {
        cookies.set(name, value);
      },
      clearCookie: (name: string) => {
        cookies.delete(name);
      },
    } as TrpcContext["res"],
  };

  return { ctx, cookies };
}

function createDirectorContext(): { ctx: TrpcContext; cookies: Map<string, string> } {
  const director: AuthenticatedUser = {
    id: 1,
    email: "admin@diarc.com.br",
    name: "Administrador Diarc",
    role: "director",
    isActive: 1,
    passwordHash: "$2b$10$test",
    username: "admin",
    loginMethod: "local",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return createMockContext(director);
}

describe("auth.login", () => {
  it("should successfully login with correct credentials", async () => {
    const { ctx, cookies } = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.login({
      email: "admin@diarc.com.br",
      password: "Admin@123",
    });

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user?.email).toBe("admin@diarc.com.br");
    expect(result.user?.role).toBe("director");
    expect(cookies.has("auth_token")).toBe(true);
  });

  it("should fail login with incorrect password", async () => {
    const { ctx } = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.login({
        email: "admin@diarc.com.br",
        password: "WrongPassword",
      })
    ).rejects.toThrow();
  });

  it("should fail login with non-existent user", async () => {
    const { ctx } = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.login({
        email: "nonexistent@example.com",
        password: "anypassword",
      })
    ).rejects.toThrow();
  });
});

describe("auth.logout", () => {
  it("should clear auth cookie on logout", async () => {
    const { ctx, cookies } = createDirectorContext();
    cookies.set("auth_token", "fake-token");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result.success).toBe(true);
    expect(cookies.has("auth_token")).toBe(false);
  });
});

describe("auth.me", () => {
  it("should return current user when authenticated", async () => {
    const { ctx } = createDirectorContext();
    const caller = appRouter.createCaller(ctx);

    const user = await caller.auth.me();

    expect(user).toBeDefined();
    expect(user?.email).toBe("admin@diarc.com.br");
    expect(user?.role).toBe("director");
  });

  it("should return null when not authenticated", async () => {
    const { ctx } = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const user = await caller.auth.me();

    expect(user).toBeNull();
  });
});
