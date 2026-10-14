export function required(value: unknown): string | number {
  const result = nullable(value);

  if (result === null) {
    return 0;
  }

  return result;
}

export function nullable(value: unknown): string | number | null {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    return value === '' ? null : value;
  }

  return null;
}
