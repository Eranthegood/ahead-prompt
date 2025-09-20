import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BlogEditForm } from '@/components/AdminBlog/BlogEditForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Plus } from 'lucide-react';

export default function BlogEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id && id !== 'new';

  const handleSave = () => {
    navigate('/admin/blog');
  };

  const handleCancel = () => {
    navigate('/admin/blog');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/blog')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Edit className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-bold">Éditer l'Article</h1>
              </>
            ) : (
              <>
                <Plus className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-bold">Nouvel Article</h1>
              </>
            )}
          </div>
        </div>

        {/* Blog Edit Form */}
        <BlogEditForm
          blogId={isEditing ? id : undefined}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}