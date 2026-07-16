// Copyright 2026 sharexpress
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React, { useEffect } from "react";

/**
 * Security Policy Page Component
 *
 * Displays sharexpress's comprehensive security policies and practices.
 * Design matches the minimal, dark aesthetic of the platform while providing
 * detailed security disclosures and responsible disclosure guidelines.
 *
 * @component
 * @returns {JSX.Element} Security policy page
 */
const SecurityPolicyPage = () => {
  useEffect(() => {
    document.title = "Security Policy — ShareXpress";
  }, []);

  const LAST_UPDATED = "March 3, 2026";
  const EFFECTIVE_DATE = "January 1, 2026";
  const SECURITY_EMAIL = "security@sharexpress.in";
  const CONTACT_EMAIL = "support@sharexpress.in";
  const COMPANY_NAME = "sharexpress Technologies";
  const SERVICE_NAME = "sharexpress";

  return (
    <div className="w-full bg-black text-white pt-40 pb-32">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl">Security Policy</h1>
          <p className="text-[#B8B8B8] mt-3">
            Last updated: {LAST_UPDATED} | Effective: {EFFECTIVE_DATE}
          </p>
        </div>

        {/* Introduction */}
        <div className="space-y-6 text-[#B8B8B8] leading-relaxed text-[17px]">
          <p>
            Security is fundamental to {COMPANY_NAME}'s mission of providing
            secure, privacy-first file sharing. This Security Policy describes
            our comprehensive security measures, practices, and commitments to
            protecting your data and our infrastructure.
          </p>

          <p>
            We employ a defense-in-depth strategy with multiple layers of
            security controls spanning application architecture, infrastructure,
            network, and operational security. Our security program is
            continuously monitored, audited, and improved.
          </p>

          <p className="font-medium text-[#B8B8B8]">
            We are committed to transparency. If you discover a security
            vulnerability, please report it responsibly to{" "}
            <a
              href={`mailto:${SECURITY_EMAIL}`}
              className="text-[#B8B8B8] underline"
            >
              {SECURITY_EMAIL}
            </a>
            . We will acknowledge, investigate, and remediate verified issues
            promptly.
          </p>
        </div>

        {/* Section 1 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl text-white uppercase">
            1. ENCRYPTION AND DATA PROTECTION
          </h2>

          <div className="space-y-6 text-[#B8B8B8] leading-relaxed">
            <div>
              <h3 className="text-[#B8B8B8] font-medium text-lg mb-3">
                1.1 Encryption in Transit
              </h3>
              <p>
                All data transmitted between your device and our servers is
                encrypted using industry-standard protocols:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>
                  <strong className="text-[#B8B8B8]">TLS 1.3:</strong> Transport
                  Layer Security 1.3 for all HTTPS connections with perfect
                  forward secrecy (PFS)
                </li>
                <li>
                  <strong className="text-[#B8B8B8]">
                    Strong cipher suites:
                  </strong>{" "}
                  AES-256-GCM, ChaCha20-Poly1305, with ECDHE key exchange
                </li>
                <li>
                  <strong className="text-[#B8B8B8]">
                    Certificate pinning:
                  </strong>{" "}
                  Mobile applications use certificate pinning to prevent
                  man-in-the-middle attacks
                </li>
                <li>
                  <strong className="text-[#B8B8B8]">HSTS enforcement:</strong>{" "}
                  HTTP Strict Transport Security (HSTS) with 2-year max-age and
                  preload
                </li>
                <li>
                  <strong className="text-[#B8B8B8]">
                    Legacy protocol blocking:
                  </strong>{" "}
                  TLS 1.0, 1.1, and SSLv3 are permanently disabled
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[#B8B8B8] font-medium text-lg mb-3 mt-8">
                1.2 Encryption at Rest
              </h3>
              <p>
                Files and sensitive data stored in our infrastructure are
                encrypted at rest:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>
                  <strong className="text-[#B8B8B8]">
                    File encryption (AES-256):
                  </strong>{" "}
                  All uploaded files are encrypted using AES-256 encryption
                  before storage in Amazon S3
                </li>
                <li>
                  <strong className="text-[#B8B8B8]">
                    Server-side encryption (SSE-S3):
                  </strong>{" "}
                  AWS S3 server-side encryption with automatic key rotation
                </li>
                <li>
                  <strong className="text-[#B8B8B8]">
                    Database encryption:
                  </strong>{" "}
                  MongoDB Atlas encryption at rest with encrypted storage
                  volumes
                </li>
                <li>
                  <strong className="text-[#B8B8B8]">Backup encryption:</strong>{" "}
                  All backups are encrypted with separate encryption keys
                </li>
                <li>
                  <strong className="text-[#B8B8B8]">Key management:</strong>{" "}
                  Encryption keys stored in AWS KMS (Key Management Service)
                  with automatic rotation
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[#B8B8B8] font-medium text-lg mb-3 mt-8">
                1.3 End-to-End Security Architecture
              </h3>
              <p>
                Our security architecture implements multiple protective layers:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>
                  <strong className="text-[#B8B8B8]">
                    Zero-knowledge design:
                  </strong>{" "}
                  We cannot access the contents of your files; only
                  authenticated session participants can decrypt shared files
                </li>
                <li>
                  <strong className="text-[#B8B8B8]">
                    Session-based isolation:
                  </strong>{" "}
                  Files are scoped to sharing sessions with strict access
                  controls
                </li>
                <li>
                  <strong className="text-[#B8B8B8]">
                    Integrity verification:
                  </strong>{" "}
                  SHA-256 checksums ensure files are not corrupted or tampered
                  with
                </li>
                <li>
                  <strong className="text-[#B8B8B8]">Ephemeral storage:</strong>{" "}
                  Files automatically deleted after 30 days or session
                  termination
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl text-white uppercase">
            2. AUTHENTICATION AND ACCESS CONTROL
          </h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <div className="ml-4 space-y-3">
              <div>
                <p className="font-medium text-[#B8B8B8]">
                  2.1 User Authentication
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Email OTP authentication:
                    </strong>{" "}
                    One-time passcodes (OTP) sent via email with 10-minute
                    expiry and rate limiting
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Password hashing (bcrypt):
                    </strong>{" "}
                    Passwords hashed using bcrypt with work factor 12 and
                    per-user salts
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      OAuth 2.0 integration:
                    </strong>{" "}
                    Support for Google and GitHub OAuth with token validation
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      JWT token-based sessions:
                    </strong>{" "}
                    JSON Web Tokens (JWT) signed with RS256 (RSA signatures)
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Two-factor authentication (2FA):
                    </strong>{" "}
                    TOTP (Time-based One-Time Password) support via
                    authenticator apps
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">Session timeout:</strong>{" "}
                    Automatic logout after 15 minutes of inactivity for security
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  2.2 Access Control
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Role-based access control (RBAC):
                    </strong>{" "}
                    Granular permissions (upload, download, edit) enforced at
                    API level
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Principle of least privilege:
                    </strong>{" "}
                    Users and services granted minimum permissions necessary
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Session-scoped authorization:
                    </strong>{" "}
                    File access restricted to session participants only
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Presigned URL security:
                    </strong>{" "}
                    S3 presigned URLs expire after 10 minutes and are single-use
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Self-scan prevention:
                    </strong>{" "}
                    Users cannot scan their own QR codes to prevent unauthorized
                    session creation
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  2.3 Administrative Access
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    <strong className="text-[#B8B8B8]">MFA enforcement:</strong>{" "}
                    All administrative accounts require multi-factor
                    authentication
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">Audit logging:</strong>{" "}
                    All privileged operations logged with immutable audit trails
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">Access reviews:</strong>{" "}
                    Quarterly access reviews to revoke unnecessary privileges
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      SSH key management:
                    </strong>{" "}
                    SSH keys rotated every 90 days, password authentication
                    disabled
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl text-white uppercase">
            3. INFRASTRUCTURE SECURITY
          </h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <div className="ml-4 space-y-3">
              <div>
                <p className="font-medium text-[#B8B8B8]">
                  3.1 Cloud Infrastructure
                </p>
                <p>
                  Our infrastructure is hosted on enterprise-grade cloud
                  providers:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    <strong className="text-[#B8B8B8]">
                      AWS (Amazon Web Services):
                    </strong>{" "}
                    ISO 27001, SOC 2, PCI DSS certified data centers
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Geographic redundancy:
                    </strong>{" "}
                    Multi-region deployment across us-east-1 and us-west-2
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">DDoS protection:</strong>{" "}
                    Cloudflare DDoS mitigation with automatic threat detection
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">CDN security:</strong>{" "}
                    Cloudflare CDN with Web Application Firewall (WAF)
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  3.2 Network Security
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Virtual Private Cloud (VPC):
                    </strong>{" "}
                    Isolated network with private subnets for sensitive
                    resources
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">Security groups:</strong>{" "}
                    Stateful firewall rules allowing only necessary traffic
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Network segmentation:
                    </strong>{" "}
                    Separate networks for application, database, and management
                    tiers
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Intrusion detection (IDS):
                    </strong>{" "}
                    Real-time monitoring for suspicious network activity
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">VPN access:</strong>{" "}
                    Administrative access via VPN with certificate-based
                    authentication
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  3.3 Container and Orchestration Security
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Kubernetes hardening:
                    </strong>{" "}
                    Pod security policies, network policies, and RBAC
                    enforcement
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Container image scanning:
                    </strong>{" "}
                    Automated vulnerability scanning with Trivy before
                    deployment
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Minimal base images:
                    </strong>{" "}
                    Distroless or Alpine Linux base images to reduce attack
                    surface
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Runtime security:
                    </strong>{" "}
                    Falco monitoring for anomalous container behavior
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl text-white uppercase">
            4. APPLICATION SECURITY
          </h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <div className="ml-4 space-y-3">
              <div>
                <p className="font-medium text-[#B8B8B8]">
                  4.1 Secure Development Lifecycle
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Security by design:
                    </strong>{" "}
                    Threat modeling during architecture and design phases
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">Code reviews:</strong>{" "}
                    Mandatory peer review for all code changes with security
                    checklist
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Static analysis (SAST):
                    </strong>{" "}
                    Automated code scanning with Bandit (Python), ESLint
                    (JavaScript)
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Dependency scanning:
                    </strong>{" "}
                    Automated vulnerability detection in third-party libraries
                    (Safety, npm audit)
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">Secret scanning:</strong>{" "}
                    GitHub secret scanning to prevent accidental credential
                    commits
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  4.2 Input Validation and Sanitization
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Strict input validation:
                    </strong>{" "}
                    Pydantic schemas validate all API requests and reject
                    malformed data
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      SQL injection prevention:
                    </strong>{" "}
                    Parameterized queries and ORM (Motor for MongoDB)
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">XSS protection:</strong>{" "}
                    Content Security Policy (CSP), output encoding, React's
                    automatic escaping
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">CSRF protection:</strong>{" "}
                    SameSite cookies, CSRF tokens for state-changing operations
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      File upload validation:
                    </strong>{" "}
                    MIME type verification, extension whitelist, size limits,
                    malware scanning
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  4.3 API Security
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    <strong className="text-[#B8B8B8]">Rate limiting:</strong>{" "}
                    Token bucket algorithm with Redis backend (20-100
                    requests/minute)
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Circuit breaker pattern:
                    </strong>{" "}
                    Automatic service degradation on external service failures
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Request throttling:
                    </strong>{" "}
                    IP-based and user-based rate limiting
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">CORS policies:</strong>{" "}
                    Strict Cross-Origin Resource Sharing policies
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">API versioning:</strong>{" "}
                    Versioned endpoints to maintain security patches without
                    breaking changes
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl text-white uppercase">
            5. MONITORING AND INCIDENT RESPONSE
          </h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <div className="ml-4 space-y-3">
              <div>
                <p className="font-medium text-[#B8B8B8]">
                  5.1 Security Monitoring
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    <strong className="text-[#B8B8B8]">24/7 monitoring:</strong>{" "}
                    Prometheus + Grafana dashboards with real-time alerts
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Centralized logging:
                    </strong>{" "}
                    ELK stack (Elasticsearch, Logstash, Kibana) with 90-day
                    retention
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Distributed tracing:
                    </strong>{" "}
                    OpenTelemetry + Jaeger for request flow visibility
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Anomaly detection:
                    </strong>{" "}
                    Machine learning-based detection for unusual activity
                    patterns
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Security Information and Event Management (SIEM):
                    </strong>{" "}
                    Aggregated security event analysis
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  5.2 Incident Response Plan
                </p>
                <p>
                  Our incident response process follows industry best practices:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    <strong className="text-[#B8B8B8]">Detection:</strong>{" "}
                    Automated alerts trigger on-call security team
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">Containment:</strong>{" "}
                    Isolate affected systems within 15 minutes
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">Investigation:</strong>{" "}
                    Forensic analysis to determine scope and impact
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">Eradication:</strong>{" "}
                    Remove threat vectors and apply patches
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">Recovery:</strong>{" "}
                    Restore services with verified integrity
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Post-incident review:
                    </strong>{" "}
                    Lessons learned and process improvements
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  5.3 Breach Notification
                </p>
                <p>
                  In the event of a data breach affecting personal information:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    <strong className="text-[#B8B8B8]">
                      User notification:
                    </strong>{" "}
                    Affected users notified within 72 hours via email
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Regulatory notification:
                    </strong>{" "}
                    Compliance with GDPR, CCPA, and other applicable laws
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Public disclosure:
                    </strong>{" "}
                    Transparency report published for significant breaches
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">Remediation:</strong>{" "}
                    Credit monitoring or identity protection services offered if
                    warranted
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Section 6 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl text-white uppercase">
            6. VULNERABILITY MANAGEMENT
          </h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <div className="ml-4 space-y-3">
              <div>
                <p className="font-medium text-[#B8B8B8]">
                  6.1 Vulnerability Assessment
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Quarterly penetration testing:
                    </strong>{" "}
                    Third-party security firms conduct comprehensive penetration
                    tests
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Automated vulnerability scanning:
                    </strong>{" "}
                    Weekly scans with Nessus and OpenVAS
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Bug bounty program:
                    </strong>{" "}
                    Rewards for responsible disclosure of security
                    vulnerabilities
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Red team exercises:
                    </strong>{" "}
                    Annual simulated attacks to test defenses
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  6.2 Patch Management
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Critical patches:
                    </strong>{" "}
                    Applied within 24 hours of release
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">High severity:</strong>{" "}
                    Applied within 7 days
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Medium/Low severity:
                    </strong>{" "}
                    Applied within 30 days
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Automated updates:
                    </strong>{" "}
                    Unattended-upgrades for security patches on Ubuntu servers
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Dependency updates:
                    </strong>{" "}
                    Dependabot automated pull requests for library updates
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  6.3 Security Metrics
                </p>
                <p>We track and report on key security indicators:</p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>Mean time to detect (MTTD): Target &lt; 5 minutes</li>
                  <li>Mean time to respond (MTTR): Target &lt; 2 hours</li>
                  <li>Vulnerability remediation rate: 100% within SLA</li>
                  <li>Patch compliance rate: &gt; 95%</li>
                  <li>False positive rate: &lt; 10%</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Section 7 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl text-white uppercase">
            7. COMPLIANCE AND CERTIFICATIONS
          </h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <div className="ml-4 space-y-3">
              <div>
                <p className="font-medium text-[#B8B8B8]">
                  7.1 Regulatory Compliance
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    <strong className="text-[#B8B8B8]">
                      GDPR (General Data Protection Regulation):
                    </strong>{" "}
                    Full compliance with EU data protection requirements
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      CCPA (California Consumer Privacy Act):
                    </strong>{" "}
                    Compliance with California privacy laws
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      IT Act 2000 (India):
                    </strong>{" "}
                    Compliance with Indian Information Technology Act
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      PDPA (Personal Data Protection Act):
                    </strong>{" "}
                    Alignment with emerging data protection frameworks
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  7.2 Security Standards
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    <strong className="text-[#B8B8B8]">OWASP Top 10:</strong>{" "}
                    Protection against all OWASP Top 10 web application security
                    risks
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">CIS Benchmarks:</strong>{" "}
                    Server hardening according to Center for Internet Security
                    benchmarks
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      NIST Cybersecurity Framework:
                    </strong>{" "}
                    Alignment with NIST CSF (Identify, Protect, Detect, Respond,
                    Recover)
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      ISO 27001 readiness:
                    </strong>{" "}
                    Information Security Management System (ISMS) in development
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  7.3 Third-Party Audits
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    Annual security audits by independent third-party firms
                  </li>
                  <li>
                    Quarterly penetration testing with remediation verification
                  </li>
                  <li>Infrastructure provider certifications (AWS, MongoDB)</li>
                  <li>
                    Security assessment reports available upon request for
                    enterprise customers
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Section 8 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl text-white uppercase">
            8. RESPONSIBLE DISCLOSURE POLICY
          </h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <p>
              We value the security research community and encourage responsible
              disclosure of security vulnerabilities. If you discover a security
              issue, please follow these guidelines:
            </p>

            <div className="ml-4 space-y-3">
              <div>
                <p className="font-medium text-[#B8B8B8]">8.1 How to Report</p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    <strong className="text-[#B8B8B8]">Email:</strong> Send
                    reports to{" "}
                    <a
                      href={`mailto:${SECURITY_EMAIL}`}
                      className="text-[#B8B8B8] underline"
                    >
                      {SECURITY_EMAIL}
                    </a>
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">PGP encryption:</strong>{" "}
                    Use our PGP key (available on our website) for sensitive
                    disclosures
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">Include:</strong>{" "}
                    Detailed description, steps to reproduce, proof-of-concept,
                    and impact assessment
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">Response time:</strong>{" "}
                    We will acknowledge your report within 24 hours
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  8.2 Disclosure Guidelines
                </p>
                <p>
                  To qualify for our responsible disclosure program, you must:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    Give us reasonable time to investigate and remediate (90
                    days minimum)
                  </li>
                  <li>
                    Not publicly disclose the vulnerability before we have
                    patched it
                  </li>
                  <li>
                    Not exploit the vulnerability beyond what is necessary to
                    demonstrate it
                  </li>
                  <li>Not access, modify, or delete other users' data</li>
                  <li>Not conduct social engineering or phishing attacks</li>
                  <li>
                    Not perform denial-of-service or resource exhaustion attacks
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  8.3 Recognition and Rewards
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Security hall of fame:
                    </strong>{" "}
                    Public recognition on our website (with permission)
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">Bug bounties:</strong>{" "}
                    Monetary rewards for qualifying vulnerabilities (coming
                    soon)
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">Severity tiers:</strong>
                    <ul className="list-disc list-inside ml-8 mt-1">
                      <li>Critical (RCE, auth bypass): Recognition + reward</li>
                      <li>
                        High (data exposure, privilege escalation): Recognition
                      </li>
                      <li>Medium/Low (CSRF, XSS): Recognition</li>
                    </ul>
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  8.4 Out of Scope
                </p>
                <p>The following are explicitly out of scope:</p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>Social engineering attacks against employees or users</li>
                  <li>Physical attacks against our facilities or personnel</li>
                  <li>Denial-of-service (DoS/DDoS) attacks</li>
                  <li>Spam, phishing, or social media account compromise</li>
                  <li>Issues in third-party services we do not control</li>
                  <li>
                    Self-XSS, clickjacking on pages with no sensitive actions
                  </li>
                  <li>Outdated browser/plugin vulnerabilities</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Section 9 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl text-white uppercase">
            9. EMPLOYEE SECURITY PRACTICES
          </h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <div className="ml-4 space-y-3">
              <div>
                <p className="font-medium text-[#B8B8B8]">
                  9.1 Security Training
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Onboarding training:
                    </strong>{" "}
                    Mandatory security training for all new employees
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Annual refreshers:
                    </strong>{" "}
                    Yearly security awareness training
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Phishing simulations:
                    </strong>{" "}
                    Quarterly simulated phishing campaigns
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Secure coding training:
                    </strong>{" "}
                    OWASP Top 10, secure design patterns, threat modeling
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  9.2 Access Controls
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Least privilege access:
                    </strong>{" "}
                    Employees granted minimum permissions required for their
                    role
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">MFA enforcement:</strong>{" "}
                    All corporate accounts require multi-factor authentication
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Password managers:
                    </strong>{" "}
                    Mandatory use of enterprise password managers (1Password)
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Device management:
                    </strong>{" "}
                    Full-disk encryption, automatic updates, remote wipe
                    capability
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  9.3 Offboarding Procedures
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    Access revocation within 1 hour of termination notification
                  </li>
                  <li>Equipment return and secure data wiping</li>
                  <li>Exit interviews covering confidentiality obligations</li>
                  <li>Audit trail review for departing privileged users</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Section 10 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl text-white uppercase">
            10. BUSINESS CONTINUITY AND DISASTER RECOVERY
          </h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <div className="ml-4 space-y-3">
              <div>
                <p className="font-medium text-[#B8B8B8]">
                  10.1 Recovery Objectives
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    <strong className="text-[#B8B8B8]">
                      RTO (Recovery Time Objective):
                    </strong>{" "}
                    &lt; 4 hours
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      RPO (Recovery Point Objective):
                    </strong>{" "}
                    &lt; 15 minutes
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      MTTR (Mean Time To Repair):
                    </strong>{" "}
                    &lt; 2 hours
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Availability target:
                    </strong>{" "}
                    99.9% uptime
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  10.2 Backup Strategy
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Database backups:
                    </strong>{" "}
                    Daily full backup, 15-minute incremental, 30-day retention
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      File storage replication:
                    </strong>{" "}
                    S3 cross-region replication to us-west-2
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Configuration backups:
                    </strong>{" "}
                    Infrastructure as Code (Terraform) versioned in Git
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">Backup testing:</strong>{" "}
                    Monthly automated restoration tests to staging environment
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  10.3 Disaster Recovery Procedures
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>Documented runbooks for common failure scenarios</li>
                  <li>
                    Automated failover to DR region for database and application
                  </li>
                  <li>24/7 on-call rotation with escalation procedures</li>
                  <li>Annual DR simulation exercises</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Section 11 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl text-white uppercase">
            11. CONTACT SECURITY TEAM
          </h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <p>
              For security-related inquiries, vulnerabilities, or incident
              reports:
            </p>

            <div className="ml-4 mt-4 space-y-2">
              <p>
                <strong className="text-[#B8B8B8]">
                  Security Vulnerabilities:
                </strong>{" "}
                <a
                  href={`mailto:${SECURITY_EMAIL}`}
                  className="text-[#B8B8B8] underline"
                >
                  {SECURITY_EMAIL}
                </a>
              </p>
              <p>
                <strong className="text-[#B8B8B8]">General Security:</strong>{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-[#B8B8B8] underline"
                >
                  {CONTACT_EMAIL}
                </a>
              </p>
              <p>
                <strong className="text-[#B8B8B8]">
                  PGP Public Key Fingerprint:
                </strong>
                <br />
                <code className="bg-white/10 px-2 py-1 rounded text-sm">
                  1234 5678 90AB CDEF 1234 5678 90AB CDEF 1234 5678
                </code>
              </p>
              <p>
                <strong className="text-[#B8B8B8]">Security Updates:</strong>{" "}
                Subscribe to our security mailing list at{" "}
                <a
                  href="https://sharexpress.in/security-updates"
                  className="text-[#B8B8B8] underline"
                >
                  sharexpress.in/security-updates
                </a>
              </p>
            </div>

            <p className="mt-6">
              We take all security reports seriously and will respond to
              vulnerability disclosures within 24 hours.
            </p>
          </div>
        </div>

        {/* Section 12 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl text-white uppercase">
            12. UPDATES TO POLICY
          </h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <p>
              We continuously improve our security practices and will update
              this Security Policy to reflect changes. Material updates will be
              communicated via:
            </p>

            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Email notification to registered users</li>
              <li>Prominent notice on our website</li>
              <li>Security blog post with detailed changelog</li>
            </ul>

            <p className="mt-4">
              We encourage you to review this Security Policy periodically to
              stay informed about how we protect your information.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 pt-12 border-t border-white/10 text-center">
          <p className="text-[#B8B8B8]/40 text-sm">
            © {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.
            <br />
            <a
              href="/terms"
              className="hover:text-[#B8B8B8] transition-colors ml-2"
            >
              Terms of Service
            </a>{" "}
            •{" "}
            <a
              href="/privacy"
              className="hover:text-[#B8B8B8] transition-colors"
            >
              Privacy Policy
            </a>{" "}
            •{" "}
            <a
              href="/security"
              className="hover:text-[#B8B8B8] transition-colors"
            >
              Security Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecurityPolicyPage;
