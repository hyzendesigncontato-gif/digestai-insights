import { useState, useRef, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Sparkles, 
  User, 
  Loader2,
  FileText,
  History,
  Trash2,
  Plus
} from 'lucide-react';
import { Message } from '@/types';
import { cn } from '@/lib/utils';
import { chatWithAI } from '@/config/ai';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useConversations } from '@/hooks/useConversations';

const quickSuggestions = [
  'O que posso comer hoje?',
  'Estou com estufamento, o que significa?',
  'Analise meus sintomas recentes',
  'Gerar relatório completo',
  'Quais alimentos devo evitar?',
  'Criar plano alimentar para hoje',
];

export default function Chat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { messages, conversationId, isLoading: loadingConversation, addMessage, newConversation } = useConversations();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const generateAIResponse = (userMessage: string): string => {
    // Mock AI responses based on user input
    const lowercaseMsg = userMessage.toLowerCase();
    
    if (lowercaseMsg.includes('comer') || lowercaseMsg.includes('cardápio') || lowercaseMsg.includes('plano')) {
      return `Com base no seu perfil, aqui estão algumas sugestões seguras para hoje:\n\n**☀️ Café da Manhã**\n- Pão sem glúten com ovo mexido\n- Chá de camomila\n- Banana\n\n**🌤️ Almoço**\n- Arroz branco\n- Frango grelhado\n- Salada verde (alface, rúcula)\n- Azeite de oliva\n\n**🌙 Jantar**\n- Peixe assado\n- Batata doce\n- Legumes cozidos (cenoura, abobrinha)\n\n⚠️ **Evite hoje:** Leite, queijo, pão comum, macarrão, cebola e alho.\n\nPrecisa de mais opções? Me conte suas preferências!`;
    }
    
    if (lowercaseMsg.includes('estufamento') || lowercaseMsg.includes('inchaço') || lowercaseMsg.includes('inchado')) {
      return `Entendo que você está com estufamento. Isso pode estar relacionado a alguns fatores:\n\n**🔍 Possíveis Causas:**\n1. Ingestão de alimentos ricos em FODMAPs (cebola, alho)\n2. Consumo de laticínios (você tem 78% de probabilidade de intolerância à lactose)\n3. Alimentos com glúten\n\n**💡 Recomendações Imediatas:**\n- Beba chá de hortelã ou gengibre\n- Evite deitar após as refeições\n- Faça uma caminhada leve de 10-15 minutos\n- Evite bebidas gaseificadas\n\n**📝 Registro:**\nGostaria que eu registrasse esse sintoma? Qual a intensidade de 1 a 10?\n\nSe o estufamento persistir por mais de 24h, considere consultar um gastroenterologista.`;
    }
    
    if (lowercaseMsg.includes('sintoma') || lowercaseMsg.includes('analis')) {
      return `**📊 Análise dos Seus Sintomas Recentes:**\n\nNos últimos 7 dias, identifiquei os seguintes padrões:\n\n**Sintomas mais frequentes:**\n1. 🔴 Estufamento (3x) - geralmente após laticínios\n2. 🟠 Dor abdominal (2x) - associada a alimentos com glúten\n3. 🟡 Gases (2x) - correlação com cebola/alho\n\n**🎯 Padrão identificado:**\nSeus sintomas ocorrem principalmente após o almoço (60% dos casos), sugerindo que esse é o momento mais crítico do dia.\n\n**💡 Sugestão:**\nConsidere um período de eliminação de 2 semanas removendo:\n- Todos os laticínios\n- Alimentos com glúten\n- Cebola e alho (FODMAPs)\n\nDeseja que eu gere um relatório detalhado?`;
    }
    
    if (lowercaseMsg.includes('relatório') || lowercaseMsg.includes('gerar')) {
      return `**📋 Relatório em Preparação!**\n\nEstou compilando todas as suas informações para gerar um relatório médico completo.\n\n**O relatório incluirá:**\n✅ Análise de intolerâncias (Lactose, Glúten, FODMAPs)\n✅ Lista personalizada de alimentos seguros/evitar\n✅ Sugestões de cardápio semanal\n✅ Gráficos de evolução\n✅ Recomendações personalizadas\n\n**⏱️ Status:** Relatório disponível na seção "Relatórios"\n\nVocê pode acessá-lo agora clicando em **Relatórios** no menu lateral, ou posso explicar algum ponto específico?`;
    }
    
    if (lowercaseMsg.includes('evitar') || lowercaseMsg.includes('proibido')) {
      return `**🚫 Alimentos que Você Deve Evitar:**\n\nCom base na sua análise, aqui está a lista completa:\n\n**❌ Evitar Totalmente:**\n- Leite (Score: 15/100)\n- Macarrão (Score: 18/100)\n- Pão de forma (Score: 20/100)\n- Cebola (Score: 25/100)\n- Alho (Score: 22/100)\n\n**⚠️ Consumir com Moderação:**\n- Queijo (Score: 45/100) - máx. 30g/dia\n- Iogurte (Score: 50/100) - preferir sem lactose\n- Maçã (Score: 60/100) - máx. 1 por dia\n\n**✅ Alternativas Seguras:**\n- Leite vegetal (aveia, coco)\n- Arroz, quinoa\n- Ervas frescas no lugar de cebola/alho\n\nPosso sugerir substituições específicas para suas receitas favoritas!`;
    }
    
    return `Obrigado por compartilhar! Analisei sua mensagem e aqui está minha avaliação:\n\n**🔍 Entendi que você mencionou:** "${userMessage.slice(0, 50)}${userMessage.length > 50 ? '...' : ''}"\n\nPara te ajudar melhor, preciso de mais algumas informações:\n\n1. Quando exatamente você notou isso?\n2. Você consumiu algum alimento diferente nas últimas horas?\n3. Qual a intensidade do desconforto (1-10)?\n\nLembre-se: estou aqui para ajudá-lo a identificar padrões e melhorar sua saúde digestiva. Quanto mais detalhes você compartilhar, mais precisa será minha análise! 💪`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !user) return;
    
    const userMessageContent = input.trim();
    setInput('');
    setIsLoading(true);
    
    // Adiciona mensagem do usuário no Supabase
    await addMessage('user', userMessageContent);
    
    try {
      // Chama o agente IA real via N8N
      const response = await chatWithAI(
        user.id,
        userMessageContent,
        conversationId || undefined,
        {}
      );
      
      // Adiciona resposta da IA no Supabase
      await addMessage('assistant', response.message || 'Desculpe, não consegui processar sua mensagem.');
      
      // Se houver insights, pode criar notificações
      if (response.insights && response.insights.length > 0) {
        toast({
          title: '💡 Novos insights disponíveis',
          description: `O DigestAI identificou ${response.insights.length} insight(s) importante(s).`,
        });
      }
    } catch (error) {
      console.error('Error sending message to AI:', error);
      
      // Fallback: adiciona mensagem de erro
      await addMessage('assistant', 'Desculpe, tive um problema ao processar sua mensagem. Por favor, tente novamente.');
      
      toast({
        title: 'Erro ao conectar com IA',
        description: 'Verifique sua conexão e tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const handleNewChat = () => {
    newConversation();
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loadingConversation) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando conversa...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-[calc(100vh-6rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 animate-fade-in gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg flex-shrink-0">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate">Chat DigestAI</h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Seu assistente de saúde digestiva</p>
            </div>
          </div>
          
          <Button variant="outline" size="sm" onClick={handleNewChat} className="flex-shrink-0">
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Nova Conversa</span>
          </Button>
        </div>

        {/* Chat Container */}
        <Card className="flex-1 flex flex-col overflow-hidden animate-fade-in stagger-1">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 animate-fade-in",
                    message.role === 'user' ? "flex-row-reverse" : ""
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Avatar */}
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden",
                    message.role === 'assistant' 
                      ? "bg-gradient-to-br from-primary to-secondary" 
                      : "bg-muted"
                  )}>
                    {message.role === 'assistant' ? (
                      <Sparkles className="w-4 h-4 text-white" />
                    ) : user?.avatarUrl ? (
                      <img 
                        src={user.avatarUrl} 
                        alt={user.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  
                  {/* Message Bubble */}
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3",
                    message.role === 'assistant' 
                      ? "chat-bubble-ai" 
                      : "chat-bubble-user"
                  )}>
                    <div className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </div>
                    <p className={cn(
                      "text-xs mt-2",
                      message.role === 'assistant' ? "text-primary/60" : "text-muted-foreground"
                    )}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex gap-3 animate-fade-in">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="chat-bubble-ai rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">DigestAI está pensando...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Suggestions */}
          <div className="px-3 sm:px-4 py-2 border-t border-border overflow-x-auto">
            <div className="flex gap-2 max-w-3xl mx-auto pb-1">
              {quickSuggestions.slice(0, 4).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickSuggestion(suggestion)}
                  className="px-3 py-1.5 text-xs rounded-full bg-muted hover:bg-primary/10 hover:text-primary border border-border hover:border-primary/30 transition-all duration-200 whitespace-nowrap flex-shrink-0"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 sm:p-4 border-t border-border">
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Digite sua dúvida..."
                  className="flex-1 h-10 sm:h-12 input-focus text-sm"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  variant="gradient"
                  size="icon"
                  className="h-10 w-10 sm:h-12 sm:w-12"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2 hidden sm:block">
                O DigestAI é um assistente informativo e não substitui consulta médica.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
