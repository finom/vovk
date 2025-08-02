/*
Function "multitenant" accepts an object with "requestUrl", "requestHost", "targetHost" and "overrides" properties.
The requestHost parameter comes from request headers and should be used instead of the hostname in the requestUrl.
The keys in overrides are subdomains relative to the "targetHost". They can include a dot to indicate lower-level 
subdomains, and can use square brackets to indicate wildcard values. The values are arrays of objects with "from" 
and "to" properties, which are strings indicating the override paths for Next.js. 

If a path matches a specific subdomain name (e.g., "/admin" matches the "admin" subdomain), 
the request will be redirected to that specific subdomain instead of being processed on the current subdomain.

If a path ends with "_schema_", it will not be processed by any overrides and will be passed through as-is.

Example:

const { action, destination, message, subdomains } = multitenant({
  requestUrl: request.url,
  requestHost: request.headers.get('host'),
  targetHost: "localhost:3000",
  overrides: {
    "[customer_name].customer": [
      { from: "api", to: "api/customer" }, // API
      { from: "", to: "[customer_name]" } // UI
    ],
    "pro.[customer_name].customer": [
        { from: "api", to: "api/customer/pro" }, // API
        { from: "", to: "pro/[customer_name]" } // UI
    ],
    "admin": [
      { from: "api", to: "api/admin" }, // API
      { from: "", to: "admin" } // UI
    ],
  },
});

subdomains is a Record<string, string> | null where keys are subdomain names and values are their corresponding values. If non-wildcard subdomains are used, should be equal to null.
action is one of "rewrite", "redirect", "notfound", or null.
message is a string describing the action taken
destination is a string URL to redirect or rewrite to, or null if no action is taken or "notfound"
*/

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

/**
 * Convert a pattern with [placeholders] to a regex pattern and extract placeholder names
 */
const patternToRegex = (pattern: string): { regex: RegExp; paramNames: string[] } => {
  const paramNames: string[] = [];
  const regexPattern = pattern
    .replace(/\[([^\]]+)\]/g, (_, name) => {
      paramNames.push(name);
      return '([^.]+)';
    })
    .replace(/\./g, '\\.'); // Escape dots in the pattern

  return {
    regex: new RegExp(`^${regexPattern}$`),
    paramNames,
  };
};

export function multitenant(config: Config) {
  const { requestUrl, requestHost, targetHost, overrides } = config;

  // Parse the URL
  const urlObj = new URL(requestUrl);
  const pathname = urlObj.pathname.slice(1); // Remove leading slash

  // Skip processing for paths ending with "_schema_"
  if (pathname.endsWith('_schema_')) {
    return {
      action: null,
      destination: null,
      message: 'Schema endpoint, bypassing overrides',
      subdomains: null,
    };
  }

  const pathSegments = pathname.split('/').filter(Boolean);

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
        action: 'redirect',
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
        if (pathname === rule.from || pathname.startsWith(`${rule.from}/`)) {
          // Replace path with the destination
          let destination = pathname.replace(rule.from, rule.to);

          // Replace any dynamic parameters in destination
          if (Object.keys(params).length > 0) {
            Object.entries(params).forEach(([key, value]) => {
              destination = destination.replace(`[${key}]`, value);
            });
          }

          // Only return non-null subdomains if we have wildcard parameters
          const wildcardSubdomains = paramNames.length > 0 ? params : null;

          return {
            action: 'rewrite',
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
      action: 'redirect',
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
