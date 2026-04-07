const projectRef = new URL(
  import.meta.env.VITE_SUPABASE_URL ?? "https://aylkfgmvncucsojrclbj.supabase.co"
).hostname.split(".")[0];

const authStoragePrefix = `sb-${projectRef}-auth-token`;

export const clearStoredAuthSession = () => {
  if (typeof window === "undefined") return;

  const keysToRemove: string[] = [];

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);

    if (key?.startsWith(authStoragePrefix)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => window.localStorage.removeItem(key));
};

export const isAuthNetworkError = (error: unknown) =>
  error instanceof TypeError && error.message === "Failed to fetch";

export const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage = "Tempo limite excedido."
) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
};
