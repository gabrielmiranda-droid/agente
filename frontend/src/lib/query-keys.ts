export const queryKeys = {
  company: (companyId?: number) => ["company", companyId ?? "me"] as const,
  users: (companyId?: number) => ["users", companyId ?? "me"] as const,
  whatsappInstances: (companyId?: number) => ["whatsapp-instances", companyId ?? "me"] as const,
  agents: (companyId?: number) => ["agents", companyId ?? "me"] as const,
  knowledge: (companyId?: number) => ["knowledge", companyId ?? "me"] as const,
  conversations: (companyId?: number) => ["conversations", companyId ?? "me"] as const,
  conversationMessages: (conversationId?: number) =>
    ["conversation-messages", conversationId ?? "none"] as const,
  metrics: (companyId?: number) => ["metrics", companyId ?? "me"] as const,
  plans: ["plans"] as const,
  subscription: ["subscription"] as const,
  companies: ["companies"] as const,
  businessProfile: (companyId?: number) => ["business-profile", companyId ?? "me"] as const,
  categories: (companyId?: number) => ["categories", companyId ?? "me"] as const,
  products: (companyId?: number) => ["products", companyId ?? "me"] as const,
  addons: (companyId?: number) => ["addons", companyId ?? "me"] as const,
  businessHours: (companyId?: number) => ["business-hours", companyId ?? "me"] as const,
  promotions: (companyId?: number) => ["promotions", companyId ?? "me"] as const
};
