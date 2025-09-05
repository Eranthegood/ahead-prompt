import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { UserX, Shield, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function MixpanelAdmin() {
  const [userIdToExclude, setUserIdToExclude] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleExcludeUser = async () => {
    if (!userIdToExclude.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a user ID',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to perform this action',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-mixpanel-exclusions', {
        body: {
          action: 'exclude',
          user_id: userIdToExclude.trim(),
          admin_user_id: user.id
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: 'Success',
          description: `User ${userIdToExclude} has been excluded from Mixpanel analysis`,
        });
        setUserIdToExclude('');
      } else {
        throw new Error('Failed to exclude user from Mixpanel');
      }
    } catch (error) {
      console.error('Error excluding user:', error);
      toast({
        title: 'Error',
        description: 'Failed to exclude user from Mixpanel analysis',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleIncludeUser = async () => {
    if (!userIdToExclude.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a user ID',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to perform this action',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-mixpanel-exclusions', {
        body: {
          action: 'include',
          user_id: userIdToExclude.trim(),
          admin_user_id: user.id
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: 'Success',
          description: `User ${userIdToExclude} has been included back in Mixpanel analysis`,
        });
        setUserIdToExclude('');
      } else {
        throw new Error('Failed to include user in Mixpanel');
      }
    } catch (error) {
      console.error('Error including user:', error);
      toast({
        title: 'Error',
        description: 'Failed to include user in Mixpanel analysis',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Mixpanel Admin Dashboard</h1>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This dashboard allows you to exclude specific user UIDs from Mixpanel tracking and analysis. 
            All actions are logged for audit purposes.
          </AlertDescription>
        </Alert>

        {/* Exclude User Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserX className="w-5 h-5" />
              Manage User Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Enter user ID"
                value={userIdToExclude}
                onChange={(e) => setUserIdToExclude(e.target.value)}
                className="max-w-md"
              />
              <div className="flex gap-4">
                <Button 
                  onClick={handleExcludeUser} 
                  disabled={isLoading}
                  variant="destructive"
                >
                  {isLoading ? 'Processing...' : 'Exclude from Analysis'}
                </Button>
                <Button 
                  onClick={handleIncludeUser} 
                  disabled={isLoading}
                  variant="default"
                >
                  {isLoading ? 'Processing...' : 'Include in Analysis'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>Exclude:</strong> Sets the `exclude_from_analysis` property to true in Mixpanel.<br />
                <strong>Include:</strong> Removes the exclusion properties from the user profile.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>How it Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              • When you exclude a user, their profile in Mixpanel gets an `exclude_from_analysis` property set to `true`
            </p>
            <p className="text-sm text-muted-foreground">
              • Future tracking calls for excluded users will be skipped in the frontend
            </p>
            <p className="text-sm text-muted-foreground">
              • All exclusion/inclusion actions are logged in the audit table
            </p>
            <p className="text-sm text-muted-foreground">
              • You can verify exclusions by checking the user profile in Mixpanel&apos;s People section
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}