import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitPullRequest, ExternalLink, Calendar, GitBranch } from "lucide-react";
import { motion } from "framer-motion";

interface FeaturedPRProps {
  className?: string;
}

const FeaturedPRCard = ({ className = "" }: FeaturedPRProps) => {
  const featuredPR = {
    number: 27,
    title: "Refactor: Replace hero section with AutomationHero component",
    description: "Enhanced the landing page with a new automation-focused hero section featuring dark theming, animated workflow visualization, and improved user experience.",
    status: "merged" as const,
    repository: "ahead.love",
    author: "AI Assistant",
    createdAt: "2024-01-15",
    mergedAt: "2024-01-15",
    url: "https://github.com/ahead-love/main/pull/27",
    changes: {
      additions: 145,
      deletions: 32,
      files: 3
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "merged":
        return <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">Merged</Badge>;
      case "open":
        return <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Open</Badge>;
      case "closed":
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/20">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className="border-primary/20 bg-gradient-to-br from-background via-background to-primary/5 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <GitPullRequest className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Featured Pull Request #{featuredPR.number}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Latest Enhancement
                </p>
              </div>
            </div>
            {getStatusBadge(featuredPR.status)}
          </div>

          <div className="mb-4">
            <h4 className="font-medium text-foreground mb-2">
              {featuredPR.title}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {featuredPR.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <GitBranch className="h-4 w-4" />
              <span>{featuredPR.repository}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Merged {featuredPR.mergedAt}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="text-green-400">+{featuredPR.changes.additions}</span>
              <span className="mx-1">|</span>
              <span className="text-red-400">-{featuredPR.changes.deletions}</span>
              <span className="ml-2">{featuredPR.changes.files} files</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-primary/60 flex items-center justify-center">
                <span className="text-xs font-medium text-primary-foreground">AI</span>
              </div>
              <span className="text-sm text-muted-foreground">{featuredPR.author}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 hover:bg-primary/10 hover:border-primary/30"
              onClick={() => window.open(featuredPR.url, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
              View on GitHub
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FeaturedPRCard;