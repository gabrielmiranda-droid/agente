export type ConversationStatus = "open" | "pending" | "resolved";
export type MessageDirection = "incoming" | "outgoing";

export type Conversation = {
  id: number;
  company_id: number;
  contact_id: number;
  whatsapp_instance_id: number | null;
  assigned_user_id: number | null;
  status: ConversationStatus;
  bot_enabled: boolean;
  human_handoff_active: boolean;
  internal_notes: string | null;
  tags: string[] | null;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
  contact_name?: string | null;
  contact_phone_number?: string | null;
  last_message_preview?: string | null;
  last_message_direction?: MessageDirection | null;
};

export type Message = {
  id: number;
  direction: MessageDirection;
  content: string;
  provider_message_id: string | null;
  ai_generated: boolean;
  created_at: string;
};
