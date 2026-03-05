import { useGetLegalPage } from "@/hooks/useQueries";
import { Heart } from "lucide-react";
import LegalPageLayout, { LegalSection } from "../components/LegalPageLayout";

const PAGE_ID = "donor-privacy";

const SECTIONS = [
  { id: "introduction", title: "Introduction" },
  { id: "visibility-options", title: "Your Donation Visibility" },
  { id: "information-protected", title: "Information We Protect" },
  { id: "payment-processors", title: "Payment Processors" },
  { id: "data-retention", title: "Data Retention" },
  { id: "your-rights", title: "Your Rights" },
  { id: "contact", title: "Contact Us" },
];

function DefaultContent() {
  return (
    <>
      <LegalSection id="introduction" title="Introduction">
        <p>
          At GlobalHope Donations, we deeply respect the privacy of our donors.
          This Donor Privacy Policy explains specifically how we handle your
          personal information as a donor, what visibility options you have, and
          how your payment and personal data are protected.
        </p>
        <p>
          Our commitment is to give you meaningful control over your donation
          experience while maintaining the transparency and accountability that
          charitable giving deserves.
        </p>
      </LegalSection>

      <LegalSection
        id="visibility-options"
        title="Your Donation Visibility Options"
      >
        <p>
          When making a donation, you have full control over whether your name
          appears publicly:
        </p>
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-border bg-muted/30">
            <p className="font-semibold text-foreground mb-2">
              Public Donor List
            </p>
            <p>
              By default, your name (as provided) may appear in the campaign's
              donor list as a way to acknowledge your generosity and inspire
              others to contribute. Your donation amount is also displayed
              alongside your name in the public supporter list.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Your email address, phone number, and payment details are{" "}
              <strong>never</strong> shown publicly.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-orange-100 bg-orange-50">
            <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4 text-orange-500" />
              Anonymous Donation Option
            </p>
            <p>
              You can choose to donate anonymously by toggling the "Donate
              anonymously" option in the donation form. When you donate
              anonymously:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
              <li>
                Your name will appear as "Anonymous" in all public donor lists.
              </li>
              <li>
                No identifying information about you will be displayed publicly.
              </li>
              <li>
                Your donation is still processed and recorded internally for
                compliance purposes, but your identity remains private.
              </li>
            </ul>
          </div>
        </div>
        <p>
          You can change your anonymity preference by contacting us, though we
          cannot retroactively modify historical donation records in all cases.
        </p>
      </LegalSection>

      <LegalSection id="information-protected" title="Information We Protect">
        <p>
          The following donor information is treated as confidential and is
          never shared publicly or sold to third parties:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              label: "Email Address",
              desc: "Used only for receipts and communication. Never publicly visible.",
            },
            {
              label: "Phone Number",
              desc: "Optional. Used only for direct communication if needed.",
            },
            {
              label: "Payment Details",
              desc: "Card numbers, bank details, and UPI IDs are processed by payment providers only.",
            },
            {
              label: "Billing Address",
              desc: "Collected by payment processors for fraud prevention only.",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="p-3 rounded-xl border border-border bg-muted/30"
            >
              <p className="font-semibold text-foreground text-sm mb-0.5">
                {item.label}
              </p>
              <p className="text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
        <p>
          We implement technical and organisational measures to protect this
          information from unauthorised access, disclosure, or misuse.
        </p>
      </LegalSection>

      <LegalSection id="payment-processors" title="Payment Processors">
        <p>
          Your payment data is handled exclusively by the following trusted,
          industry-certified payment processors. We do not store your raw
          payment credentials on our servers.
        </p>
        <div className="space-y-3">
          <div className="p-4 rounded-xl border border-border bg-muted/30">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-foreground">Stripe</p>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                PCI-DSS Level 1
              </span>
            </div>
            <p>
              Handles international card payments (Visa, Mastercard, American
              Express, and more). All card data is tokenised and never touches
              our servers.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-muted/30">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-foreground">PayPal</p>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                PCI-DSS Compliant
              </span>
            </div>
            <p>
              Handles PayPal account payments and select card payments globally.
              Transactions are processed within PayPal's secure environment.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-muted/30">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-foreground">Razorpay</p>
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
                RBI Authorised
              </span>
            </div>
            <p>
              Handles UPI and other Indian payment methods. All transactions
              comply with RBI regulations and are secured by Razorpay's
              infrastructure.
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Each payment processor is subject to their own privacy and security
          policies. We encourage you to review them before donating.
        </p>
      </LegalSection>

      <LegalSection id="data-retention" title="Data Retention">
        <p>We retain donor data for the following periods:</p>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li>
            <strong>Donation records</strong> — Retained for a minimum of 7
            years for charity compliance, tax, and audit purposes.
          </li>
          <li>
            <strong>Personal information (name, email)</strong> — Retained while
            your account is active and for 2 years after your last interaction.
          </li>
          <li>
            <strong>Payment processor records</strong> — Governed by the
            retention policies of Stripe, PayPal, and Razorpay respectively.
          </li>
        </ul>
        <p>
          You may request deletion of your data at any time; however, legally
          required records (such as financial transaction records) may be
          retained despite such requests.
        </p>
      </LegalSection>

      <LegalSection id="your-rights" title="Your Rights">
        <p>
          As a donor, you have the following rights regarding your personal
          data:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li>
            <strong>Access</strong> — Request a copy of the data we hold about
            you.
          </li>
          <li>
            <strong>Correction</strong> — Request correction of inaccurate or
            incomplete data.
          </li>
          <li>
            <strong>Deletion</strong> — Request deletion of your personal data,
            subject to legal retention obligations.
          </li>
          <li>
            <strong>Anonymity</strong> — Request that your name be anonymised in
            public-facing donor lists.
          </li>
          <li>
            <strong>Opt-out</strong> — Unsubscribe from marketing and
            non-essential email communications at any time.
          </li>
          <li>
            <strong>Portability</strong> — Request your donation history data in
            a machine-readable format.
          </li>
        </ul>
        <p>
          To exercise any of these rights, please contact our Privacy Team using
          the details below.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact Us">
        <p>
          For questions about donor privacy, to exercise your rights, or for any
          other privacy-related concerns:
        </p>
        <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 space-y-1">
          <p className="font-semibold text-foreground">
            GlobalHope Donations – Privacy Team
          </p>
          <p>
            Email:{" "}
            <a
              href="mailto:donorprivacy@globalhope.org"
              className="text-orange-600 hover:underline"
            >
              donorprivacy@globalhope.org
            </a>
          </p>
          <p>Address: 123 Giving Way, New York, NY 10001, United States</p>
        </div>
        <p>
          We will respond to all donor privacy requests within 30 days of
          receipt.
        </p>
      </LegalSection>
    </>
  );
}

export default function DonorPrivacyPage() {
  const { data: legalPage, isLoading } = useGetLegalPage(PAGE_ID);

  return (
    <LegalPageLayout
      title="Donor Privacy Policy"
      subtitle="How we protect your identity and personal information as a donor."
      icon={<Heart className="w-6 h-6" />}
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
