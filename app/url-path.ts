export function normalizePathname(pathname: string) {
  return "/" + pathname.replace(/^\/+|\/+$/g, "");
}

export function canonicalPath(pathname: string) {
  const path = normalizePathname(pathname);
  return path === "/" ? path : path + "/";
}
