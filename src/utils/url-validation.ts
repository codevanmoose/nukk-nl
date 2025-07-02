export function isValidNuUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname === 'www.nu.nl' || parsedUrl.hostname === 'nu.nl';
  } catch {
    return false;
  }
}

export function normalizeNuUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    // Ensure we always use www.nu.nl
    parsedUrl.hostname = 'www.nu.nl';
    return parsedUrl.toString();
  } catch {
    throw new Error('Invalid URL');
  }
}

export function extractNuPath(url: string): string {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
  } catch {
    throw new Error('Invalid URL');
  }
}