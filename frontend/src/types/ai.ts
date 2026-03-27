export type Agent = {
  id: number;
  company_id: number;
  name: string;
  model: string;
  temperature: number;
  max_context_messages: number;
  active: boolean;
  created_at: string;
};

export type KnowledgeItem = {
  id: number;
  company_id: number;
  title: string;
  content: string;
  category: string | null;
  active: boolean;
  created_at: string;
};

export type UsageMetric = {
  metric_date: string;
  metric_name: string;
  metric_value: number;
  estimated_cost: number;
};

