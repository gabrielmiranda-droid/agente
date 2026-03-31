export type OperationalOrderStatus =
  | "new"
  | "pending_confirmation"
  | "confirmed"
  | "in_preparation"
  | "out_for_delivery"
  | "ready_for_pickup"
  | "completed"
  | "cancelled";

export type OrderItem = {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  addons_json: Array<Record<string, unknown>> | null;
  notes: string | null;
};

export type OrderPrintJob = {
  id: number;
  trigger_status: string;
  printer_target: string | null;
  payload_text: string | null;
  printed: boolean;
  printed_at: string | null;
  created_at: string;
};

export type OperationalOrder = {
  id: number;
  company_id: number;
  conversation_id: number | null;
  code: string;
  status: OperationalOrderStatus;
  fulfillment_type: string;
  payment_method: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  delivery_address: string | null;
  neighborhood: string | null;
  notes: string | null;
  subtotal: number;
  delivery_fee: number;
  discount_amount: number;
  total_amount: number;
  printed_at: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  print_jobs: OrderPrintJob[];
};

export type DashboardStat = {
  label: string;
  value: string | number;
  hint: string;
  tone: string;
};

export type ClientPanelData = {
  stats: DashboardStat[];
  orders: OperationalOrder[];
  inbox_counts: Record<string, number>;
  catalog_summary: Record<string, number>;
  inventory_alerts: Array<Record<string, string | number | boolean>>;
  finance_summary: {
    period_start: string;
    period_end: string;
    total_sold: number;
    average_ticket: number;
    orders_count: number;
    payment_breakdown: Record<string, number>;
    top_products: Array<{ name: string; quantity: number }>;
  };
  business_snapshot: Record<string, unknown>;
  ai_context_sources: Array<{ source: string; items: number; description: string }>;
};

export type DevPanelData = {
  global_stats: DashboardStat[];
  company_breakdown: Array<Record<string, string | number | boolean>>;
  plan_breakdown: Array<{ plan: string; companies: number }>;
  ai_usage: {
    total_tokens: number;
    estimated_cost: number;
    models: Record<string, number>;
  };
  global_logs: Array<{ title: string; level: string; description: string }>;
  channel_summary: Array<Record<string, string | number | boolean | null>>;
};

export type InventoryItem = {
  id: number;
  company_id: number;
  product_id: number | null;
  name: string;
  unit: string;
  current_quantity: number;
  low_stock_threshold: number;
  active: boolean;
  available_for_sale: boolean;
  created_at: string;
  updated_at: string;
};

export type FinanceSummary = ClientPanelData["finance_summary"];
