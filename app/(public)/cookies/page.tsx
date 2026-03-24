import { CookiePreferencesButton } from "@/components/ui/cookie-preferences-button";

export default function CookiesPolicyPage() {
  return (
    <div className="min-h-screen bg-white py-24 sm:py-32 dark:bg-[#0a0a0a]">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1>Cookie Policy</h1>
          <p className="text-sm text-slate-500">Last updated: March 11, 2026</p>

          <p>
            This Cookie Policy explains how BlogX (&quot;we&quot;,
            &quot;us&quot;, and &quot;our&quot;) uses cookies and similar
            technologies to recognize you when you visit our website at
            blogx.com and use our publishing platform. It explains what these
            technologies are and why we use them, as well as your rights to
            control our use of them.
          </p>

          <h2>1. What are cookies?</h2>
          <p>
            Cookies are small data files that are placed on your computer or
            mobile device when you visit a website. Cookies are widely used by
            website owners in order to make their websites work, or to work more
            efficiently, as well as to provide reporting information.
          </p>
          <p>
            Cookies set by the website owner (in this case, BlogX) are called
            &quot;first-party cookies&quot;. Cookies set by parties other than
            the website owner are called &quot;third-party cookies&quot;.
            Third-party cookies enable third-party features or functionality to
            be provided on or through the website (e.g., advertising,
            interactive content, and analytics). The parties that set these
            third-party cookies can recognize your computer both when it visits
            the website in question and also when it visits certain other
            websites.
          </p>

          <h2>2. Why do we use cookies?</h2>
          <p>
            We use first and third-party cookies for several reasons. Some
            cookies are required for technical reasons in order for our websites
            to operate, and we refer to these as &quot;essential&quot; or
            &quot;strictly necessary&quot; cookies. Other cookies also enable us
            to track and target the interests of our users to enhance the
            experience on our properties. Third parties serve cookies through
            our websites for advertising, analytics, and other purposes.
          </p>

          <h3>Essential Cookies</h3>
          <p>
            These cookies are strictly necessary to provide you with services
            available through our website and to use some of its features, such
            as access to secure areas (like the Editor). Because these cookies
            are strictly necessary to deliver the website, you cannot refuse
            them without impacting how our website functions.
          </p>
          <ul>
            <li>
              <strong>Clerk Authentication</strong>: Used to securely identify
              you and maintain your authenticated session.
            </li>
            <li>
              <strong>Security Tokens</strong>: Prevents cross-site request
              forgery and other security vulnerabilities.
            </li>
          </ul>

          <h3>Performance and Analytics Cookies</h3>
          <p>
            These cookies collect information that is used either in aggregate
            form to help us understand how our websites are being used or how
            effective our marketing campaigns are, or to help us customize our
            websites and application for you in order to enhance your
            experience.
          </p>
          <ul>
            <li>
              <strong>Usage Metrics</strong>: Helps us track page views, time
              spent on editor tools, and overall platform performance.
            </li>
            <li>
              <strong>Error Tracking</strong>: Monitors application stability
              and logs errors securely so our engineers can fix bugs.
            </li>
          </ul>

          <h2>3. How can I control cookies?</h2>
          <p>
            You have the right to decide whether to accept or reject cookies.
            You can exercise your cookie preferences by clicking on the
            appropriate opt-out links provided in the cookie banner upon your
            first visit, or by adjusting your browser settings.
          </p>
          <p>
            You can set or amend your web browser controls to accept or refuse
            cookies. If you choose to reject cookies, you may still use our
            website though your access to some functionality and areas of our
            website may be restricted. As the means by which you can refuse
            cookies through your web browser controls vary from
            browser-to-browser, you should visit your browser&apos;s help menu
            for more information.
          </p>

          <h2>4. Updates to this Cookie Policy</h2>
          <p>
            We may update this Cookie Policy from time to time in order to
            reflect, for example, changes to the cookies we use or for other
            operational, legal, or regulatory reasons. Please therefore re-visit
            this Cookie Policy regularly to stay informed about our use of
            cookies and related technologies.
          </p>

          <div className="mt-12 rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <h3 className="mt-0 text-lg font-semibold">
              Manage your preferences
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              You can always adjust your cookie settings for this device.
            </p>
            <div className="mt-4 flex gap-4">
              <CookiePreferencesButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
