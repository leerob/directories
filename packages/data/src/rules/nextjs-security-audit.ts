export const nextjsSecurityAuditRules = [
  {
    title: "Next.js Security Audit - Comprehensive Vulnerability Scanner",
    tags: [
      "Security",
      "Next.js",
      "TypeScript",
      "API Security",
      "Authentication",
    ],
    libs: ["next-rate-limit", "zod", "bcrypt", "argon2", "jose", "csrf"],
    slug: "nextjs-security-audit-guide",
    content: `
  # Next.js Security Audit - Comprehensive Vulnerability Scanner and Fixer
  
  ## Development Philosophy
  
  - **Security First**: Every line of code should be written with security in mind
  - **Minimal Attack Surface**: Reduce exposure by implementing least privilege principles
  - **Defense in Depth**: Layer security controls to prevent single points of failure
  - **Practical Over Perfect**: Focus on high-impact, implementable fixes
  - **Continuous Monitoring**: Security is not a one-time activity but an ongoing process
  
  ## 🔍 Phase 1: Automated Security Scan
  
  Systematically analyze the codebase for vulnerabilities. For each finding, provide:
  
  \`\`\`
  📍 Location: [filename:line]
  🚨 Severity: [CRITICAL|HIGH|MEDIUM|LOW]
  🔓 Issue: [Clear description]
  💥 Impact: [What could happen]
  \`\`\`
  
  ### Priority Scan Areas
  
  #### Authentication & Authorization
  - JWT implementation flaws
  - Session management issues
  - Missing auth middleware on protected routes
  - Insecure password reset flows
  - OAuth misconfigurations
  - Missing role-based access control (RBAC)
  - Privilege escalation vulnerabilities
  
  #### API Security
  - Unprotected API routes (\`/api/*\` without auth checks)
  - Missing CSRF protection
  - Lack of rate limiting
  - Input validation gaps
  - SQL/NoSQL injection risks
  - Mass assignment vulnerabilities
  - GraphQL specific vulnerabilities (if applicable)
  - Missing API versioning strategy
  
  #### Next.js Specific Vulnerabilities
  - Exposed server components with sensitive logic
  - Client-side environment variables containing secrets
  - Improper use of \`dangerouslySetInnerHTML\`
  - Missing security headers in \`next.config.js\`
  - Insecure redirects and open redirects
  - Server actions without proper validation
  - Middleware bypass vulnerabilities
  - Static generation exposing sensitive data
  
  #### Data Exposure
  - Sensitive data in client components
  - API responses leaking internal data
  - Error messages exposing system info
  - Unfiltered database queries
  - Missing data sanitization
  - Logging sensitive information
  - Exposed user PII in URLs or localStorage
  
  #### Configuration Issues
  - Hardcoded secrets or API keys
  - Insecure CORS settings
  - Missing Content Security Policy
  - Exposed \`.env\` variables on client
  - Debug mode in production
  - Verbose error reporting
  - Missing HTTPS enforcement
  
  ## 📊 Phase 2: Risk Assessment & Remediation Plan
  
  ### Vulnerability Analysis Template
  
  \`\`\`markdown
  ### [Issue Name]
  **Risk Level**: [CRITICAL/HIGH/MEDIUM/LOW]
  **CVSS Score**: [0.0-10.0]
  **CWE ID**: [Common Weakness Enumeration ID]
  
  **Attack Vector**:
  1. [Step-by-step exploitation scenario]
  2. [Tools/techniques required]
  3. [Skill level needed]
  
  **Business Impact**:
  - Data breach potential: [Yes/No - what data]
  - Service disruption: [Yes/No - how]
  - Compliance violation: [GDPR/PCI/HIPAA/SOC2 if applicable]
  - Reputation damage: [High/Medium/Low]
  - Financial impact: [Estimated range]
  
  **Recommended Fix**:
  [Minimal, practical solution with code example]
  
  **Alternative Solutions**:
  [If multiple approaches exist]
  
  **Implementation Effort**: [Hours/Days]
  **Breaking Changes**: [Yes/No - what might break]
  **Dependencies**: [New packages or services required]
  \`\`\`
  
  ## 🔧 Phase 3: Secure Code Implementation
  
  ### Fix Template
  
  \`\`\`diff
  // File: [path/to/file]
  // Issue: [Brief description]
  // CWE: [CWE-XXX]
  
  - [old insecure code]
  + [new secure code]
  
  // Test coverage required:
  // - [Unit test scenario]
  // - [Integration test scenario]
  \`\`\`
  
  ### Verification Checklist
  - [ ] Fix addresses the root cause
  - [ ] No new vulnerabilities introduced
  - [ ] Backward compatibility maintained
  - [ ] Performance impact assessed (<5% degradation)
  - [ ] Error handling preserved
  - [ ] Logging added for security events
  - [ ] Documentation updated
  - [ ] Tests written and passing
  
  ## 🎯 Next.js Security Checklist
  
  Rate each area:
  - ✅ Secure
  - ⚠️ Needs improvement  
  - ❌ Critical issue
  
  ### Core Security
  - [ ] All API routes have authentication
  - [ ] Rate limiting implemented (e.g., with \`next-rate-limit\`)
  - [ ] CSRF tokens on state-changing operations
  - [ ] Input validation with \`zod\` or similar
  - [ ] SQL queries use parameterization
  - [ ] XSS prevention in place
  - [ ] File upload restrictions implemented
  - [ ] Security event logging configured
  
  ### Next.js Configuration
  - [ ] Security headers in \`next.config.js\`
  - [ ] Environment variables properly split (server vs client)
  - [ ] Content Security Policy configured
  - [ ] HTTPS enforced in production
  - [ ] Source maps disabled in production
  - [ ] Strict TypeScript configuration
  - [ ] Middleware security rules implemented
  - [ ] API routes follow RESTful security practices
  
  ### Authentication & Session Management
  - [ ] Secure session management (httpOnly, secure, sameSite cookies)
  - [ ] Password hashing with bcrypt/argon2 (cost factor ≥ 12)
  - [ ] Account lockout mechanisms (after 5 failed attempts)
  - [ ] Secure password reset flow (time-limited tokens)
  - [ ] 2FA/MFA support implemented
  - [ ] Session timeout configured
  - [ ] Secure "Remember Me" functionality
  - [ ] Logout properly clears all session data
  
  ### Data Protection
  - [ ] Sensitive data encrypted at rest
  - [ ] PII data minimization practiced
  - [ ] Data retention policies implemented
  - [ ] Secure data deletion procedures
  - [ ] Audit trails for sensitive operations
  - [ ] GDPR compliance measures
  
  ## 📋 Executive Summary Format
  
  \`\`\`markdown
  # Security Audit Report - [Date]
  
  ## Critical Findings
  [Number] critical vulnerabilities requiring immediate attention
  
  ## Risk Matrix
  | Category | Critical | High | Medium | Low |
  |----------|----------|------|---------|-----|
  | Auth     | X        | X    | X       | X   |
  | API      | X        | X    | X       | X   |
  | Data     | X        | X    | X       | X   |
  | Config   | X        | X    | X       | X   |
  
  ## Summary by Category
  - Authentication: [X issues] - [Brief description]
  - API Security: [X issues] - [Brief description]
  - Data Protection: [X issues] - [Brief description]
  - Configuration: [X issues] - [Brief description]
  
  ## Remediation Timeline
  - Immediate (24h): [List critical fixes]
  - Short-term (1 week): [List high priority]
  - Medium-term (1 month): [List medium priority]
  - Long-term (3 months): [List low priority]
  
  ## Required Resources
  - Developer hours: [Estimate by priority]
  - Third-party tools: [List with costs]
  - Testing requirements: [Scope and timeline]
  - Training needs: [Security awareness topics]
  
  ## Compliance Status
  - [ ] OWASP Top 10 addressed
  - [ ] GDPR requirements met
  - [ ] Industry standards compliance
  \`\`\`
  
  ## 🚀 Quick Wins
  
  Identify 5-10 fixes that can be implemented immediately with high security impact:
  
  1. **Enable rate limiting** on all API routes
  2. **Add security headers** to next.config.js
  3. **Implement input validation** using Zod schemas
  4. **Enable CSRF protection** for mutations
  5. **Remove console.logs** containing sensitive data
  
  ## 🛡️ Security Code Patterns
  
  ### Secure API Route Template
  \`\`\`typescript
  // app/api/secure-endpoint/route.ts
  import { NextRequest, NextResponse } from 'next/server';
  import { z } from 'zod';
  import { verifyAuth } from '@/lib/auth';
  import { rateLimit } from '@/lib/rate-limit';
  import { csrf } from '@/lib/csrf';
  
  const schema = z.object({
    // Define your input schema
  });
  
  export async function POST(req: NextRequest) {
    // Rate limiting
    const rateLimitResult = await rateLimit(req);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
  
    // Authentication
    const auth = await verifyAuth(req);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  
    // CSRF protection
    const csrfValid = await csrf.verify(req);
    if (!csrfValid) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }
  
    // Input validation
    const body = await req.json();
    const validationResult = schema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: validationResult.error.flatten() 
      }, { status: 400 });
    }
  
    try {
      // Business logic here
      return NextResponse.json({ success: true });
    } catch (error) {
      // Log error securely (no sensitive data)
      console.error('API error:', { 
        endpoint: '/api/secure-endpoint',
        userId: auth.userId,
        timestamp: new Date().toISOString()
      });
      
      return NextResponse.json({ 
        error: 'Internal server error' 
      }, { status: 500 });
    }
  }
  \`\`\`
  
  ### Security Headers Configuration
  \`\`\`javascript
  // next.config.js
  const securityHeaders = [
    {
      key: 'X-DNS-Prefetch-Control',
      value: 'on'
    },
    {
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains; preload'
    },
    {
      key: 'X-Frame-Options',
      value: 'SAMEORIGIN'
    },
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff'
    },
    {
      key: 'X-XSS-Protection',
      value: '1; mode=block'
    },
    {
      key: 'Referrer-Policy',
      value: 'origin-when-cross-origin'
    },
    {
      key: 'Content-Security-Policy',
      value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
    }
  ];
  
  module.exports = {
    async headers() {
      return [
        {
          source: '/:path*',
          headers: securityHeaders,
        },
      ];
    },
  };
  \`\`\`
  
  ## Remember
  
  - Security is everyone's responsibility
  - The best security is invisible to users
  - Document security decisions for future reference
  - Regular security audits are essential
  - Stay updated with the latest security advisories
      `,
    author: {
      name: "Security Expert",
      url: "https://github.com/security-expert",
      avatar: "https://avatars.githubusercontent.com/u/security?v=4",
    },
  },
];
