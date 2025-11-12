/**
 * Security Headers Configuration
 *
 * Implements security-related HTTP headers to protect against common web vulnerabilities.
 * Headers are applied globally via next.config.js or per-route in API handlers.
 *
 * References:
 * - OWASP Secure Headers Project: https://owasp.org/www-project-secure-headers/
 * - MDN Security Headers: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers
 *
 * Usage in next.config.js:
 * ```typescript
 * import { getSecurityHeaders } from './lib/security/headers';
 *
 * module.exports = {
 *   async headers() {
 *     return [
 *       {
 *         source: '/(.*)',
 *         headers: getSecurityHeaders(),
 *       },
 *     ];
 *   },
 * };
 * ```
 *
 * Usage in API routes:
 * ```typescript
 * import { applySecurityHeaders } from '@/lib/security/headers';
 *
 * export async function GET(req: Request) {
 *   const response = Response.json({ data: 'hello' });
 *   return applySecurityHeaders(response);
 * }
 * ```
 */

// ============================================================================
// Security Headers
// ============================================================================

/**
 * Content Security Policy (CSP)
 *
 * Prevents XSS attacks by controlling which resources can be loaded.
 * Customize based on your application's needs.
 */
export function getContentSecurityPolicy(
  options: {
    enableInlineScripts?: boolean;
    enableInlineStyles?: boolean;
    enableDataImages?: boolean;
  } = {}
): string {
  const {
    enableInlineScripts = true, // Next.js requires this
    enableInlineStyles = true, // Next.js requires this
    enableDataImages = true,
  } = options;

  const csp = [
    // Default fallback for all resource types
    "default-src 'self'",

    // Scripts
    [
      'script-src',
      "'self'",
      enableInlineScripts && "'unsafe-inline'", // Next.js requires for development
      enableInlineScripts && "'unsafe-eval'", // Next.js requires for development
      'https://vercel.live', // Vercel toolbar
      'https://va.vercel-scripts.com', // Vercel Analytics
    ]
      .filter(Boolean)
      .join(' '),

    // Styles
    [
      'style-src',
      "'self'",
      enableInlineStyles && "'unsafe-inline'", // Required for styled-jsx and Tailwind
      'https://fonts.googleapis.com',
    ]
      .filter(Boolean)
      .join(' '),

    // Images
    [
      'img-src',
      "'self'",
      enableDataImages && 'data:', // For base64 images
      'blob:', // For generated images
      'https:', // For external images (consider restricting)
    ]
      .filter(Boolean)
      .join(' '),

    // Fonts
    ["font-src 'self'", 'https://fonts.gstatic.com', 'data:'].join(' '),

    // AJAX, WebSockets, EventSource
    "connect-src 'self' https://vercel.live https://va.vercel-scripts.com https://*.google.com https://*.googleapis.com",

    // Frames
    "frame-src 'self' https://vercel.live",

    // Media
    "media-src 'self'",

    // Objects (Flash, Java, etc.)
    "object-src 'none'",

    // Base URI restriction
    "base-uri 'self'",

    // Form submission restriction
    "form-action 'self'",

    // Prevent framing (redundant with X-Frame-Options)
    "frame-ancestors 'none'",

    // Upgrade insecure requests (HTTP -> HTTPS)
    'upgrade-insecure-requests',

    // Disable dangerous features
    "worker-src 'self' blob:",
    "manifest-src 'self'",
  ];

  return csp.join('; ');
}

/**
 * Get all security headers
 *
 * @param options Configuration options
 * @returns Array of header objects for Next.js config
 */
export function getSecurityHeaders(
  options: {
    csp?: string | null;
    enableStrictTransportSecurity?: boolean;
    reportOnly?: boolean;
  } = {}
): Array<{ key: string; value: string }> {
  const {
    csp = getContentSecurityPolicy(),
    enableStrictTransportSecurity = true,
    reportOnly = false,
  } = options;

  const headers: Array<{ key: string; value: string }> = [
    /**
     * X-DNS-Prefetch-Control
     * Controls browser DNS prefetching (performance vs privacy trade-off)
     */
    {
      key: 'X-DNS-Prefetch-Control',
      value: 'on',
    },

    /**
     * X-Frame-Options
     * Prevents clickjacking by blocking iframe embedding
     * Values: DENY, SAMEORIGIN, ALLOW-FROM uri
     */
    {
      key: 'X-Frame-Options',
      value: 'DENY',
    },

    /**
     * X-Content-Type-Options
     * Prevents MIME-type sniffing
     * Forces browser to respect Content-Type header
     */
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff',
    },

    /**
     * X-XSS-Protection
     * Legacy XSS filter (deprecated in favor of CSP, but still useful)
     * Values: 0 (disable), 1 (enable), 1; mode=block
     */
    {
      key: 'X-XSS-Protection',
      value: '1; mode=block',
    },

    /**
     * Referrer-Policy
     * Controls how much referrer information is sent
     * Values: no-referrer, origin, strict-origin-when-cross-origin, etc.
     */
    {
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin',
    },

    /**
     * Permissions-Policy (formerly Feature-Policy)
     * Controls which browser features can be used
     * Format: feature=(origin1 origin2), feature=()
     */
    {
      key: 'Permissions-Policy',
      value: [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'interest-cohort=()', // Disable FLoC
        'payment=()',
        'usb=()',
        'magnetometer=()',
        'gyroscope=()',
        'accelerometer=()',
      ].join(', '),
    },
  ];

  /**
   * Strict-Transport-Security (HSTS)
   * Forces HTTPS connections
   * Note: Vercel automatically handles this, but we include it for completeness
   */
  if (enableStrictTransportSecurity && process.env.NODE_ENV === 'production') {
    headers.push({
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains; preload',
    });
  }

  /**
   * Content-Security-Policy
   * Most important security header - prevents XSS, injection attacks
   */
  if (csp) {
    headers.push({
      key: reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy',
      value: csp,
    });
  }

  return headers;
}

