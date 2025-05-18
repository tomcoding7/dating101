import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  timestamp: Date;
  isRead: boolean;
}

interface ChatProps {
  matchId: string;
  receiverId: string;
  receiverName: string;
}

export default function Chat({ matchId, receiverId, receiverName }: ChatProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io({
      path: "/api/socket",
    });

    socketInstance.on("connect", () => {
      console.log("Connected to socket server");
      socketInstance.emit("join-chat", matchId);
    });

    socketInstance.on("new-message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    setSocket(socketInstance);

    // Fetch existing messages
    fetchMessages();

    return () => {
      socketInstance.emit("leave-chat", matchId);
      socketInstance.disconnect();
    };
  }, [matchId]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages/${matchId}`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      toast.error("Failed to load messages");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !session?.user?.id) return;

    try {
      const messageData = {
        chatId: matchId,
        message: newMessage,
        senderId: session.user.id,
        receiverId,
      };

      socket.emit("send-message", messageData);
      setNewMessage("");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <span>Chat with {receiverName}</span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-xl w-96 h-[500px] flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Chat with {receiverName}</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.senderId === session?.user?.id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.senderId === session?.user?.id
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  <p>{message.content}</p>
                  <span className="text-xs opacity-75">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="input-field flex-1"
              />
              <button
                type="submit"
                className="btn-primary"
                disabled={!newMessage.trim()}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
