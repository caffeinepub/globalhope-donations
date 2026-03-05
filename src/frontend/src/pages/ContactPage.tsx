import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  Heart,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      // Save to localStorage
      const existing: ContactMessage[] = JSON.parse(
        localStorage.getItem("contact_messages") ?? "[]",
      );
      const newMsg: ContactMessage = {
        id: Date.now().toString(),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        message: message.trim(),
        createdAt: new Date().toISOString(),
        isRead: false,
      };
      localStorage.setItem(
        "contact_messages",
        JSON.stringify([...existing, newMsg]),
      );

      setIsSubmitting(false);
      setSubmitted(true);

      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-background">
        {/* Hero banner */}
        <section className="py-16 bg-foreground text-white relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 80%, oklch(0.68 0.19 46) 0%, transparent 50%), radial-gradient(circle at 80% 20%, oklch(0.72 0.21 55) 0%, transparent 50%)",
            }}
          />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-14 h-14 rounded-2xl orange-gradient flex items-center justify-center mx-auto mb-5">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
                Get In Touch
              </h1>
              <p className="text-lg text-white/70 max-w-xl mx-auto">
                Have questions about a campaign, donations, or just want to
                connect? We'd love to hear from you.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
              {/* Contact Info Panel */}
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="lg:col-span-2 space-y-6"
              >
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    Contact Information
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Reach out directly through any of these channels. Our team
                    typically responds within 24 hours.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      icon: Mail,
                      label: "Email",
                      value: "hello@globalhope.org",
                      href: "mailto:hello@globalhope.org",
                    },
                    {
                      icon: Phone,
                      label: "Phone",
                      value: "+1 (800) 555-HOPE",
                      href: "tel:+18005554673",
                    },
                    {
                      icon: MapPin,
                      label: "Address",
                      value: "123 Giving Way, New York, NY 10001",
                      href: null,
                    },
                  ].map(({ icon: Icon, label, value, href }) => (
                    <div
                      key={label}
                      className="flex items-start gap-4 p-4 rounded-xl bg-card card-shadow border border-border"
                    >
                      <div className="w-10 h-10 rounded-xl orange-gradient flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                          {label}
                        </p>
                        {href ? (
                          <a
                            href={href}
                            className="text-sm font-medium text-foreground hover:text-orange-500 transition-colors"
                          >
                            {value}
                          </a>
                        ) : (
                          <p className="text-sm font-medium text-foreground">
                            {value}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Impact note */}
                <div className="p-5 rounded-2xl bg-orange-50 border border-orange-100">
                  <div className="flex items-center gap-2.5 mb-3">
                    <Heart className="w-5 h-5 text-orange-500 fill-orange-100" />
                    <span className="font-semibold text-sm text-orange-700">
                      Every Voice Matters
                    </span>
                  </div>
                  <p className="text-sm text-orange-600/80 leading-relaxed">
                    Your feedback helps us improve our campaigns and serve our
                    communities better. We read every message personally.
                  </p>
                </div>
              </motion.aside>

              {/* Form Panel */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="lg:col-span-3"
              >
                <div className="bg-card rounded-2xl p-8 card-shadow border border-border">
                  {submitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-10"
                      data-ocid="contact.success_state"
                    >
                      <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                      </div>
                      <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                        Message Sent!
                      </h3>
                      <p className="text-muted-foreground text-base max-w-sm mx-auto leading-relaxed">
                        Your message has been received! We'll respond within 24
                        hours.
                      </p>
                      <Button
                        onClick={() => setSubmitted(false)}
                        variant="outline"
                        className="mt-8 border-orange-200 text-orange-600 hover:bg-orange-50"
                      >
                        Send Another Message
                      </Button>
                    </motion.div>
                  ) : (
                    <>
                      <h2 className="font-display text-xl font-bold text-foreground mb-6">
                        Send Us a Message
                      </h2>

                      <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="contact-name"
                              className="text-sm font-semibold"
                            >
                              Full Name{" "}
                              <span className="text-orange-500">*</span>
                            </Label>
                            <Input
                              id="contact-name"
                              type="text"
                              placeholder="Jane Smith"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              required
                              disabled={isSubmitting}
                              autoComplete="name"
                              className="h-11"
                              data-ocid="contact.name_input"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="contact-email"
                              className="text-sm font-semibold"
                            >
                              Email Address{" "}
                              <span className="text-orange-500">*</span>
                            </Label>
                            <Input
                              id="contact-email"
                              type="email"
                              placeholder="jane@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              disabled={isSubmitting}
                              autoComplete="email"
                              className="h-11"
                              data-ocid="contact.email_input"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="contact-phone"
                            className="text-sm font-semibold"
                          >
                            Phone Number{" "}
                            <span className="text-muted-foreground font-normal">
                              (optional)
                            </span>
                          </Label>
                          <Input
                            id="contact-phone"
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            disabled={isSubmitting}
                            autoComplete="tel"
                            className="h-11"
                            data-ocid="contact.phone_input"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="contact-message"
                            className="text-sm font-semibold"
                          >
                            Message <span className="text-orange-500">*</span>
                          </Label>
                          <Textarea
                            id="contact-message"
                            placeholder="Tell us how we can help, ask about a campaign, or share your story..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                            disabled={isSubmitting}
                            rows={5}
                            className="resize-none"
                            data-ocid="contact.message_textarea"
                          />
                          <p className="text-xs text-muted-foreground text-right">
                            {message.length} characters
                          </p>
                        </div>

                        <Button
                          type="submit"
                          disabled={isSubmitting || !name || !email || !message}
                          className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
                          data-ocid="contact.submit_button"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </form>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
