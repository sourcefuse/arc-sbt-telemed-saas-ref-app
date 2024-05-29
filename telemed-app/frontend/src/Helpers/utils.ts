export const getValue = (obj: any, key: string): any => {
  return key
    .replace(/\[([^\]]+)]/g, ".$1")
    .split(".")
    .reduce(function (o: { [x: string]: any }, p: string | number) {
      return o?.[p] || "";
    }, obj);
};

export const getTenantSlug = () => {
  const subdomain = window.location.host.split(".")[0];
  let tenantSlug = subdomain;
  if (subdomain.includes("localhost") || subdomain === "app") {
    tenantSlug = "pooled";
  }
  return tenantSlug;
};

window.location.host.split(".")[0];
