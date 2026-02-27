"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgrammePhaseProps {
  phase: number;
  title: string;
  weeks: string;
  description: string;
  milestones: string[];
  index?: number;
}

export function ProgrammePhase({
  phase,
  title,
  weeks,
  description,
  milestones,
  index = 0,
}: ProgrammePhaseProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="relative"
    >
      {/* Connector line */}
      {index < 2 && (
        <div className="absolute left-8 top-[4.5rem] hidden h-[calc(100%+2rem)] w-px bg-gradient-to-b from-border to-transparent lg:block" />
      )}

      <div className="rounded-2xl border border-border bg-card p-8 transition-all hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20">
        <div className="mb-6 flex items-center gap-4">
          <div
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-bold",
              phase === 1 && "bg-primary/10 text-primary",
              phase === 2 && "bg-accent/10 text-accent",
              phase === 3 && "bg-success/10 text-success"
            )}
          >
            {phase}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{weeks}</p>
          </div>
        </div>

        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        <div className="space-y-3">
          {milestones.map((milestone) => (
            <div key={milestone} className="flex items-start gap-3">
              <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
              <span className="text-sm text-foreground/80">{milestone}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
