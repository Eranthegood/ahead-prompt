import React from 'react';
import { BlogAdminList } from '@/components/AdminBlog/BlogAdminList';
import { Shield, BookOpen } from 'lucide-react';

export default function AdminBlog() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              Administration
              <BookOpen className="h-6 w-6" />
              Blog
            </h1>
            <p className="text-muted-foreground">
              Interface d'administration pour gérer les articles de blog
            </p>
          </div>
        </div>

        {/* Blog Admin List */}
        <BlogAdminList />
      </div>
    </div>
  );
}