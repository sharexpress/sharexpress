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
 * Privacy Policy Page Component
 *
 * Displays sharexpress's comprehensive privacy policy with GDPR/CCPA compliance.
 * Design matches the minimal, dark aesthetic of the platform while providing
 * legally robust privacy disclosures.
 *
 * @component
 * @returns {JSX.Element}
 */
const PrivacyPolicyPage = () => {
  useEffect(() => {
    document.title = "Privacy Policy — ShareXpress";
  }, []);

  const LAST_UPDATED = "March 3, 2026";
  const EFFECTIVE_DATE = "January 1, 2026";
  const CONTACT_EMAIL = "support@sharexpress.in";
  const DPO_EMAIL = "dpo@sharexpress.in";
  const COMPANY_NAME = "sharexpress Technologies";
  const RETENTION_DAYS = 30;

  return (
    <div className="w-full bg-black text-white pt-40 pb-32">
      <div className="max-w-3xl mx-auto px-6 ">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl ">Privacy Policy</h1>
          <p className="text-[#B8B8B8] mt-3">
            Last updated: {LAST_UPDATED} | Effective: {EFFECTIVE_DATE}
          </p>
        </div>

        {/* Introduction */}
        <div className="space-y-6 text-[#B8B8B8] leading-relaxed text-[17px]">
          <p>
            This Privacy Policy describes how {COMPANY_NAME} ("sharexpress",
            "we", "us", "our") collects, uses, discloses, and protects your
            personal information when you use our secure file-sharing platform,
            available at sharexpress.in and through our mobile applications
            (collectively, the "Service").
          </p>

          <p>
            sharexpress is built with a privacy-first architecture. We employ
            end-to-end encryption, zero-knowledge design principles, and
            session-based ephemeral storage to minimize data collection. We
            collect only the information necessary to operate secure,
            peer-to-peer file transfers between authenticated parties.
          </p>

          <p className="font-medium text-[#B8B8B8] ">
            We do not sell, rent, or share your personal data with third parties
            for their marketing purposes. We do not use your files to train
            artificial intelligence systems. We do not run advertising trackers
            or behavioral profiling.
          </p>

          <p>
            By using sharexpress, you agree to the collection and use of
            information in accordance with this Privacy Policy. If you do not
            agree, please discontinue use of the Service immediately.
          </p>
        </div>

        {/* Section 1 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl  text-white uppercase">
            1. INFORMATION WE COLLECT
          </h2>

          <div className="space-y-6 text-[#B8B8B8] leading-relaxed">
            <div>
              <h3 className="text-[#B8B8B8] font-medium text-lg mb-3">
                1.1 Account Information
              </h3>
              <p>When you register for a sharexpress account, we collect:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>
                  <strong className="text-[#B8B8B8]">Email address:</strong>{" "}
                  Used for account creation, authentication via one-time
                  passcodes (OTP), password reset, and critical security
                  notifications.
                </li>
                <li>
                  <strong className="text-[#B8B8B8]">
                    Display name (optional):
                  </strong>{" "}
                  Shown to sharing session participants to identify you during
                  file transfers.
                </li>
                <li>
                  <strong className="text-[#B8B8B8]">
                    Authentication credentials:
                  </strong>{" "}
                  Hashed passwords (bcrypt with salt) or OAuth tokens from
                  third-party providers (Google, GitHub) if you choose social
                  login. We never store passwords in plaintext.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[#B8B8B8] font-medium text-lg mb-3 mt-8">
                1.2 Guest Session Information
              </h3>
              <p>
                For users who choose not to register ("Guest Mode"), we create
                temporary session identifiers:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>
                  <strong className="text-[#B8B8B8]">Guest session ID:</strong>{" "}
                  A randomly generated, cryptographically secure token stored in
                  a browser cookie to maintain your ephemeral identity during
                  transfers.
                </li>
                <li>
                  <strong className="text-[#B8B8B8]">
                    Guest display name:
                  </strong>{" "}
                  An optional pseudonym you provide for identification within
                  sharing sessions.
                </li>
                <li>
                  Guest sessions expire automatically after 24 hours of
                  inactivity and do not persist across browser sessions unless
                  cookies are preserved.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[#B8B8B8] font-medium text-lg mb-3 mt-8">
                1.3 Files and File Metadata
              </h3>
              <p>
                To facilitate secure file transfers, we temporarily process and
                store:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>
                  <strong className="text-[#B8B8B8]">File content:</strong>{" "}
                  Uploaded files are stored encrypted at rest in Amazon S3 (or
                  equivalent object storage) with AES-256 encryption. Files are
                  scoped to sharing sessions and automatically deleted after{" "}
                  {RETENTION_DAYS} days or when the session is terminated,
                  whichever occurs first.
                </li>
                <li>
                  <strong className="text-[#B8B8B8]">File metadata:</strong>{" "}
                  Original filename, file size (in bytes), MIME type, upload
                  timestamp, SHA-256 checksum (for integrity verification), and
                  uploader identity (user ID or guest session ID).
                </li>
                <li>
                  <strong className="text-[#B8B8B8]">
                    Sharing session data:
                  </strong>{" "}
                  Session identifiers, QR codes, participant identities (sender
                  and receiver), access permissions (upload/download/edit),
                  session status (active/completed/revoked), creation and expiry
                  timestamps.
                </li>
              </ul>
              <p className="mt-3 italic">
                We do not scan, analyze, or inspect the contents of your files
                for any purpose other than automated malware detection and
                compliance with legal obligations.
              </p>
            </div>

            <div>
              <h3 className="text-[#B8B8B8] font-medium text-lg mb-3 mt-8">
                1.4 Technical and Usage Data
              </h3>
              <p>
                To operate the Service securely and reliably, we automatically
                collect:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>
                  <strong className="text-[#B8B8B8]">
                    Device and browser information:
                  </strong>{" "}
                  User-agent string (browser type and version), operating
                  system, screen resolution, and device type (mobile/desktop).
                </li>
                <li>
                  <strong className="text-[#B8B8B8]">IP address:</strong> Used
                  for rate limiting, fraud prevention, geographic access
                  restrictions, and security logging. IP addresses are stored
                  for a maximum of 90 days.
                </li>
                <li>
                  <strong className="text-[#B8B8B8]">Request logs:</strong> HTTP
                  method, endpoint, timestamp, response status code, and request
                  duration for debugging, performance monitoring, and security
                  auditing.
                </li>
                <li>
                  <strong className="text-[#B8B8B8]">
                    Cookies and local storage:
                  </strong>{" "}
                  Authentication tokens (JWT), session identifiers, and user
                  preferences. See Section 9 (Cookies) for details.
                </li>
                <li>
                  <strong className="text-[#B8B8B8]">
                    Analytics (optional):
                  </strong>{" "}
                  If you consent, we collect aggregated, anonymized usage
                  metrics (page views, feature usage, session duration) via
                  privacy-respecting analytics tools (e.g., Plausible, Fathom).
                  You may opt out at any time.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[#B8B8B8] font-medium text-lg mb-3 mt-8">
                1.5 Communications
              </h3>
              <p>
                If you contact us via email, support tickets, or feedback forms,
                we collect the content of your message, your email address, and
                any attachments you provide. This data is retained only as long
                as necessary to resolve your inquiry.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl  text-white uppercase">
            2. How We Use Your Information
          </h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <p>
              We process your personal information for the following purposes:
            </p>

            <div className="ml-4 space-y-3">
              <div>
                <p className="font-medium text-[#B8B8B8]">
                  2.1 Service Delivery
                </p>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Authenticate users and maintain secure sessions</li>
                  <li>Generate and manage QR codes for sharing initiation</li>
                  <li>
                    Facilitate peer-to-peer file transfers with access control
                  </li>
                  <li>
                    Enforce session expiry, file quotas, and permission policies
                  </li>
                  <li>Provide download links with time-limited, signed URLs</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  2.2 Security and Fraud Prevention
                </p>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>
                    Detect and prevent unauthorized access, abuse, and malicious
                    activity
                  </li>
                  <li>
                    Monitor for suspicious patterns (e.g., excessive upload
                    rates, automated bots)
                  </li>
                  <li>
                    Scan uploaded files for malware and prohibited content
                  </li>
                  <li>
                    Enforce rate limits to prevent denial-of-service attacks
                  </li>
                  <li>Maintain audit logs for security investigations</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  2.3 Platform Improvement
                </p>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>
                    Analyze aggregated, anonymized usage patterns to improve
                    features
                  </li>
                  <li>Debug errors and optimize performance</li>
                  <li>Conduct A/B testing with user consent</li>
                  <li>Develop new features based on feedback</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  2.4 Legal Compliance
                </p>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>
                    Comply with applicable laws, regulations, and legal
                    processes
                  </li>
                  <li>
                    Respond to lawful requests from law enforcement or
                    government agencies
                  </li>
                  <li>
                    Enforce our Terms of Service and Acceptable Use Policy
                  </li>
                  <li>Protect our rights, property, and user safety</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  2.5 Communications (with consent)
                </p>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>
                    Send transactional emails (e.g., OTP codes, session
                    notifications)
                  </li>
                  <li>
                    Respond to support inquiries and provide customer service
                  </li>
                  <li>Send security alerts and critical service updates</li>
                  <li>
                    Deliver optional marketing communications (opt-in only; you
                    may unsubscribe anytime)
                  </li>
                </ul>
              </div>
            </div>

            <p className="mt-6 font-medium text-[#B8B8B8]">
              We do not use your files to train machine learning models,
              including large language models (LLMs) or generative AI systems.
            </p>
          </div>
        </div>

        {/* Section 3 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl  text-white uppercase">
            3. Legal Basis for Processing (GDPR)
          </h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <p>
              If you are located in the European Economic Area (EEA), United
              Kingdom, or Switzerland, we process your personal data under the
              following legal bases:
            </p>

            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>
                <strong className="text-[#B8B8B8]">
                  Contractual necessity:
                </strong>{" "}
                Processing is necessary to perform our Terms of Service (e.g.,
                account creation, file transfers).
              </li>
              <li>
                <strong className="text-[#B8B8B8]">
                  Legitimate interests:
                </strong>{" "}
                Fraud prevention, security monitoring, and platform improvement,
                provided these interests do not override your rights.
              </li>
              <li>
                <strong className="text-[#B8B8B8]">Legal obligation:</strong>{" "}
                Compliance with laws, court orders, or regulatory requirements.
              </li>
              <li>
                <strong className="text-[#B8B8B8]">Consent:</strong> Where you
                have explicitly opted in (e.g., marketing emails, analytics
                cookies). You may withdraw consent at any time.
              </li>
            </ul>
          </div>
        </div>

        {/* Section 4 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl  text-white uppercase">
            4. Data Sharing and Disclosure
          </h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <p>
              We do not sell, rent, or trade your personal information. We may
              share limited data in the following circumstances:
            </p>

            <div className="ml-4 space-y-3">
              <div>
                <p className="font-medium text-[#B8B8B8]">
                  4.1 Service Providers
                </p>
                <p>
                  We engage trusted third-party vendors to operate the Service:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    <strong className="text-[#B8B8B8]">Cloud storage:</strong>{" "}
                    Amazon Web Services (AWS) S3 for encrypted file storage.
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Database hosting:
                    </strong>{" "}
                    MongoDB Atlas for metadata and session management.
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">Email delivery:</strong>{" "}
                    SendGrid or Amazon SES for transactional emails (OTP codes).
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      CDN and DDoS protection:
                    </strong>{" "}
                    Cloudflare for content delivery and security.
                  </li>
                  <li>
                    <strong className="text-[#B8B8B8]">
                      Payment processing (if applicable):
                    </strong>{" "}
                    Stripe for subscription billing. We do not store credit card
                    numbers.
                  </li>
                </ul>
                <p className="mt-2 italic">
                  All service providers are bound by data processing agreements
                  (DPAs) and process data solely on our behalf under strict
                  confidentiality obligations.
                </p>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  4.2 Legal Requirements
                </p>
                <p>
                  We may disclose information if required by law or in good
                  faith belief that such action is necessary to:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>Comply with a subpoena, court order, or legal process</li>
                  <li>
                    Respond to lawful requests from law enforcement or
                    government agencies
                  </li>
                  <li>Prevent fraud, abuse, or illegal activity</li>
                  <li>Protect the safety of users or the public</li>
                  <li>Defend against legal claims</li>
                </ul>
                <p className="mt-2">
                  We will notify affected users of legal requests unless
                  prohibited by law or court order.
                </p>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  4.3 Business Transfers
                </p>
                <p>
                  If sharexpress is acquired, merged, or undergoes a
                  reorganization, your personal information may be transferred
                  to the successor entity. We will notify you via email or
                  prominent notice on our website before such transfer.
                </p>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  4.4 With Your Consent
                </p>
                <p>
                  We may share information with other parties when you
                  explicitly authorize us to do so (e.g., integrations with
                  third-party services you connect).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl  text-white uppercase">5. Data Retention</h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <p>
              We retain personal information only as long as necessary to
              fulfill the purposes outlined in this Privacy Policy, unless a
              longer retention period is required or permitted by law.
            </p>

            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>
                <strong className="text-[#B8B8B8]">Account data:</strong>{" "}
                Retained until you delete your account. Deleted accounts are
                purged within 30 days.
              </li>
              <li>
                <strong className="text-[#B8B8B8]">Guest sessions:</strong>{" "}
                Automatically deleted after 24 hours of inactivity or upon
                browser session termination.
              </li>
              <li>
                <strong className="text-[#B8B8B8]">Files:</strong> Automatically
                deleted {RETENTION_DAYS} days after upload or when the sharing
                session is completed/revoked, whichever occurs first. Users may
                manually delete files at any time.
              </li>
              <li>
                <strong className="text-[#B8B8B8]">Session metadata:</strong>{" "}
                Retained for 90 days for audit and security purposes, then
                anonymized or deleted.
              </li>
              <li>
                <strong className="text-[#B8B8B8]">Server logs:</strong> IP
                addresses and request logs are retained for 90 days, then
                deleted.
              </li>
              <li>
                <strong className="text-[#B8B8B8]">
                  Support communications:
                </strong>{" "}
                Retained for up to 2 years to maintain service continuity and
                legal compliance.
              </li>
            </ul>

            <p className="mt-4">
              You may request deletion of your data at any time by contacting{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-[#B8B8B8] underline"
              >
                {CONTACT_EMAIL}
              </a>
              . We will respond within 30 days.
            </p>
          </div>
        </div>

        {/* Section 6 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl  text-white uppercase ">6. Data Security</h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <p>
              We implement industry-standard technical and organizational
              measures to protect your personal information against unauthorized
              access, disclosure, alteration, or destruction:
            </p>

            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>
                <strong className="text-[#B8B8B8]">
                  Encryption in transit:
                </strong>{" "}
                All data transmitted between your device and our servers is
                encrypted using TLS 1.3 (Transport Layer Security).
              </li>
              <li>
                <strong className="text-[#B8B8B8]">Encryption at rest:</strong>{" "}
                Files are encrypted using AES-256 before storage. Database
                credentials and API keys are encrypted and stored in secure
                vaults.
              </li>
              <li>
                <strong className="text-[#B8B8B8]">Authentication:</strong>{" "}
                Passwords are hashed using bcrypt with per-user salts. We
                support two-factor authentication (2FA) via TOTP (Time-based
                One-Time Password).
              </li>
              <li>
                <strong className="text-[#B8B8B8]">Access controls:</strong>{" "}
                Employee access to production systems is restricted via
                role-based access control (RBAC) and logged for audit purposes.
              </li>
              <li>
                <strong className="text-[#B8B8B8]">Security monitoring:</strong>{" "}
                We employ intrusion detection systems (IDS), real-time alerting,
                and regular security audits.
              </li>
              <li>
                <strong className="text-[#B8B8B8]">
                  Vulnerability management:
                </strong>{" "}
                We conduct regular penetration testing and maintain a
                responsible disclosure program for security researchers.
              </li>
            </ul>

            <p className="mt-4 italic">
              Despite our efforts, no system is 100% secure. You are responsible
              for maintaining the confidentiality of your account credentials.
              If you suspect unauthorized access, contact us immediately at{" "}
              <a
                href="mailto:security@sharexpress.in"
                className="text-[#B8B8B8] underline"
              >
                security@sharexpress.in
              </a>
              .
            </p>
          </div>
        </div>

        {/* Section 7 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl  text-white uppercase ">
            7. Your Privacy Rights
          </h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <p>
              Depending on your location, you may have the following rights
              regarding your personal information:
            </p>

            <div className="ml-4 space-y-3">
              <div>
                <p className="font-medium text-[#B8B8B8]">
                  7.1 Access and Portability
                </p>
                <p>
                  You may request a copy of the personal information we hold
                  about you in a structured, machine-readable format (e.g.,
                  JSON, CSV).
                </p>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  7.2 Correction
                </p>
                <p>
                  You may update or correct inaccurate personal information via
                  your account settings or by contacting us.
                </p>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  7.3 Deletion ("Right to be Forgotten")
                </p>
                <p>
                  You may request deletion of your account and associated data.
                  We will honor this request within 30 days, subject to legal
                  retention requirements.
                </p>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  7.4 Restriction of Processing
                </p>
                <p>
                  You may request that we limit how we use your data in certain
                  circumstances (e.g., while disputing accuracy).
                </p>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">7.5 Objection</p>
                <p>
                  You may object to processing based on legitimate interests or
                  direct marketing. We will cease such processing unless we have
                  compelling legitimate grounds.
                </p>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  7.6 Withdraw Consent
                </p>
                <p>
                  Where processing is based on consent (e.g., marketing emails),
                  you may withdraw consent at any time via unsubscribe links or
                  account settings.
                </p>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  7.7 Lodge a Complaint
                </p>
                <p>
                  If you are in the EEA/UK, you have the right to lodge a
                  complaint with your local data protection authority (DPA).
                </p>
              </div>
            </div>

            <p className="mt-6">
              To exercise any of these rights, contact us at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-[#B8B8B8] underline"
              >
                {CONTACT_EMAIL}
              </a>{" "}
              or{" "}
              <a
                href={`mailto:${DPO_EMAIL}`}
                className="text-[#B8B8B8] underline"
              >
                {DPO_EMAIL}
              </a>
              . We will respond within 30 days (or as required by applicable
              law).
            </p>
          </div>
        </div>

        {/* Section 8 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl  text-white uppercase ">
            8. International Data Transfers
          </h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <p>
              sharexpress is based in the United States. If you access the
              Service from outside the U.S., your information may be transferred
              to, stored, and processed in the U.S. or other countries where our
              service providers operate.
            </p>

            <p>
              For users in the EEA/UK/Switzerland, we ensure adequate protection
              through:
            </p>

            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>
                <strong className="text-[#B8B8B8]">
                  Standard Contractual Clauses (SCCs):
                </strong>{" "}
                Approved by the European Commission for data transfers to third
                countries.
              </li>
              <li>
                <strong className="text-[#B8B8B8]">
                  Data Processing Agreements (DPAs):
                </strong>{" "}
                With all service providers handling EU data.
              </li>
              <li>
                <strong className="text-[#B8B8B8]">Adequacy decisions:</strong>{" "}
                We prioritize service providers in countries with EU adequacy
                decisions (e.g., UK, Canada).
              </li>
            </ul>

            <p className="mt-4">
              You may request a copy of the safeguards we use for international
              transfers by contacting{" "}
              <a
                href={`mailto:${DPO_EMAIL}`}
                className="text-[#B8B8B8] underline"
              >
                {DPO_EMAIL}
              </a>
              .
            </p>
          </div>
        </div>

        {/* Section 9 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl  text-white uppercase ">
            9. Cookies and Tracking Technologies
          </h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <p>
              We use cookies and similar technologies to operate and improve the
              Service. You may control cookie preferences via your browser
              settings.
            </p>

            <div className="ml-4 space-y-3">
              <div>
                <p className="font-medium text-[#B8B8B8]">
                  9.1 Essential Cookies
                </p>
                <p>
                  Required for authentication, session management, and security:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    <code className="bg-white/10 px-1 rounded">
                      x-sharing-token
                    </code>{" "}
                    — JWT for sharing session authentication
                  </li>
                  <li>
                    <code className="bg-white/10 px-1 rounded">
                      guest_session
                    </code>{" "}
                    — Guest user identifier
                  </li>
                  <li>
                    <code className="bg-white/10 px-1 rounded">csrf_token</code>{" "}
                    — Cross-site request forgery protection
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  9.2 Analytics Cookies (Optional)
                </p>
                <p>
                  With your consent, we use privacy-respecting analytics (e.g.,
                  Plausible) to understand aggregated usage patterns. These do
                  not track individuals across websites. You may opt out at any
                  time.
                </p>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  9.3 Third-Party Cookies
                </p>
                <p>
                  We do not allow third-party advertising or tracking cookies.
                  OAuth providers (Google, GitHub) may set their own cookies
                  during authentication.
                </p>
              </div>
            </div>

            <p className="mt-4">
              To manage cookies, adjust your browser settings. Note that
              disabling essential cookies will prevent you from using the
              Service.
            </p>
          </div>
        </div>

        {/* Section 10 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl  text-white uppercase ">
            10. Children's Privacy
          </h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <p>
              sharexpress is not directed to children under 16 years of age (or
              the applicable age of digital consent in your jurisdiction). We do
              not knowingly collect personal information from children.
            </p>

            <p>
              If we become aware that we have inadvertently collected data from
              a child without parental consent, we will delete it promptly. If
              you believe your child has provided us with personal information,
              contact us at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-[#B8B8B8] underline"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </div>
        </div>

        {/* Section 11 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl  text-white uppercase ">
            11. California Privacy Rights (CCPA)
          </h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <p>
              If you are a California resident, the California Consumer Privacy
              Act (CCPA) grants you additional rights:
            </p>

            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>
                <strong className="text-[#B8B8B8]">Right to know:</strong>{" "}
                Request disclosure of personal information collected, used, and
                shared in the past 12 months.
              </li>
              <li>
                <strong className="text-[#B8B8B8]">Right to delete:</strong>{" "}
                Request deletion of personal information, subject to exceptions.
              </li>
              <li>
                <strong className="text-[#B8B8B8]">Right to opt out:</strong> We
                do not sell personal information. If our practices change, we
                will provide an opt-out mechanism.
              </li>
              <li>
                <strong className="text-[#B8B8B8]">
                  Right to non-discrimination:
                </strong>{" "}
                We will not discriminate against you for exercising your CCPA
                rights.
              </li>
            </ul>

            <p className="mt-4">
              To submit a CCPA request, email{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-[#B8B8B8] underline"
              >
                {CONTACT_EMAIL}
              </a>{" "}
              with "CCPA Request" in the subject line. We will verify your
              identity and respond within 45 days.
            </p>

            <p className="mt-4 font-medium text-[#B8B8B8]">
              Do Not Sell My Personal Information: We do not sell personal
              information as defined by the CCPA.
            </p>
          </div>
        </div>

        {/* Section 12 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl  text-white uppercase ">
            12. Changes to This Privacy Policy
          </h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <p>
              We may update this Privacy Policy from time to time to reflect
              changes in our practices, legal requirements, or Service features.
              We will notify you of material changes by:
            </p>

            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>
                Posting the updated policy on this page with a new "Last
                updated" date
              </li>
              <li>
                Sending an email notification to your registered email address
              </li>
              <li>Displaying a prominent notice on our website</li>
            </ul>

            <p className="mt-4">
              Your continued use of sharexpress after the effective date of an
              updated Privacy Policy constitutes acceptance of the changes. If
              you do not agree, you must discontinue use and may request account
              deletion.
            </p>

            <p className="mt-4">
              We encourage you to review this Privacy Policy periodically.
            </p>
          </div>
        </div>

        {/* Section 13 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl  text-white uppercase ">13. Contact Us</h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <p>
              If you have questions, concerns, or requests regarding this
              Privacy Policy or our data practices, please contact us:
            </p>

            <div className="ml-4 mt-4 space-y-2">
              <p>
                <strong className="text-[#B8B8B8]">Email:</strong>{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-[#B8B8B8] underline"
                >
                  {CONTACT_EMAIL}
                </a>
              </p>
              <p>
                <strong className="text-[#B8B8B8]">
                  Data Protection Officer:
                </strong>{" "}
                <a
                  href={`mailto:${DPO_EMAIL}`}
                  className="text-[#B8B8B8] underline"
                >
                  {DPO_EMAIL}
                </a>
              </p>
              <p>
                <strong className="text-[#B8B8B8]">Mailing Address:</strong>
                <br />
                {COMPANY_NAME}
                <br />
                Attn: Privacy Team
                <br />
                Indore, Madhya Pradesh , 452001
                <br />
                India
              </p>
            </div>

            <p className="mt-6">
              We will respond to privacy inquiries within 30 days (or as
              required by applicable law). For security-related issues, contact{" "}
              <a
                href="mailto:security@sharexpress.in"
                className="text-[#B8B8B8] underline"
              >
                security@sharexpress.in
              </a>
              .
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
              href="/acceptable-use"
              className="hover:text-[#B8B8B8] transition-colors"
            >
              Acceptable Use
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
