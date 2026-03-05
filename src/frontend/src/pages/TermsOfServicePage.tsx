import { useGetLegalPage } from "@/hooks/useQueries";
import { FileText } from "lucide-react";
import LegalPageLayout, { LegalSection } from "../components/LegalPageLayout";

const PAGE_ID = "terms";

const SECTIONS = [
  { id: "introduction", title: "Introduction" },
  { id: "platform-purpose", title: "Platform Purpose" },
  { id: "user-responsibilities", title: "User Responsibilities" },
  { id: "donation-policy", title: "Donation Policy" },
  { id: "platform-rights", title: "Platform Rights" },
  { id: "liability", title: "Liability Limitations" },
  { id: "changes", title: "Changes to Terms" },
  { id: "contact", title: "Contact Us" },
];

function DefaultContent() {
  return (
    <>
      <LegalSection id="introduction" title="Introduction">
        <p>
          Welcome to GlobalHope Donations. These Terms of Service ("Terms")
          govern your access to and use of our platform, including our website,
          donation features, and all related services. By using GlobalHope
          Donations, you agree to be bound by these Terms.
        </p>
        <p>
          If you do not agree with any part of these Terms, please do not use
          our platform. We reserve the right to update these Terms at any time,
          and your continued use constitutes acceptance of the revised Terms.
        </p>
      </LegalSection>

      <LegalSection id="platform-purpose" title="Platform Purpose">
        <p>
          GlobalHope Donations is an online charity donation platform designed
          to connect compassionate donors with meaningful causes worldwide. Our
          platform enables:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li>
            Individuals and organisations to create fundraising campaigns for
            charitable purposes.
          </li>
          <li>
            Donors globally to contribute financially to campaigns they wish to
            support.
          </li>
          <li>
            Campaign organisers to track progress, share updates, and
            communicate with donors.
          </li>
        </ul>
        <p>
          GlobalHope Donations acts as a platform facilitator. We do not
          independently verify the authenticity of every campaign but take
          reasonable steps to ensure platform integrity.
        </p>
      </LegalSection>

      <LegalSection id="user-responsibilities" title="User Responsibilities">
        <p>
          By using our platform, you agree to the following responsibilities:
        </p>
        <div className="space-y-4">
          <div>
            <p className="font-semibold text-foreground mb-1">
              Provide Accurate Information
            </p>
            <p>
              You must provide truthful, accurate, and up-to-date information
              when creating campaigns, making donations, or registering an
              account. Misrepresentation of any kind is strictly prohibited.
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground mb-1">
              No Fraudulent Donations
            </p>
            <p>
              You must not make donations using stolen payment methods, engage
              in money laundering, or attempt to manipulate campaign statistics
              or progress figures fraudulently.
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground mb-1">
              Respect Platform Rules
            </p>
            <p>
              You must not use our platform to promote illegal activities,
              harass other users, upload malicious content, or circumvent
              security measures. You must comply with all applicable laws and
              regulations.
            </p>
          </div>
        </div>
      </LegalSection>

      <LegalSection id="donation-policy" title="Donation Policy">
        <div className="space-y-4">
          <div>
            <p className="font-semibold text-foreground mb-1">
              Donations are Voluntary
            </p>
            <p>
              All donations made through GlobalHope Donations are entirely
              voluntary. You are under no obligation to donate any amount, and
              there is no minimum donation required unless otherwise specified
              by a campaign.
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground mb-1">Refund Policy</p>
            <p>
              Refunds are generally not available once a donation has been
              processed. However, refunds may be considered on a case-by-case
              basis at the discretion of the campaign organiser and GlobalHope
              Donations in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
              <li>Technical errors resulting in duplicate charges.</li>
              <li>
                Campaign found to be fraudulent or in violation of these Terms.
              </li>
              <li>
                Specific campaign policies that permit refunds within a defined
                timeframe.
              </li>
            </ul>
            <p className="mt-2">
              To request a refund, contact us at{" "}
              <a
                href="mailto:support@globalhope.org"
                className="text-orange-600 hover:underline"
              >
                support@globalhope.org
              </a>{" "}
              within 14 days of the transaction.
            </p>
          </div>
        </div>
      </LegalSection>

      <LegalSection id="platform-rights" title="Platform Rights">
        <p>GlobalHope Donations reserves the right to:</p>
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="font-semibold text-foreground mb-0.5">
              Remove Fraudulent Campaigns
            </p>
            <p>
              We may remove, suspend, or modify any campaign that we determine,
              in our sole discretion, violates these Terms, is fraudulent,
              misleading, or harmful to donors or third parties.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="font-semibold text-foreground mb-0.5">
              Suspend Accounts
            </p>
            <p>
              We may suspend or permanently terminate user accounts that violate
              these Terms, engage in fraudulent behaviour, or otherwise harm the
              integrity of the platform.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="font-semibold text-foreground mb-0.5">
              Modify the Platform
            </p>
            <p>
              We may update, modify, or discontinue any feature of the platform
              at any time, with or without notice, without liability to you.
            </p>
          </div>
        </div>
      </LegalSection>

      <LegalSection id="liability" title="Liability Limitations">
        <p>To the maximum extent permitted by applicable law:</p>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li>
            GlobalHope Donations is not responsible for the actions, omissions,
            or misuse of funds by third-party campaign organisers. We facilitate
            donations but do not guarantee how funds raised will be utilised.
          </li>
          <li>
            We are not liable for any indirect, incidental, special,
            consequential, or punitive damages arising from your use of the
            platform.
          </li>
          <li>
            We do not warrant that the platform will be error-free,
            uninterrupted, or free from viruses or other harmful components.
          </li>
          <li>
            Our total liability to you for any claim arising from or related to
            these Terms or your use of the platform shall not exceed the amount
            you donated in the 12 months preceding the claim.
          </li>
        </ul>
        <p>
          We strongly encourage donors to research campaigns thoroughly before
          donating.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Changes to Terms">
        <p>
          We may modify these Terms of Service at any time. When we make
          material changes, we will:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li>Update the "Last updated" date at the top of this page.</li>
          <li>
            Notify users via email (if you have provided your email address) or
            via a prominent notice on the platform.
          </li>
        </ul>
        <p>
          Your continued use of the platform after changes become effective
          constitutes your acceptance of the revised Terms. If you do not agree
          with the updated Terms, please discontinue use of the platform.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact Us">
        <p>
          For questions, concerns, or legal enquiries regarding these Terms of
          Service, please contact us:
        </p>
        <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 space-y-1">
          <p className="font-semibold text-foreground">GlobalHope Donations</p>
          <p>
            Email:{" "}
            <a
              href="mailto:legal@globalhope.org"
              className="text-orange-600 hover:underline"
            >
              legal@globalhope.org
            </a>
          </p>
          <p>Address: 123 Giving Way, New York, NY 10001, United States</p>
        </div>
      </LegalSection>
    </>
  );
}

export default function TermsOfServicePage() {
  const { data: legalPage, isLoading } = useGetLegalPage(PAGE_ID);

  return (
    <LegalPageLayout
      title="Terms of Service"
      subtitle="The rules and guidelines governing your use of GlobalHope Donations."
      icon={<FileText className="w-6 h-6" />}
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
