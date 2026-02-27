"use client";

import { Hero } from "@/components/Hero";
import { BlogCard } from "@/components/BlogCard";
import { blogPosts } from "@/lib/blog-data";

export default function BlogPage() {
  return (
    <>
      <Hero
        title="Insights &"
        titleAccent="Ideas"
        subtitle="Thoughts on AI, startups, and the future of accelerators from the Sanctuary team."
      />

      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-6 md:grid-cols-2">
            {blogPosts.map((post, i) => (
              <BlogCard
                key={post.slug}
                slug={post.slug}
                title={post.title}
                excerpt={post.excerpt}
                date={post.date}
                category={post.category}
                readTime={post.readTime}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
