/* eslint-disable @next/next/no-img-element */
import { Heart, MessageCircle, User, Send, Paperclip, FileText, Upload, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../src/components/Layout';
import { getMe } from '../src/services/auth';
import { listMessages, sendMessage, listMatches, markMessagesAsRead } from '../src/services/matches';

export default function ChatOn() {
  const router = useRouter();
  const [activeConversation, setActiveConversation] = useState('support');
  const [newMessage, setNewMessage] = useState('');
  const [showPedigreeModal, setShowPedigreeModal] = useState(false);
  const [pedigreeFile, setPedigreeFile] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [userName, setUserName] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConversationListMobile, setShowConversationListMobile] = useState(true);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const activeConv = conversations.find((c) => c.id === activeConversation);

  const mapMatchMessages = (data, userId) => {
    return (Array.isArray(data) ? data : []).map((m) => ({
      id: m.id,
      text: m.text,
      time: new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isSent: Number(m.senderId) === Number(userId)
    }));
  };

  // Load user and conversations
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const me = await getMe();
        if (!mounted) return;
        setUserName(me?.name || 'Usuário');
        setCurrentUserId(me?.id || null);

        const data = await listMatches();
        if (!mounted) return;
        const mapped = (Array.isArray(data) ? data : []).map((m) => ({
          id: m.id,
          name: m.petName || `Match #${m.id}`,
          breed: m.breed || 'Pet',
          avatar: m.image || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop',
          lastMessage: 'Conversa iniciada',
          time: m.createdAt ? new Date(m.createdAt).toLocaleDateString('pt-BR') : 'Hoje',
          location: m.location || 'Localização não informada',
          type: 'match'
        }));

        const supportConv = {
          id: 'support',
          name: 'Suporte PetFind',
          breed: 'Equipe',
          avatar: null,
          lastMessage: 'Bem-vindo ao PetFind!',
          time: new Date().toLocaleDateString('pt-BR'),
          location: 'Suporte Online',
          type: 'support'
        };

        const allConversations = [supportConv, ...mapped];
        setConversations(allConversations);
        
        // Load support messages initially
        const supportMessages = [
          {
            id: 1,
            text: `Olá ${me?.name}! 👋 Bem-vindo ao PetFind!`,
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            isSent: false
          },
          {
            id: 2,
            text: 'Somos a plataforma onde você encontra o match perfeito para seu pet!',
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            isSent: false
          },
          {
            id: 3,
            text: '🐾 Aqui você pode:\n• Cadastrar seu pet\n• Encontrar matches\n• Conversar com outros tutores\n• Gerenciar seus matches',
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            isSent: false
          }
        ];
        setMessages(supportMessages);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load', err);
        if (mounted) {
          const supportConv = {
            id: 'support',
            name: 'Suporte PetFind',
            breed: 'Equipe',
            avatar: null,
            lastMessage: 'Bem-vindo ao PetFind!',
            time: new Date().toLocaleDateString('pt-BR'),
            location: 'Suporte Online',
            type: 'support'
          };
          setConversations([supportConv]);
          const supportMessages = [
            {
              id: 1,
              text: 'Olá! 👋 Bem-vindo ao PetFind!',
              time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
              isSent: false
            }
          ];
          setMessages(supportMessages);
          setLoading(false);
        }
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  // Load messages for active conversation
  useEffect(() => {
    if (!activeConversation || activeConversation === 'support' || !currentUserId) return;

    let mounted = true;
    async function fetchMessages() {
      try {
        // Mark messages as read
        await markMessagesAsRead(activeConversation);

        const data = await listMessages(activeConversation);
        if (!mounted) return;
        const mapped = mapMatchMessages(data, currentUserId);
        setMessages(mapped);
      } catch (err) {
        console.error('Failed to load messages', err);
      }
    }
    fetchMessages();

    const intervalId = setInterval(fetchMessages, 3000);
    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [activeConversation, currentUserId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    if (activeConversation === 'support') {
      const newMsg = {
        id: messages.length + 1,
        text: newMessage,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        isSent: true
      };
      setMessages((prev) => [...prev, newMsg]);
      setNewMessage('');
      return;
    }

    try {
      const sent = await sendMessage(activeConversation, newMessage.trim());
      const mapped = {
        id: sent.id,
        text: sent.text,
        time: new Date(sent.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        isSent: true
      };
      setMessages((prev) => [...prev, mapped]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) setPedigreeFile(file.name);
  };

  const handleSendPedigree = () => {
    if (!pedigreeFile) return;
    const newMsg = {
      id: messages.length + 1,
      text: 'Segue o pedigree do meu pet!',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isSent: true,
      fileType: 'pedigree',
      fileName: pedigreeFile
    };
    setMessages([...messages, newMsg]);
    setShowPedigreeModal(false);
    setPedigreeFile(null);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen page-bg flex items-center justify-center">
          <p className="text-gray-500">Carregando chat...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen page-bg flex flex-col items-center justify-center py-4 sm:py-8 px-3 sm:px-4">
        <div className="w-full max-w-5xl bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row" style={{ minHeight: '75vh', maxHeight: '85vh' }}>
          <div className="md:hidden px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between">
            <p className="text-sm font-semibold text-[#0a0a0a]">Chat</p>
            <button
              type="button"
              className="btn-secondary px-3 py-1.5 text-xs"
              onClick={() => setShowConversationListMobile((prev) => !prev)}
            >
              {showConversationListMobile ? 'Abrir conversa' : 'Ver conversas'}
            </button>
          </div>

          {/* Conversations List */}
          <div className={`${showConversationListMobile ? 'flex' : 'hidden'} md:flex w-full md:w-80 border-r border-slate-200 bg-[#FFF7F1]/70 flex-col shrink-0 backdrop-blur-[1px]`}>
            <div className="px-6 py-6 border-b border-slate-200">
              <h2 className="text-xl md:text-2xl font-bold text-[#0a0a0a]">Conversas</h2>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-soft">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setActiveConversation(conv.id);
                    if (typeof window !== 'undefined' && window.innerWidth < 768) {
                      setShowConversationListMobile(false);
                    }
                  }}
                  className={`w-full px-4 py-4 flex gap-3 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left ${
                    activeConversation === conv.id ? 'bg-white ring-l-2 ring-[#ffa98f]' : ''
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden shrink-0">
                      {conv.avatar ? (
                        <img src={conv.avatar} alt={conv.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                      ) : (
                        <div className="w-full h-full bg-[#FFA98F]/80 text-white flex items-center justify-center font-semibold text-xl">
                          {conv.type === 'support' ? '🐾' : 'M'}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-sm text-[#101828]">{conv.name}</h3>
                      <span className="text-xs text-gray-400 shrink-0">{conv.time}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{conv.breed}</p>
                    <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`${showConversationListMobile ? 'hidden' : 'flex'} md:flex flex-1 flex-col min-w-0`}>
            {/* Chat Header */}
            {activeConv && (
              <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-slate-200 flex items-center justify-between shrink-0 bg-[#FFF7F1]/70 backdrop-blur-[1px]">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden shrink-0">
                    {activeConv.avatar ? (
                      <img src={activeConv.avatar} alt={activeConv.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                    ) : (
                      <div className="w-full h-full bg-[#FFA98F]/80 text-white flex items-center justify-center font-semibold">
                        {activeConv.type === 'support' ? '🐾' : 'M'}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-[#0a0a0a] truncate">{activeConv.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{activeConv.location}</p>
                  </div>
                </div>
                {activeConv.type !== 'support' && (
                  <button className="btn btn-pill px-3 sm:px-4 py-2 shrink-0 text-xs sm:text-sm">
                    Ver Perfil
                  </button>
                )}
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 bg-slate-50 px-4 sm:px-6 py-4 sm:py-6 overflow-y-auto scrollbar-soft">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isSent ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[86%] sm:max-w-md px-4 py-3 rounded-2xl ${
                        message.isSent
                            ? 'bg-[#FFA98F]/85 text-white rounded-br-none'
                          : 'bg-white shadow-sm text-[#101828] rounded-bl-none'
                      }`}
                    >
                      {message.fileType === 'pedigree' && (
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[rgba(255,255,255,0.3)]">
                          <FileText className="w-4 h-4" />
                          <span className="text-xs font-medium">{message.fileName}</span>
                        </div>
                      )}
                      <p className="text-sm leading-5 mb-1 whitespace-pre-wrap">{message.text}</p>
                      <p className={`text-xs ${message.isSent ? 'text-white/70' : 'text-gray-500'}`}>
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="px-4 sm:px-6 py-4 sm:py-6 border-t border-slate-200 bg-white shrink-0">
              <div className="flex items-end gap-3 mb-3">
                <button
                  onClick={() => setShowPedigreeModal(true)}
                  className="btn-secondary btn-pill w-10 h-10 p-0 border-2 border-slate-200 shrink-0"
                  title="Enviar pedigree"
                >
                  <Paperclip className="w-5 h-5 text-gray-600" />
                </button>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite uma mensagem..."
                  className="flex-1 px-4 py-3 bg-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa98f] resize-none max-h-24"
                  rows="1"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="btn btn-pill w-10 h-10 p-0 shrink-0"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Lembre-se de marcar encontros em locais seguros e públicos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pedigree Modal */}
      {showPedigreeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#0a0a0a]">Enviar Pedigree</h3>
              <button
                onClick={() => setShowPedigreeModal(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {pedigreeFile ? (
              <div className="mb-6">
                <div className="bg-[#fff7ed] border border-[#ffa98f] rounded-xl p-4 flex items-start gap-3">
                  <FileText className="w-5 h-5 text-[#ffa98f] shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0a0a0a] mb-1">Arquivo selecionado</p>
                    <p className="text-xs text-gray-500 truncate">{pedigreeFile}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-4">Selecione um arquivo do pedigree</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-pill px-4 py-2"
                  >
                    Selecionar Arquivo
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPedigreeModal(false);
                  setPedigreeFile(null);
                }}
                className="btn-secondary btn-pill flex-1 px-4 py-3 text-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleSendPedigree}
                disabled={!pedigreeFile}
                className="btn btn-pill flex-1 px-4 py-3"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
