export function parseLegacyPathParams(path: string): Record<string, string> {
  const parts = path.split('/').filter(Boolean);
  const params: Record<string, string> = {};

  for (let index = 0; index < parts.length - 1; index += 2) {
    params[parts[index]] = decodeURIComponent(parts[index + 1]);
  }

  return params;
}
