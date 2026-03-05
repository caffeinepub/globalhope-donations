import { useGetLegalPage } from "@/hooks/useQueries";
import { ShieldCheck } from "lucide-react";
import LegalPageLayout, { LegalSection } from "../components/LegalPageLayout";

const PAGE_ID = "privacy";

const SECTIONS = [
  { id: "introduction", title: "Introduction" },
  { id: "information-collected", title: "Information We Collect" },
  { id: "how-we-use", title: "How We Use Your Information" },
  { id: "third-party", title: "Third-Party Services" },
  { id: "security", title: "Security Measures" },
  { id: "your-rights", title: "Your Rights" },
  { id: "contact", title: "Contact Us" },
];

function DefaultContent() {
  return (
    <>
      <LegalSection id="introduction" title="Introduction">
        <p>
          GlobalHope Donations ("we," "our," or "us") is committed to protecting
          your privacy. This Privacy Policy explains how we collect, use,
          disclose, and safeguard your information when you use our charity
          donation platform. Please read this policy carefully before using our
          services.
        </p>
        <p>
          By accessing or using GlobalHope Donations, you agree to the
          collection and use of information in accordance with this policy.
        </p>
      </LegalSection>

      <LegalSection id="information-collected" title="Information We Collect">
        <p>We may collect the following categories of personal information:</p>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li>
            <strong>Name</strong> — Your full name, used to personalise donation
            receipts and acknowledge your contribution.
          </li>
          <li>
            <strong>Email address</strong> — Used to send donation
            confirmations, receipts, and important platform communications.
          </li>
          <li>
            <strong>Donation amount</strong> — The value and currency of each
            donation you make.
          </li>
          <li>
            <strong>Payment details</strong> — Processed securely by our
            third-party payment providers (Stripe, PayPal, Razorpay). We do not
            store raw card numbers or payment credentials.
          </li>
          <li>
            <strong>Phone number</strong> — Optional; collected to facilitate
            communication regarding your donation if needed.
          </li>
          <li>
            <strong>IP address and device information</strong> — Collected
            automatically to prevent fraud and improve platform security.
          </li>
        </ul>
        <p>
          When you choose to donate anonymously, your name is not displayed
          publicly, though we still process the technical data required to
          complete your payment.
        </p>
      </LegalSection>

      <LegalSection id="how-we-use" title="How We Use Your Information">
        <p>Your information is used for the following purposes:</p>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li>
            <strong>Processing donations</strong> — To complete your donation
            transaction and update campaign progress.
          </li>
          <li>
            <strong>Sending receipts</strong> — To email you a confirmation and
            tax receipt for your donation.
          </li>
          <li>
            <strong>Platform improvements</strong> — To analyse usage patterns
            and improve the usability and performance of our platform.
          </li>
          <li>
            <strong>Fraud prevention</strong> — To detect, prevent, and address
            fraudulent transactions and abuse of our platform.
          </li>
          <li>
            <strong>Legal compliance</strong> — To comply with applicable laws,
            regulations, and court orders.
          </li>
        </ul>
        <p>
          We do not sell, trade, or rent your personal information to third
          parties for marketing purposes.
        </p>
      </LegalSection>

      <LegalSection id="third-party" title="Third-Party Services">
        <p>
          We work with the following trusted third-party service providers who
          may process your data:
        </p>
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="font-semibold text-foreground mb-0.5">Stripe</p>
            <p>
              Processes international card payments. Stripe is PCI-DSS
              compliant. See{" "}
              <a
                href="https://stripe.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:underline"
              >
                Stripe's Privacy Policy
              </a>
              .
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="font-semibold text-foreground mb-0.5">PayPal</p>
            <p>
              Processes PayPal and card payments globally. See{" "}
              <a
                href="https://www.paypal.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:underline"
              >
                PayPal's Privacy Policy
              </a>
              .
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="font-semibold text-foreground mb-0.5">Razorpay</p>
            <p>
              Processes UPI and Indian payment methods. See{" "}
              <a
                href="https://razorpay.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:underline"
              >
                Razorpay's Privacy Policy
              </a>
              .
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="font-semibold text-foreground mb-0.5">
              Google Analytics
            </p>
            <p>
              Used to understand how visitors interact with our platform. Data
              is anonymised where possible. See{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:underline"
              >
                Google's Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </LegalSection>

      <LegalSection id="security" title="Security Measures">
        <p>
          We implement industry-standard security measures to protect your
          personal information:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li>
            <strong>Encrypted payments</strong> — All payment data is
            transmitted using TLS/SSL encryption (256-bit) and processed by
            PCI-DSS-compliant payment providers.
          </li>
          <li>
            <strong>Secure data storage</strong> — Donor data is stored on the
            Internet Computer blockchain, which provides tamper-evident,
            decentralised data storage.
          </li>
          <li>
            <strong>Access controls</strong> — Admin access requires strong
            authentication. User data access is restricted on a need-to-know
            basis.
          </li>
          <li>
            <strong>Regular audits</strong> — We periodically review our
            security practices and update them to address emerging threats.
          </li>
        </ul>
        <p>
          While we strive to protect your data, no method of electronic
          transmission or storage is 100% secure. We cannot guarantee absolute
          security.
        </p>
      </LegalSection>

      <LegalSection id="your-rights" title="Your Rights">
        <p>
          Under GDPR and applicable data protection laws, you have the following
          rights:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li>
            <strong>Access your data</strong> — You may request a copy of the
            personal information we hold about you.
          </li>
          <li>
            <strong>Request deletion</strong> — You may request that we delete
            your personal data, subject to legal retention requirements.
          </li>
          <li>
            <strong>Opt-out from emails</strong> — You can unsubscribe from
            non-essential communications at any time using the unsubscribe link
            in our emails.
          </li>
          <li>
            <strong>Data portability</strong> — You may request your data in a
            machine-readable format.
          </li>
          <li>
            <strong>Rectification</strong> — You may request correction of
            inaccurate personal data.
          </li>
          <li>
            <strong>Object to processing</strong> — You may object to certain
            types of processing of your personal data.
          </li>
        </ul>
        <p>
          To exercise any of these rights, please contact us using the details
          below.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact Us">
        <p>
          If you have questions about this Privacy Policy or wish to exercise
          your data rights, please contact us:
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
        <p>
          We aim to respond to all privacy-related enquiries within 30 days.
        </p>
      </LegalSection>
    </>
  );
}

export default function PrivacyPolicyPage() {
  const { data: legalPage, isLoading } = useGetLegalPage(PAGE_ID);

  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle="How we collect, use, and protect your personal information."
      icon={<ShieldCheck className="w-6 h-6" />}
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
