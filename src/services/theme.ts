// Theme Service: Standard Light Theme (Dark Mode Decommissioned)

const THEME_STORAGE_KEY = 'tatpar_dark_mode';

// Auto-cleanup any residual dark mode preference from client storage
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem(THEME_STORAGE_KEY);
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.classList.remove('dark-theme');
    }
  } catch (e) {}
}

export function getIsDarkMode(): boolean {
  return false;
}

export function setDarkMode(_enabled: boolean): void {
  // Dark mode disabled
}

export function useDarkMode(): [boolean, (val: boolean) => void] {
  return [false, () => {}];
}
