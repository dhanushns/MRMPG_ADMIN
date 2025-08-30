import layouts from "@/components/layouts";
import ui from "@/components/ui";
import { useCallback, useEffect, useState } from "react";
import type { types } from "@/types";
import type { ApprovalFiltersResponse, ApprovalMembersResponse, ApprovalStats, BaseApiResponse, CardItem, PaymentApprovalData, PaymentApprovalResponse, PendingRegistrationData, QuickViewMemberData } from "@/types/apiResponseTypes";
import { ApiClient } from "@/utils";
import { useNotification } from "@/hooks/useNotification";

interface ApprovalCards {
    registration: CardItem[];
    payment: CardItem[];
}

interface lastUpdatedProps {
    registration: Date;
    payment: Date;
}

interface ApprovalFilterParams {
    search?: string;
    month?: string;
    year?: string;
    pgLocation?: string;
    rentType?: string;
    paymentStatus?: string;
    approvalStatus?: string;
    page?: number;
    limit?: number;
}

const ApprovalsPage = () => {

    const [activeTab, setActiveTab] = useState("pending_registration");
    const [registrationTableData, setRegistrationTableData] = useState<PendingRegistrationData[]>([]);
    const [paymentTableData, setPaymentTableData] = useState<PaymentApprovalData[]>([]);

    const [TableLoading, setTableLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const notification = useNotification();

    // QuickView Modal state
    const [quickViewModal, setQuickViewModal] = useState<{
        isOpen: boolean;
        memberData: QuickViewMemberData | null;
    }>({
        isOpen: false,
        memberData: null
    });

    // Loading states
    const [approveLoading, setApproveLoading] = useState(false);
    const [rejectLoading, setRejectLoading] = useState(false);
    const [fetchingStats, setFetchingStats] = useState(false);
    const [filterItemsLoading, setFilterItemsLoading] = useState(false);

    // Cards stats
    const [approvalCards, setApprovalCards] = useState<ApprovalCards | null>(null);
    const [lastUpdated, setLastUpdated] = useState<lastUpdatedProps | null>(null);

    // filter items
    const [filterItems, setFilterItems] = useState<types["FilterItemProps"][]>([]);
    
    // Current filter values
    const [currentFilters, setCurrentFilters] = useState<ApprovalFilterParams>({
        page: 1,
        limit: 10
    });

    const tabsItem = [
        {
            id: "pending_registration",
            label: "Registration Pending",
            count: registrationTableData.length,
        },
        {
            id: "pending_payment",
            label: "Payment Pending",
            count: paymentTableData.length,
        }
    ]

    const getTableColums = (): types["TableColumn"][] => {
        switch (activeTab) {
            case "pending_registration":
                return [
                    {
                        key: "name",
                        label: "Name",
                        sortable: true,
                        width: "10%",
                        align: "left" as const,
                    },
                    {
                        key: "location",
                        label: "Location",
                        sortable: true,
                        width: "10%"
                    },
                    {
                        key: "work",
                        label: "Work",
                        sortable: true,
                        width: "10%",
                        align: "center" as const
                    },
                    {
                        key: "rentType",
                        label: "Rent Type",
                        sortable: true,
                        width: "10%"
                    },
                    {
                        key: "pgLocation",
                        label: "PG Location",
                        sortable: true,
                        width: "10%"
                    },
                    {
                        key: "phone",
                        label: "Phone",
                        sortable: true,
                        width: "10%"
                    },
                    {
                        key: "actions",
                        label: "Actions",
                        sortable: false,
                        width: "10%",
                        align: "center" as const,
                        render: (_value: unknown, row: Record<string, unknown>) => (
                            <ui.Button
                                variant="primary"
                                size="small"
                                onClick={() => handleQuickView(row as PendingRegistrationData)}
                                leftIcon={<ui.Icons name="eye" size={14} />}
                            >
                                Quick View
                            </ui.Button>
                        )
                    }
                ]
            case "pending_payment":
                return [
                    {
                        key: "name",
                        label: "Name",
                        sortable: true,
                        width: "10%",
                        align: "left" as const,
                    },
                    {
                        key: "work",
                        label: "Work",
                        sortable: true,
                        width: "10%",
                        align: "center" as const
                    },
                    {
                        key: "rentType",
                        label: "Rent Type",
                        sortable: true,
                        width: "10%"
                    },
                    {
                        key: "pgLocation",
                        label: "PG Location",
                        sortable: true,
                        width: "10%",
                        align: "center" as const
                    },
                    {
                        key: "phone",
                        label: "Phone",
                        sortable: true,
                        width: "10%"
                    },
                    {
                        key: "rent",
                        label: "Rent",
                        sortable: true,
                        width: "10%",
                        align: "center" as const,
                    },
                    {
                        key: "currentMonthPaymentStatus",
                        label: "Payment",
                        sortable: false,
                        width: "10%",
                        align: "center" as const,
                        render: (value: unknown) => (
                            <span className={`status-badge status-badge--${(value as string).toLowerCase()}`}>
                                {value as string}
                            </span>
                        )
                    },
                    {
                        key: "currentMonthApprovalStatus",
                        label: "Approval",
                        sortable: false,
                        width: "10%",
                        align: "center" as const,
                        render: (value: unknown) => (
                            <span className={`status-badge status-badge--${(value as string).toLowerCase()}`}>
                                {value as string}
                            </span>
                        )
                    }
                ]
            default:
                return [];
        }
    }

    const getTableData = (): PendingRegistrationData[] | PaymentApprovalData[] => {
        return activeTab === 'pending_registration' ? registrationTableData : paymentTableData;
    }

    useEffect(() => {
        switch (activeTab) {
            case "pending_registration":
                fetchPendingRegistrationsData();
                fetchApprovalStats();
                break;
            case "pending_payment":
                fetchPaymentsData();
                fetchPaymentApprovalFilters();
                break;
            default:
                break;
        }
    }, [activeTab])

    // Function to get pending registrations data
    const fetchPendingRegistrationsData = async () => {
        setTableLoading(true);
        try {

            const apiResponse = await ApiClient.get("/approval/members") as ApprovalMembersResponse;
            if (apiResponse && apiResponse.success) {
                setRegistrationTableData(apiResponse.data);
                setCurrentPage(apiResponse.pagination.page);
                setTotalPages(apiResponse.pagination.totalPages);
            }
            else {
                setRegistrationTableData([]);
                setCurrentPage(1);
                setTotalPages(1);
                notification.showError('Failed to fetch pending registrations', "Contact support", 2000);
            }

        } catch (err) {
            notification.showError('Error fetching pending registrations', "Check your network connection", 2000);
            return [];
        }
        finally {
            setTableLoading(false);
        }

    }

    // Build query parameters for approval filters
    const buildApprovalQueryParams = (filterParams: ApprovalFilterParams): string => {
        const params = new URLSearchParams();
        
        // Add pagination
        if (filterParams.page) {
            params.append('page', filterParams.page.toString());
        }
        params.append('limit', (filterParams.limit || 10).toString());

        // Add search if provided
        if (filterParams.search?.trim()) {
            params.append('search', filterParams.search.trim());
        }

        // Add other filter parameters
        if (filterParams.month) {
            params.append('month', filterParams.month);
        }
        if (filterParams.year) {
            params.append('year', filterParams.year);
        }
        if (filterParams.pgLocation) {
            params.append('pgLocation', filterParams.pgLocation);
        }
        if (filterParams.rentType) {
            params.append('rentType', filterParams.rentType);
        }
        if (filterParams.paymentStatus) {
            params.append('paymentStatus', filterParams.paymentStatus);
        }
        if (filterParams.approvalStatus) {
            params.append('approvalStatus', filterParams.approvalStatus);
        }

        return params.toString();
    };

    // Function to get pending payment data
    const fetchPaymentsData = async (filterParams: ApprovalFilterParams = currentFilters) => {
        setTableLoading(true);
        try {
            const queryString = buildApprovalQueryParams(filterParams);
            const apiResponse = await ApiClient.get(`/approval/payments?${queryString}`) as PaymentApprovalResponse;
            console.log(apiResponse);
            if (apiResponse && apiResponse.success) {
                setPaymentTableData(apiResponse.data.tableData);
                setCurrentPage(apiResponse.data.pagination.page);
                setTotalPages(apiResponse.data.pagination.totalPages);
            }
            else {
                setPaymentTableData([]);
                setCurrentPage(1);
                setTotalPages(1);
                notification.showError(apiResponse.error || 'Failed to fetch pending payments', apiResponse.message || 'Contact support', 2000);
            }

        } catch (err) {
            notification.showError('Error fetching pending payments', "Check your network connection", 2000);
            return [];
        }
        finally {
            setTableLoading(false);
        }
    }

    // Function to get the filters for payment approvals
    const fetchPaymentApprovalFilters = async () => {
        setFilterItemsLoading(true);
        try {
            const apiResponse = await ApiClient.get("/approval/payments/filters") as ApprovalFiltersResponse;
            if (apiResponse && apiResponse.success) {
                setFilterItems(apiResponse.data.filters);
            } else {
                setFilterItems([]);
                notification.showError(apiResponse.error || 'Failed to fetch payment approval filters', apiResponse.message || 'Contact support', 2000);
            }
        } catch (error) {
            notification.showError('Error fetching filters', "Check your network connection", 2000);
        }
        finally {
            setFilterItemsLoading(false);
        }
    }

    //Function to get tab cards
    const fetchApprovalStats = useCallback(async (filterParams: ApprovalFilterParams = currentFilters) => {

        setFetchingStats(true);
        try {
            const queryString = buildApprovalQueryParams(filterParams);
            const apiResponse = await ApiClient.get(`/approval/stats?${queryString}`) as ApprovalStats;
            if (apiResponse.success && apiResponse.data) {
                setApprovalCards(apiResponse.data.cards);
                setLastUpdated(apiResponse.data.lastUpdated);
            }
            else {
                notification.showError(apiResponse?.message || 'Failed to fetch approval stats', apiResponse.error, 2000);
            } ``

        } catch (error) {
            notification.showError('Error fetching approval stats', "Check your network connection", 2000);
        } finally {
            setFetchingStats(false);
        }

    }, [notification, currentFilters]);

    // Refresh Stats card
    const handleRefreshStats = useCallback(async () => {
        setFetchingStats(true);
        try {

            const apiResponse = await ApiClient.post("/approval/stats/refresh", {}) as ApprovalStats;
            if (apiResponse.success && apiResponse.data) {
                setApprovalCards(apiResponse.data.cards);
                setLastUpdated(apiResponse.data.lastUpdated);
            }
            else {
                notification.showError(apiResponse?.message || 'Failed to refresh approval stats', apiResponse.error, 2000);
            }

        } catch (error) {
            notification.showError('Error fetching approval stats', "Check your network connection", 2000);
        }
        finally {
            setFetchingStats(false);
        }
    }, [notification]);

    //handles payment filter apply function
    const handlePaymentFilterApply = useCallback(async (filterValues: Record<string, string | string[] | number | boolean | Date | { start: string; end: string } | null>) => {
        const filterParams: ApprovalFilterParams = {
            page: 1,
            limit: currentFilters.limit || 10,
            search: filterValues.search as string || '',
            month: filterValues.month as string || '',
            year: filterValues.year as string || '',
            pgLocation: filterValues.pgLocation as string || '',
            rentType: filterValues.rentType as string || '',
            paymentStatus: filterValues.paymentStatus as string || '',
            approvalStatus: filterValues.approvalStatus as string || ''
        };

        setCurrentFilters(filterParams);

        try {
            await Promise.all([
                fetchPaymentsData(filterParams),
                fetchApprovalStats(filterParams)
            ]);
        } catch (error) {
            notification.showError('Error applying filters', 'Please try again', 2000);
        }
    }, [currentFilters, fetchPaymentsData, fetchApprovalStats, notification]);


    // Function to reset filters
    const handleResetFilters = useCallback(() => {
        const resetFilters: ApprovalFilterParams = {
            page: 1,
            limit: 10
        };
        
        setCurrentFilters(resetFilters);
        
        // Reload data with reset filters
        fetchPaymentsData(resetFilters);
        fetchApprovalStats(resetFilters);
    }, [fetchPaymentsData, fetchApprovalStats]);


    const getTabCards = () => {
        switch (activeTab) {
            case "pending_registration":
                return approvalCards?.registration || [];
            case "pending_payment":
                return approvalCards?.payment || [];
            default:
                return [];
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchPendingRegistrationsData();
    };

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
    };

    // QuickView Modal handlers
    const handleQuickView = (memberData: PendingRegistrationData) => {
        const quickViewData: QuickViewMemberData = {
            id: memberData.id,
            memberId: memberData.memberId,
            name: memberData.name,
            email: memberData.email,
            phone: memberData.phone,
            roomNo: '',
            memberType: memberData.rentType === 'LONG_TERM' ? 'long-term' : 'short-term',
            profileImage: memberData.photoUrl,
            paymentStatus: 'PENDING',
            paymentApprovalStatus: 'PENDING',
            documents: [
                { name: 'Photo', url: memberData.photoUrl },
                { name: 'Aadhar Card', url: memberData.aadharUrl }
            ].filter(doc => doc.url),
            age: memberData.age,
            work: memberData.work,
            location: memberData.location,
            pgLocation: memberData.pgLocation
        };

        setQuickViewModal({
            isOpen: true,
            memberData: quickViewData
        });
    };

    const handleCloseQuickView = () => {
        setQuickViewModal({
            isOpen: false,
            memberData: null
        });
    };

    const handleApproveUser = async (userId: string, pgId: string, formData: { roomNo: string; rentAmount: string; advanceAmount?: string; pgLocation: string; dateOfJoining?: string }) => {
        setApproveLoading(true);
        try {
            const approveForm = {
                status: 'APPROVED',
                pgId: pgId,
                ...formData
            }

            const apiResponse = await ApiClient.put(`/approval/members/${userId}`, approveForm) as BaseApiResponse;

            if (apiResponse && apiResponse.success) {
                notification.showSuccess('Member Approved', 'A new member has been added successfully in ' + formData.pgLocation);
                fetchPendingRegistrationsData();
                handleCloseQuickView();
            }
            else {
                notification.showError(apiResponse?.message || 'Member Approval Failed', 'Failed to approve member in ' + formData.pgLocation);
            }
        } catch (error) {
            notification.showError('Member Approval Failed', 'Failed to approve member in ' + formData.pgLocation);
        } finally {
            setApproveLoading(false);
        }
    };

    const handleRejectUser = async (userId: string) => {
        setRejectLoading(true);
        try {
            const rejectForm = {
                status: 'REJECTED',
            };

            const apiResponse = await ApiClient.put(`/approval/members/${userId}`, rejectForm) as BaseApiResponse;

            if (apiResponse && apiResponse.success) {
                notification.showSuccess('Member Rejected', 'Member has been rejected successfully');
                fetchPendingRegistrationsData();
                handleCloseQuickView();
            } else {
                notification.showError(apiResponse?.message || 'Member Rejection Failed', 'Failed to reject member');
            }
        } catch (error) {
            notification.showError('Member Rejection Failed', 'Failed to reject member');
        } finally {
            setRejectLoading(false);
        }
    };

    return (
        <div className="approvals-page">
            <div className="approvals-page__header">
                <layouts.HeaderLayout title="Approval Management System" subText="View and manage pending registration and payment approvals" />
            </div>
            <div className="approvals-page__content">
                <div className="approvals-page__tabs">
                    <ui.Tabs tabs={tabsItem} activeTab={activeTab} onTabChange={handleTabChange} showCounts />
                </div>
                {activeTab === 'pending_payment' && (
                    <div className="approvals-page__filters">
                        <layouts.FilterLayout
                            filters={filterItems}
                            loading={filterItemsLoading}
                            className="approvals-page__filters"
                            columns={4}
                            showApplyButton
                            showResetButton
                            onApply={handlePaymentFilterApply}
                            onReset={handleResetFilters} />
                    </div>
                )}
                <div className="approvals-page__cards">
                    <layouts.CardGrid
                        cards={approvalCards ? getTabCards() : [{ icon: "clock" }, { icon: "clock" }, { icon: "clock" }, { icon: "clock" }]}
                        columns={4} gap="md"
                        loading={fetchingStats}
                        showRefresh
                        onRefresh={handleRefreshStats}
                        lastUpdated={lastUpdated ? (activeTab === 'pending_registration' ? lastUpdated.registration : lastUpdated.payment) : undefined}
                        className="approvals-page__card-grid" />
                </div>
                <div className="approvals-page__table">
                    <layouts.TableLayout
                        columns={getTableColums()}
                        data={getTableData()}
                        loading={TableLoading}
                        pagination={{
                            currentPage: currentPage,
                            totalPages: totalPages,
                            totalItems: getTableData().length,
                            onPageChange: handlePageChange
                        }}
                        showRefresh
                        onRefresh={()=> activeTab === 'pending_registration' ? fetchPendingRegistrationsData() : fetchPaymentsData(currentFilters)}
                    />
                </div>
            </div>

            <layouts.QuickViewModal
                isOpen={quickViewModal.isOpen}
                onClose={handleCloseQuickView}
                memberData={quickViewModal.memberData}
                modelLayouts={{
                    paymentInfo: false,
                    documents: true,
                    approvalForm: true
                }}
                onApproveUser={handleApproveUser}
                onDeleteUser={() => console.log("DELETED USER")}
                onRejectUser={handleRejectUser}
                approveLoading={approveLoading}
                rejectLoading={rejectLoading}
            />
        </div>
    );
};

export default ApprovalsPage;
