import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";

interface Section {
  id: string;
  title: string;
}

interface Props {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  sections: Section[];
  children: React.ReactNode;
  isLoading?: boolean;
  updatedAt?: string;
}

export default function LegalPageLayout({
  title,
  subtitle,
  icon,
  sections,
  children,
  isLoading = false,
  updatedAt,
}: Props) {
  const [activeSection, setActiveSection] = useState<string>(
    sections[0]?.id ?? "",
  );
  const contentRef = useRef<HTMLDivElement>(null);

  // Intersection observer for active TOC section
  // We use a MutationObserver on contentRef to re-attach when children render
  useEffect(() => {
    let intersectionObserver: IntersectionObserver | null = null;

    const attachObserver = () => {
      intersectionObserver?.disconnect();
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setActiveSection(entry.target.id);
            }
          }
        },
        {
          rootMargin: "-20% 0px -70% 0px",
          threshold: 0,
        },
      );
      const sectionEls = contentRef.current?.querySelectorAll("[data-section]");
      if (sectionEls) {
        for (const el of sectionEls) {
          intersectionObserver.observe(el);
        }
      }
    };

    attachObserver();

    const mutationObserver = new MutationObserver(attachObserver);
    if (contentRef.current) {
      mutationObserver.observe(contentRef.current, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      intersectionObserver?.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  const handleTocClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero header */}
        <div className="bg-foreground text-white py-14 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0 mt-1">
                <span className="text-orange-400">{icon}</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-orange-400 uppercase tracking-widest mb-1">
                  Legal
                </p>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight">
                  {title}
                </h1>
                <p className="text-white/60 text-sm mt-2 max-w-lg">
                  {subtitle}
                </p>
                {updatedAt && (
                  <p className="text-white/40 text-xs mt-3">
                    Last updated: {updatedAt}
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Content area with sticky TOC */}
        <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
          <div className="flex gap-10">
            {/* TOC sidebar — desktop only */}
            <aside className="hidden lg:block w-56 shrink-0">
              <div className="sticky top-24">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                  On this page
                </p>
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => handleTocClick(section.id)}
                      data-ocid={`legal.toc.${section.id.replace(/-/g, "_")}.link`}
                      className={`w-full text-left text-sm py-1.5 px-3 rounded-lg transition-all ${
                        activeSection === section.id
                          ? "text-orange-600 bg-orange-50 font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Mobile TOC */}
            <div className="lg:hidden mb-8 w-full">
              <div className="bg-muted/50 rounded-xl p-4 border border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  Contents
                </p>
                <div className="flex flex-wrap gap-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => handleTocClick(section.id)}
                      className="text-xs py-1 px-2.5 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-orange-300 transition-all"
                    >
                      {section.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0" ref={contentRef}>
              {isLoading ? (
                <div className="space-y-8">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-8 w-48" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="prose-legal"
                >
                  {children}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Section heading component for reuse
export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} data-section className="mb-10 scroll-mt-28">
      <h2 className="font-display text-xl font-bold text-orange-600 mb-4 pb-2 border-b border-orange-100">
        {title}
      </h2>
      <div className="space-y-3 text-foreground/80 text-sm leading-relaxed">
        {children}
      </div>
    </section>
  );
}
