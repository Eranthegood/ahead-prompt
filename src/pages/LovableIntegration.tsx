import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, Code, Layers, CheckCircle, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LovableLogo = ({ className }: { className?: string }) => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2L22 8.5V15.5L12 22L2 15.5V8.5L12 2Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="3" fill="currentColor"/>
    <path d="M8 10L12 12L16 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8 14L12 12L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const LovableIntegration: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "AI-Powered Development",
      description: "Leverage Lovable's AI capabilities to accelerate your development process",
      icon: Zap
    },
    {
      title: "Seamless Code Generation",
      description: "Generate high-quality code directly from your design specifications",
      icon: Code
    },
    {
      title: "Multi-Layer Architecture",
      description: "Build scalable applications with proper architectural patterns",
      icon: Layers
    }
  ];

  const benefits = [
    "Reduce development time by up to 70%",
    "Maintain code quality and consistency",
    "Seamless integration with existing workflows",
    "Real-time collaboration features",
    "Automated testing and deployment"
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <LovableLogo className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Lovable Integration</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Supercharge your development workflow with Lovable's AI-powered platform
          </p>
          <Badge variant="secondary" className="mt-4">
            AI Development Platform
          </Badge>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="text-center">
                <CardHeader>
                  <Icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="text-2xl font-bold mb-6">Key Benefits</h2>
            <ul className="space-y-3">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Ready to Get Started?</h3>
            <p className="text-muted-foreground mb-6">
              Connect your Lovable account and start building faster than ever before.
            </p>
            <div className="space-y-3">
              <Button className="w-full">
                Connect Lovable Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full">
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit Lovable
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LovableIntegration;