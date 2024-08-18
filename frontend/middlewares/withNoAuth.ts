import { NextRequest, NextResponse } from "next/server";
import { fetchWithCookies } from "@/utils";
import { MiddlewareFactory } from "./types";

async function isAuthenticated(req: NextRequest) {
  if (!req.cookies.has("access_token_cookie")) {
    return false;
  }
  try {
    const res = await fetchWithCookies(process.env.AUTH_URL + "/whoami", {});
    if (res.status !== 200) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

async function notAuthMiddleware(req: NextRequest) {
  const isAuth = await isAuthenticated(req);
  if (isAuth) {
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const withNoAuth = {
  path: "^/login",
  middleware: notAuthMiddleware,
} as MiddlewareFactory;
