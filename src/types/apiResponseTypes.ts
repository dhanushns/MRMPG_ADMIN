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
type PaymentStatusTypes = "PENDING" | "PAID" | "REJECTED" | "OVERDUE";
type ApprovalStatusTypes = "PENDING" | "APPROVED" | "REJECTED";
type RentType = "LONG_TERM" | "SHORT_TERM";

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

export interface Payment {
  id: string;
  memberId?: string;
  member?: MemberData;
  pgId?: string;
  pg?: Pg;
  month: number;
  year: number;
  amount: number;
  rentBillScreenshot?: string;
  electricityBillScreenshot?: string;
  paidDate?: string;
  dueDate: string;
  overdueDate?: string;
  attemptNumber: number;
  paymentStatus: PaymentStatusTypes;
  approvalStatus: ApprovalStatusTypes;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pg {
  id: string;
  name: string;
  type: PgType;
  location: string;
  rooms?: RoomInfo[];
  members?: MemberData[];
  payment?: Payment[];
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
  rentType: RentType;
  advanceAmount: number;
  pgId: string;
  roomId: string;
  dateOfJoining: string;
  createdAt: string;
  updatedAt: string;
  pgDetails: {
    id: string;
    name: string;
    type: PgType;
    location: string;
  };
  roomDetails: {
    id: string;
    roomNo: string;
    rent: number;
    capacity: number;
  };
  room: RoomInfo;
  pg: Pg;
  payments?: Payment[];
  tenure?: {
    days: number;
    months: number;
    years: number;
  }
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
  rentType: RentType;
  photoUrl: string;
  aadharUrl: string;
  pgType: PgType;
}

export interface PaymentApprovalData extends MemberData {
  [key: string]: unknown;
  rentAmount: number;
  pgLocation: string;
  pgName: string;
  roomNo: string;
  requestedMonthPaymentStatus: PaymentStatusTypes;
  requestedMonthApprovalStatus: ApprovalStatusTypes;
  requestedMonthPayment: {
    id: string;
    paymentStatus: PaymentStatusTypes;
    approvalStatus: ApprovalStatusTypes;
    amount: number;
    month: number;
    year: number;
    dueDate: string;
    overdueDate: string;
    paidDate: string | null;
    rentBillScreenshot: string | null;
    electricityBillScreenshot: string | null;
    attemptNumber: number;
    createdAt: string;
  };
  hasRequestedMonthPayment: boolean;
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
  pgName: string;
  roomNo: string;
  paymentStatus: PaymentStatusTypes;
  rentAmount: number;
  currentMonthPayment: Payment;
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
  rentType: RentType;
  profileImage?: string;
  phone?: string;
  email?: string;
  paymentStatus: PaymentStatusTypes
  paymentApprovalStatus?: ApprovalStatusTypes;
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

// Payment QuickView Modal data structure
export interface PaymentQuickViewData {
  id: string;
  memberId: string;
  name: string;
  age: number;
  gender: "MALE" | "FEMALE";
  location: string;
  email: string;
  phone: string;
  work: string;
  profileImage?: string;
  rentType: "LONG_TERM" | "SHORT_TERM";
  pgLocation: string;
  pgName: string;
  roomNo: string;
  rent: number;
  advanceAmount: number;
  dateOfJoining: string;
  paymentDetails: {
    id: string;
    paymentStatus: PaymentStatusTypes;
    approvalStatus: ApprovalStatusTypes;
    amount: number;
    month: number;
    year: number;
    dueDate: string;
    overdueDate: string;
    paidDate: string | null;
    rentBillScreenshot: string | null;
    electricityBillScreenshot: string | null;
    attemptNumber: number;
    createdAt: string;
  };
  documents?: { name: string; url: string; }[];
}

export interface PaymentHistory extends Payment {
  [key: string]: unknown;
}

export interface MemberProfileData {
  member: MemberData
  paymentHistory: {
    data: PaymentHistory[]
    pagination: Pagination
  },
  paymentSummary: {
    totalPayments: number;
    pendingPayments: number;
    overduePayments: number;
    totalAmountPaid: number;
    totalAmountPending: number;
    totalAmountOverdue: number;
    lastPaymentDate: string | null;
    nextDueDate: string | null;
  }
}

export interface MemberProfileDataReponse extends BaseApiResponse {
  data: MemberProfileData
}


export interface RoomsFilterResponse extends BaseApiResponse {
  data: {
    filters: types["FilterItemProps"][];
    totalPGs: number;
  };
}

export interface RoomsStatsResponse extends BaseApiResponse {
  data: {
    cards?: CardItem[];
    lastUpdated: Date;
  };
}

export interface RoomData {
  [key: string]: unknown;
  id: string;
  roomNo: string;
  occupied: number;
  status: string;
  statusValue: string;
  rentAmount: number;
  capacity: number;
  currentOccupancy: number;
  availableSlots: number;
  isFullyOccupied: boolean;
  members: [
    {
      id: string;
      memberId: string;
      name: string;
      gender: "MALE" | "FEMALE";
      rentType: RentType;
    }
  ]
}

export interface RoomsApiResponse extends BaseApiResponse {
  data: {
    rooms: RoomData[];
    pgDetails: {
      id: string;
      name: string;
      type: PgType;
      location: string;
    }
    pagination: Pagination
  };
}
