export type ValidationRule<T> = (
  value: T | null | undefined
) => boolean | string;

export function numberInRange(
  min = Number.NEGATIVE_INFINITY,
  max = Number.POSITIVE_INFINITY,
  minInclusive = true,
  maxInclusive = true
): ValidationRule<number> {
  return (value) => {
    // If we don't have a value, don't validate
    if (value === null || value === undefined) {
      return true;
    }

    if (value <= min) {
      return minInclusive ? value === min : "Invalid, too small";
    }

    if (value >= max) {
      return maxInclusive ? value === max : "Invalid, too big";
    }

    return true;
  };
}
