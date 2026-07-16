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
 * Terms of Service Page Component
 *
 * Displays sharexpress's comprehensive terms of service with legal compliance.
 * Design matches the minimal, dark aesthetic of the platform while providing
 * legally robust service terms and user obligations.
 *
 * @component
 * @returns {JSX.Element} Terms of service page
 */
const TermsOfServicePage = () => {
  useEffect(() => {
    document.title = "Terms of Service — ShareXpress";
  }, []);

  const LAST_UPDATED = "March 3, 2026";
  const EFFECTIVE_DATE = "January 1, 2026";
  const CONTACT_EMAIL = "support@sharexpress.in";
  const LEGAL_EMAIL = "legal@sharexpress.in";
  const COMPANY_NAME = "sharexpress Technologies";
  const SERVICE_NAME = "sharexpress";
  const MAX_FILE_SIZE = 20; // MB
  const RETENTION_DAYS = 30;

  return (
    <div className="w-full bg-black text-white pt-40 pb-32">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl">Terms of Service</h1>
          <p className="text-[#B8B8B8] mt-3">
            Last updated: {LAST_UPDATED} | Effective: {EFFECTIVE_DATE}
          </p>
        </div>

        {/* Introduction */}
        <div className="space-y-6 text-[#B8B8B8] leading-relaxed text-[17px]">
          <p>
            These Terms of Service ("Terms", "Agreement") constitute a legally
            binding agreement between you ("User", "you", "your") and{" "}
            {COMPANY_NAME} ("{SERVICE_NAME}", "we", "us", "our") governing your
            access to and use of the {SERVICE_NAME} platform, including our
            website at sharexpress.in, mobile applications, and related services
            (collectively, the "Service").
          </p>

          <p className="font-medium text-[#B8B8B8]">
            BY ACCESSING OR USING THE SERVICE, YOU AGREE TO BE BOUND BY THESE
            TERMS. IF YOU DO NOT AGREE TO THESE TERMS, YOU MUST NOT ACCESS OR
            USE THE SERVICE.
          </p>

          <p>
            We reserve the right to modify these Terms at any time. Material
            changes will be communicated via email or prominent notice on our
            website. Your continued use after such notification constitutes
            acceptance of the modified Terms.
          </p>
        </div>

        {/* Section 1 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl text-white uppercase">
            1. SERVICE DESCRIPTION
          </h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <p>
              {SERVICE_NAME} is a secure, session-based file-sharing platform
              that enables users to transfer files between authenticated parties
              via QR code-initiated sharing sessions.
            </p>

            <div className="ml-4 space-y-3">
              <div>
                <p className="font-medium text-[#B8B8B8]">1.1 Core Features</p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    Account creation for registered users or guest sessions for
                    temporary access
                  </li>
                  <li>
                    QR code generation for sharing initiation with configurable
                    expiry and scan limits
                  </li>
                  <li>
                    Secure file uploads with end-to-end encryption and integrity
                    verification
                  </li>
                  <li>
                    Session-based access control with granular permissions
                    (upload/download/edit)
                  </li>
                  <li>
                    Automatic file deletion after {RETENTION_DAYS} days or
                    session termination
                  </li>
                  <li>Real-time session status tracking and notifications</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  1.2 Service Availability
                </p>
                <p>
                  We strive to maintain 99.9% uptime but do not guarantee
                  uninterrupted access. The Service may be temporarily
                  unavailable due to maintenance, updates, or circumstances
                  beyond our control. We are not liable for service
                  interruptions.
                </p>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  1.3 Service Modifications
                </p>
                <p>
                  We reserve the right to modify, suspend, or discontinue any
                  aspect of the Service at any time, with or without notice. We
                  are not liable for any modification, suspension, or
                  discontinuation of the Service.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl text-white uppercase">
            2. ACCOUNT REGISTRATION
          </h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <div className="ml-4 space-y-3">
              <div>
                <p className="font-medium text-[#B8B8B8]">
                  2.1 Eligibility Requirements
                </p>
                <p>To create an account, you must:</p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    Be at least 16 years of age (or the age of digital consent
                    in your jurisdiction)
                  </li>
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Promptly update account information if it changes</li>
                  <li>
                    Not be prohibited from using the Service under applicable
                    laws
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  2.2 Account Security
                </p>
                <p>You are solely responsible for:</p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    Maintaining the confidentiality of your password and
                    authentication credentials
                  </li>
                  <li>
                    All activities that occur under your account, whether
                    authorized by you or not
                  </li>
                  <li>
                    Immediately notifying us of any unauthorized access or
                    security breach at{" "}
                    <a
                      href="mailto:security@sharexpress.in"
                      className="text-[#B8B8B8] underline"
                    >
                      security@sharexpress.in
                    </a>
                  </li>
                </ul>
                <p className="mt-2 italic">
                  We are not liable for losses arising from unauthorized use of
                  your account due to your failure to maintain adequate
                  security.
                </p>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  2.3 Guest Sessions
                </p>
                <p>
                  Guest users may use the Service without registration, subject
                  to limitations:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>Guest sessions expire after 24 hours of inactivity</li>
                  <li>
                    Guest sessions do not persist across browser sessions unless
                    cookies are preserved
                  </li>
                  <li>
                    Guest users have limited quota and reduced session duration
                  </li>
                  <li>
                    We reserve the right to restrict guest access at any time
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  2.4 Account Termination
                </p>
                <p>
                  You may terminate your account at any time via account
                  settings or by contacting{" "}
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="text-[#B8B8B8] underline"
                  >
                    {CONTACT_EMAIL}
                  </a>
                  . Upon termination:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>Your account will be deactivated within 24 hours</li>
                  <li>
                    All files and session data will be permanently deleted
                    within 30 days
                  </li>
                  <li>Active sharing sessions will be immediately revoked</li>
                  <li>
                    You will lose access to all uploaded files and session
                    history
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl text-white uppercase">
            3. ACCEPTABLE USE POLICY
          </h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <p>
              You agree to use the Service only for lawful purposes and in
              accordance with these Terms. You must not:
            </p>

            <div className="ml-4 space-y-3">
              <div>
                <p className="font-medium text-[#B8B8B8]">
                  3.1 Prohibited Content
                </p>
                <p>Upload, share, or transmit any content that:</p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    Infringes intellectual property rights (copyrights,
                    trademarks, patents, trade secrets)
                  </li>
                  <li>
                    Contains malware, viruses, ransomware, trojans, or other
                    malicious code
                  </li>
                  <li>
                    Depicts or promotes child exploitation, abuse, or
                    endangerment
                  </li>
                  <li>
                    Violates privacy rights, including unauthorized disclosure
                    of personal information
                  </li>
                  <li>
                    Contains hate speech, harassment, threats, or incitement to
                    violence
                  </li>
                  <li>
                    Facilitates illegal activities, including drug trafficking,
                    terrorism, or fraud
                  </li>
                  <li>
                    Promotes self-harm, suicide, eating disorders, or dangerous
                    activities
                  </li>
                  <li>Contains spam, phishing schemes, or deceptive content</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  3.2 Prohibited Activities
                </p>
                <p>Engage in any activity that:</p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    Attempts to gain unauthorized access to our systems, other
                    users' accounts, or third-party systems
                  </li>
                  <li>
                    Reverse engineers, decompiles, or disassembles any portion
                    of the Service
                  </li>
                  <li>
                    Circumvents security measures, rate limits, or access
                    controls
                  </li>
                  <li>
                    Uses automated scripts, bots, or scrapers to access the
                    Service
                  </li>
                  <li>
                    Interferes with or disrupts the Service or servers/networks
                    connected to the Service
                  </li>
                  <li>
                    Impersonates another person or entity, or falsely represents
                    affiliation
                  </li>
                  <li>
                    Uses the Service for commercial purposes without express
                    written permission
                  </li>
                  <li>
                    Resells, sublicenses, or redistributes the Service or access
                    credentials
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  3.3 Enforcement
                </p>
                <p>
                  We reserve the right to investigate violations and take
                  appropriate action, including:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>Removing prohibited content without notice</li>
                  <li>
                    Suspending or terminating accounts that violate these Terms
                  </li>
                  <li>
                    Reporting illegal activity to law enforcement authorities
                  </li>
                  <li>
                    Cooperating with legal investigations and court orders
                  </li>
                </ul>
                <p className="mt-2 italic">
                  We are not obligated to monitor user content but reserve the
                  right to do so for security and compliance purposes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl text-white uppercase">4. FILE UPLOADS</h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <div className="ml-4 space-y-3">
              <div>
                <p className="font-medium text-[#B8B8B8]">
                  4.1 Upload Restrictions
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>Maximum file size: {MAX_FILE_SIZE} MB per file</li>
                  <li>Maximum files per upload: 30 files</li>
                  <li>
                    Daily quota: 1 GB for registered users, 100 MB for guest
                    users
                  </li>
                  <li>
                    Prohibited file types: Executable files (.exe, .bat, .cmd,
                    .sh, .app, .dmg, .jar, etc.)
                  </li>
                  <li>
                    We reserve the right to modify these limits at any time
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  4.2 Content Ownership
                </p>
                <p>
                  You retain all ownership rights to files you upload. By
                  uploading content to {SERVICE_NAME}, you grant us a limited,
                  non-exclusive, royalty-free license to:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    Store, process, and transmit your files to provide the
                    Service
                  </li>
                  <li>
                    Perform automated security scanning for malware and
                    prohibited content
                  </li>
                  <li>Create backups and ensure data redundancy</li>
                </ul>
                <p className="mt-2 font-medium text-[#B8B8B8]">
                  We do not claim ownership of your files and will not use them
                  for any purpose other than providing the Service. We do not
                  use your files to train AI systems.
                </p>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  4.3 File Retention and Deletion
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    Files are automatically deleted {RETENTION_DAYS} days after
                    upload
                  </li>
                  <li>
                    Files are immediately deleted when sharing sessions are
                    completed or revoked
                  </li>
                  <li>
                    Users may manually delete files at any time via the
                    interface
                  </li>
                  <li>
                    Deleted files are permanently purged within 24 hours and
                    cannot be recovered
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  4.4 No Backup Responsibility
                </p>
                <p className="italic">
                  {SERVICE_NAME} is not a backup or archival service. We are not
                  responsible for loss, corruption, or deletion of your files.
                  You are solely responsible for maintaining backups of
                  important data.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl text-white uppercase">
            5. INTELLECTUAL PROPERTY
          </h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <div className="ml-4 space-y-3">
              <div>
                <p className="font-medium text-[#B8B8B8]">
                  5.1 Our Intellectual Property
                </p>
                <p>
                  The Service, including its design, code, trademarks, logos,
                  and documentation, is owned by {COMPANY_NAME} and protected by
                  copyright, trademark, patent, and other intellectual property
                  laws.
                </p>
                <p className="mt-2">You may not:</p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    Copy, modify, distribute, or create derivative works of the
                    Service
                  </li>
                  <li>
                    Remove or alter any copyright, trademark, or proprietary
                    notices
                  </li>
                  <li>
                    Use our trademarks, logos, or branding without written
                    permission
                  </li>
                  <li>
                    Frame or mirror any part of the Service without
                    authorization
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  5.2 Open Source License
                </p>
                <p>
                  Portions of the Service may be released under the Apache
                  License 2.0. Such components are governed by their respective
                  open source licenses. See our GitHub repository for details.
                </p>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  5.3 DMCA Compliance
                </p>
                <p>
                  We respect intellectual property rights and comply with the
                  Digital Millennium Copyright Act (DMCA). If you believe your
                  copyrighted work has been infringed, submit a DMCA notice to{" "}
                  <a
                    href={`mailto:${LEGAL_EMAIL}`}
                    className="text-[#B8B8B8] underline"
                  >
                    {LEGAL_EMAIL}
                  </a>{" "}
                  with:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    Identification of the copyrighted work claimed to be
                    infringed
                  </li>
                  <li>
                    Identification of the allegedly infringing material and its
                    location
                  </li>
                  <li>
                    Your contact information (name, address, email, phone)
                  </li>
                  <li>
                    A statement of good faith belief that use is unauthorized
                  </li>
                  <li>
                    A statement that the information is accurate and you are
                    authorized to act
                  </li>
                  <li>Your physical or electronic signature</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Section 6 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl text-white uppercase">
            6. PRIVACY AND DATA PROTECTION
          </h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <p>
              Your use of the Service is governed by our Privacy Policy,
              available at{" "}
              <a href="/privacy" className="text-[#B8B8B8] underline">
                sharexpress.in/privacy
              </a>
              . By using the Service, you consent to our collection, use, and
              disclosure of personal information as described in the Privacy
              Policy.
            </p>

            <div className="ml-4 space-y-3">
              <div>
                <p className="font-medium text-[#B8B8B8]">6.1 Data Security</p>
                <p>
                  We implement industry-standard security measures including:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>TLS 1.3 encryption for data in transit</li>
                  <li>AES-256 encryption for files at rest</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Intrusion detection and prevention systems</li>
                </ul>
                <p className="mt-2 italic">
                  However, no security system is impenetrable. We cannot
                  guarantee absolute security of your data.
                </p>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  6.2 Data Breach Notification
                </p>
                <p>
                  In the event of a data breach affecting your personal
                  information, we will notify you within 72 hours via email and
                  provide details about the breach, data affected, and remedial
                  actions taken.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 7 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl text-white uppercase">
            7. DISCLAIMER OF WARRANTIES
          </h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <p className="font-medium text-[#B8B8B8] uppercase">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
              WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
            </p>

            <p>
              To the fullest extent permitted by law, {COMPANY_NAME} disclaims
              all warranties, including but not limited to:
            </p>

            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>
                <strong className="text-[#B8B8B8]">
                  Implied warranties of merchantability:
                </strong>{" "}
                We do not warrant that the Service is suitable for your purposes
              </li>
              <li>
                <strong className="text-[#B8B8B8]">
                  Fitness for a particular purpose:
                </strong>{" "}
                We do not guarantee the Service will meet your requirements
              </li>
              <li>
                <strong className="text-[#B8B8B8]">Non-infringement:</strong> We
                do not warrant that the Service does not infringe third-party
                rights
              </li>
              <li>
                <strong className="text-[#B8B8B8]">
                  Accuracy and reliability:
                </strong>{" "}
                We do not warrant that the Service is error-free, secure, or
                uninterrupted
              </li>
              <li>
                <strong className="text-[#B8B8B8]">Data integrity:</strong> We
                do not guarantee that files will be preserved without
                corruption, loss, or deletion
              </li>
            </ul>

            <p className="mt-4">
              Some jurisdictions do not allow exclusion of implied warranties,
              so some of these exclusions may not apply to you.
            </p>
          </div>
        </div>

        {/* Section 8 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl text-white uppercase">
            8. LIMITATION OF LIABILITY
          </h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <p className="font-medium text-[#B8B8B8] uppercase">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, {COMPANY_NAME} SHALL NOT
              BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
              PUNITIVE DAMAGES ARISING FROM OR RELATED TO YOUR USE OF THE
              SERVICE.
            </p>

            <p>This includes, but is not limited to, damages for:</p>

            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Loss of profits, revenue, or business opportunities</li>
              <li>Loss of data, files, or information</li>
              <li>Corruption or unauthorized access to data</li>
              <li>Service interruptions or downtime</li>
              <li>Security breaches or data leaks</li>
              <li>Reliance on the Service for critical operations</li>
              <li>Third-party claims arising from your use of the Service</li>
            </ul>

            <p className="mt-4 font-medium text-[#B8B8B8]">
              IN NO EVENT SHALL OUR TOTAL LIABILITY EXCEED THE GREATER OF (A)
              $100 USD OR (B) THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING
              THE CLAIM.
            </p>

            <p className="mt-4">
              Some jurisdictions do not allow limitation of liability for
              consequential damages, so these limitations may not apply to you.
            </p>
          </div>
        </div>

        {/* Section 9 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl text-white uppercase">9. INDEMNIFICATION</h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <p>
              You agree to indemnify, defend, and hold harmless {COMPANY_NAME},
              its affiliates, officers, directors, employees, agents, and
              licensors from and against any claims, liabilities, damages,
              losses, costs, or expenses (including reasonable attorney's fees)
              arising from:
            </p>

            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Your violation of these Terms</li>
              <li>Your violation of any applicable laws or regulations</li>
              <li>
                Your infringement of third-party intellectual property rights
              </li>
              <li>Content you upload, share, or transmit via the Service</li>
              <li>Your misuse of the Service or unauthorized access</li>
              <li>
                Claims by third parties arising from your sharing sessions
              </li>
            </ul>

            <p className="mt-4">
              We reserve the right to assume exclusive defense and control of
              any matter subject to indemnification, and you agree to cooperate
              with our defense of such claims.
            </p>
          </div>
        </div>

        {/* Section 10 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl text-white uppercase">
            10. DISPUTE RESOLUTION
          </h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <div className="ml-4 space-y-3">
              <div>
                <p className="font-medium text-[#B8B8B8]">
                  10.1 Informal Resolution
                </p>
                <p>
                  Before initiating formal proceedings, you agree to contact us
                  at{" "}
                  <a
                    href={`mailto:${LEGAL_EMAIL}`}
                    className="text-[#B8B8B8] underline"
                  >
                    {LEGAL_EMAIL}
                  </a>{" "}
                  to resolve disputes informally. We will attempt to resolve
                  disputes within 30 days.
                </p>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  10.2 Governing Law
                </p>
                <p>
                  These Terms are governed by the laws of India, without regard
                  to conflict of law principles. Any legal action must be
                  brought in the courts of Indore, Madhya Pradesh, India, and
                  you consent to exclusive jurisdiction and venue in such
                  courts.
                </p>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  10.3 Arbitration (Optional)
                </p>
                <p>
                  If informal resolution fails, disputes may be resolved through
                  binding arbitration under the Indian Arbitration and
                  Conciliation Act, 1996. Arbitration will be conducted in
                  English in Indore, Madhya Pradesh.
                </p>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  10.4 Class Action Waiver
                </p>
                <p className="italic">
                  You agree to resolve disputes individually and waive any right
                  to participate in class actions or class-wide arbitration.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 11 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl text-white uppercase">
            11. TERMINATION AND SUSPENSION
          </h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <p>
              We reserve the right to suspend or terminate your account and
              access to the Service, with or without notice, for:
            </p>

            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Violation of these Terms or our Acceptable Use Policy</li>
              <li>Fraudulent, abusive, or illegal activity</li>
              <li>Failure to pay fees (if applicable for premium features)</li>
              <li>Extended period of inactivity (over 12 months)</li>
              <li>
                Court orders, legal requests, or compliance with applicable laws
              </li>
              <li>
                At our discretion, if we determine your use poses security or
                legal risks
              </li>
            </ul>

            <p className="mt-4">Upon termination:</p>

            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Your access to the Service will be immediately revoked</li>
              <li>All active sharing sessions will be terminated</li>
              <li>
                Files will be deleted according to our retention schedule (30
                days)
              </li>
              <li>
                You remain liable for any obligations incurred prior to
                termination
              </li>
            </ul>

            <p className="mt-4 italic">
              Termination does not relieve you of obligations under Sections 5
              (Intellectual Property), 7 (Disclaimer), 8 (Limitation of
              Liability), and 9 (Indemnification), which survive termination.
            </p>
          </div>
        </div>

        {/* Section 12 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl text-white uppercase">
            12. GENERAL PROVISIONS
          </h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <div className="ml-4 space-y-3">
              <div>
                <p className="font-medium text-[#B8B8B8]">
                  12.1 Entire Agreement
                </p>
                <p>
                  These Terms, together with our Privacy Policy and Acceptable
                  Use Policy, constitute the entire agreement between you and{" "}
                  {COMPANY_NAME} regarding the Service, superseding any prior
                  agreements.
                </p>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  12.2 Severability
                </p>
                <p>
                  If any provision of these Terms is found to be unenforceable
                  or invalid, the remaining provisions will remain in full force
                  and effect.
                </p>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">12.3 Waiver</p>
                <p>
                  Our failure to enforce any right or provision of these Terms
                  does not constitute a waiver of such right or provision.
                </p>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  12.4 Assignment
                </p>
                <p>
                  You may not assign or transfer these Terms or your account
                  without our written consent. We may assign these Terms without
                  restriction.
                </p>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  12.5 Force Majeure
                </p>
                <p>
                  We are not liable for delays or failures in performance caused
                  by circumstances beyond our reasonable control, including acts
                  of God, natural disasters, war, terrorism, pandemics,
                  government actions, or internet outages.
                </p>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  12.6 Export Compliance
                </p>
                <p>
                  You agree to comply with all applicable export control laws
                  and not to export, re-export, or transfer the Service or any
                  technical data to prohibited countries or individuals.
                </p>
              </div>

              <div>
                <p className="font-medium text-[#B8B8B8] mt-4">
                  12.7 Third-Party Services
                </p>
                <p>
                  The Service may integrate with third-party services (e.g.,
                  OAuth providers, cloud storage). We are not responsible for
                  such third-party services and disclaim all liability arising
                  from their use.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 13 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl text-white uppercase">
            13. CHANGES TO THESE TERMS
          </h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <p>
              We reserve the right to modify these Terms at any time. When we
              make material changes, we will:
            </p>

            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Update the "Last updated" date at the top of this page</li>
              <li>
                Send an email notification to your registered email address
              </li>
              <li>Display a prominent notice on our website for 30 days</li>
            </ul>

            <p className="mt-4">
              Your continued use of the Service after such notification
              constitutes acceptance of the modified Terms. If you do not agree
              to the changes, you must discontinue use and may delete your
              account.
            </p>

            <p className="mt-4">
              We encourage you to review these Terms periodically.
            </p>
          </div>
        </div>

        {/* Section 14 */}
        <div className="mt-20 space-y-8">
          <h2 className="text-2xl text-white uppercase">14. CONTACT US</h2>

          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <p>
              If you have questions or concerns about these Terms, please
              contact us:
            </p>

            <div className="ml-4 mt-4 space-y-2">
              <p>
                <strong className="text-[#B8B8B8]">General Inquiries:</strong>{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-[#B8B8B8] underline"
                >
                  {CONTACT_EMAIL}
                </a>
              </p>
              <p>
                <strong className="text-[#B8B8B8]">Legal Matters:</strong>{" "}
                <a
                  href={`mailto:${LEGAL_EMAIL}`}
                  className="text-[#B8B8B8] underline"
                >
                  {LEGAL_EMAIL}
                </a>
              </p>
              <p>
                <strong className="text-[#B8B8B8]">Security Issues:</strong>{" "}
                <a
                  href="mailto:security@sharexpress.in"
                  className="text-[#B8B8B8] underline"
                >
                  security@sharexpress.in
                </a>
              </p>
              <p>
                <strong className="text-[#B8B8B8]">Mailing Address:</strong>
                <br />
                {COMPANY_NAME}
                <br />
                Attn: Legal Department
                <br />
                Indore, Madhya Pradesh, 452001
                <br />
                India
              </p>
            </div>

            <p className="mt-6">
              We will respond to inquiries within 5 business days.
            </p>
          </div>
        </div>

        {/* Acknowledgment */}
        <div className="mt-20 pt-12 border-t border-white/10">
          <div className="space-y-4 text-[#B8B8B8] leading-relaxed">
            <p className="font-medium text-[#B8B8B8] uppercase">
              ACKNOWLEDGMENT OF TERMS
            </p>
            <p>
              By clicking "I Agree", creating an account, or accessing the
              Service, you acknowledge that you have read, understood, and agree
              to be bound by these Terms of Service.
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

export default TermsOfServicePage;
