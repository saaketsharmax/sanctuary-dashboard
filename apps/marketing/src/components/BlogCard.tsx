"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

interface BlogCardProps {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  index?: number;
}

export function BlogCard({
  slug,
  title,
  excerpt,
  date,
  category,
  readTime,
  index = 0,
}: BlogCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        href={`/blog/${slug}`}
        className="group block rounded-2xl border border-border bg-card p-8 transition-all hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20"
      >
        <div className="mb-4 flex items-center gap-3">
          <span className="rounded-full bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            {category}
          </span>
          <span className="text-xs text-muted-foreground">{readTime}</span>
        </div>

        <h3 className="mb-3 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
          {title}
          <ArrowUpRight
            size={16}
            className="ml-1 inline-block opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </h3>

        <p className="mb-4 text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {excerpt}
        </p>

        <time className="text-xs text-muted-foreground">{date}</time>
      </Link>
    </motion.article>
  );
}
