// 定义API响应的通用接口
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 菜品类别接口
export interface Category {
  category_id: number;
  category_name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// 菜品接口
export interface Dish {
  dish_id: number;
  dish_name: string;
  category_id: number;
  category_name?: string;
  price: number;
  description: string | null;
  status: number;
  created_at: string;
  updated_at: string;
}

// 供应商接口
export interface Supplier {
  supplier_id: number;
  supplier_name: string;
  contact_name: string | null;
  phone: string | null;
  address: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

// 原材料接口
export interface Ingredient {
  ingredient_id: number;
  ingredient_name: string;
  supplier_id: number;
  supplier_name?: string;
  stock_quantity: number;
  unit: string | null;
  cost_price: number;
  created_at: string;
  updated_at: string;
}

// 菜品原材料关系接口
export interface DishIngredient {
  relation_id: number;
  dish_id: number;
  ingredient_id: number;
  ingredient_name?: string;
  quantity: number;
  unit: string | null;
  created_at: string;
  updated_at: string;
}

// 员工接口
export interface Employee {
  employee_id: number;
  employee_name: string;
  gender: string | null;
  phone: string;
  position: string;
  hire_date: string;
  status: number;
  created_at: string;
  updated_at: string;
}

// 会员接口
export interface Member {
  member_id: number;
  card_number: string;
  member_name: string;
  phone: string | null;
  level: number;
  points: number;
  register_date: string;
  created_at: string;
  updated_at: string;
}

// 订单接口
export interface Order {
  order_id: number;
  order_number: string;
  table_number: string;
  customer_count: number;
  employee_id: number;
  employee_name?: string;
  member_id: number | null;
  member_name?: string | null;
  total_amount: number;
  discount_amount: number;
  actual_amount: number;
  status: number;
  payment_method: string | null;
  order_time: string;
  payment_time: string | null;
  created_at: string;
  updated_at: string;
  details?: OrderDetail[];
}

// 订单明细接口
export interface OrderDetail {
  detail_id: number;
  order_id: number;
  dish_id: number;
  dish_name?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  remark: string | null;
  created_at: string;
  updated_at: string;
}

// 库存记录接口
export interface InventoryRecord {
  record_id: number;
  ingredient_id: number;
  ingredient_name?: string;
  operation_type: number;
  quantity: number;
  unit?: string;
  operation_time: string;
  employee_id: number;
  employee_name?: string;
  remark: string | null;
  created_at: string;
  updated_at: string;
}

// 仪表盘数据接口
export interface DashboardData {
  today_orders: number;
  today_sales: number;
  member_count: number;
  warning_count: number;
  hot_dishes: {
    dish_id: number;
    dish_name: string;
    total_quantity: number;
    total_amount: number;
  }[];
  sales_trend: {
    date: string;
    order_count: number;
    total_amount: number;
  }[];
}

// 销售统计数据接口
export interface SalesStatistics {
  total_orders: number;
  total_amount: number;
  dish_sales: {
    dish_id: number;
    dish_name: string;
    total_quantity: number;
    total_amount: number;
  }[];
  category_sales: {
    category_id: number;
    category_name: string;
    total_quantity: number;
    total_amount: number;
  }[];
  daily_sales: {
    date: string;
    order_count: number;
    total_amount: number;
  }[];
}

// 会员统计数据接口
export interface MemberStatistics {
  total_members: number;
  level_statistics: {
    level: number;
    count: number;
  }[];
  top_members: {
    member_id: number;
    member_name: string;
    card_number: string;
    level: number;
    points: number;
    order_count: number;
    total_amount: number;
  }[];
}

// 库存统计数据接口
export interface InventoryStatistics {
  warning_count: number;
  supplier_statistics: {
    supplier_id: number;
    supplier_name: string;
    ingredient_count: number;
    total_value: number;
  }[];
  total_value: number;
  inventory_trend: {
    date: string;
    operation_type: number;
    total_quantity: number;
  }[];
}

// 分页查询参数接口
export interface QueryParams {
  page?: number;
  limit?: number;
  [key: string]: any;
}
