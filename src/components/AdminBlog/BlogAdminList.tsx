import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  Clock,
  ExternalLink,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/hooks/useWorkspace';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: string; // Changé pour accepter n'importe quel string
  published_at?: string;
  created_at: string;
  updated_at: string;
  view_count: number;
  reading_time_minutes?: number;
  categories: Array<{
    name: string;
    color: string;
  }>;
}

export function BlogAdminList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { workspace } = useWorkspace();

  useEffect(() => {
    if (workspace) {
      fetchPosts();
    }
  }, [workspace, searchQuery, statusFilter]);

  const fetchPosts = async () => {
    if (!workspace) return;

    try {
      setLoading(true);

      let query = supabase
        .from('blog_posts')
        .select(`
          *,
          blog_post_categories(
            blog_categories(
              name,
              color
            )
          )
        `)
        .eq('workspace_id', workspace.id)
        .order('updated_at', { ascending: false });

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Apply search filter
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedPosts = data?.map(post => ({
        ...post,
        categories: post.blog_post_categories?.map((bpc: any) => bpc.blog_categories) || []
      })) || [];

      setPosts(formattedPosts);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les articles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePostStatus = async (postId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ 
          status: newStatus,
          published_at: newStatus === 'published' ? new Date().toISOString() : null
        })
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Statut mis à jour",
        description: `Article ${newStatus === 'published' ? 'publié' : newStatus === 'draft' ? 'mis en brouillon' : 'archivé'}`
      });

      fetchPosts();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
    }
  };

  const deletePost = async (postId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Article supprimé",
        description: "L'article a été supprimé avec succès"
      });

      fetchPosts();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'article",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="success">Publié</Badge>;
      case 'draft':
        return <Badge variant="secondary">Brouillon</Badge>;
      case 'archived':
        return <Badge variant="outline">Archivé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-600';
      case 'draft': return 'text-yellow-600';
      case 'archived': return 'text-gray-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestion du Blog</h2>
          <p className="text-muted-foreground">
            Gérez vos articles de blog et leur publication
          </p>
        </div>
        <Button
          onClick={() => navigate('/admin/blog/new')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nouvel Article
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher des articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="published">Publiés</SelectItem>
            <SelectItem value="draft">Brouillons</SelectItem>
            <SelectItem value="archived">Archivés</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Posts Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8">
              <div className="animate-pulse space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="bg-muted h-4 w-1/3 rounded"></div>
                    <div className="bg-muted h-4 w-20 rounded"></div>
                    <div className="bg-muted h-4 w-32 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all' 
                  ? "Aucun article trouvé pour ces critères"
                  : "Aucun article créé pour le moment"
                }
              </p>
              <Button
                onClick={() => navigate('/admin/blog/new')}
                variant="outline"
              >
                Créer votre premier article
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Catégories</TableHead>
                  <TableHead>Vues</TableHead>
                  <TableHead>Modifié</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{post.title}</div>
                        <div className="text-sm text-muted-foreground">
                          /{post.slug}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(post.status)}
                        {post.reading_time_minutes && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {post.reading_time_minutes}min
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {post.categories.slice(0, 2).map((cat, index) => (
                          <Badge 
                            key={index}
                            variant="outline" 
                            className="text-xs"
                            style={{ borderColor: cat.color, color: cat.color }}
                          >
                            {cat.name}
                          </Badge>
                        ))}
                        {post.categories.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{post.categories.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.view_count}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(post.updated_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/blog/edit/${post.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {post.status === 'published' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        <Select
                          value={post.status}
                          onValueChange={(value) => updatePostStatus(post.id, value)}
                        >
                          <SelectTrigger className="w-[110px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Brouillon</SelectItem>
                            <SelectItem value="published">Publier</SelectItem>
                            <SelectItem value="archived">Archiver</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePost(post.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      {posts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{posts.length}</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-full">
                  <Eye className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Publiés</p>
                  <p className="text-2xl font-bold text-green-600">
                    {posts.filter(p => p.status === 'published').length}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <Calendar className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Brouillons</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {posts.filter(p => p.status === 'draft').length}
                  </p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Edit className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Vues totales</p>
                  <p className="text-2xl font-bold">
                    {posts.reduce((total, post) => total + post.view_count, 0)}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <Eye className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}