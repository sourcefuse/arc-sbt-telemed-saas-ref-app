export function getAssetSource(path: string) {
  if (path === undefined) {
    throw new Error('Path is missing');
  }
  let prefix = process.env.NEXT_PUBLIC_CDN_DOMAIN;
  if (!prefix) {
    throw new Error('NEXT_PUBLIC_CDN_DOMAIN is missing in env');
  }

  if (!prefix.endsWith('/')) {
    prefix += '/';
  }

  if (path.startsWith('/')) {
    path = path.slice(1);
  }

  return prefix.concat(path);
}
