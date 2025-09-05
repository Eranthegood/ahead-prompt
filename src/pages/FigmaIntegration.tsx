import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Palette, Users, Layers, CheckCircle, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FigmaLogo = ({ className }: { className?: string }) => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M8 24C10.2091 24 12 22.2091 12 20V16H8C5.79086 16 4 17.7909 4 20C4 22.2091 5.79086 24 8 24Z" fill="#0ACF83"/>
    <path d="M4 12C4 9.79086 5.79086 8 8 8H12V16H8C5.79086 16 4 14.2091 4 12Z" fill="#A259FF"/>
    <path d="M4 4C4 1.79086 5.79086 0 8 0H12V8H8C5.79086 8 4 6.20914 4 4Z" fill="#F24E1E"/>
    <path d="M12 0H16C18.2091 0 20 1.79086 20 4C20 6.20914 18.2091 8 16 8H12V0Z" fill="#FF7262"/>
    <path d="M20 12C20 14.2091 18.2091 16 16 16C13.7909 16 12 14.2091 12 12C12 9.79086 13.7909 8 16 8C18.2091 8 20 9.79086 20 12Z" fill="#1ABCFE"/>
  </svg>
);

const FigmaIntegration: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Design System Sync",
      description: "Automatically sync your design components and tokens from Figma",
      icon: Palette
    },
    {
      title: "Team Collaboration",
      description: "Seamless collaboration between designers and developers",
      icon: Users
    },
    {
      title: "Component Library",
      description: "Convert Figma components directly to code components",
      icon: Layers
    }
  ];

  const benefits = [
    "Pixel-perfect design implementation",
    "Automated design token extraction",
    "Real-time design updates sync",
    "Component library generation",
    "Design handoff automation"
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <FigmaLogo className="h-16 w-16" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Figma Integration</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Bridge the gap between design and development with seamless Figma integration
          </p>
          <Badge variant="secondary" className="mt-4">
            Design Collaboration Platform
          </Badge>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="text-center">
                <CardHeader>
                  <Icon className="h-12 w-12 mx-auto mb-4 text-purple-500" />
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
            <h2 className="text-2xl font-bold mb-6">Design-to-Code Benefits</h2>
            <ul className="space-y-3">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Connect Your Figma</h3>
            <p className="text-muted-foreground mb-6">
              Link your Figma workspace and start converting designs to code automatically.
            </p>
            <div className="space-y-3">
              <Button className="w-full bg-purple-500 hover:bg-purple-600">
                Connect Figma
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Documentation
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

export default FigmaIntegration;