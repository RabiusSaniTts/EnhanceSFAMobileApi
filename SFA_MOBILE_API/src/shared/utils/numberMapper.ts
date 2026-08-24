export function toLegacyNumber(value: unknown): number {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? 0 : numberValue;
}
