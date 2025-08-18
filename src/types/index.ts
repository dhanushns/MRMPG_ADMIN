interface Menu {
  id: string;
  layout: "root" | "entity" | "image";
  label: string;
  path: string;
  tabs?: Menu[];
  selected?: boolean;
  image?: React.ReactNode;
  class: string;
}

// Filter types
type FilterType =
  | "text"
  | "search"
  | "select"
  | "multiSelect"
  | "date"
  | "dateRange"
  | "number"
  | "checkbox"
  | "radio";

interface FilterOptionProps {
  label: string;
  value: string;
  disabled?: boolean;
}

type FilterValue = string | string[] | number | boolean | Date | null;

interface FilterItemProps {
  id: string;
  type: FilterType;
  label?: string;
  placeholder?: string;
  options?: FilterOptionProps[];
  defaultValue?: FilterValue;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  gridSpan?: number;
  min?: number | string;
  max?: number | string;
  step?: number;
  multiSelect?: boolean;
  className?: string;
  style?: React.CSSProperties;
  validation?: (value: FilterValue) => string | null;
  onChange?: (id: string, value: FilterValue | string[]) => void;
  value?: string[];
  onFocus?: () => void;
  onBlur?: () => void;
  // MultiSelect dropdown props
  variant?: "list" | "dropdown" | "native" | "custom";
  searchable?: boolean;
  maxDisplayItems?: number;
  showSelectAll?: boolean;
}

interface FilterLayoutProps {
  title?: string;
  filters: FilterItemProps[];
  layout?: "horizontal" | "vertical" | "grid";
  columns?: number;
  spacing?: "small" | "medium" | "large";
  showResetButton?: boolean;
  showApplyButton?: boolean;
  onApply?: (filters: Record<string, FilterValue>) => void;
  onReset?: () => void;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

// Icon types
type IconName =
  | "search"
  | "user"
  | "users"
  | "settings"
  | "home"
  | "bell"
  | "mail"
  | "phone"
  | "calendar"
  | "clock"
  | "edit"
  | "delete"
  | "plus"
  | "minus"
  | "close"
  | "check"
  | "save"
  | "copy"
  | "share"
  | "refresh"
  | "chevronDown"
  | "chevronUp"
  | "chevronLeft"
  | "chevronRight"
  | "arrowLeft"
  | "arrowRight"
  | "arrowUp"
  | "arrowDown"
  | "eye"
  | "eyeOff"
  | "download"
  | "upload"
  | "file"
  | "folder"
  | "image"
  | "video"
  | "music"
  | "heart"
  | "star"
  | "filter"
  | "grid"
  | "list"
  | "menu"
  | "moreVertical"
  | "moreHorizontal"
  | "info"
  | "warning"
  | "success"
  | "error"
  | "help"
  | "trash"
  | "edit3"
  | "logout"
  | "login"
  | "lock"
  | "unlock"
  | "wifi"
  | "wifiOff"
  | "battery"
  | "bluetooth"
  | "camera"
  | "mic"
  | "micOff"
  | "volume"
  | "volumeOff"
  | "location"
  | "globe"
  | "car"
  | "truck"
  | "plane"
  | "train"
  | "bike"
  | "indianRupee";

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
  onClick?: () => void;
}

// Table types
interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (
    value: unknown,
    row: Record<string, unknown>,
    index: number
  ) => React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

interface TableData {
  [key: string]: unknown;
}

interface TableLayoutProps {
  columns: TableColumn[];
  data: TableData[];
  loading?: boolean;
  pagination?: boolean;
  pageSize?: number;
  sortable?: boolean;
  className?: string;
  onRowClick?: (row: TableData, index: number) => void;
  onSort?: (key: string, direction: "asc" | "desc") => void;
  emptyMessage?: string;
}

interface types {
  Menu: Menu;
  FilterOptionProps: FilterOptionProps;
  FilterItemProps: FilterItemProps;
  FilterLayoutProps: FilterLayoutProps;
  IconName: IconName;
  IconProps: IconProps;
  TableColumn: TableColumn;
  TableData: TableData;
  TableLayoutProps: TableLayoutProps;
}

export type { types };
