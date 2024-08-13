import { NextMiddleware, NextResponse } from "next/server";
import { MiddlewareFactory } from "./types";

export function chain(
  middlewares: MiddlewareFactory[],
  index: number = 0,
): NextMiddleware {
  if (index >= middlewares.length) {
    return () => NextResponse.next();
  }

  return (req, _event) => {
    const { path, middleware } = middlewares[index];
    const { pathname } = req.nextUrl;

    if (pathname.match(path)) {
      const res = middleware(req, _event);
      if (res) {
        return res;
      }
    }
    return chain(middlewares, index + 1)(req, _event);
  };
}
