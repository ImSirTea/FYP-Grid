// Does not compare against an interface, only that all properties that exist are defined
export function hasAllProperties(option: Record<string, any>) {
  return Object.entries(option).every(
    ([key, value]) => typeof value !== "undefined"
  );
}
