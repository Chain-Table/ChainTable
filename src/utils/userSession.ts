// Utilidad para manejar sesión de usuario EVM
// Rehydrate from localStorage so session survives page reloads
let userSession: { id: string; username: string; walletAddress: string } | null = null;
try {
  const raw = typeof window !== 'undefined' ? localStorage.getItem('userSession') : null;
  if (raw) {
    userSession = JSON.parse(raw);
  }
} catch {
  // ignore parse errors
  userSession = null;
}

// Crear sesión: con alias (wallet opcional) o con la wallet como nombre
export function createUserSession(username: string, walletAddress = ''): { id: string; username: string; walletAddress: string } {
  if (!username) {
    throw new Error('Elegí un alias o conectá tu wallet');
  }
  // Persistencia de userId
  let uniqueId = localStorage.getItem('userId');
  if (!uniqueId) {
    uniqueId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('userId', uniqueId);
  }
  userSession = { id: uniqueId, username, walletAddress };
  try {
    localStorage.setItem('userSession', JSON.stringify(userSession));
  } catch { /* ignore */ }
  return userSession;
}

// Vincular (o cambiar) la wallet de la sesión; si el nombre era la wallet vieja, se actualiza también
export function setSessionWallet(walletAddress: string) {
  const s = getUserSession();
  if (!s || s.walletAddress === walletAddress) return;
  createUserSession(!s.username || s.username === s.walletAddress ? walletAddress : s.username, walletAddress);
}

// Obtener sesión actual (no crear una nueva automáticamente para EVM-only)
export function getUserSession(): { id: string; username: string; walletAddress: string } | null {
  // If in-memory session is missing, attempt to rehydrate from localStorage
  if (!userSession) {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('userSession') : null;
      if (raw) {
        userSession = JSON.parse(raw);
      }
    } catch {
      userSession = null;
    }
  }
  return userSession;
}

// Limpiar sesión actual
export function clearUserSession(): void {
  userSession = null;
  try {
    localStorage.removeItem('userSession');
  } catch { /* ignore */ }
}

// Funciones de conveniencia
export const getUserId = () => getUserSession()?.id || '';
export const getUserName = () => getUserSession()?.username || '';
export const getWalletAddress = () => getUserSession()?.walletAddress || '';