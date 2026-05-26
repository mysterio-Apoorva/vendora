import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Bot, Send, X, MessageSquare, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { aiService } from '@/services';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIConcierge: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm your Vendora Shopping Concierge. How can I help you find the perfect product today?" }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatMutation = useMutation({
    mutationFn: (message: string) => aiService.chat(message),
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    chatMutation.mutate(userMsg);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-card border shadow-2xl rounded-2xl w-[400px] h-[600px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10">
          <div className="p-4 bg-primary text-primary-foreground flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-sm">Shopping Concierge</p>
                <p className="text-[10px] opacity-80 flex items-center gap-1">
                  <Sparkles className="h-2 w-2" /> Powered by Vendora AI
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="hover:bg-white/20">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={cn(
                  "flex gap-3 max-w-[85%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                )}>
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                    msg.role === 'assistant' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {msg.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>
                  <div className={cn(
                    "p-3 rounded-2xl text-sm shadow-sm",
                    msg.role === 'assistant' ? "bg-muted rounded-tl-none" : "bg-primary text-primary-foreground rounded-tr-none"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatMutation.isPending && (
                <div className="flex gap-3 max-w-[85%]">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-muted p-3 rounded-2xl rounded-tl-none text-sm animate-pulse">
                    Typing...
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-muted/30">
            <form 
              className="flex gap-2" 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            >
              <Input 
                placeholder="Ask me anything..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="bg-background border-none shadow-none focus-visible:ring-1"
              />
              <Button type="submit" size="icon" disabled={!input.trim() || chatMutation.isPending}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <Button 
          size="icon" 
          className="h-14 w-14 rounded-full shadow-2xl hover:scale-110 transition-transform"
          onClick={() => setIsOpen(true)}
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default AIConcierge;
