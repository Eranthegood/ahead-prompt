import React from 'react';
import { BlogList } from '@/components/Blog/BlogList';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Rss, TrendingUp } from 'lucide-react';

export default function Blog() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-6">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-5xl font-bold">Blog</h1>
            </div>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Découvrez nos derniers articles sur le développement, la productivité, 
              l'IA et les meilleures pratiques pour optimiser votre workflow.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Rss className="h-4 w-4" />
                S'abonner au RSS
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Articles populaires
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-3xl font-bold">Articles récents</h2>
            <Badge variant="secondary">À la une</Badge>
          </div>
          
          <BlogList featured />
        </div>
      </section>

      {/* Newsletter Signup Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">
              Restez informé des dernières actualités
            </h3>
            <p className="text-muted-foreground mb-6">
              Recevez nos meilleurs articles directement dans votre boîte mail. 
              Pas de spam, désabonnement en un clic.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-4 py-2 border rounded-lg bg-background"
              />
              <Button>S'abonner</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}