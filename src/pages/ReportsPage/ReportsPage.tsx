import layouts from "@/components/layouts";
import ui from "@/components/ui";
import { ApiClient, AuthManager, buildReportsQueryParams } from "@/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useNotification } from "@/hooks/useNotification";
import type { types } from "@/types";
import type {
    CardItem,
    ReportsPageCardsResponse,
    ReportsPageFilterResponse,
    ReportsPageMemberData,
    ReportsPagePaymentDataResponse,
    ReportsPageRoomDataResponse,
    ReportsMemberData,
    ReportsPagePaymentData,
    ReportsPageRoomData
} from "@/types/apiResponseTypes";
import type { WeekRange } from "@/components/ui/WeekPicker";
import type { MonthRange } from "@/components/ui/MonthPicker";
import "./ReportsPage.scss";

const ReportsPage = (): React.ReactElement => {

    const isInitialLoad = useRef(true);
    const navigate = useNavigate();
    const notification = useNotification();
    const { search } = useLocation();
    const params = useMemo(() => new URLSearchParams(search), [search]);
    const reportType = params.get('type') || 'weekly';

    const [activeTab, setActiveTab] = useState<string>("member-data");
    const [selectedWeek, setSelectedWeek] = useState<WeekRange | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<MonthRange | null>(null);

    // cards response
    const [cardData, setCardData] = useState<CardItem[]>([
        { icon: "alertTriangle" }, { icon: "alertTriangle" }, { icon: "alertTriangle" }, { icon: "alertTriangle" }
    ]);
    const [cardsResponse, setCardsResponse] = useState<ReportsPageCardsResponse | null>(null);

    // table data state
    const [tableData, setTableData] = useState<(ReportsMemberData | ReportsPagePaymentData | ReportsPageRoomData)[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Loading states
    const [cardsLoading, setCardsLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(false);
    const [downloadLoading, setDownloadLoading] = useState(false);

    // Pagination state
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
    });

    // Authentication token validation
    useEffect(() => {
        const checkTokenValidity = () => {
            if (!AuthManager.isTokenValid()) {
                AuthManager.clearAuthData();
                navigate('/login');
            }
        };
        checkTokenValidity();
    }, [navigate]);

    // fetch reports page stats card
    const fetchReportsStatsCard = useCallback(async () => {
        setCardsLoading(true);
        try {
            const apiResponse = await ApiClient.get(`/report/${reportType}/cards`) as ReportsPageCardsResponse;
            if (apiResponse.success && apiResponse.data) {
                setCardsResponse(apiResponse);
                setCardData(apiResponse.data.cards);
            }
            else {
                notification.showError(apiResponse.error || "Failed to fetch reports stats", apiResponse.message, 5000);
            }
        } catch (error) {
            notification.showError("Failed to fetch reports stats", error instanceof Error ? error.message : String(error), 5000);
        } finally {
            setCardsLoading(false);
        }
    }, [reportType, notification]);

    // Fetch table data based on active tab
    const fetchTableData = useCallback(async (resetPage = false) => {
        setTableLoading(true);
        const page = resetPage ? 1 : currentPage;

        try {
            let queryParams = `page=${page}&limit=10`;
            
            // Add week filter if selected
            if (selectedWeek) {
                const startDate = selectedWeek.start.toISOString().split('T')[0];
                const endDate = selectedWeek.end.toISOString().split('T')[0];
                queryParams += `&startDate=${startDate}&endDate=${endDate}`;
            }
            
            // Add month filter if selected (and no week filter)
            if (selectedMonth && !selectedWeek) {
                const startDate = selectedMonth.startDate.toISOString().split('T')[0];
                const endDate = selectedMonth.endDate.toISOString().split('T')[0];
                queryParams += `&startDate=${startDate}&endDate=${endDate}`;
            }

            let apiResponse;
            switch (activeTab) {
                case "member-data":
                    apiResponse = await ApiClient.get(`/report/${reportType}/${activeTab}?${queryParams}`) as ReportsPageMemberData;
                    break;
                case "payment-data":
                    apiResponse = await ApiClient.get(`/report/${reportType}/${activeTab}?${queryParams}`) as ReportsPagePaymentDataResponse;
                    break;
                case "room-data":
                    apiResponse = await ApiClient.get(`/report/${reportType}/${activeTab}?${queryParams}`) as ReportsPageRoomDataResponse;
                    break;
                default:
                    throw new Error("Invalid tab");
            }

            if (apiResponse.success && apiResponse.data) {
                setTableData(apiResponse.data.tableData);
                setPagination(apiResponse.data.pagination);
                if (resetPage) {
                    setCurrentPage(1);
                }
            } else {
                notification.showError(apiResponse.error || "Failed to fetch table data", apiResponse.message, 5000);
            }
        } catch (error) {
            notification.showError("Failed to fetch table data", error instanceof Error ? error.message : String(error), 5000);
        } finally {
            setTableLoading(false);
        }
    }, [activeTab, currentPage, selectedWeek, selectedMonth, sortKey, sortDirection, reportType, notification]);

    // Handle pagination
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Handle sorting
    const handleSort = (key: string, direction: 'asc' | 'desc') => {
        setSortKey(key);
        setSortDirection(direction);
    };

    // Handle refresh
    const handleRefresh = useCallback(() => {
        fetchTableData();
        fetchReportsStatsCard();
    }, [fetchTableData, fetchReportsStatsCard]);

    // Get table columns based on active tab
    const getTableColumns = (): types["TableColumn"][] => {
        switch (activeTab) {
            case "member-data":
                return [
                    { key: "memberId", label: "Member ID", width: "10%", align: "center" },
                    { key: "memberName", label: "Name", width: "10%" },
                    { key: "memberAge", label: "Age", width: "5%", align: "center" },
                    { key: "pgName", label: "PG Name", width: "20%", align: "left" },
                    { key: "roomNo", label: "Room", align: "left", width: "10%" },
                    { key: "roomRent", label: "Rent", align: "left", render: (value) => `₹${value}`, width: "10%" },
                    { key: "daysSinceJoining", label: "Days", align: "center", width: "5%" },
                    { key: "totalPaymentsMade", label: "Payments", align: "center", width: "5%" },
                    { key: "pendingPaymentsCount", label: "Pending", align: "center", width: "5%" },
                    { key: "overduePaymentsCount", label: "Overdue", align: "center", width: "5%" }
                ];
            case "payment-data":
                return [
                    { key: "memberId", label: "Member ID", sortable: true },
                    { key: "memberName", label: "Name", sortable: true },
                    { key: "pgName", label: "PG Name", sortable: true },
                    { key: "roomNo", label: "Room", align: "center" },
                    { key: "currentWeekPayments", label: "Current Week Payments", align: "center" },
                    { key: "currentWeekTotal", label: "Current Week Total", align: "right", render: (value) => `₹${value}` },
                    { key: "previousWeekPayments", label: "Previous Week Payments", align: "center" },
                    { key: "previousWeekTotal", label: "Previous Week Total", align: "right", render: (value) => `₹${value}` },
                    {
                        key: "paymentTrend",
                        label: "Trend",
                        align: "center",
                        render: (value, row) => (
                            <div className={`trend-indicator trend-${value}`}>
                                <ui.Icons
                                    name={value === 'up' ? "trendingUp" : "trendingDown"}
                                    size={16}
                                />
                                <span>{(row as ReportsPagePaymentData).paymentTrendPercentage}%</span>
                            </div>
                        )
                    },
                    { key: "totalApprovedAmount", label: "Total Approved", align: "right", render: (value) => `₹${value}` },
                    { key: "totalPendingAmount", label: "Total Pending", align: "right", render: (value) => `₹${value}` },
                    { key: "totalOverdueAmount", label: "Total Overdue", align: "right", render: (value) => `₹${value}` }
                ];
            case "room-data":
                return [
                    { key: "roomNo", label: "Room No", sortable: true },
                    { key: "pgName", label: "PG Name", sortable: true },
                    { key: "capacity", label: "Capacity", align: "center" },
                    { key: "currentOccupants", label: "Current Occupants", align: "center" },
                    {
                        key: "occupancyRate",
                        label: "Occupancy Rate",
                    
                        align: "center",
                        render: (value) => `${value}%`
                    },
                    {
                        key: "roomStatus",
                        label: "Status",
                        align: "center",
                        render: (value) => (
                            <span className={`status-badge status-${String(value).toLowerCase().replace(' ', '-')}`}>
                                {String(value)}
                            </span>
                        )
                    },
                    {
                        key: "isAvailable",
                        label: "Available",
                        align: "center",
                        render: (value) => (
                            <ui.Icons
                                name={value ? "check" : "minus"}
                                size={16}
                                className={value ? "text-success" : "text-error"}
                            />
                        )
                    },
                    { key: "weeklyRevenue", label: "Weekly Revenue", align: "right", render: (value) => `₹${value}` },
                    { key: "potentialMonthlyRevenue", label: "Potential Monthly", align: "right", render: (value) => `₹${value}` },
                    {
                        key: "actualUtilization",
                        label: "Utilization",
                    
                        align: "center",
                        render: (value) => `${value}%`
                    }
                ];
            default:
                return [];
        }
    };

    // Reports page tabs
    const tabsItem = [
        {
            id: "member-data",
            label: "Member's Data",
        },
        {
            id: "payment-data",
            label: "Payment's Data",
        },
        {
            id: "room-data",
            label: "Room's Data",
        }
    ]

    // handle tabs changes
    const handleTabChange = useCallback((tabId: string) => {
        setActiveTab(tabId);
        setCurrentPage(1);
        setSortKey(null);
        setSortDirection('asc');
    }, []);

    // Handle week selection
    const handleWeekChange = useCallback((weekRange: WeekRange | null) => {
        setSelectedWeek(weekRange);
        if (weekRange) {
            setSelectedMonth(null); // Clear month selection when week is selected
        }
        setCurrentPage(1); // Reset to first page when week changes
    }, []);

    // Handle month selection
    const handleMonthChange = useCallback((monthRange: MonthRange | null) => {
        setSelectedMonth(monthRange);
        if (monthRange) {
            setSelectedWeek(null); // Clear week selection when month is selected
        }
        
        setCurrentPage(1); // Reset to first page when month changes
    }, []);

    const handleDownloadReport = useCallback(async () => {
        setDownloadLoading(true);
        try {
            // Use the makeAuthenticatedRequest method directly for blob response
            const response = await ApiClient.makeAuthenticatedRequest(
                `/report/download?reportType=${reportType}`,
                {
                    method: 'GET'
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Get the blob from response
            const blob = await response.blob();

            // Create blob URL and trigger download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Generate filename based on current context
            const timestamp = new Date().toISOString().split('T')[0];
            const tabName = activeTab.replace('-', '_');
            link.download = `${reportType}_${tabName}_report_${timestamp}.xlsx`;

            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            notification.showSuccess("Report downloaded successfully", `${reportType} ${activeTab.replace('-', ' ')} report has been downloaded`, 3000);
        } catch (error) {
            notification.showError("Failed to download report", error instanceof Error ? error.message : String(error), 5000);
        } finally {
            setDownloadLoading(false);
        }
    }, [reportType, activeTab, notification]);

    // Effect to fetch data when reportType changes
    // useEffect(() => {
    //     if (AuthManager.isAuthenticated() && !isInitialLoad.current) {
    //         setCurrentPage(1);
    //         setSortKey(null);
    //         setSortDirection('asc');

    //         // Fetch new data for the changed report type
    //         fetchReportsStatsCard();
    //         fetchTableData(true);
    //     }
    // }, [reportType]);

    // // Effect to fetch data when tab changes
    // useEffect(() => {
    //     if (AuthManager.isAuthenticated() && activeTab && !isInitialLoad.current) {
    //         fetchTableData(true);
    //     }
    // }, [activeTab]);

    // // Effect to fetch data when selected week changes
    // useEffect(() => {
    //     if (AuthManager.isAuthenticated() && !isInitialLoad.current) {
    //         fetchTableData(true);
    //     }
    // }, [selectedWeek]);

    // // Effect to handle page changes
    // useEffect(() => {
    //     if (AuthManager.isAuthenticated() && currentPage > 1 && !isInitialLoad.current) {
    //         fetchTableData();
    //     }
    // }, [currentPage]);

    // Initial data fetch
    // useEffect(() => {
    //     if (AuthManager.isAuthenticated() && isInitialLoad.current) {
    //         fetchReportsStatsCard();
    //         fetchTableData();
    //         isInitialLoad.current = false;
    //     }
    // }, []);

    // Effect to fetch data when selected month changes
    useEffect(() => {
        if (AuthManager.isAuthenticated() && !isInitialLoad.current) {
            fetchTableData(true);
        }
    }, [selectedMonth]);

    return (
        <div className="reports-page">
            <div className="reports-page__header">
                <layouts.HeaderLayout title={`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Reports`} subText={`View and generate your ${reportType} reports`} />
            </div>
            <div className="reports-page__content">
                <div className="reports-page__cards-section">
                    <layouts.CardGrid
                        cards={cardData}
                        loading={cardsLoading}
                        columns={4}
                        showRefresh
                        lastUpdated={cardsResponse?.data.lastUpdated}
                        onRefresh={fetchReportsStatsCard}
                    />
                </div>

                <div className="reports-page__tabs-section">
                    <ui.Tabs tabs={tabsItem} activeTab={activeTab} onTabChange={handleTabChange} />
                </div>

                <div className="reports-page__date-pickers-section">
                    <div className="reports-page__week-picker">
                        <ui.WeekPicker
                            value={selectedWeek}
                            onChange={handleWeekChange}
                            placeholder="Select a week to filter reports"
                            size="small"
                        />
                    </div>
                    
                    <div className="reports-page__month-picker">
                        <ui.MonthPicker
                            value={selectedMonth}
                            onChange={handleMonthChange}
                            placeholder="Select a month to filter reports"
                            size="small"
                            showQuickSelect={true}
                            clearable={true}
                        />
                    </div>
                </div>

                <div className="reports-page__downloadReport-section">
                    <ui.Button
                        onClick={handleDownloadReport}
                        disabled={downloadLoading || tableLoading}
                        leftIcon={downloadLoading ? <ui.Icons name="loader" className="animate-spin" /> : <ui.Icons name="download" />}
                    >
                        {downloadLoading ? "Downloading..." : "Download Report"}
                    </ui.Button>
                </div>

                <div className="reports-page__table-section">
                    <layouts.TableLayout
                        columns={getTableColumns()}
                        data={tableData}
                        loading={tableLoading}
                        pagination={{
                            currentPage: pagination.page,
                            totalItems: pagination.total,
                            totalPages: pagination.totalPages,
                            onPageChange: handlePageChange
                        }}
                        pageSize={pagination.limit}
                        sortable
                        currentSort={{ key: sortKey, direction: sortDirection }}
                        onSort={handleSort}
                        showRefresh
                        showLastUpdated
                        lastUpdated={cardsResponse?.data.lastUpdated}
                        onRefresh={handleRefresh}
                        emptyMessage={`No ${activeTab.replace('_', ' ')} data available`}
                    />
                </div>
            </div>
        </div>
    );
};

export default ReportsPage; 