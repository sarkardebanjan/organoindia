export const decodeJwt = (token) => {
  if (!token) return null;
  try {
    const [, payload] = token.split('.');
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(normalized));
  } catch {
    return null;
  }
};

export const extractRoles = (tokenOrPayload) => {
  const payload =
    typeof tokenOrPayload === 'string' ? decodeJwt(tokenOrPayload) : tokenOrPayload;
  const roles = payload?.roles ?? payload?.authorities ?? payload?.scope ?? [];
  if (Array.isArray(roles)) {
    return roles.map((role) => (typeof role === 'string' ? role : role.authority));
  }
  return String(roles)
    .split(' ')
    .filter(Boolean);
};

export const hasAdminRole = (tokenOrPayload) =>
  extractRoles(tokenOrPayload).includes('ROLE_ADMIN');
