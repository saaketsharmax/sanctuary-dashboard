"use client";

import Link from "next/link";
import {
  ArrowRight,
  DollarSign,
  Cpu,
  GraduationCap,
  Users,
  BarChart3,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import { Hero } from "@/components/Hero";
import { ProgrammePhase } from "@/components/ProgrammePhase";
import { SectionHeader } from "@/components/SectionHeader";

const phases = [
  {
    phase: 1,
    title: "Foundation",
    weeks: "Weeks 1-4",
    description:
      "Validate your assumptions, sharpen your thesis, and build the strategic foundation for rapid growth. Our AI agents research your market, assess competitive landscape, and match you with the ideal mentors.",
    milestones: [
      "Complete market validation with AI-powered research",
      "Refine product-market fit based on data-driven insights",
      "Establish core KPIs and measurement framework",
      "Get matched with 2-3 expert mentors via AI matching",
      "First mentor sessions and strategic alignment",
      "Investment funds disbursed: $50K cash + $50K credits",
    ],
  },
  {
    phase: 2,
    title: "Acceleration",
    weeks: "Weeks 5-8",
    description:
      "Execute your growth strategy with AI-augmented decision-making. Focus on customer acquisition, product iteration, and preparing your fundraising narrative with real traction data.",
    milestones: [
      "Launch customer acquisition experiments",
      "Weekly AI-generated progress reports and recommendations",
      "Fundraising narrative workshop and pitch refinement",
      "Technical architecture review with AI and expert mentors",
      "Credit utilisation for key growth tools and services",
      "Mid-programme DD checkpoint and assessment",
    ],
  },
  {
    phase: 3,
    title: "Launch Pad",
    weeks: "Weeks 9-12",
    description:
      "Polish your story, practice your pitch, and prepare for Demo Day. Connect with our investor network and plan your post-programme trajectory.",
    milestones: [
      "Demo Day pitch preparation and rehearsals",
      "AI-generated investor matching and warm introductions",
      "Final due diligence report for investor readiness",
      "Post-programme strategy and milestones planning",
      "Alumni network onboarding and ongoing access",
      "Demo Day presentation to 200+ investors",
    ],
  },
];

const benefits = [
  {
    icon: <DollarSign size={22} />,
    title: "$50K Cash Investment",
    description:
      "Direct investment to fund your operations during the programme and beyond. Standard terms, founder-friendly.",
  },
  {
    icon: <Cpu size={22} />,
    title: "$50K in Credits",
    description:
      "Access to premium tools and services: cloud infrastructure, AI APIs, legal, accounting, and more from our partner network.",
  },
  {
    icon: <GraduationCap size={22} />,
    title: "Expert Mentor Network",
    description:
      "AI-matched mentors with deep domain expertise. Serial founders, industry executives, and technical leaders.",
  },
  {
    icon: <Users size={22} />,
    title: "Investor Network",
    description:
      "Direct access to 200+ active angel investors, seed funds, and Series A leads through Demo Day and warm introductions.",
  },
  {
    icon: <BarChart3 size={22} />,
    title: "AI Operations Platform",
    description:
      "Full access to Sanctuary OS: 18 AI agents for DD, assessment, research, matching, and programme management.",
  },
  {
    icon: <Calendar size={22} />,
    title: "Lifetime Alumni Access",
    description:
      "Post-programme access to the platform, alumni events, follow-on funding opportunities, and the Sanctuary community.",
  },
];

export default function ProgrammePage() {
  return (
    <>
      <Hero
        badge="12-Week Programme"
        title="Three Phases to"
        titleAccent="Transform Your Startup"
        subtitle="A structured, AI-augmented programme that takes founders from validation to investor-ready in 12 intensive weeks."
        primaryCta={{ label: "Apply Now", href: "/apply" }}
        secondaryCta={{ label: "View FAQ", href: "/faq" }}
      />

      {/* Programme Phases */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader
            label="The Journey"
            title="Week by Week"
            description="Each phase builds on the last, with AI agents providing continuous support and insight throughout."
          />

          <div className="grid gap-8 lg:grid-cols-3">
            {phases.map((phase, i) => (
              <ProgrammePhase
                key={phase.phase}
                phase={phase.phase}
                title={phase.title}
                weeks={phase.weeks}
                description={phase.description}
                milestones={phase.milestones}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="border-y border-border bg-secondary/30 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader
            label="Benefits"
            title="What Founders Get"
            description="Everything you need to validate, build, and scale. No equity games, no hidden fees."
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-2xl border border-border bg-card p-8"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/5 text-primary">
                  {benefit.icon}
                </div>
                <h3 className="mb-2 text-base font-semibold">{benefit.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mentor Matching */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="mb-3 text-sm font-medium uppercase tracking-widest text-accent">
                AI-Powered Matching
              </p>
              <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
                The Right Mentors, Every Time
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                Our matching AI analyses mentor expertise, founder needs, company
                stage, and interpersonal compatibility to create high-impact
                mentorship pairs. No more random assignments.
              </p>

              <div className="grid gap-6 sm:grid-cols-3">
                {[
                  { value: "95%", label: "Match satisfaction rate" },
                  { value: "3.2", label: "Avg. mentors per founder" },
                  { value: "48h", label: "Time to first match" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="rounded-xl border border-border bg-card p-6"
                  >
                    <p className="text-2xl font-bold gradient-text">{stat.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-primary py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">
              Ready to Join?
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/70">
              Applications for Cohort 3 close March 31, 2026. Do not miss your
              chance.
            </p>
            <Link
              href="/apply"
              className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-background px-6 py-3 text-sm font-medium text-foreground shadow-lg transition-all hover:shadow-xl"
            >
              Apply Now
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
