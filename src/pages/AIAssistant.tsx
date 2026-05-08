import { useState, useRef, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User, Trash2, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

const suggestions = [
  "What is the conveyancing process for buying a house in the UK?",
  "Calculate stamp duty on a &pound;500,000 property purchase",
  "What searches are needed when buying a property?",
  "Explain the difference between leasehold and freehold",
  "What happens at exchange of contracts?",
  "How long does the conveyancing process typically take?",
];

export default function AIAssistant() {
  const { isAuthenticated } = useAuth();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  const { data: history } = trpc.ai.history.useQuery(undefined, { enabled: isAuthenticated });
  const chat = trpc.ai.chat.useMutation({
    onSuccess: (d) => { setMessages(prev => [...prev, { role: "assistant", content: d.response }]); utils.ai.history.invalidate(); },
    onError: (err) => {
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${err.message || "Failed to get response"}. Please try again.` }]);
    },
  });
  const clear = trpc.ai.clear.useMutation({ onSuccess: () => { setMessages([]); utils.ai.history.invalidate(); } });

  useEffect(() => { if (history?.length && !messages.length) setMessages(history.map(h => ({ role: h.role as "user" | "assistant", content: h.content }))); }, [history]);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, chat.isPending]);

  const send = () => {
    if (!input.trim() || chat.isPending) return;
    const msg = input.trim();
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setInput("");
    chat.mutate({ message: msg });
  };

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  if (!isAuthenticated) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4"><Bot className="w-8 h-8 text-emerald-600" /></div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Property Assistant</h1>
      <p className="text-gray-500 max-w-md mb-6">Sign in to access TransferAI &mdash; your expert UK property conveyancing assistant powered by Claude.</p>
      <a href={`/api/oauth/authorize?client_id=${import.meta.env.VITE_APP_ID}&redirect_uri=${encodeURIComponent(`${window.location.origin}/api/oauth/callback`)}&response_type=code&scope=profile&state=${btoa(`${window.location.origin}/api/oauth/callback`)}`}><Button className="bg-emerald-600 hover:bg-emerald-700">Sign in to continue</Button></a>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center"><Sparkles className="w-5 h-5 text-emerald-600" /></div>
          <div><h1 className="text-xl font-bold text-gray-900">TransferAI Assistant</h1><p className="text-sm text-gray-500">Expert UK property conveyancing guidance</p></div>
        </div>
        {messages.length > 0 && <Button variant="ghost" size="sm" className="text-gray-500" onClick={() => clear.mutate()} disabled={clear.isPending}><Trash2 className="w-4 h-4 mr-1" />Clear</Button>}
      </div>
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {!messages.length ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4"><Bot className="w-8 h-8 text-emerald-500" /></div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">How can I help with your property transaction?</h2>
                <p className="text-sm text-gray-500 max-w-md mb-6">Ask me anything about UK property law, conveyancing, stamp duty, or the buying/selling process.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl">
                  {suggestions.map((s, i) => <button key={i} className="text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors text-sm text-gray-700" onClick={() => { setMessages(prev => [...prev, { role: "user", content: s }]); chat.mutate({ message: s }); }}>{s}</button>)}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                    {msg.role === "assistant" && <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-1"><Bot className="w-4 h-4 text-emerald-600" /></div>}
                    <div className={`max-w-[80%] rounded-lg p-3 text-sm ${msg.role === "user" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-800"}`}>
                      {msg.role === "assistant" ? <div className="prose prose-sm max-w-none"><ReactMarkdown>{msg.content}</ReactMarkdown></div> : <p>{msg.content}</p>}
                    </div>
                    {msg.role === "user" && <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1"><User className="w-4 h-4 text-gray-600" /></div>}
                  </div>
                ))}
                {chat.isPending && <div className="flex gap-3"><div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0"><Bot className="w-4 h-4 text-emerald-600" /></div><div className="bg-gray-100 rounded-lg p-3"><Loader2 className="w-4 h-4 animate-spin text-emerald-600" /></div></div>}
              </div>
            )}
          </ScrollArea>
          <div className="border-t p-4 bg-white">
            <div className="flex gap-2">
              <Input placeholder="Ask about UK property transactions..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} className="flex-1" disabled={chat.isPending} />
              <Button onClick={send} disabled={!input.trim() || chat.isPending} className="bg-emerald-600 hover:bg-emerald-700">{chat.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
