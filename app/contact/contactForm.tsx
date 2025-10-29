"use client";

import { Button } from "@/components/ui/buttons";
import { useState } from "react";


export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    hp: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    // client-side validations
    if (formData.hp) {
      setStatus('Spam detected.');
      setLoading(false);
      return;
    }

    const emailRe = /^\S+@\S+\.\S+$/
    if (!emailRe.test(formData.email)) {
      setStatus('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    if (formData.message.length < 10) {
      setStatus('Message is too short. Please provide more details.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("Message sent successfully!");
        setFormData({ name: "", email: "", subject: "", message: "", hp: "" });
      } else {
        setStatus("Failed to send message. Please try again.");
      }
    } catch (err) {
      setStatus("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-8">
      <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* honeypot to trap bots */}
        <input
          type="text"
          id="hp"
          value={formData.hp}
          onChange={handleChange}
          autoComplete="off"
          tabIndex={-1}
          className="hidden"
        />
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-background border border-border/50 focus:border-primary focus:outline-none transition-colors"
              placeholder="Your name"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-background border border-border/50 focus:border-primary focus:outline-none transition-colors"
              placeholder="your@email.com"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium mb-2">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-background border border-border/50 focus:border-primary focus:outline-none transition-colors"
            placeholder="How can we help?"
            required
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-2">
            Message
          </label>
          <textarea
            id="message"
            rows={6}
            value={formData.message}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-background border border-border/50 focus:border-primary focus:outline-none transition-colors resize-none"
            placeholder="Tell us more about your inquiry..."
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full velo-gradient text-white font-medium shadow-lg hover:shadow-xl transition-all"
        >
          {loading ? "Sending..." : "Send Message"}
        </Button>

        {status && (
          <p
            className={`text-center text-sm mt-3 ${
              status.includes("success") ? "text-green-500" : "text-red-500"
            }`}
          >
            {status}
          </p>
        )}
      </form>
    </div>
  );
}
