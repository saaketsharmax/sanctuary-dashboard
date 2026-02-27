"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  FileText,
  MessageSquare,
  Award,
} from "lucide-react";
import { motion } from "framer-motion";
import { Hero } from "@/components/Hero";
import { SectionHeader } from "@/components/SectionHeader";

const requirements = [
  "Pre-seed or seed stage startup with a working prototype or MVP",
  "Full-time commitment from at least one technical co-founder",
  "Willingness to be based in London or participate fully remotely",
  "Incorporated company or willingness to incorporate before programme start",
  "Coachable team open to AI-augmented operational workflows",
];

const timeline = [
  {
    icon: <FileText size={20} />,
    title: "Submit Application",
    description: "Complete the online application form with your startup details, pitch, and team background.",
    time: "15 minutes",
  },
  {
    icon: <MessageSquare size={20} />,
    title: "AI Interview",
    description: "Our conversational AI conducts a structured interview to understand your vision, market, and approach.",
    time: "30 minutes",
  },
  {
    icon: <CheckCircle size={20} />,
    title: "Assessment & DD",
    description: "AI agents analyse your application, research your market, and generate a comprehensive assessment.",
    time: "48 hours",
  },
  {
    icon: <Award size={20} />,
    title: "Decision",
    description: "Investment committee reviews AI-generated reports and makes final acceptance decisions.",
    time: "1 week",
  },
];

const cohortDates = [
  { label: "Applications Open", date: "January 15, 2026" },
  { label: "Application Deadline", date: "March 31, 2026" },
  { label: "Interviews Complete", date: "April 14, 2026" },
  { label: "Decisions Announced", date: "April 21, 2026" },
  { label: "Programme Starts", date: "May 5, 2026" },
  { label: "Demo Day", date: "July 25, 2026" },
];

export default function ApplyPage() {
  return (
    <>
      <Hero
        badge="Cohort 3 Applications Open"
        title="Start Your"
        titleAccent="Application"
        subtitle="Join the AI-native accelerator that gives you $100K in funding, 18 AI agents, expert mentors, and 12 weeks to build something extraordinary."
      />

      {/* Requirements */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="mb-3 text-sm font-medium uppercase tracking-widest text-accent">
                Requirements
              </p>
              <h2 className="mb-6 text-3xl font-bold tracking-tight">
                Who Should Apply
              </h2>
              <p className="mb-8 text-muted-foreground leading-relaxed">
                We look for exceptional teams building technology-enabled
                businesses with the potential to become category leaders. Stage
                matters less than ambition, execution speed, and founder-market
                fit.
              </p>

              <div className="space-y-4">
                {requirements.map((req, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle size={18} className="mt-0.5 shrink-0 text-success" />
                    <span className="text-sm text-foreground">{req}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-border bg-card p-8"
            >
              <h3 className="mb-6 text-xl font-semibold">Application Process</h3>
              <div className="space-y-6">
                {timeline.map((step, i) => (
                  <div key={step.title} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary">
                        {step.icon}
                      </div>
                      {i < timeline.length - 1 && (
                        <div className="mt-2 w-px flex-1 bg-border" />
                      )}
                    </div>
                    <div className="pb-6">
                      <h4 className="text-sm font-semibold">{step.title}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                      <div className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock size={12} />
                        {step.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Key Dates */}
      <section className="border-y border-border bg-secondary/30 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader
            label="Cohort 3"
            title="Key Dates"
          />

          <div className="mx-auto max-w-2xl">
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              {cohortDates.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="flex items-center justify-between border-b border-border px-6 py-4 last:border-b-0"
                >
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                  <span className="text-sm text-muted-foreground">{item.date}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Apply?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              The application takes about 15 minutes. Our AI will guide you
              through the rest.
            </p>
            <Link
              href="https://sanctuary-dashboard.vercel.app/auth/signup"
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/25 hover:bg-primary/90"
            >
              Start Application
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <p className="mt-4 text-xs text-muted-foreground">
              You will be redirected to the Sanctuary Dashboard to create your account.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
