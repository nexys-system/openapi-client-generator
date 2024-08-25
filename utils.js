"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pre = void 0;
exports.pre = `
const genericJSONRequest = async (
  url: string,
  method: string,
  {
    data,
    query,
  }: Partial<{
    data: { [k: string]: any };
    query: { [k: string]: string };
  }> = {}
) => {
  const body = data ? JSON.stringify(data) : undefined;
  const queryString = query
    ? "?" +
      Object.entries(query)
        .map(([k, v]) => [k, encodeURIComponent(v)].join("="))
        .join("&")
    : "";
  const response = await fetch(url + queryString, {
    method,
    headers: { "Content-Type": "application/json" },
    body,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
};

const host = "";
`;
