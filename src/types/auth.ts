export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    role: string;
    token: string;
  };
}

export interface User {
  _id: string;
  name: string;
  email: string;
  subscription: {
    isActive: boolean;
    plan: string;
    startDate: string;
    endDate: string;
  };
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  monthlyTransactions: number;
  recentSubscriptions: Array<{
    _id: string;
    name: string;
    email: string;
    subscription: {
      isActive: boolean;
      plan: string;
      startDate: string;
      endDate: string;
    };
  }>;
}

export interface UsersResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: {
      total: number;
      page: number;
      pages: number;
      limit: number;
    };
  };
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardStats;
}

export interface Category {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryResponse {
  success: boolean;
  data: {
    category: Category;
  };
}

export interface CategoriesResponse {
  success: boolean;
  data: {
    categories: Category[];
    pagination: {
      total: number;
      page: number;
      pages: number;
      limit: number;
    };
  };
}