interface SessionData {
  userId: string;
  email: string;
  loginTime: number;
  expiresAt: number;
  sessionId: string;
}

const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours
const SESSION_KEY = 'app_session';

export const createSession = (userId: string, email: string): string => {
  const sessionId = generateSessionId();
  const now = Date.now();
  const sessionData: SessionData = {
    userId,
    email,
    loginTime: now,
    expiresAt: now + SESSION_DURATION,
    sessionId
  };
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  return sessionId;
};

export const validateSession = (): SessionData | null => {
  const sessionStr = localStorage.getItem(SESSION_KEY);
  if (!sessionStr) return null;
  
  try {
    const session: SessionData = JSON.parse(sessionStr);
    if (Date.now() > session.expiresAt) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    clearSession();
    return null;
  }
};

export const refreshSession = (): boolean => {
  const session = validateSession();
  if (!session) return false;
  
  session.expiresAt = Date.now() + SESSION_DURATION;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return true;
};

export const clearSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

const generateSessionId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};