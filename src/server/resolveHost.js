export const resolveHost = host => {
  if (!host) return "en";
  if (host.includes("de")) return "de";
  else if (host.includes("tr")) return "tr";
  return "en";
};
