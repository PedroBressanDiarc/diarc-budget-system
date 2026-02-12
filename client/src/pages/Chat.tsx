import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageCircle, Send, Users, User, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { MessageContent } from "@/components/MessageContent";

export default function Chat() {
  const { data: user } = trpc.auth.me.useQuery();
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [isGroup, setIsGroup] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Queries
  const { data: chats = [], refetch: refetchChats } = trpc.chats.list.useQuery();
  const { data: users = [] } = trpc.users.listForChat.useQuery();
  const { data: messages = [], refetch: refetchMessages } = trpc.chats.getMessages.useQuery(
    { chatId: selectedChatId! },
    { enabled: selectedChatId !== null }
  );

  // Mutations
  const createChatMutation = trpc.chats.create.useMutation({
    onSuccess: (newChat) => {
      toast.success("Chat criado com sucesso!");
      refetchChats();
      setNewChatOpen(false);
      setNewChatName("");
      setSelectedUsers([]);
      setIsGroup(false);
      setSelectedChatId(newChat.id);
    },
    onError: (error) => {
      toast.error("Erro ao criar chat: " + error.message);
    },
  });

  const sendMessageMutation = trpc.chats.sendMessage.useMutation({
    onSuccess: () => {
      refetchMessages();
      refetchChats();
      setMessageContent("");
    },
    onError: (error) => {
      toast.error("Erro ao enviar mensagem: " + error.message);
    },
  });

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Polling para atualizar mensagens (simular tempo real)
  useEffect(() => {
    if (selectedChatId === null) return;
    
    const interval = setInterval(() => {
      refetchMessages();
      refetchChats();
    }, 3000); // Atualizar a cada 3 segundos

    return () => clearInterval(interval);
  }, [selectedChatId, refetchMessages, refetchChats]);

  const handleCreateChat = () => {
    if (isGroup && !newChatName.trim()) {
      toast.error("Nome do grupo é obrigatório");
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error("Selecione pelo menos um participante");
      return;
    }

    if (!isGroup && selectedUsers.length > 1) {
      toast.error("Chat privado deve ter apenas 1 participante");
      return;
    }

    createChatMutation.mutate({
      name: isGroup ? newChatName : undefined,
      isGroup,
      participantIds: selectedUsers,
    });
  };

  const handleSendMessage = () => {
    if (!messageContent.trim() || selectedChatId === null) return;

    sendMessageMutation.mutate({
      chatId: selectedChatId,
      content: messageContent.trim(),
    });
  };

  const selectedChat = chats.find(c => c.id === selectedChatId);

  // Filtrar usuários por busca
  const filteredUsers = users.filter(u => 
    u.id !== user?.id && // Excluir usuário atual
    (u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Nome do chat para exibição
  const getChatName = (chat: typeof chats[0]) => {
    if (chat.isGroup) {
      return chat.name || "Grupo sem nome";
    }
    // Chat privado: mostrar nome do outro participante
    const otherParticipant = chat.participants.find(p => p.userId !== user?.id);
    return otherParticipant?.userName || "Chat";
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Lista de Conversas */}
      <Card className="w-80 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Conversas
          </h2>
          <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nova Conversa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isGroup"
                    checked={isGroup}
                    onCheckedChange={(checked) => setIsGroup(checked === true)}
                  />
                  <Label htmlFor="isGroup">Criar grupo</Label>
                </div>

                {isGroup && (
                  <div>
                    <Label htmlFor="groupName">Nome do Grupo</Label>
                    <Input
                      id="groupName"
                      value={newChatName}
                      onChange={(e) => setNewChatName(e.target.value)}
                      placeholder="Digite o nome do grupo"
                    />
                  </div>
                )}

                <div>
                  <Label>Participantes</Label>
                  <div className="relative mt-2 mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar usuários..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-2">
                    {filteredUsers.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhum usuário encontrado
                      </p>
                    ) : (
                      filteredUsers.map((u) => (
                        <div key={u.id} className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md">
                          <Checkbox
                            id={`user-${u.id}`}
                            checked={selectedUsers.includes(u.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedUsers([...selectedUsers, u.id]);
                              } else {
                                setSelectedUsers(selectedUsers.filter(id => id !== u.id));
                              }
                            }}
                          />
                          <Label htmlFor={`user-${u.id}`} className="flex-1 cursor-pointer">
                            <div className="font-medium">{u.name}</div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                  {selectedUsers.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {selectedUsers.length} participante{selectedUsers.length > 1 ? 's' : ''} selecionado{selectedUsers.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                <Button onClick={handleCreateChat} className="w-full" disabled={createChatMutation.isPending}>
                  {createChatMutation.isPending ? "Criando..." : "Criar Conversa"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>Nenhuma conversa ainda</p>
              <p className="text-xs mt-1">Clique em + para iniciar</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  className={`w-full text-left p-3 rounded-md transition-colors ${
                    selectedChatId === chat.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {chat.isGroup ? (
                        <Users className="h-4 w-4 flex-shrink-0" />
                      ) : (
                        <User className="h-4 w-4 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{getChatName(chat)}</p>
                        {chat.lastMessage && (
                          <p className="text-xs opacity-70 truncate">
                            {chat.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                    {chat.unreadCount > 0 && (
                      <Badge variant="secondary" className="ml-2 flex-shrink-0">
                        {chat.unreadCount}
                      </Badge>
                    )}
                  </div>
                  {chat.isGroup && (
                    <p className="text-xs opacity-60 mt-1">
                      {chat.participants.length} participantes
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Área de Mensagens */}
      <Card className="flex-1 flex flex-col">
        {selectedChatId === null ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Selecione uma conversa</p>
              <p className="text-sm">Escolha uma conversa à esquerda para começar</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header do Chat */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-2">
                {selectedChat?.isGroup ? (
                  <Users className="h-5 w-5" />
                ) : (
                  <User className="h-5 w-5" />
                )}
                <div>
                  <h3 className="font-semibold">{selectedChat && getChatName(selectedChat)}</h3>
                  {selectedChat?.isGroup && (
                    <p className="text-xs text-muted-foreground">
                      {selectedChat.participants.map(p => p.userName).join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-8">
                  <p>Nenhuma mensagem ainda</p>
                  <p className="text-xs mt-1">Envie a primeira mensagem!</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwn = message.senderId === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {!isOwn && selectedChat?.isGroup && (
                          <p className="text-xs font-semibold mb-1">{message.senderName}</p>
                        )}
                        <MessageContent content={message.content} />
                        <p className={`text-xs mt-1 ${isOwn ? "opacity-70" : "text-muted-foreground"}`}>
                          {new Date(message.createdAt).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de Mensagem */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageContent.trim() || sendMessageMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Pressione Enter para enviar, Shift+Enter para nova linha
              </p>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
