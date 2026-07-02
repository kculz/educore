export function optionalText(value: string | null | undefined) {
  if (value === null || value === undefined) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function requiredText(value: string | null | undefined, message: string) {
  const trimmed = optionalText(value);
  if (!trimmed) {
    throw new Error(message);
  }

  return trimmed;
}

export function hasAnyText(values: Array<string | null | undefined>) {
  return values.some((value) => optionalText(value) !== undefined);
}

export function parsePositiveInteger(value: string | null | undefined, message: string) {
  const trimmed = optionalText(value);
  if (!trimmed) {
    throw new Error(message);
  }

  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(message);
  }

  return parsed;
}
