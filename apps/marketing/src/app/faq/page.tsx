"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Hero } from "@/components/Hero";
import { FAQAccordion } from "@/components/FAQAccordion";

const faqItems = [
  {
    question: "What stage of startup is Sanctuary best suited for?",
    answer:
      "We primarily work with pre-seed and seed stage startups. Ideally, you have a working prototype or MVP, early traction signals, and a committed founding team. We are stage-agnostic in terms of revenue but care deeply about velocity: how fast are you learning and iterating?",
  },
  {
    question: "How does the AI interview process work?",
    answer:
      "After you submit your written application, our conversational AI agent will conduct a structured interview. It asks about your market, product, team, and business model in a natural conversational format. The interview typically takes 25-30 minutes. It is not a test; it is designed to help us understand your startup deeply and consistently across all applicants.",
  },
  {
    question: "What do founders receive financially?",
    answer:
      "Each accepted startup receives $50,000 in cash investment plus $50,000 in service credits. The cash is disbursed at programme start. Credits can be used for cloud infrastructure, AI APIs, legal services, accounting, design tools, and more through our partner network. Standard SAFE terms apply.",
  },
  {
    question: "What equity does Sanctuary take?",
    answer:
      "We invest via a standard post-money SAFE. The specific terms are shared during the acceptance process. Our terms are founder-friendly and aligned with market standards for pre-seed accelerator investments.",
  },
  {
    question: "Is the programme remote or in-person?",
    answer:
      "The programme is hybrid. We have a physical space in London for those who prefer in-person collaboration, but the entire programme can be completed remotely. All mentorship sessions, workshops, and even Demo Day have a fully remote option. Our AI-native platform is designed to work seamlessly across time zones.",
  },
  {
    question: "How is mentor matching done?",
    answer:
      "Our AI analyses your startup across multiple dimensions: industry, stage, technical stack, growth challenges, founder personality, and specific needs. It then matches you with 2-3 mentors from our network whose expertise, availability, and communication style are the best fit. Match satisfaction rates are above 95%, and you can request re-matching at any time.",
  },
  {
    question: "What happens after the 12-week programme?",
    answer:
      "Graduates retain full access to the Sanctuary OS platform, including AI agents and portfolio tracking. You join our alumni network with ongoing access to events, follow-on funding opportunities, and peer support. Many of our investor partners actively invest in post-programme rounds.",
  },
  {
    question: "How is AI used in the application review?",
    answer:
      "Our AI pipeline handles claim extraction, market research, and initial assessment scoring. However, all final acceptance decisions are made by our human investment committee. The AI provides comprehensive, unbiased analysis; humans apply judgement and context. Every applicant receives detailed feedback regardless of outcome.",
  },
  {
    question: "Can I apply if I am a solo founder?",
    answer:
      "Yes, but we strongly recommend having a plan for team building. Solo founders are evaluated more critically on their ability to execute across both technical and commercial domains. If you are a solo founder, highlight your plan to bring on co-founders or key early hires during the programme.",
  },
  {
    question: "What sectors do you focus on?",
    answer:
      "We are sector-agnostic but have particular depth in AI/ML, fintech, developer tools, healthtech, and enterprise SaaS. Our mentor network spans these sectors and more. We look for technology-enabled businesses with the potential to build significant, defensible value.",
  },
];

export default function FAQPage() {
  return (
    <>
      <Hero
        title="Frequently Asked"
        titleAccent="Questions"
        subtitle="Everything you need to know about Sanctuary, our programme, and the application process."
      />

      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6">
          <FAQAccordion items={faqItems} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-16 rounded-2xl border border-border bg-card p-8 text-center"
          >
            <h3 className="mb-2 text-lg font-semibold">Still have questions?</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              We are happy to help. Reach out and we will get back to you within
              48 hours.
            </p>
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/25 hover:bg-primary/90"
            >
              Contact Us
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
