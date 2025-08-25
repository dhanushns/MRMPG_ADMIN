// Base API Response interface
interface BaseApiResponse {
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
  memberId:string;
  member: MemberData;
  pgId: string;
  pg: Pg;
  month: Date;
  year: number;
  amount: number;
  rentBillScreenshot:string;
  electricityBillScreenshot:string;
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
  aadharUrl:string;
  pgType: PgType;
}

export type ApprovalMembersResponse = PaginatedResponse<PendingRegistrationData>;

// Formatted member data for table display
export interface TableMemberData {
  [key: string]: unknown;
  memberId: string;
  name: string;
  pgLocation: string;
  rentType: string;
  roomNo: string;
  advance: string;
  rent: string;
  status: string;
  originalData: MemberData;
}

// Members API Response
export interface DashboardApiResponse extends BaseApiResponse {
  data: {
    tableData : TableMemberData[],
  },
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// QuickView Modal data structure
export interface QuickViewMemberData {
  id: string;
  memberId?: string;
  name: string;
  roomNo: string;
  memberType: "long_term" | "short_term";
  profileImage?: string;
  phone?: string;
  email?: string;
  paymentStatus: "Paid" | "Pending";
  paymentApprovalStatus?: "Pending" | "Approved" | "Rejected";
  documents?: { name: string; url: string; }[];
  age?: number;
  work?: string;
  location?: string;
  advanceAmount?: number;
  rent?: number;
  joinedOn?: string;
  aadharUrl?: string;
}

