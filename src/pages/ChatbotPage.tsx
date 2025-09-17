import React from 'react';
import { Chatbot } from '@/components/Chatbot';
import { Card } from '@/components/ui/card';
import { useParams } from 'react-router-dom';

export default function ChatbotPage() {
  const { sessionId } = useParams<{ sessionId?: string }>();

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 border-0 shadow-none">
        <Chatbot sessionId={sessionId} className="h-full" />
      </Card>
    </div>
  );
}