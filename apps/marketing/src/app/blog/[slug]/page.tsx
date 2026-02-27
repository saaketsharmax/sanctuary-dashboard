"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { motion } from "framer-motion";
import { getBlogPost, blogPosts } from "@/lib/blog-data";
import { notFound } from "next/navigation";

export default function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  // Split content into paragraphs, preserving headers
  const contentBlocks = post.content.split("\n\n");

  return (
    <>
      <div className="gradient-hero pt-28 pb-16">
        <div className="mx-auto max-w-3xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/blog"
              className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft size={14} />
              Back to Blog
            </Link>

            <div className="mb-4 flex items-center gap-3">
              <span className="rounded-full bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                {post.category}
              </span>
            </div>

            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <User size={14} />
                {post.author.name}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={14} />
                {post.date}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={14} />
                {post.readTime}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <article className="py-16">
        <div className="mx-auto max-w-3xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="prose-sanctuary"
          >
            {contentBlocks.map((block, i) => {
              const trimmed = block.trim();

              if (trimmed.startsWith("## ")) {
                return (
                  <h2
                    key={i}
                    className="mt-12 mb-4 text-2xl font-bold tracking-tight"
                  >
                    {trimmed.replace("## ", "")}
                  </h2>
                );
              }

              if (trimmed.startsWith("### ")) {
                return (
                  <h3
                    key={i}
                    className="mt-8 mb-3 text-lg font-semibold"
                  >
                    {trimmed.replace("### ", "")}
                  </h3>
                );
              }

              if (trimmed.startsWith("- ")) {
                const items = trimmed.split("\n").filter((line) => line.startsWith("- "));
                return (
                  <ul key={i} className="my-4 space-y-2">
                    {items.map((item, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-3 text-base leading-relaxed text-muted-foreground"
                      >
                        <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
                        <span
                          dangerouslySetInnerHTML={{
                            __html: item
                              .replace(/^- /, "")
                              .replace(
                                /\*\*(.*?)\*\*/g,
                                '<strong class="text-foreground font-medium">$1</strong>'
                              ),
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                );
              }

              if (trimmed.match(/^\d+\./)) {
                const items = trimmed.split("\n").filter((line) => line.match(/^\d+\./));
                return (
                  <ol key={i} className="my-4 space-y-2">
                    {items.map((item, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-3 text-base leading-relaxed text-muted-foreground"
                      >
                        <span className="mt-0.5 shrink-0 text-sm font-semibold text-primary/60">
                          {j + 1}.
                        </span>
                        <span
                          dangerouslySetInnerHTML={{
                            __html: item
                              .replace(/^\d+\.\s*/, "")
                              .replace(
                                /\*\*(.*?)\*\*/g,
                                '<strong class="text-foreground font-medium">$1</strong>'
                              ),
                          }}
                        />
                      </li>
                    ))}
                  </ol>
                );
              }

              return (
                <p
                  key={i}
                  className="my-4 text-base leading-relaxed text-muted-foreground"
                >
                  {trimmed}
                </p>
              );
            })}
          </motion.div>

          {/* Related Posts */}
          <div className="mt-20 border-t border-border pt-12">
            <h3 className="mb-6 text-lg font-semibold">More from the Blog</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {blogPosts
                .filter((p) => p.slug !== slug)
                .slice(0, 2)
                .map((relatedPost) => (
                  <Link
                    key={relatedPost.slug}
                    href={`/blog/${relatedPost.slug}`}
                    className="group rounded-xl border border-border bg-card p-6 transition-all hover:shadow-md hover:border-primary/20"
                  >
                    <span className="mb-2 inline-block rounded-full bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {relatedPost.category}
                    </span>
                    <h4 className="text-sm font-semibold transition-colors group-hover:text-primary line-clamp-2">
                      {relatedPost.title}
                    </h4>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {relatedPost.date}
                    </p>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
