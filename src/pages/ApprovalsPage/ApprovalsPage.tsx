import layouts from "@/components/layouts";
import ui from "@/components/ui";
import { useCallback, useEffect, useState } from "react";
import type { types } from "@/types";
import type { ApprovalFiltersResponse, ApprovalMembersResponse, ApprovalStats, BaseApiResponse, CardItem, PaymentApprovalData, PaymentApprovalResponse, PendingRegistrationData, QuickViewMemberData, PaymentQuickViewData } from "@/types/apiResponseTypes";
import { ApiClient } from "@/utils";
import { useNotification } from "@/hooks/useNotification";
import "./ApprovalsPage.scss";

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

    // Payment QuickView Modal state
    const [paymentQuickViewModal, setPaymentQuickViewModal] = useState<{
        isOpen: boolean;
        memberData: PaymentQuickViewData | null;
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
        },
        {
            id: "pending_payment",
            label: "Payment Pending",
        }
    ]

    const getTableColums = (): types["TableColumn"][] => {
        switch (activeTab) {
            case "pending_registration":
                return [
                    {
                        key: "name",
                        label: "Name",
                        width: "10%",
                        align: "left" as const,
                    },
                    {
                        key: "rentType",
                        label: "Rent Type",
                        width: "10%"
                    },
                    {
                        key: "pgLocation",
                        label: "PG Location",
                        width: "10%"
                    },
                    {
                        key: "phone",
                        label: "Phone",
                        width: "10%"
                    },
                    {
                        key: "actions",
                        label: "Actions",
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
                        width: "15%",
                        align: "left" as const,
                    },
                    {
                        key: "rentType",
                        label: "Rent Type",
                        width: "12%"
                    },
                    {
                        key: "pgLocation",
                        label: "PG Location",
                        width: "15%",
                        align: "center" as const
                    },
                    {
                        key: "phone",
                        label: "Phone",
                        width: "15%"
                    },
                    {
                        key: "rentAmount",
                        label: "Rent",
                        width: "12%",
                        align: "center" as const,
                        render: (value: unknown) => (
                            <div className='currency-value'>
                                <span className='currency-symbol'>
                                    <ui.Icons name="indianRupee" size={14} />
                                </span>
                                <span className='currency-amount'>{value as string}</span>
                            </div>
                        )
                    },
                    {
                        key: "requestedMonthPaymentStatus",
                        label: "Payment",
                        width: "10%",
                        align: "center" as const,
                        render: (value: unknown) => (
                            <span className={`status-badge status-badge--${(value as string).toLowerCase()}`}>
                                {value as string}
                            </span>
                        )
                    },
                    {
                        key: "requestedMonthApprovalStatus",
                        label: "Approval",
                        width: "9%",
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
            rentType: memberData.rentType,
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

    // Payment QuickView Modal handlers
    const handlePaymentQuickView = (memberData: PaymentApprovalData) => {
        const paymentQuickViewData: PaymentQuickViewData = {
            id: memberData.id,
            memberId: memberData.memberId,
            name: memberData.name,
            age: memberData.age,
            gender: memberData.gender,
            location: memberData.location,
            email: memberData.email,
            phone: memberData.phone,
            work: memberData.work,
            profileImage: memberData.photoUrl,
            rentType: memberData.rentType,
            pgLocation: memberData.pgLocation,
            pgName: memberData.pgName,
            roomNo: memberData.roomNo,
            rent: memberData.rentAmount,
            advanceAmount: memberData.advanceAmount,
            dateOfJoining: memberData.dateOfJoining,
            paymentDetails: {
                id: memberData.requestedMonthPayment?.id,
                paymentStatus: memberData.requestedMonthPayment?.paymentStatus,
                approvalStatus: memberData.requestedMonthPayment?.approvalStatus,
                amount: memberData.requestedMonthPayment?.amount,
                month: memberData.requestedMonthPayment?.month,
                year: memberData.requestedMonthPayment?.year,
                dueDate: memberData.requestedMonthPayment?.dueDate,
                overdueDate: memberData.requestedMonthPayment?.overdueDate,
                paidDate: memberData.requestedMonthPayment?.paidDate,
                rentBillScreenshot: memberData.requestedMonthPayment?.rentBillScreenshot,
                electricityBillScreenshot: memberData.requestedMonthPayment?.electricityBillScreenshot,
                attemptNumber: memberData.requestedMonthPayment?.attemptNumber,
                createdAt: memberData.requestedMonthPayment?.createdAt
            },
            documents: [
                { name: 'Profile Photo', url: memberData.photoUrl },
                { name: 'ID Proof', url: memberData.documentUrl }
            ].filter(doc => doc.url)
        };

        setPaymentQuickViewModal({
            isOpen: true,
            memberData: paymentQuickViewData
        });
    };

    const handleClosePaymentQuickView = () => {
        setPaymentQuickViewModal({
            isOpen: false,
            memberData: null
        });
    };

    const handleApproveUser = async (userId: string, pgId: string, formData: { roomId: string; rentAmount?: string; pricePerDay?: string; advanceAmount?: string; pgLocation: string; dateOfJoining?: string }) => {
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

    const handleApprovePayment = async (paymentId: string) => {
        setApproveLoading(true);
        try {
            const approveForm = {
                approvalStatus: 'APPROVED'
            };

            const apiResponse = await ApiClient.put(`/approval/payments/${paymentId}`, approveForm) as BaseApiResponse;

            if (apiResponse && apiResponse.success) {
                notification.showSuccess('Payment Approved', 'Payment has been approved successfully');
                fetchPaymentsData(currentFilters);
                fetchApprovalStats(currentFilters);
                handleClosePaymentQuickView();
            } else {
                notification.showError(apiResponse?.message || 'Payment Approval Failed', 'Failed to approve payment');
            }
        } catch (error) {
            notification.showError('Payment Approval Failed', 'Failed to approve payment');
        } finally {
            setApproveLoading(false);
        }
    };

    const handleRejectPayment = async (paymentId: string) => {
        setRejectLoading(true);
        try {
            const rejectForm = {
                status: 'REJECTED'
            };

            const apiResponse = await ApiClient.put(`/approval/payments/${paymentId}`, rejectForm) as BaseApiResponse;

            if (apiResponse && apiResponse.success) {
                notification.showSuccess('Payment Rejected', 'Payment has been rejected successfully');
                fetchPaymentsData(currentFilters);
                fetchApprovalStats(currentFilters);
                handleClosePaymentQuickView();
            } else {
                notification.showError(apiResponse?.message || 'Payment Rejection Failed', 'Failed to reject payment');
            }
        } catch (error) {
            notification.showError('Payment Rejection Failed', 'Failed to reject payment');
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
                        showRefresh={activeTab === 'pending_registration'}
                        onRefresh={fetchApprovalStats}
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
                        onRefresh={() => activeTab === 'pending_registration' ? fetchPendingRegistrationsData() : fetchPaymentsData(currentFilters)}
                        onRowClick={activeTab === 'pending_payment' ? (row) => handlePaymentQuickView(row as PaymentApprovalData) : undefined}
                        className={activeTab === 'pending_payment' ? 'table--clickable' : ''}
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
                    approvalForm: true,
                    showViewProfile: false
                }}
                onApproveUser={handleApproveUser}
                onDeleteUser={() => console.log("DELETED USER")}
                onRejectUser={handleRejectUser}
                approveLoading={approveLoading}
                rejectLoading={rejectLoading}
            />

            <layouts.PaymentQuickViewModal
                isOpen={paymentQuickViewModal.isOpen}
                onClose={handleClosePaymentQuickView}
                memberData={paymentQuickViewModal.memberData}
                onApprovePayment={handleApprovePayment}
                onRejectPayment={handleRejectPayment}
                approveLoading={approveLoading}
                rejectLoading={rejectLoading}
            />
        </div>
    );
};

export default ApprovalsPage;
