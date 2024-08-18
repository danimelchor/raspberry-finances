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

function getLoginURL(req: NextRequest) {
  const { origin, pathname } = new URL(req.url);
  const loginURL = new URL("/login", origin);
  loginURL.searchParams.set("redirect", pathname);
  return loginURL.toString();
}

async function authMiddleware(req: NextRequest) {
  const isAuth = await isAuthenticated(req);
  if (!isAuth) {
    return NextResponse.redirect(getLoginURL(req));
  }
}

export const withAuth = {
  path: "^/((?!login|_next/static|_next/image|favicon.ico|api|register).*)",
  middleware: authMiddleware,
} as MiddlewareFactory;
