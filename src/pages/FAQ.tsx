import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQ() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">FAQ - Ahead.love</h1>
          <p className="text-lg text-muted-foreground">
            Find answers to the most common questions about Ahead.love
          </p>
        </div>

        <div className="space-y-8">
          {/* Pricing & Subscriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Pricing & Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="free">
                  <AccordionTrigger>Why Ahead is not completely free?</AccordionTrigger>
                  <AccordionContent>
                    As we support API costs for prompt generation, we try to cover our costs.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="limits">
                  <AccordionTrigger>How do the plan limits work?</AccordionTrigger>
                  <AccordionContent>
                    <p>Basic and Pro plans will have access to more features such as:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Knowledge Box</li>
                      <li>Prompt enhancer</li>
                      <li>Biggest library</li>
                      <li>Team collaboration</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="cancel">
                  <AccordionTrigger>Can I cancel my subscription?</AccordionTrigger>
                  <AccordionContent>
                    Anytime! No questions asked.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="refund">
                  <AccordionTrigger>Can I have a refund for my annual subscription?</AccordionTrigger>
                  <AccordionContent>
                    Yes, within 30 days after your payment.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="users">
                  <AccordionTrigger>How many users can I onboard on my Pro subscription?</AccordionTrigger>
                  <AccordionContent>
                    You can add 2 teammates. If you need more, send us a message to setup a proper company workspace.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Integrations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="integrations">
                  <AccordionTrigger>Does Ahead support integrations?</AccordionTrigger>
                  <AccordionContent>
                    Yes, Cursor, Claude, Figma and GitHub.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Team */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Team</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="team">
                  <AccordionTrigger>Who is the team behind Ahead?</AccordionTrigger>
                  <AccordionContent>
                    Jérémy. I'm alone working on this project.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}