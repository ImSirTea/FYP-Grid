export function hasAllProperties(option: Record<string, any>) {
  return Object.entries(option).every(
    ([key, value]) => typeof value !== "undefined"
  );
}
