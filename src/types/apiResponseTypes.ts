import type { IconName } from ".";
import type { types } from ".";

// Base API Response interface
export interface BaseApiResponse {
  success: boolean;
  message: string;
  error?: string;
}

// Login related types
type PgType = "MENS" | "WOMENS";

export type PaginatedResponse<T> = BaseApiResponse & {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type AdminResponse = {
  id: string;
  name: string;
  email: string;
  pgType: PgType;
};

export type LoginResponse = BaseApiResponse & {
  data: {
    admin: AdminResponse;
    token: string;
    expiresIn: string;
  };
};

// Member related types based on actual API response
export interface RoomInfo {
  id: string;
  roomNo: string;
  rent: number;
  capacity: number;
}

export interface PaymentStatus {
  status: "PENDING" | "APPROVED" | "REJECTED";
  month: string;
  paymentDetails: Record<string, unknown> | null;
}

export interface Payment {
  id: string;
  memberId: string;
  member: MemberData;
  pgId: string;
  pg: Pg;
  month: Date;
  year: number;
  amount: number;
  rentBillScreenshot: string;
  electricityBillScreenshot: string;
  paidDate: Date;
  attemptNumber: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "OVERDUE";
  approvedBy: string | null;
  approvedAt: Date | null;
}

export interface Pg {
  id: string;
  name: string;
  type: PgType;
  location: string;
  rooms: RoomInfo[];
  members: MemberData[];
  payment: Payment[];
}

export interface MemberData {
  id: string;
  memberId: string;
  name: string;
  age: number;
  gender: "MALE" | "FEMALE";
  location: string;
  email: string;
  phone: string;
  work: string;
  photoUrl: string;
  aadharUrl: string;
  rentType: "LONG_TERM" | "SHORT_TERM";
  advanceAmount: number;
  pgId: string;
  roomId: string;
  dateOfJoining: string;
  createdAt: string;
  updatedAt: string;
  room: RoomInfo;
  pg: Pg;
  payments: Payment[];
}

export interface PendingRegistrationData {
  [key: string]: unknown;
  id: string;
  name: string;
  memberId: "NA" | string;
  age: number;
  gender: "MALE" | "FEMALE";
  email: string;
  phone: string;
  location: string;
  work: string;
  pgLocation: string;
  rentType: string;
  photoUrl: string;
  aadharUrl: string;
  pgType: PgType;
}

export interface PaymentApprovalData extends MemberData {
  [key: string]: unknown;
  rent: number;
  currentMonthPaymentStatus: "PAID" | "PENDING" | "REJECTED" | "APPROVED" | "OVERDUE";
  currentMonthApprovalStatus: "APPROVED" | "PENDING" | "REJECTED";
  currentMonthPayment: Payment;
  hasCurrentMonthPayment: boolean;
}

export type ApprovalMembersResponse = PaginatedResponse<PendingRegistrationData>;
export interface PaymentApprovalResponse extends BaseApiResponse {
  data: {
    tableData: PaymentApprovalData[]
    pagination: Pagination
  }
}


// Formatted member data for table display
export interface TableMemberData extends MemberData {
  [key: string]: unknown;
  pgLocation: string;
  roomNo: string;
  rent: number;
  paymentStatus: "PAID" | "PENDING" | "OVERDUE";
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
}

// Members API Response
export interface DashboardApiResponse extends BaseApiResponse {
  data: {
    tableData: TableMemberData[],
  },
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type MembersApiResponse = DashboardApiResponse;

// Dashboard Stats card reponse

export type colors = "primary" | "success" | "warning" | "error" | "info";

export interface CardItem {
  title?: string;
  value?: string;
  trend?: "up" | "down";
  percentage?: number;
  icon: IconName;
  color?: colors;
  subtitle?: string;
  badge?: {
    text: string;
    color: colors;
  };
  onClick?: () => void;
}

export interface DashboardStatsResponse extends BaseApiResponse {
  data: {
    cards?: CardItem[];
    lastUpdated: Date;
  };
}

export interface DashboardFiltersResponse extends BaseApiResponse {
  data: {
    filters: types["FilterItemProps"][]
  }
}

export interface ApprovalStats extends BaseApiResponse {
  data: {
    cards: {
      registration: CardItem[],
      payment: CardItem[]
    },
    lastUpdated: {
      registration: Date,
      payment: Date
    }
  }
}

export interface ApprovalFiltersResponse extends BaseApiResponse {
  data: {
    filters: types["FilterItemProps"][];
    totalPGs: number;
  };
}

// QuickView Modal data structure
export interface QuickViewMemberData {
  id: string;
  memberId?: string;
  name: string;
  roomNo: string;
  memberType: "long-term" | "short-term";
  profileImage?: string;
  phone?: string;
  email?: string;
  paymentStatus: "PAID" | "PENDING" | "OVERDUE";
  paymentApprovalStatus?: "PENDING" | "APPROVED" | "REJECTED";
  documents?: { name: string; url: string; }[];
  age?: number;
  work?: string;
  location?: string;
  pgLocation?: string;
  advanceAmount?: number;
  rent?: number;
  joinedOn?: string;
  aadharUrl?: string;
}

