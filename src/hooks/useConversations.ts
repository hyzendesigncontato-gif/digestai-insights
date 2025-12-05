// ============================================
// DigestAI - useConversations Hook
// Hook para gerenciar conversas e mensagens
// ============================================

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Message } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export function useConversations() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      initializeConversation();
    } else {
      setMessages([]);
      setIsLoading(false);
    }
  }, [user]);

  const initializeConversation = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);

      // Busca a conversa mais recente do usuário
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (convError) throw convError;

      let currentConvId: string;

      if (conversations && conversations.length > 0) {
        currentConvId = conversations[0].id;
      } else {
        // Cria nova conversa
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert([{ 
            user_id: user.id,
            title: 'Nova conversa' 
          }])
          .select()
          .single();

        if (createError) throw createError;
        currentConvId = newConv.id;

        // Adiciona mensagem inicial
        await supabase.from('messages').insert([{
          conversation_id: currentConvId,
          role: 'assistant',
          content: 'Olá! Eu sou o DigestAI, seu assistente especializado em saúde digestiva. 👋\n\nEstou aqui para ajudá-lo a entender melhor seu sistema digestivo, identificar possíveis intolerâncias alimentares e criar um plano alimentar personalizado.\n\nComo posso ajudá-lo hoje?',
        }]);
      }

      setConversationId(currentConvId);
      await loadMessages(currentConvId);
    } catch (err) {
      console.error('Error initializing conversation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const normalizedMessages = (data || []).map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.created_at,
      }));

      setMessages(normalizedMessages);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const addMessage = async (role: 'user' | 'assistant', content: string) => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          role,
          content,
        }])
        .select()
        .single();

      if (error) throw error;

      const newMessage: Message = {
        id: data.id,
        role: data.role,
        content: data.content,
        timestamp: data.created_at,
      };

      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (err) {
      console.error('Error adding message:', err);
      return null;
    }
  };

  const newConversation = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert([{ 
          user_id: user.id,
          title: 'Nova conversa' 
        }])
        .select()
        .single();

      if (error) throw error;

      setConversationId(data.id);
      setMessages([]);

      // Adiciona mensagem inicial
      await addMessage('assistant', 'Olá! Eu sou o DigestAI, seu assistente especializado em saúde digestiva. 👋\n\nEstou aqui para ajudá-lo a entender melhor seu sistema digestivo, identificar possíveis intolerâncias alimentares e criar um plano alimentar personalizado.\n\nComo posso ajudá-lo hoje?');
    } catch (err) {
      console.error('Error creating new conversation:', err);
    }
  };

  return {
    messages,
    conversationId,
    isLoading,
    addMessage,
    newConversation,
    refetch: () => conversationId && loadMessages(conversationId),
  };
}
