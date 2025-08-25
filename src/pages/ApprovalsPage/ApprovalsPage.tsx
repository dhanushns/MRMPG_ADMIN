import layouts from "@/components/layouts";
import ui from "@/components/ui";
import { useEffect, useState } from "react";
import type { types } from "@/types";
import type { ApprovalMembersResponse, PendingRegistrationData, QuickViewMemberData } from "@/types/apiResponseTypes";
import { ApiClient } from "@/utils";

const ApprovalsPage = () => {

    const [activeTab, setActiveTab] = useState("pending_registration");
    const [tableData, setTableData] = useState<PendingRegistrationData[]>([]);
    const [TableLoading, setTableLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalMembers, setTotalMembers] = useState(0);

    // QuickView Modal state
    const [quickViewModal, setQuickViewModal] = useState<{
        isOpen: boolean;
        memberData: QuickViewMemberData | null;
    }>({
        isOpen: false,
        memberData: null
    });

    const tabsItem = [
        {
            id: "pending_registration",
            label: "Registration Pending",
            count: 12,
        },
        {
            id: "pending_payment",
            label: "Payment Pending",
            count: 5
        }
    ]

    const getTabCards = (): types["CardLayoutProps"][] => {

        switch (activeTab) {
            case "pending_registration":
                return [
                    {
                        title: "Total Requests",
                        value: "200",
                        trend: "up" as const,
                        percentage: 12,
                        icon: "userPlus" as const,
                        color: "success" as const,
                        subtitle: "Compared to last month",
                    },
                    {
                        title: "Approved",
                        value: "20",
                        icon: "checkCircle2" as const,
                        color: "success" as const,
                        subtitle: "August 2025",
                    },
                    {
                        title: "Rejected",
                        value: "12",
                        icon: "xCircle" as const,
                        color: "error" as const,
                        subtitle: "Rejected Registration approvals",
                    }
                ]
            case "pending_payment":
                return [
                    {
                        title: "Not Paid",
                        value: "12",
                        icon: "clock" as const,
                        color: "warning" as const,
                        subtitle: "Members still not yet uploaded the payment screenshots",
                    },
                    {
                        title: "Approved",
                        value: "20",
                        icon: "checkCircle2" as const,
                        color: "success" as const,
                        subtitle: "Approved Payment Requests",
                    },
                    {
                        title: "Rejected",
                        value: "12",
                        icon: "xCircle" as const,
                        color: "error" as const,
                        subtitle: "Rejected Payment Requests",
                    }
                ]
            default:
                return [];
        }

    }

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
            default:
                return [];
        }
    }

    useEffect(() => {
        switch (activeTab) {
            case "pending_registration":
                getPendingRegistrationsData();
                break;
            case "pending_payment":
                break;
            default:
                break;
        }
    }, [activeTab])

    const getPendingRegistrationsData = async () => {
        setTableLoading(true);
        try {

            const apiResponse = await ApiClient.get("/approval/members") as ApprovalMembersResponse;
            if (apiResponse && apiResponse.success) {
                setTableData(apiResponse.data);
                setCurrentPage(apiResponse.pagination.page);
                setTotalPages(apiResponse.pagination.totalPages);
                setTotalMembers(apiResponse.pagination.total);
            }
            else {
                setTableData([]);
                setCurrentPage(1);
                setTotalPages(1);
                setTotalMembers(0);
            }

        } catch (err) {
            console.error("Error fetching pending registrations:", err);
            return [];
        }
        finally {
            setTableLoading(false);
        }

    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        getPendingRegistrationsData();
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
            roomNo: '', // Empty for pending registrations
            memberType: memberData.rentType === 'LONG_TERM' ? 'long_term' : 'short_term',
            profileImage: memberData.photoUrl,
            paymentStatus: 'Pending', // Default for pending registrations
            paymentApprovalStatus: 'Pending',
            documents: [
                { name: 'Photo', url: memberData.photoUrl },
                { name: 'Aadhar Card', url: memberData.aadharUrl }
            ].filter(doc => doc.url), // Filter out empty URLs
            age: memberData.age,
            work: memberData.work,
            location: memberData.location
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

    const handleApproveUser = async (userId: string, formData: { roomNo: string; rentAmount: string; advanceAmount?: string; pgLocation: string }) => {
        try {
            console.log('Approving user:', userId, formData);
            // Here you would make an API call to approve the user
            // await ApiClient.post(`/approval/approve/${userId}`, formData);
            
            // Refresh the data after approval
            getPendingRegistrationsData();
            handleCloseQuickView();
        } catch (error) {
            console.error('Error approving user:', error);
        }
    };

    const handleRejectUser = async (userId: string) => {
        try {
            console.log('Rejecting user:', userId);
            getPendingRegistrationsData();
            handleCloseQuickView();
        } catch (error) {
            console.error('Error rejecting user:', error);
        }
    };

    return (
        <div className="approvals-page">
            <div className="approvals-page__header">
                <layouts.HeaderLayout title="Approval Management System" subText="View and manage pending registration and payment approvals" />
            </div>
            <div className="approvals-page__content">
                <div className="approvals-page__tabs">
                    <ui.Tabs tabs={tabsItem} activeTab={activeTab} onTabChange={handleTabChange} />
                </div>
                <div className="approvals-page__cards">
                    <layouts.CardGrid cards={getTabCards()} columns={3} gap="md" className="approvals-page__card-grid" />
                </div>
                <div className="approvals-page__table">
                    <layouts.TableLayout
                        columns={getTableColums()}
                        data={tableData}
                        loading={TableLoading}
                        pagination={{
                            currentPage: currentPage,
                            totalPages: totalPages,
                            totalItems: totalMembers,
                            onPageChange: handlePageChange
                        }}
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
                onDeleteUser={handleRejectUser}
            />
        </div>
    );
};

export default ApprovalsPage;
