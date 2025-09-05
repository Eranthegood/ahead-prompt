import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, Rocket, Timer, CheckCircle, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BoltLogo = ({ className }: { className?: string }) => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
  </svg>
);

const BoltIntegration: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Lightning Fast Development",
      description: "Build applications at unprecedented speed with Bolt's optimized workflow",
      icon: Zap
    },
    {
      title: "Rapid Deployment",
      description: "Deploy your applications instantly with zero-configuration deployment",
      icon: Rocket
    },
    {
      title: "Real-Time Updates",
      description: "See changes instantly with hot module replacement and live reloading",
      icon: Timer
    }
  ];

  const benefits = [
    "10x faster development cycles",
    "Zero-configuration setup",
    "Built-in performance optimization",
    "Instant preview and testing",
    "Seamless CI/CD integration"
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <BoltLogo className="h-16 w-16 text-yellow-500" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Bolt Integration</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience lightning-fast development with Bolt's powerful framework
          </p>
          <Badge variant="secondary" className="mt-4">
            Fast Development Framework
          </Badge>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="text-center">
                <CardHeader>
                  <Icon className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
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
            <h2 className="text-2xl font-bold mb-6">Why Choose Bolt?</h2>
            <ul className="space-y-3">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Get Started with Bolt</h3>
            <p className="text-muted-foreground mb-6">
              Set up Bolt integration and start building at lightning speed.
            </p>
            <div className="space-y-3">
              <Button className="w-full bg-yellow-500 hover:bg-yellow-600">
                Connect Bolt
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full">
                <ExternalLink className="mr-2 h-4 w-4" />
                Learn More
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

export default BoltIntegration;