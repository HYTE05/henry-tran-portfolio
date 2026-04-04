"use client";

import { FormEvent, useState } from "react";
import { useMascotContext } from "@/contexts/MascotContext";

export function ContactSection() {
  const { setCelebrating } = useMascotContext();
  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState("submitting");

    try {
      // TODO: Replace with actual Formspree endpoint URL
      // Get your form endpoint from https://formspree.io
      const FORMSPREE_URL = "https://formspree.io/f/PLACEHOLDER";

      const response = await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormState("success");
        setCelebrating(true);
        // Reset celebrate after 3 seconds
        setTimeout(() => setCelebrating(false), 3000);
        setFormData({ name: "", email: "", message: "" });
      } else {
        setFormState("error");
      }
    } catch (err) {
      console.error("Form submission error:", err);
      setFormState("error");
    }

    // Reset form state after 4 seconds
    setTimeout(() => setFormState("idle"), 4000);
  };

  return (
    <section
      id="section-contact"
      data-scroll-section="contact"
      className="min-h-screen flex-1 bg-[var(--bg-primary)] px-6 py-24 md:py-32"
    >
      <div className="mx-auto max-w-2xl">
        <p className="font-[family-name:var(--font-dm-sans)] text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">
          Get in touch
        </p>
        <h2 className="font-[family-name:var(--font-cormorant)] mt-3 text-4xl text-[var(--text-primary)] md:text-5xl">
          Contact
        </h2>
        <p className="font-[family-name:var(--font-dm-sans)] mt-6 text-lg text-[var(--text-secondary)] leading-relaxed">
          Whether you&apos;re a fellow engineer, a curious mind, or someone who just
          wants to talk about planes &mdash; I&apos;d love to hear from you.
        </p>

        {formState === "success" ? (
          <div className="mt-12 p-8 rounded-xl border border-[var(--accent-warm)] bg-[var(--accent-warm)]/5">
            <h3 className="font-[family-name:var(--font-cormorant)] text-2xl text-[var(--accent-warm)]">
              Message received.
            </h3>
            <p className="font-[family-name:var(--font-dm-sans)] mt-3 text-[var(--text-secondary)]">
              Thanks for reaching out. I&apos;ll get back to you soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-12 space-y-6">
            <div>
              <label
                htmlFor="name"
                className="font-[family-name:var(--font-dm-sans)] block text-sm text-[var(--text-primary)] mb-2"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 rounded bg-[var(--bg-surface)] border border-[var(--text-secondary)]/20 font-[family-name:var(--font-dm-sans)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--accent-cool)] transition-colors"
                placeholder="Your name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="font-[family-name:var(--font-dm-sans)] block text-sm text-[var(--text-primary)] mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 rounded bg-[var(--bg-surface)] border border-[var(--text-secondary)]/20 font-[family-name:var(--font-dm-sans)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--accent-cool)] transition-colors"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="font-[family-name:var(--font-dm-sans)] block text-sm text-[var(--text-primary)] mb-2"
              >
                Message
              </label>
              <textarea
                id="message"
                required
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                rows={6}
                className="w-full px-4 py-3 rounded bg-[var(--bg-surface)] border border-[var(--text-secondary)]/20 font-[family-name:var(--font-dm-sans)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--accent-cool)] transition-colors resize-none"
                placeholder="Your message..."
              />
            </div>

            <button
              type="submit"
              disabled={formState === "submitting"}
              className="w-full px-6 py-3 bg-[var(--accent-cool)] text-[var(--bg-primary)] font-[family-name:var(--font-dm-sans)] font-bold rounded transition-all duration-200 hover:bg-[var(--accent-cool)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formState === "submitting" ? "Sending..." : "Send"}
            </button>

            {formState === "error" && (
              <p className="text-sm text-[var(--accent-coral)]">
                Something went wrong. Please try again.
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
