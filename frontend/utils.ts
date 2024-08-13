import { cookies } from "next/headers";

export async function fetchWithCookies(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  let reqCookies = cookies();
  let cookiesString = "";
  for (const cookie of reqCookies.getAll()) {
    cookiesString += `${cookie.name}=${cookie.value}; `;
  }

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Cookie: cookiesString,
    },
  });
}
