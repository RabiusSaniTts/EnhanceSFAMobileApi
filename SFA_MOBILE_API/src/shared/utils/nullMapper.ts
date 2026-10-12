export function emptyStringToNull(value: unknown): unknown {
  return value === '' ? null : value;
}

export function nullToEmptyString(value: unknown): unknown {
  return value === null || value === undefined ? '' : value;
}
