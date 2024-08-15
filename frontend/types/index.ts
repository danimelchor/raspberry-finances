export interface User {
  username: string;
  email?: string;
}

export type DisplayType = "line" | "bar" | "pie" | "table";

export type Query = {
  id?: number;
  sql: string;
  updated_at?: string;
  pinned?: boolean;
  title?: string;
  display_type: DisplayType;
};
