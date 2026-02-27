"use client";

import {
  Lightbulb,
  Target,
  Heart,
  Zap,
  Shield,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";
import { Hero } from "@/components/Hero";
import { SectionHeader } from "@/components/SectionHeader";

const values = [
  {
    icon: <Lightbulb size={22} />,
    title: "Founder-First",
    description:
      "Every decision we make starts with the question: does this help founders build better companies faster?",
  },
  {
    icon: <Target size={22} />,
    title: "Radical Transparency",
    description:
      "No black boxes. Founders see exactly how decisions are made, from AI assessments to investment committee notes.",
  },
  {
    icon: <Heart size={22} />,
    title: "Human + Machine",
    description:
      "AI handles the operational complexity. Humans provide the judgement, empathy, and mentorship that build lasting companies.",
  },
  {
    icon: <Zap size={22} />,
    title: "Speed to Signal",
    description:
      "Traditional accelerators take weeks to surface insights. Our AI surfaces actionable intelligence in hours.",
  },
  {
    icon: <Shield size={22} />,
    title: "Ethical AI",
    description:
      "Our AI systems are auditable, explainable, and designed to reduce bias in investment and mentoring decisions.",
  },
  {
    icon: <Globe size={22} />,
    title: "Global by Default",
    description:
      "Great founders exist everywhere. Our AI-native platform breaks down geographic barriers to access.",
  },
];

const timeline = [
  {
    year: "2024",
    title: "The Idea",
    description:
      "Frustrated by the inefficiency of traditional accelerators, our founding team began prototyping an AI-native alternative.",
  },
  {
    year: "2025",
    title: "Platform Built",
    description:
      "18 specialised AI agents deployed. First cohort of founders go through the programme with a fully AI-augmented experience.",
  },
  {
    year: "2026",
    title: "Scaling Up",
    description:
      "Cohort 3 launches with an expanded mentor network, deeper AI capabilities, and partnerships with leading VCs.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Hero
        badge="Our Story"
        title="Rethinking What an"
        titleAccent="Accelerator Can Be"
        subtitle="We believe the best startup support should be as intelligent, fast, and scalable as the companies it serves. That is why we built Sanctuary."
      />

      {/* Mission */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-border bg-card p-10 text-center"
            >
              <h2 className="mb-4 text-2xl font-bold">Our Mission</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                To democratise access to world-class startup support by
                combining the best of human mentorship with AI-powered
                operations. We want every exceptional founder, regardless of
                geography or connections, to have the tools and support to build
                a category-defining company.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-y border-border bg-secondary/30 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader
            label="Philosophy"
            title="What We Stand For"
            description="These principles guide every aspect of how we build Sanctuary and support our founders."
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-2xl border border-border bg-card p-8"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/5 text-primary">
                  {value.icon}
                </div>
                <h3 className="mb-2 text-base font-semibold">{value.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader
            label="Timeline"
            title="Our Journey"
          />

          <div className="mx-auto max-w-2xl space-y-0">
            {timeline.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative flex gap-6 pb-12 last:pb-0"
              >
                {/* Connector */}
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {item.year}
                  </div>
                  {i < timeline.length - 1 && (
                    <div className="mt-2 w-px flex-1 bg-border" />
                  )}
                </div>

                <div className="pt-2">
                  <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 12-Week Overview */}
      <section className="border-t border-border bg-secondary/30 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader
            label="Programme"
            title="12 Weeks, 3 Phases"
            description="A structured journey from validation to launch, powered by AI at every step."
          />

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                phase: "Foundation",
                weeks: "Weeks 1-4",
                color: "bg-primary/10 text-primary",
                items: [
                  "Market validation & research",
                  "Product-market fit assessment",
                  "Team alignment workshops",
                  "AI mentor matching",
                ],
              },
              {
                phase: "Acceleration",
                weeks: "Weeks 5-8",
                color: "bg-accent/10 text-accent",
                items: [
                  "Growth strategy execution",
                  "Fundraising preparation",
                  "Customer acquisition",
                  "Technical architecture review",
                ],
              },
              {
                phase: "Launch Pad",
                weeks: "Weeks 9-12",
                color: "bg-success/10 text-success",
                items: [
                  "Demo Day preparation",
                  "Investor introductions",
                  "Post-programme planning",
                  "Alumni network onboarding",
                ],
              },
            ].map((phase, i) => (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="rounded-2xl border border-border bg-card p-8"
              >
                <div className={`mb-4 inline-flex rounded-lg px-3 py-1.5 text-xs font-semibold ${phase.color}`}>
                  {phase.weeks}
                </div>
                <h3 className="mb-4 text-xl font-semibold">{phase.phase}</h3>
                <ul className="space-y-3">
                  {phase.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
