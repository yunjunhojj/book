export async function measure<T>(label: string, task: () => T | Promise<T>) {
  const start = performance.now();
  const result = await task();
  const end = performance.now();

  return {
    label,
    duration: end - start,
    result,
  };
}