/**
 * Get security headers as object (for Response headers)
 */
export function getSecurityHeadersObject(options?: Parameters<typeof getSecurityHeaders>[0]): Record<string, string> {
  const headers = getSecurityHeaders(options);
  const obj: Record<string, string> = {};
  headers.forEach(({ key, value }) => {
    obj[key] = value;
  });
  return obj;
}

/**
 * Apply security headers to a Response object
 *
 * @example
 * ```typescript
 * export async function GET(req: Request) {
 *   const response = Response.json({ data: 'hello' });
 *   return applySecurityHeaders(response);
 * }
 * ```
 */
export function applySecurityHeaders(response: Response, options?: Parameters<typeof getSecurityHeaders>[0]): Response {
  const securityHeaders = getSecurityHeadersObject(options);
  const headers = new Headers(response.headers);

  Object.entries(securityHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Middleware wrapper to apply security headers to all responses
 *
 * @example
 * ```typescript
 * export const GET = withSecurityHeaders(async (req: Request) => {
 *   return Response.json({ data: 'hello' });
 * });
 * ```
 */
export function withSecurityHeaders(
  handler: (req: Request) => Promise<Response>,
  options?: Parameters<typeof getSecurityHeaders>[0]
) {
  return async (req: Request) => {
    const response = await handler(req);
    return applySecurityHeaders(response, options);
  };
}

// ============================================================================
// CORS Headers
// ============================================================================

/**
 * CORS configuration
 */
export interface CorsOptions {
  origin: string | string[] | '*';
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

/**
 * Default CORS options (restrictive)
 */
export const defaultCorsOptions: CorsOptions = {
  origin: [], // No origins allowed by default
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: [],
  credentials: true,
  maxAge: 86400, // 24 hours
};

/**
 * Check if origin is allowed
 */
function isOriginAllowed(origin: string, allowedOrigins: string | string[] | '*'): boolean {
  if (allowedOrigins === '*') {
    return true;
  }

  if (typeof allowedOrigins === 'string') {
    return origin === allowedOrigins;
  }

  return allowedOrigins.includes(origin);
}

/**
 * Get CORS headers for a request
 *
 * @example
 * ```typescript
 * export async function GET(req: Request) {
 *   const corsHeaders = getCorsHeaders(req, {
 *     origin: ['https://example.com', 'https://app.example.com'],
 *   });
 *
 *   if (!corsHeaders) {
 *     return new Response('Forbidden', { status: 403 });
 *   }
 *
 *   return Response.json({ data: 'hello' }, { headers: corsHeaders });
 * }
 * ```
 */
export function getCorsHeaders(req: Request, options: CorsOptions = defaultCorsOptions): Record<string, string> | null {
  const origin = req.headers.get('origin');

  // No origin header = not a CORS request
  if (!origin) {
    return {};
  }

  // Check if origin is allowed
  if (!isOriginAllowed(origin, options.origin)) {
    return null; // Origin not allowed
  }

  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': options.methods?.join(', ') || defaultCorsOptions.methods!.join(', '),
    'Access-Control-Allow-Headers': options.allowedHeaders?.join(', ') || defaultCorsOptions.allowedHeaders!.join(', '),
  };

  if (options.exposedHeaders && options.exposedHeaders.length > 0) {
    headers['Access-Control-Expose-Headers'] = options.exposedHeaders.join(', ');
  }

  if (options.credentials) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  if (options.maxAge) {
    headers['Access-Control-Max-Age'] = String(options.maxAge);
  }

  return headers;
}

/**
 * Handle CORS preflight request (OPTIONS)
 *
 * @example
 * ```typescript
 * export async function OPTIONS(req: Request) {
 *   return handleCors(req, {
 *     origin: ['https://example.com'],
 *   });
 * }
 * ```
 */
export function handleCors(req: Request, options: CorsOptions = defaultCorsOptions): Response {
  const corsHeaders = getCorsHeaders(req, options);

  if (!corsHeaders) {
    return new Response('Forbidden', { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * Middleware wrapper to handle CORS
 *
 * @example
 * ```typescript
 * export const GET = withCors(
 *   async (req: Request) => {
 *     return Response.json({ data: 'hello' });
 *   },
 *   {
 *     origin: ['https://example.com'],
 *   }
 * );
 *
 * export const OPTIONS = (req: Request) => handleCors(req, {
 *   origin: ['https://example.com'],
 * });
 * ```
 */
export function withCors(handler: (req: Request) => Promise<Response>, options: CorsOptions = defaultCorsOptions) {
  return async (req: Request) => {
    const corsHeaders = getCorsHeaders(req, options);

    if (!corsHeaders) {
      return new Response('Forbidden', { status: 403 });
    }

    const response = await handler(req);
    const headers = new Headers(response.headers);

    Object.entries(corsHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}

// ============================================================================
// Combined Middleware
// ============================================================================

/**
 * Apply both security headers and CORS
 *
 * @example
 * ```typescript
 * export const GET = withSecurityAndCors(
 *   async (req: Request) => {
 *     return Response.json({ data: 'hello' });
 *   },
 *   {
 *     cors: {
 *       origin: ['https://example.com'],
 *     },
 *   }
 * );
 * ```
 */
export function withSecurityAndCors(
  handler: (req: Request) => Promise<Response>,
  options: {
    security?: Parameters<typeof getSecurityHeaders>[0];
    cors?: CorsOptions;
  } = {}
) {
  return async (req: Request) => {
    // Check CORS
    if (options.cors) {
      const corsHeaders = getCorsHeaders(req, options.cors);
      if (!corsHeaders) {
        return new Response('Forbidden', { status: 403 });
      }
    }

    // Execute handler
    const response = await handler(req);

    // Apply headers
    let finalResponse = applySecurityHeaders(response, options.security);

    if (options.cors) {
      const corsHeaders = getCorsHeaders(req, options.cors);
      if (corsHeaders) {
        const headers = new Headers(finalResponse.headers);
        Object.entries(corsHeaders).forEach(([key, value]) => {
          headers.set(key, value);
        });
        finalResponse = new Response(finalResponse.body, {
          status: finalResponse.status,
          statusText: finalResponse.statusText,
          headers,
        });
      }
    }

    return finalResponse;
  };
}

// ============================================================================
// Next.js Config Helper
// ============================================================================

/**
 * Generate Next.js headers configuration
 *
 * Add this to next.config.js:
 * ```typescript
 * import { getNextConfigHeaders } from './lib/security/headers';
 *
 * module.exports = {
 *   async headers() {
 *     return getNextConfigHeaders();
 *   },
 * };
 * ```
 */
export function getNextConfigHeaders() {
  return [
    {
      // Apply security headers to all routes
      source: '/(.*)',
      headers: getSecurityHeaders(),
    },
    {
      // More restrictive CSP for API routes
      source: '/api/:path*',
      headers: getSecurityHeaders({
        csp: getContentSecurityPolicy({
          enableInlineScripts: false,
          enableInlineStyles: false,
        }),
      }),
    },
  ];
}

// ============================================================================
// Usage Examples
// ============================================================================

/**
 * Example 1: Apply security headers to API route
 *
 * ```typescript
 * import { applySecurityHeaders } from '@/lib/security/headers';
 *
 * export async function GET(req: Request) {
 *   const response = Response.json({ data: 'hello' });
 *   return applySecurityHeaders(response);
 * }
 * ```
 *
 * Example 2: Use middleware wrapper
 *
 * ```typescript
 * import { withSecurityHeaders } from '@/lib/security/headers';
 *
 * export const GET = withSecurityHeaders(async (req: Request) => {
 *   return Response.json({ data: 'hello' });
 * });
 * ```
 *
 * Example 3: CORS for public API
 *
 * ```typescript
 * import { withCors, handleCors } from '@/lib/security/headers';
 *
 * const corsOptions = {
 *   origin: ['https://example.com', 'https://app.example.com'],
 * };
 *
 * export const OPTIONS = (req: Request) => handleCors(req, corsOptions);
 *
 * export const GET = withCors(
 *   async (req: Request) => {
 *     return Response.json({ data: 'hello' });
 *   },
 *   corsOptions
 * );
 * ```
 *
 * Example 4: Combined security and CORS
 *
 * ```typescript
 * import { withSecurityAndCors } from '@/lib/security/headers';
 *
 * export const GET = withSecurityAndCors(
 *   async (req: Request) => {
 *     return Response.json({ data: 'hello' });
 *   },
 *   {
 *     cors: {
 *       origin: ['https://example.com'],
 *     },
 *   }
 * );
 * ```
 */
