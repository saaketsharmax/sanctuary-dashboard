"use client";

import Link from "next/link";
import {
  Bot,
  ShieldCheck,
  Users,
  Sparkles,
  TrendingUp,
  Award,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { Hero } from "@/components/Hero";
import { FeatureCard } from "@/components/FeatureCard";
import { SectionHeader } from "@/components/SectionHeader";

const features = [
  {
    icon: <Bot size={24} />,
    title: "18 AI Agents",
    description:
      "From interview assessment to due diligence, our mesh of specialised AI agents handles the operational heavy lifting so your team can focus on building.",
  },
  {
    icon: <ShieldCheck size={24} />,
    title: "Smart Due Diligence",
    description:
      "Automated claim extraction, real-time verification, and comprehensive DD reports generated in minutes instead of weeks.",
  },
  {
    icon: <Users size={24} />,
    title: "Intelligent Matching",
    description:
      "AI-powered mentor and investor matching that analyses compatibility across expertise, stage, and sector to create high-impact partnerships.",
  },
];

const stats = [
  { value: "$100K", label: "Per Startup", sublabel: "$50K cash + $50K credits" },
  { value: "18", label: "AI Agents", sublabel: "Full operational mesh" },
  { value: "12", label: "Week Programme", sublabel: "Three intensive phases" },
  { value: "100%", label: "AI-Native", sublabel: "Built for the future" },
];

const testimonials = [
  {
    quote:
      "Sanctuary's AI-native approach cut our due diligence timeline from 3 weeks to 3 hours. The depth of analysis actually increased.",
    name: "Sarah Chen",
    role: "GP, Horizon Ventures",
  },
  {
    quote:
      "The mentor matching was uncanny. We were paired with exactly the right advisors for our stage and market. That is hard to do manually.",
    name: "Marcus Johnson",
    role: "Founder, DataWeave",
  },
  {
    quote:
      "As a repeat founder, I have seen many accelerators. Sanctuary is the first one that feels like it was actually designed for how startups work today.",
    name: "Priya Patel",
    role: "CEO, NeuralShip",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <Hero
        badge="Applications Open for Cohort 3"
        title="The"
        titleAccent="AI-Native Startup Accelerator"
        subtitle="18 specialised AI agents, $100K in funding, and a 12-week programme designed to help exceptional founders build category-defining companies."
        primaryCta={{ label: "Apply Now", href: "/apply" }}
        secondaryCta={{ label: "Learn More", href: "/programme" }}
      />

      {/* Stats */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-border lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="px-6 py-10 text-center"
            >
              <p className="text-3xl font-bold gradient-text sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {stat.label}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {stat.sublabel}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader
            label="Platform"
            title="Intelligence at Every Stage"
            description="Our AI-native platform transforms how accelerators operate, replacing manual processes with intelligent automation while keeping humans in the loop."
          />

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, i) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-border bg-secondary/30 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader
            label="Process"
            title="From Application to Launch"
            description="A streamlined 12-week journey powered by AI at every step."
          />

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                icon: <Sparkles size={20} />,
                title: "AI-Powered Application",
                description:
                  "Submit your application and our AI conducts a conversational interview, assesses your startup, and researches your market automatically.",
              },
              {
                step: "02",
                icon: <TrendingUp size={20} />,
                title: "Intensive Programme",
                description:
                  "12 weeks of structured milestones, AI-matched mentors, $100K in funding, and continuous progress tracking with intelligent recommendations.",
              },
              {
                step: "03",
                icon: <Award size={20} />,
                title: "Demo Day & Beyond",
                description:
                  "Present to our investor network, receive warm introductions, and continue with alumni support and platform access post-programme.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative rounded-2xl border border-border bg-card p-8"
              >
                <div className="mb-6 flex items-center gap-3">
                  <span className="text-4xl font-bold text-border">{item.step}</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary">
                    {item.icon}
                  </div>
                </div>
                <h3 className="mb-3 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader
            label="Testimonials"
            title="Trusted by Founders & Investors"
          />

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((item, i) => (
              <motion.blockquote
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col rounded-2xl border border-border bg-card p-8"
              >
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.role}</p>
                  </div>
                </div>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-primary py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">
              Ready to Build the Future?
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/70">
              Applications for Cohort 3 are open. Join the accelerator designed
              for AI-native founders.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/apply"
                className="group inline-flex items-center gap-2 rounded-xl bg-background px-6 py-3 text-sm font-medium text-foreground shadow-lg transition-all hover:shadow-xl"
              >
                Start Your Application
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
              <Link
                href="/programme"
                className="inline-flex items-center gap-2 rounded-xl border border-primary-foreground/20 px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary-foreground/10"
              >
                View Programme Details
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
