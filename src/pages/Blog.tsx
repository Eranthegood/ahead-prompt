import React from 'react';
import { BlogList } from '@/components/Blog/BlogList';

export default function Blog() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">Blog</h1>
            <p className="text-muted-foreground mb-8">
              Latest articles on development, productivity, AI, and best practices.
            </p>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <BlogList featured />
        </div>
      </section>
    </div>
  );
}