export interface ChatMeta {
    userName: string;
    lastMessage: string;
    unreadCount: number;
    updatedAt: string;
}

export interface ChatMessage {
    sender: "client" | "admin";
    text: string;
    timestamp:number| string;
}

export interface UserChatListItem {
    uid: string;
    meta: ChatMeta;
}