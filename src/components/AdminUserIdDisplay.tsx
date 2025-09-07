import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const AdminUserIdDisplay: React.FC = () => {
  const { user } = useAuth();
  const [showUserId, setShowUserId] = useState(false);

  if (!user) return null;

  const copyUserId = () => {
    if (user.id) {
      navigator.clipboard.writeText(user.id);
      toast({
        title: "User ID Copied",
        description: "Your user ID has been copied to clipboard"
      });
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-sm">Admin User ID</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUserId(!showUserId)}
          >
            {showUserId ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {showUserId ? 'Hide' : 'Show'} ID
          </Button>
          {showUserId && (
            <Button
              variant="outline"
              size="sm"
              onClick={copyUserId}
            >
              <Copy className="h-3 w-3" />
              Copy
            </Button>
          )}
        </div>
        {showUserId && (
          <div className="bg-muted p-2 rounded text-xs font-mono break-all">
            {user.id}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Copy this ID and add it to the PROMPT_ENHANCER_ALLOWED_USERS array in src/utils/accessControl.ts
        </p>
      </CardContent>
    </Card>
  );
};