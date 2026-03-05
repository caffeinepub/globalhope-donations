import { useGetLegalPage } from "@/hooks/useQueries";
import { Cookie } from "lucide-react";
import LegalPageLayout, { LegalSection } from "../components/LegalPageLayout";

const PAGE_ID = "cookies";

const SECTIONS = [
  { id: "introduction", title: "Introduction" },
  { id: "what-are-cookies", title: "What Are Cookies" },
  { id: "cookies-we-use", title: "Cookies We Use" },
  { id: "managing-cookies", title: "Managing Cookies" },
  { id: "third-party", title: "Third-Party Cookies" },
  { id: "contact", title: "Contact Us" },
];

function DefaultContent() {
  return (
    <>
      <LegalSection id="introduction" title="Introduction">
        <p>
          This Cookie Policy explains how GlobalHope Donations uses cookies and
          similar tracking technologies when you visit our platform. By using
          our website, you consent to our use of cookies as described in this
          policy.
        </p>
        <p>
          You can manage your cookie preferences at any time using the "Manage
          Preferences" option in the cookie consent banner, or through your
          browser settings.
        </p>
      </LegalSection>

      <LegalSection id="what-are-cookies" title="What Are Cookies">
        <p>
          Cookies are small text files that are placed on your device (computer,
          tablet, or mobile phone) when you visit a website. They are widely
          used to make websites work correctly, improve efficiency, and provide
          information to website owners.
        </p>
        <p>Cookies can be:</p>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li>
            <strong>Session cookies</strong> — Temporary cookies that are
            deleted when you close your browser.
          </li>
          <li>
            <strong>Persistent cookies</strong> — Cookies that remain on your
            device for a set period or until you manually delete them.
          </li>
          <li>
            <strong>First-party cookies</strong> — Set directly by GlobalHope
            Donations.
          </li>
          <li>
            <strong>Third-party cookies</strong> — Set by external services we
            use (e.g., analytics providers).
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="cookies-we-use" title="Cookies We Use">
        <p>We use the following types of cookies on our platform:</p>
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-border bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                Essential
              </span>
            </div>
            <p className="font-semibold text-foreground mb-1">
              Website Functionality
            </p>
            <p>
              These cookies are strictly necessary for the platform to function.
              They enable core features such as secure authentication, session
              management, and navigation. Without these cookies, the site cannot
              operate correctly.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Examples: authentication tokens, session identifiers, CSRF
              protection tokens.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                Analytics
              </span>
            </div>
            <p className="font-semibold text-foreground mb-1">Analytics</p>
            <p>
              These cookies help us understand how visitors use our platform by
              collecting anonymised information about page views, session
              duration, and user journeys. This allows us to improve the
              platform's performance and usability.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Provider: Google Analytics. Data is anonymised before processing.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                Preference
              </span>
            </div>
            <p className="font-semibold text-foreground mb-1">
              User Preferences
            </p>
            <p>
              These cookies remember your preferences and settings on our
              platform, such as your chosen currency, language preferences, and
              whether you have accepted our cookie policy.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Examples: cookie consent status, selected currency, display
              preferences.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                Security
              </span>
            </div>
            <p className="font-semibold text-foreground mb-1">
              Fraud Detection
            </p>
            <p>
              These cookies are used by our payment processors and security
              systems to detect and prevent fraudulent transactions. They
              analyse behavioural patterns to identify suspicious activity.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Providers: Stripe, PayPal, Razorpay (fraud detection modules).
            </p>
          </div>
        </div>
      </LegalSection>

      <LegalSection id="managing-cookies" title="Managing Cookies">
        <p>You have several options to manage and control cookies:</p>
        <div className="space-y-3">
          <div>
            <p className="font-semibold text-foreground mb-1">
              Through our platform
            </p>
            <p>
              Use the "Manage Preferences" option in the cookie consent banner
              to control non-essential cookies. Note that disabling essential
              cookies may affect the functionality of the platform.
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground mb-1">
              Through your browser
            </p>
            <p>
              Most browsers allow you to view, manage, and delete cookies
              through their settings. Refer to your browser's help section for
              instructions:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-2 text-xs">
              <li>
                <a
                  href="https://support.google.com/chrome/answer/95647"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:underline"
                >
                  Google Chrome
                </a>
              </li>
              <li>
                <a
                  href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:underline"
                >
                  Mozilla Firefox
                </a>
              </li>
              <li>
                <a
                  href="https://support.apple.com/en-us/HT201265"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:underline"
                >
                  Safari
                </a>
              </li>
              <li>
                <a
                  href="https://support.microsoft.com/en-us/windows/manage-cookies-in-microsoft-edge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:underline"
                >
                  Microsoft Edge
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-foreground mb-1">Opt-out tools</p>
            <p>
              You can opt out of Google Analytics tracking by installing the{" "}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:underline"
              >
                Google Analytics Opt-out Browser Add-on
              </a>
              .
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs text-orange-700 bg-orange-50 border border-orange-100 rounded-lg p-3">
          <strong>Note:</strong> Disabling or deleting certain cookies may
          impact your experience on the platform, particularly those required
          for payment processing or authentication.
        </p>
      </LegalSection>

      <LegalSection id="third-party" title="Third-Party Cookies">
        <p>
          Some cookies are placed by third-party services that appear on our
          pages. We do not control these cookies and they are governed by the
          privacy policies of the respective third parties:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li>
            <strong>Google Analytics</strong> — Analytical cookies to track
            platform usage.
          </li>
          <li>
            <strong>Stripe</strong> — Payment security and fraud detection
            cookies.
          </li>
          <li>
            <strong>PayPal</strong> — Payment processing and fraud prevention
            cookies.
          </li>
          <li>
            <strong>Razorpay</strong> — UPI payment security cookies.
          </li>
        </ul>
        <p>
          We recommend reviewing the privacy and cookie policies of these third
          parties to understand how they use your data.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact Us">
        <p>
          If you have questions about our use of cookies or this Cookie Policy,
          please contact us:
        </p>
        <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 space-y-1">
          <p className="font-semibold text-foreground">GlobalHope Donations</p>
          <p>
            Email:{" "}
            <a
              href="mailto:privacy@globalhope.org"
              className="text-orange-600 hover:underline"
            >
              privacy@globalhope.org
            </a>
          </p>
          <p>Address: 123 Giving Way, New York, NY 10001, United States</p>
        </div>
      </LegalSection>
    </>
  );
}

export default function CookiePolicyPage() {
  const { data: legalPage, isLoading } = useGetLegalPage(PAGE_ID);

  return (
    <LegalPageLayout
      title="Cookie Policy"
      subtitle="How we use cookies and similar technologies on our platform."
      icon={<Cookie className="w-6 h-6" />}
      sections={SECTIONS}
      isLoading={isLoading}
      updatedAt="March 2026"
    >
      {legalPage?.content ? (
        <div
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Admin-entered content
          dangerouslySetInnerHTML={{ __html: legalPage.content }}
          className="prose-legal"
        />
      ) : (
        <DefaultContent />
      )}
    </LegalPageLayout>
  );
}
