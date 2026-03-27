export type BusinessProfile = {
  id: number;
  company_id: number;
  business_name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  neighborhood: string | null;
  delivery_fee: number | null;
  estimated_delivery_time: string | null;
  accepts_pickup: boolean;
  payment_methods: string[];
  welcome_message: string | null;
  out_of_hours_message: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductCategory = {
  id: number;
  company_id: number;
  name: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: number;
  company_id: number;
  category_id: number | null;
  name: string;
  description: string | null;
  price: number;
  promotional_price: number | null;
  active: boolean;
  featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type ProductAddon = {
  id: number;
  company_id: number;
  product_id: number;
  name: string;
  price: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type BusinessHour = {
  id: number;
  company_id: number;
  day_of_week: number;
  open_time: string;
  close_time: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type Promotion = {
  id: number;
  company_id: number;
  title: string;
  description: string | null;
  active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
};
