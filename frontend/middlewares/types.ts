import { NextMiddleware } from "next/server";

export type MiddlewareFactory = {
  path: string;
  middleware: NextMiddleware;
};
