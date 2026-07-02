export function trimToUndefined(value: string | null | undefined) {
  if (value === null || value === undefined) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function trimToNull(value: string | null | undefined) {
  return trimToUndefined(value) ?? null;
}

export function hasText(...values: Array<string | null | undefined>) {
  return values.some((value) => trimToUndefined(value) !== undefined);
}

export function titleCase(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}
