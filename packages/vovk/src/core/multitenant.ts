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

// Get the reserved paths from the overrides configuration
const getReservedPaths = (overrides: Config['overrides']): string[] => {
  return Object.keys(overrides).filter((key) => !key.includes('[') && !key.includes(']')); // Filter out dynamic paths
};

// a placeholder takes one DNS label, which can't hold "..", "/", "?" or "#" to leave the rewrite path
const DNS_LABEL = '([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)';

/**
 * Convert a pattern with [placeholders] to a regex pattern and extract placeholder names
 */
const patternToRegex = (pattern: string): { regex: RegExp; paramNames: string[] } => {
  const paramNames: string[] = [];
  const regexPattern = pattern
    .replace(/\[([^\]]+)\]/g, (_, name) => {
      paramNames.push(name);
      return DNS_LABEL;
    })
    .replace(/\./g, '\\.'); // Escape dots in the pattern

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

  // Parse the URL
  const urlObj = new URL(requestUrl);
  const pathname = urlObj.pathname.slice(1); // Remove leading slash
  const pathSegments = pathname.split('/').filter(Boolean);

  // Skip processing for the schema endpoint of a segment, which the dev CLI reads
  if (pathSegments.at(-1) === '_schema_') {
    return {
      action: null,
      destination: null,
      message: 'Schema endpoint, bypassing overrides',
      subdomains: null,
    };
  }

  // Get reserved paths
  const reservedPaths = getReservedPaths(overrides);

  // Check if any path segment matches a reserved path (e.g., "admin")
  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i];
    if (reservedPaths.includes(segment)) {
      // Create the destination URL with the reserved path as subdomain
      const destinationHost = `${segment}.${targetHost}`;

      // Keep path segments before the reserved path
      const beforeSegments = pathSegments.slice(0, i);
      // Keep path segments after the reserved path
      const afterSegments = pathSegments.slice(i + 1);

      // Construct the new path
      const newPath = [...beforeSegments, ...afterSegments].join('/');

      const destinationUrl = new URL(`${urlObj.protocol}//${destinationHost}`);
      if (newPath) {
        destinationUrl.pathname = `/${newPath}`;
      }

      // Keep any query parameters
      destinationUrl.search = urlObj.search;

      return {
        action: 'redirect' as const,
        destination: destinationUrl.toString(),
        message: `Redirecting to ${segment} subdomain`,
        subdomains: null, // No wildcards used
      };
    }
  }

  // Process based on host and subdomains
  for (const pattern in overrides) {
    const fullPattern = `${pattern}.${targetHost}`;
    const { regex, paramNames } = patternToRegex(fullPattern);
    const match = requestHost.match(regex);

    if (match) {
      const overrideRules = overrides[pattern];

      // Extract parameters from the match
      const params: Record<string, string> = {};
      if (match.length > 1) {
        for (let i = 0; i < paramNames.length; i++) {
          params[paramNames[i]] = match[i + 1];
        }
      }

      // Find the appropriate rule based on the path
      for (const rule of overrideRules) {
        // from is a path prefix, so "" matches every path
        if (rule.from === '' || pathname === rule.from || pathname.startsWith(`${rule.from}/`)) {
          // Replace path with the destination
          const restPath = pathname.slice(rule.from.length).replace(/^\//, '');
          // the placeholders of the target path, a [name] in the request path stays as it is
          const to = Object.entries(params).reduce(
            (path, [key, value]) => path.replaceAll(`[${key}]`, encodeURIComponent(value)),
            rule.to
          );
          const destination = [to, restPath].filter(Boolean).join('/');

          // Only return non-null subdomains if we have wildcard parameters
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

  // Handle cases where a customer subdomain tries to access reserved paths
  if (pathSegments.length > 0 && reservedPaths.includes(pathSegments[0])) {
    const reservedPath = pathSegments[0];
    const restPath = pathSegments.slice(1).join('/');

    // Create the destination URL with the reserved path as subdomain
    const destinationHost = `${reservedPath}.${targetHost}`;
    const destinationUrl = new URL(`${urlObj.protocol}//${destinationHost}`);

    // Only add remaining path segments if they exist
    if (restPath) {
      destinationUrl.pathname = `/${restPath}`;
    }

    // Keep any query parameters
    destinationUrl.search = urlObj.search;

    return {
      action: 'redirect' as const,
      destination: destinationUrl.toString(),
      message: `Redirecting to ${reservedPath} subdomain`,
      subdomains: null, // No wildcards used for reserved paths
    };
  }

  // Default case - pass through
  return {
    action: null,
    destination: null,
    message: 'No action',
    subdomains: null, // No wildcards matched
  };
}
