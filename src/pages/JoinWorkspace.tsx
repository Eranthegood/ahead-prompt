import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Crown, User, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspaceInvitations } from '@/hooks/useWorkspaceInvitations';
import { useToast } from '@/hooks/use-toast';
import { WorkspaceInvitation } from '@/types/workspace';

export default function JoinWorkspace() {
  const { invitationToken } = useParams<{ invitationToken: string }>();
  const navigate = useNavigate();
  const { user, signUp, signIn } = useAuth();
  const { getInvitationByToken, acceptInvitation } = useWorkspaceInvitations();
  const { toast } = useToast();

  const [invitation, setInvitation] = useState<WorkspaceInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSignUp, setIsSignUp] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [processing, setProcessing] = useState(false);
  const [justAuthenticated, setJustAuthenticated] = useState(false);

  useEffect(() => {
    if (!invitationToken) {
      navigate('/auth');
      return;
    }

    loadInvitation();
  }, [invitationToken]);

  // Handle invitation acceptance after authentication
  useEffect(() => {
    if (user && invitation && justAuthenticated) {
      handleAcceptInvitation();
      setJustAuthenticated(false);
    }
  }, [user, invitation, justAuthenticated]);

  const loadInvitation = async () => {
    if (!invitationToken) return;

    try {
      setLoading(true);
      const invitationData = await getInvitationByToken(invitationToken);
      
      if (!invitationData) {
        toast({
          variant: 'destructive',
          title: 'Invalid invitation',
          description: 'This invitation link is invalid or has expired'
        });
        navigate('/auth');
        return;
      }

      setInvitation(invitationData);
      setFormData(prev => ({ ...prev, email: invitationData.email }));
    } catch (error) {
      console.error('Error loading invitation:', error);
      toast({
        variant: 'destructive',
        title: 'Error loading invitation',
        description: 'Failed to load invitation details'
      });
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!invitation || !user || !invitationToken) return;

    try {
      setProcessing(true);
      const workspaceId = await acceptInvitation(invitationToken, user.id);
      
      toast({
        title: 'Welcome to the team!',
        description: `You've successfully joined ${invitation.workspaces?.name}`
      });

      navigate('/build');
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast({
        variant: 'destructive',
        title: 'Error joining workspace',
        description: error?.message || 'Failed to join workspace'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation) return;

    if (isSignUp && formData.password !== formData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match',
        description: 'Please make sure your passwords match'
      });
      return;
    }

    setProcessing(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(formData.email, formData.password);
        if (error) throw error;
        
        toast({
          title: 'Account created!',
          description: 'Please check your email to verify your account, then return to complete joining the workspace'
        });
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) throw error;
        
        // Set flag to trigger invitation acceptance after auth state updates
        setJustAuthenticated(true);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: isSignUp ? 'Sign up failed' : 'Sign in failed',
        description: error?.message || 'Authentication failed'
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (processing && user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Joining workspace...</h2>
          <p className="text-muted-foreground">Please wait while we add you to the team</p>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid or has expired
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Ahead Branding */}
        <div className="text-center space-y-2">
          <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-white">A</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome to Ahead</h1>
          <p className="text-muted-foreground">
            Create your account to join the <strong>{invitation.workspaces?.name}</strong> workspace
          </p>
        </div>

        <Card className="w-full">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Join Workspace</CardTitle>
            <CardDescription>
              Complete your registration to access the workspace
            </CardDescription>
          </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Invitation Details */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Invited by:</span>
              <span className="font-medium">
                {invitation.invited_by_profile?.full_name || invitation.invited_by_profile?.email}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Role:</span>
              <Badge variant={invitation.role === 'admin' ? 'default' : 'secondary'} className="flex items-center gap-1">
                {invitation.role === 'admin' ? <Crown className="h-3 w-3" /> : <User className="h-3 w-3" />}
                {invitation.role}
              </Badge>
            </div>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                disabled={true}
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={processing}>
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSignUp ? 'Create Account & Join' : 'Sign In & Join'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : 'Need to create an account? Sign up'
                }
              </button>
            </div>
          </form>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}