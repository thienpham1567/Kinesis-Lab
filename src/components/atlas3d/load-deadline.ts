/** End a stalled load so the UI can offer retry; settled loads release the timer. */
export async function withLoadDeadline<T>(
  operation: Promise<T>,
  milliseconds: number,
  onExpire: () => void,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          try {
            onExpire();
          } finally {
            reject(new Error("Anatomy loading timed out"));
          }
        }, milliseconds);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
