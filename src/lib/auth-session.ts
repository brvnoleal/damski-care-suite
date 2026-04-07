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
