import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/hooks/useWorkspace';
import { Loader2, Save, Eye, Trash2, Plus, X } from 'lucide-react';

const blogSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(200, 'Le titre ne peut pas dépasser 200 caractères'),
  slug: z.string().min(1, 'Le slug est requis').max(100, 'Le slug ne peut pas dépasser 100 caractères'),
  excerpt: z.string().max(500, 'L\'extrait ne peut pas dépasser 500 caractères').optional(),
  content: z.string().min(1, 'Le contenu est requis'),
  meta_description: z.string().max(160, 'La méta-description ne peut pas dépasser 160 caractères').optional(),
  keywords: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']),
  featured_image_url: z.string().url().optional().or(z.literal('')),
});

type BlogFormData = z.infer<typeof blogSchema>;

interface BlogEditFormProps {
  blogId?: string;
  onSave?: () => void;
  onCancel?: () => void;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

export function BlogEditForm({ blogId, onSave, onCancel }: BlogEditFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const { toast } = useToast();
  const { workspace } = useWorkspace();

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      meta_description: '',
      keywords: '',
      status: 'draft',
      featured_image_url: '',
    },
  });

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 100);
  };

  // Watch title changes to auto-generate slug
  const titleValue = form.watch('title');
  useEffect(() => {
    if (titleValue && !blogId) {
      const slug = generateSlug(titleValue);
      form.setValue('slug', slug);
    }
  }, [titleValue, form, blogId]);

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (!workspace?.id) return;

      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      setCategories(data || []);
    };

    fetchCategories();
  }, [workspace?.id]);

  // Load existing blog post if editing
  useEffect(() => {
    const fetchBlogPost = async () => {
      if (!blogId || !workspace?.id) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select(`
            *,
            blog_post_categories!inner(
              category_id,
              blog_categories!inner(id, name, slug, color)
            )
          `)
          .eq('id', blogId)
          .eq('workspace_id', workspace.id)
          .single();

        if (error) {
          console.error('Error fetching blog post:', error);
          toast({
            title: "Erreur",
            description: "Impossible de charger l'article",
            variant: "destructive",
          });
          return;
        }

        if (data) {
          form.reset({
            title: data.title,
            slug: data.slug,
            excerpt: data.excerpt || '',
            content: data.content,
            meta_description: data.meta_description || '',
            keywords: data.keywords?.join(', ') || '',
            status: data.status as 'draft' | 'published' | 'archived',
            featured_image_url: data.featured_image_url || '',
          });

          // Set categories
          const postCategories = data.blog_post_categories?.map((pc: any) => pc.category_id) || [];
          setSelectedCategories(postCategories);

          // Set keywords
          setKeywords(data.keywords || []);
        }
      } catch (error) {
        console.error('Error loading blog post:', error);
        toast({
          title: "Erreur",
          description: "Erreur lors du chargement de l'article",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogPost();
  }, [blogId, workspace?.id, form, toast]);

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      const newKeywords = [...keywords, keywordInput.trim()];
      setKeywords(newKeywords);
      form.setValue('keywords', newKeywords.join(', '));
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    const newKeywords = keywords.filter(k => k !== keyword);
    setKeywords(newKeywords);
    form.setValue('keywords', newKeywords.join(', '));
  };

  const onSubmit = async (data: BlogFormData) => {
    if (!workspace?.id) {
      toast({
        title: "Erreur",
        description: "Aucun workspace sélectionné",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const keywordArray = keywords.length > 0 ? keywords : null;
      
      const blogData = {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || null,
        content: data.content,
        meta_description: data.meta_description || null,
        keywords: keywordArray,
        status: data.status,
        featured_image_url: data.featured_image_url || null,
        workspace_id: workspace.id,
        author_id: (await supabase.auth.getUser()).data.user?.id,
      };

      let result;
      if (blogId) {
        result = await supabase
          .from('blog_posts')
          .update(blogData)
          .eq('id', blogId)
          .select()
          .single();
      } else {
        result = await supabase
          .from('blog_posts')
          .insert(blogData)
          .select()
          .single();
      }

      if (result.error) {
        console.error('Error saving blog post:', result.error);
        toast({
          title: "Erreur",
          description: "Erreur lors de la sauvegarde de l'article",
          variant: "destructive",
        });
        return;
      }

      const postId = result.data.id;

      // Update categories
      if (selectedCategories.length > 0) {
        // Remove existing categories
        await supabase
          .from('blog_post_categories')
          .delete()
          .eq('post_id', postId);

        // Add new categories
        const categoryData = selectedCategories.map(categoryId => ({
          post_id: postId,
          category_id: categoryId,
        }));

        await supabase
          .from('blog_post_categories')
          .insert(categoryData);
      }

      toast({
        title: "Succès",
        description: blogId ? 'Article mis à jour avec succès' : 'Article créé avec succès',
      });

      onSave?.();
    } catch (error) {
      console.error('Error saving blog post:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contenu Principal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre *</FormLabel>
                      <FormControl>
                        <Input placeholder="Titre de l'article" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug *</FormLabel>
                      <FormControl>
                        <Input placeholder="slug-de-l-article" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Extrait</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Court résumé de l'article..."
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contenu *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Contenu de l'article en Markdown..."
                          className="min-h-[400px] font-mono text-sm"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publication */}
            <Card>
              <CardHeader>
                <CardTitle>Publication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un statut" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Brouillon</SelectItem>
                          <SelectItem value="published">Publié</SelectItem>
                          <SelectItem value="archived">Archivé</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" disabled={isSaving} className="flex-1">
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Sauvegarder
                      </>
                    )}
                  </Button>
                  
                  {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                      Annuler
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Catégories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories([...selectedCategories, category.id]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                          }
                        }}
                        className="rounded"
                      />
                      <Badge style={{ backgroundColor: category.color }} className="text-white">
                        {category.name}
                      </Badge>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="meta_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Méta-description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Description pour les moteurs de recherche..."
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Mots-clés</FormLabel>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Ajouter un mot-clé"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddKeyword();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={handleAddKeyword}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {keywords.map((keyword) => (
                      <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
                        {keyword}
                        <button
                          type="button"
                          onClick={() => handleRemoveKeyword(keyword)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="featured_image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image mise en avant</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}