type Override = {
  from: string;
  to: string;
};

type Config = {
  requestUrl: string;
  requestHost: string;
  targetHost: string;
  overrides: {
    [key: string]: Override[];
  };
};

const getReservedPaths = (overrides: Config['overrides']): string[] => {
  return Object.keys(overrides).filter((key) => !key.includes('[') && !key.includes(']')); // Filter out dynamic paths
};

// a placeholder takes one DNS label, which can't hold "..", "/", "?" or "#" to leave the rewrite path
const DNS_LABEL = '([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)';

const patternToRegex = (pattern: string): { regex: RegExp; paramNames: string[] } => {
  const paramNames: string[] = [];
  const regexPattern = pattern
    .replace(/\[([^\]]+)\]/g, (_, name) => {
      paramNames.push(name);
      return DNS_LABEL;
    })
    .replace(/\./g, '\\.');

  return {
    regex: new RegExp(`^${regexPattern}$`),
    paramNames,
  };
};

/**
 * Multitenant function to handle subdomain and path-based routing overrides.
 * @see https://vovk.dev/multitenant
 */
export function multitenant(config: Config) {
  const { requestUrl, overrides } = config;
  // host names are case-insensitive
  const requestHost = config.requestHost.toLowerCase();
  const targetHost = config.targetHost.toLowerCase();

  const urlObj = new URL(requestUrl);
  const pathname = urlObj.pathname.slice(1);
  const pathSegments = pathname.split('/').filter(Boolean);

  // the dev CLI reads a segment's _schema_ endpoint
  if (pathSegments.at(-1) === '_schema_') {
    return {
      action: null,
      destination: null,
      message: 'Schema endpoint, bypassing overrides',
      subdomains: null,
    };
  }

  const reservedPaths = getReservedPaths(overrides);

  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i];
    if (reservedPaths.includes(segment)) {
      const destinationHost = `${segment}.${targetHost}`;

      const beforeSegments = pathSegments.slice(0, i);
      const afterSegments = pathSegments.slice(i + 1);

      const newPath = [...beforeSegments, ...afterSegments].join('/');

      const destinationUrl = new URL(`${urlObj.protocol}//${destinationHost}`);
      if (newPath) {
        destinationUrl.pathname = `/${newPath}`;
      }

      destinationUrl.search = urlObj.search;

      return {
        action: 'redirect' as const,
        destination: destinationUrl.toString(),
        message: `Redirecting to ${segment} subdomain`,
        subdomains: null,
      };
    }
  }

  for (const pattern in overrides) {
    const fullPattern = `${pattern}.${targetHost}`;
    const { regex, paramNames } = patternToRegex(fullPattern);
    const match = requestHost.match(regex);

    if (match) {
      const overrideRules = overrides[pattern];

      const params: Record<string, string> = {};
      if (match.length > 1) {
        for (let i = 0; i < paramNames.length; i++) {
          params[paramNames[i]] = match[i + 1];
        }
      }

      for (const rule of overrideRules) {
        // from is a path prefix, so "" matches every path
        if (rule.from === '' || pathname === rule.from || pathname.startsWith(`${rule.from}/`)) {
          const restPath = pathname.slice(rule.from.length).replace(/^\//, '');
          // the placeholders of the target path, a [name] in the request path stays as it is
          const to = Object.entries(params).reduce(
            (path, [key, value]) => path.replaceAll(`[${key}]`, encodeURIComponent(value)),
            rule.to
          );
          const destination = [to, restPath].filter(Boolean).join('/');

          const wildcardSubdomains = paramNames.length > 0 ? params : null;

          return {
            action: 'rewrite' as const,
            destination: `${urlObj.protocol}//${urlObj.host}/${destination}${urlObj.search}`,
            message: `Rewriting to ${destination}`,
            subdomains: wildcardSubdomains,
          };
        }
      }
    }
  }

  if (pathSegments.length > 0 && reservedPaths.includes(pathSegments[0])) {
    const reservedPath = pathSegments[0];
    const restPath = pathSegments.slice(1).join('/');

    const destinationHost = `${reservedPath}.${targetHost}`;
    const destinationUrl = new URL(`${urlObj.protocol}//${destinationHost}`);

    if (restPath) {
      destinationUrl.pathname = `/${restPath}`;
    }

    destinationUrl.search = urlObj.search;

    return {
      action: 'redirect' as const,
      destination: destinationUrl.toString(),
      message: `Redirecting to ${reservedPath} subdomain`,
      subdomains: null,
    };
  }

  return {
    action: null,
    destination: null,
    message: 'No action',
    subdomains: null,
  };
}
