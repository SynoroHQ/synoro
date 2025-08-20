import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@synoro/auth";

const base = toNextJsHandler(auth.handler);

const allowedOrigins = [process.env.APP_URL, process.env.WEB_APP_URL]
  .filter(Boolean)
  .map((u) => {
    try {
      return new URL(u as string).origin;
    } catch {
      return undefined;
    }
  })
  .filter(Boolean) as string[];

function getReqOrigin(req: Request): string | undefined {
  const origin = req.headers.get("origin");
  if (origin) return origin;
  const referer = req.headers.get("referer");
  if (!referer) return undefined;
  try {
    return new URL(referer).origin;
  } catch {
    return undefined;
  }
}

function applyCors(req: Request, res: Response): Response {
  const origin = getReqOrigin(req);
  if (origin && allowedOrigins.includes(origin)) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Vary", "Origin");
    res.headers.set("Access-Control-Allow-Credentials", "true");
    res.headers.set("Access-Control-Expose-Headers", "Set-Cookie");
  }
  return res;
}

export const GET = async (req: Request, ctx: unknown) => {
  const res = await base.GET(req as any, ctx as any);
  return applyCors(req, res);
};

export const POST = async (req: Request, ctx: unknown) => {
  const res = await base.POST(req as any, ctx as any);
  return applyCors(req, res);
};

export const OPTIONS = (req: Request) => {
  const origin = getReqOrigin(req);
  const headers = new Headers();
  if (origin && allowedOrigins.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
    headers.set("Access-Control-Allow-Credentials", "true");
  }
  headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With",
  );
  headers.set("Access-Control-Max-Age", "86400");
  return new Response(null, { status: 204, headers });
};
