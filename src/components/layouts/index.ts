import AuthLayout from "./AuthLayout";
import TopNav from "./TopNav";
import HeaderLayout from "./HeaderLayout";
import FilterLayout from "./FilterLayout";
import { TableLayout } from "./TableLayout";
import MainLayout from "./MainLayout/MainLayout";
import CardLayout, { CardGrid } from "./CardLayout";
import QuickViewModal from "./QuickViewModal";
import PaymentQuickViewModal from "./PaymentQuickViewModal";
import RelievingRequestModal from './RelievingRequestModal';
import SettlementModal from './SettlementModal';
import { RoomModal } from "./RoomModal";
import ExpenseViewModal from "./ExpenseViewModal";

export { RelievingRequestModal, SettlementModal };

const layouts = {
    AuthLayout,
    TopNav,
    HeaderLayout,
    FilterLayout,
    TableLayout,
    MainLayout,
    CardLayout,
    CardGrid,
    QuickViewModal,
    PaymentQuickViewModal,
    RelievingRequestModal,
    SettlementModal,
    RoomModal,
    ExpenseViewModal,
}

export default layouts;