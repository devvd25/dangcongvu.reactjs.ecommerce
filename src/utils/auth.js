export const LocalStorageEventTarget = new EventTarget();

export const setRoleTokenToLS = (role) => {
  localStorage.setItem("role", role);
};
export const getRoleFromLS = () => {
  return localStorage.getItem("role") || "";
};

export const setTokenToLS = (token) => {
  localStorage.setItem("token", token);
};

export const getTokenFromLS = () => {
  return localStorage.getItem("token") || "";
};

export const clearLS = () => {
  localStorage.removeItem("role");
  localStorage.removeItem("profile");
  localStorage.removeItem("token");
  const clearLSEvent = new Event("clearLS");
  LocalStorageEventTarget.dispatchEvent(clearLSEvent);
};

export const getProfileFromLS = () => {
  const result = localStorage.getItem("profile");
  return result ? JSON.parse(result) : null;
};

export const setProfileToLS = (profile) => {
  localStorage.setItem("profile", JSON.stringify(profile));
};
