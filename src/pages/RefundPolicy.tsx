import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, CreditCard, HelpCircle } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function RefundPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/5 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className="hover:text-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="space-y-8">
          <BlurFade delay={0.25} inView>
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">
                Cancellation and Refunds
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Learn about our cancellation and refund policies for Pro and Basic subscriptions
              </p>
            </div>
          </BlurFade>

          <BlurFade delay={0.4} inView>
            <div className="grid gap-6">
              {/* Pro and Basic Subscriptions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Pro and Basic Subscriptions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Canceling Your Subscription</h3>
                    <p className="text-muted-foreground">
                      You can cancel your plan at any time, whether you have a monthly or annual subscription. 
                      Cancellation takes effect immediately, but you'll retain access to premium features until 
                      the end of your current billing period.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Refund Policy */}
              <Card>
                <CardHeader>
                  <CardTitle>Refund Policy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Monthly Plans</h3>
                    <p className="text-muted-foreground">
                      We do not refund monthly plans. Once billed, the amount for your monthly subscription 
                      cannot be refunded. However, you can cancel at any time to prevent future charges.
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Annual Plans</h3>
                    <p className="text-muted-foreground mb-2">
                      <strong>Full refund within 30 days:</strong> If you cancel your annual Pro or Basic 
                      subscription within 30 days of purchase, you are entitled to a full refund.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* How to Request a Refund */}
              <Card>
                <CardHeader>
                  <CardTitle>How to Request a Refund</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">For purchases via our website</h3>
                    <p className="text-muted-foreground mb-4">
                      If you purchased a Pro or Basic subscription directly through our website within the last 30 days:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
                      <li>First cancel your subscription by following the instructions in your account settings</li>
                      <li>Contact our support team to request your refund</li>
                      <li>Include your order number and purchase date in your request</li>
                    </ol>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Processing times
                    </h3>
                    <p className="text-muted-foreground">
                      Refund requests are typically processed within 5-7 business days. The refund will be 
                      issued to the same payment method used for the original purchase.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Us */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    Contact Us
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    For any questions regarding cancellations or refunds, please don't hesitate to contact 
                    our support team who will be happy to assist you.
                  </p>
                </CardContent>
              </Card>
            </div>
          </BlurFade>
        </div>
      </main>
    </div>
  );
}