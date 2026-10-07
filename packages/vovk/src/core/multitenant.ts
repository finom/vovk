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

// every other character of a pattern or the target host is literal, as "+" or "*"
const patternToRegex = (pattern: string): { regex: RegExp; paramNames: string[] } => {
  const paramNames: string[] = [];
  const regexPattern = pattern.replace(/\[([^\]]+)\]|[.*+?^${}()|[\]\\]/g, (match, name?: string) => {
    if (name === undefined) return `\\${match}`;
    paramNames.push(name);
    return DNS_LABEL;
  });

  return {
    regex: new RegExp(`^${regexPattern}$`),
    paramNames,
  };
};

// "localhost:3000" is "localhost" and "3000"; an IPv6 host is in brackets, as "[::1]:3000"
const splitPort = (host: string) => {
  const [, hostname, port] = /^(.*?)(?::(\d+))?$/.exec(host) ?? [];
  return { hostname: hostname ?? host, port };
};

// Next.js decodes a path segment before it routes it, so "%61dmin" reaches the admin folder
const decodeSegment = (segment: string) => {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
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
  const decodedSegments = pathSegments.map(decodeSegment);
  // a target host without a port matches the request host on any port, and a redirect keeps the request's port
  const { port: targetPort } = splitPort(targetHost);
  const { hostname: requestHostname, port: requestPort } = splitPort(requestHost);
  const hostToMatch = targetPort === undefined ? requestHostname : requestHost;

  // the dev CLI reads a segment's _schema_ endpoint
  if (decodedSegments.at(-1) === '_schema_') {
    return {
      action: null,
      destination: null,
      message: 'Schema endpoint, bypassing overrides',
      subdomains: null,
    };
  }

  const reservedPaths = getReservedPaths(overrides);

  for (let i = 0; i < pathSegments.length; i++) {
    const segment = decodedSegments[i];
    if (reservedPaths.includes(segment)) {
      const destinationHost = `${segment}.${targetHost}`;

      const beforeSegments = pathSegments.slice(0, i);
      const afterSegments = pathSegments.slice(i + 1);

      const newPath = [...beforeSegments, ...afterSegments].join('/');

      const destinationUrl = new URL(`${urlObj.protocol}//${destinationHost}`);
      if (targetPort === undefined && requestPort) destinationUrl.port = requestPort;
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

  // the path as sent, empty parts and a trailing slash included
  const pathParts = pathname.split('/');
  const decodedParts = pathParts.map(decodeSegment);

  for (const pattern in overrides) {
    const fullPattern = `${pattern}.${targetHost}`;
    const { regex, paramNames } = patternToRegex(fullPattern);
    const match = hostToMatch.match(regex);

    if (match) {
      const overrideRules = overrides[pattern];

      const params: Record<string, string> = {};
      if (match.length > 1) {
        for (let i = 0; i < paramNames.length; i++) {
          params[paramNames[i]] = match[i + 1];
        }
      }

      for (const rule of overrideRules) {
        // from is a path prefix, so "" matches every path; it is compared with the decoded path, as Next.js routes it
        const fromParts = rule.from.split('/');
        if (rule.from === '' || fromParts.every((part, i) => decodedParts[i] === part)) {
          const restPath = rule.from === '' ? pathname : pathParts.slice(fromParts.length).join('/');
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

  return {
    action: null,
    destination: null,
    message: 'No action',
    subdomains: null,
  };
}
