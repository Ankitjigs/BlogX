export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white py-24 sm:py-32 dark:bg-[#0a0a0a]">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1>Privacy Policy</h1>
          <p className="text-sm text-slate-500">Last updated: March 11, 2026</p>

          <p>
            This Privacy Policy describes how BlogX ("we," "us," or "our") collects, uses, and shares your personal information when you use our website, platform, and services (collectively, the "Services").
          </p>

          <h2>1. Information We Collect</h2>
          <p>We collect information that you provide securely to us, such as:</p>
          <ul>
            <li><strong>Account Information:</strong> Name, email address, and authentication credentials.</li>
            <li><strong>Content:</strong> Blog posts, drafts, images, and other materials you upload.</li>
            <li><strong>Payment Information:</strong> Processed securely via our payment providers (e.g., Stripe); we do not store full credit card numbers.</li>
          </ul>
          
          <p>We also automatically collect information when you use the Services, including:</p>
          <ul>
            <li><strong>Log Data:</strong> IP address, browser type, operating system, and pages visited.</li>
            <li><strong>Usage Data:</strong> How you interact with the editor and platform features.</li>
            <li><strong>Cookies:</strong> Small data files stored on your device. Please see our <a href="/cookies">Cookie Policy</a> for more details.</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use the collected information for various purposes, including to:</p>
          <ul>
            <li>Provide, maintain, and improve our Services.</li>
            <li>Process transactions and send related information.</li>
            <li>Send technical notices, updates, and support messages.</li>
            <li>Respond to your comments, questions, and requests.</li>
            <li>Analyze usage trends and personalize your experience.</li>
            <li>Train our AI models (only if you explicitly opt-in; your private drafts are never used for training without consent).</li>
          </ul>

          <h2>3. Information Sharing</h2>
          <p>We may share your information with:</p>
          <ul>
            <li><strong>Service Providers:</strong> Third-party vendors who assist us with hosting, analytics, and customer support.</li>
            <li><strong>Legal Compliance:</strong> When required by law or to protect our rights and the safety of our users.</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, sale of company assets, or acquisition.</li>
          </ul>
          <p>We do not sell your personal information to third parties.</p>

          <h2>4. Data Security</h2>
          <p>
            We implement reasonable security measures, including encryption and strict access controls, to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is completely secure, and we cannot guarantee absolute security.
          </p>

          <h2>5. Your Rights</h2>
          <p>
            You have the right to access, update, or delete your personal information. You can do this within your account settings or by contacting us. Depending on your location (e.g., GDPR, CCPA), you may have additional rights regarding your data.
          </p>

          <h2>6. Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy, please contact us at <a href="mailto:privacy@blogx.com">privacy@blogx.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
