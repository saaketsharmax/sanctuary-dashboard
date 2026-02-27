"use client";

import { Mail, MapPin, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { Hero } from "@/components/Hero";
import { ContactForm } from "@/components/ContactForm";

const contactChannels = [
  {
    icon: <Mail size={22} />,
    title: "Email",
    description: "For general enquiries and partnership discussions.",
    detail: "hello@sanctuary.dev",
  },
  {
    icon: <MapPin size={22} />,
    title: "Office",
    description: "Drop by for a coffee or schedule a visit.",
    detail: "London, United Kingdom",
  },
  {
    icon: <MessageSquare size={22} />,
    title: "Social",
    description: "Follow us for updates and founder insights.",
    detail: "@sanctuary on X / LinkedIn",
  },
];

export default function ContactPage() {
  return (
    <>
      <Hero
        title="Get in"
        titleAccent="Touch"
        subtitle="Whether you are a founder, investor, mentor, or just curious, we would love to hear from you."
      />

      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-5">
            {/* Contact Info */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="mb-2 text-2xl font-bold">Contact Us</h2>
                <p className="mb-8 text-muted-foreground">
                  We typically respond within 48 hours.
                </p>

                <div className="space-y-6">
                  {contactChannels.map((channel) => (
                    <div key={channel.title} className="flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary">
                        {channel.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">{channel.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {channel.description}
                        </p>
                        <p className="mt-1 text-sm font-medium text-foreground">
                          {channel.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
