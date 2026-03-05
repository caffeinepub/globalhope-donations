import { useNavigate } from "@tanstack/react-router";
import { Heart, Mail, MapPin, Phone } from "lucide-react";
import { SiFacebook, SiInstagram, SiLinkedin, SiX } from "react-icons/si";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;
  const navigate = useNavigate();

  return (
    <footer className="bg-foreground text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <button
              type="button"
              onClick={() => navigate({ to: "/" })}
              className="flex items-center gap-2.5 mb-4"
            >
              <div className="w-8 h-8 rounded-lg orange-gradient flex items-center justify-center">
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-display text-xl font-bold">
                Global<span className="text-orange-400">Hope</span>
              </span>
            </button>
            <p className="text-sm text-white/60 leading-relaxed mb-6">
              Connecting compassionate hearts with meaningful causes around the
              world. Every donation creates ripples of change.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: SiFacebook, label: "Facebook" },
                { icon: SiX, label: "X" },
                { icon: SiInstagram, label: "Instagram" },
                { icon: SiLinkedin, label: "LinkedIn" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="https://globalhope.org"
                  aria-label={label}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-orange-500 flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-sm uppercase tracking-widest text-white/40 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Home", to: "/" as const },
                { label: "All Campaigns", to: "/campaigns" as const },
              ].map((link) => (
                <li key={link.label}>
                  <button
                    type="button"
                    onClick={() => navigate({ to: link.to })}
                    className="text-sm text-white/60 hover:text-orange-400 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
              {["About Us", "Contact"].map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => {}}
                    className="text-sm text-white/60 hover:text-orange-400 transition-colors"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-display font-semibold text-sm uppercase tracking-widest text-white/40 mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              {[
                "Privacy Policy",
                "Terms of Service",
                "Cookie Policy",
                "Donor Privacy",
              ].map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => {}}
                    className="text-sm text-white/60 hover:text-orange-400 transition-colors"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-sm uppercase tracking-widest text-white/40 mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-white/60">
                <Mail className="w-4 h-4 mt-0.5 text-orange-400 shrink-0" />
                <span>hello@globalhope.org</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/60">
                <Phone className="w-4 h-4 mt-0.5 text-orange-400 shrink-0" />
                <span>+1 (800) 555-HOPE</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/60">
                <MapPin className="w-4 h-4 mt-0.5 text-orange-400 shrink-0" />
                <span>123 Giving Way, New York, NY 10001</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            © {currentYear} GlobalHope Donations. All rights reserved.
          </p>
          <p className="text-sm text-white/40">
            Built with{" "}
            <Heart className="w-3.5 h-3.5 inline text-orange-400 fill-orange-400 mx-0.5" />
            using{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:text-orange-300 transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
