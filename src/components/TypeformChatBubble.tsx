import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const TypeformChatBubble = () => {
  const handleClick = () => {
    window.open('https://z3gxycuuo05.typeform.com/to/lHoGYyKR', '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      onClick={handleClick}
      className="fixed bottom-5 right-5 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50 bg-primary hover:bg-primary/90"
      aria-label="Ouvrir le formulaire de feedback"
    >
      <MessageCircle className="h-6 w-6 text-primary-foreground" />
    </Button>
  );
};

export default TypeformChatBubble;