export function toLegacyDateString(value: Date | string | null | undefined): string {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  return value.toISOString().slice(0, 19).replace('T', ' ');
}
