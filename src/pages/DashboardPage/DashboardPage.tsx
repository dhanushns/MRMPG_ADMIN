import React, { useState, useEffect, useCallback } from 'react';
import layouts from "@layouts/index";
import type { types } from "@/types";
import './DashboardPage.scss';
import { AuthManager, ApiClient, buildDashboardQueryParams } from '@/utils';
import { useNavigate } from 'react-router-dom';
import type {
    AdminResponse,
    TableMemberData,
    DashboardApiResponse,
    CardItem,
    DashboardStatsResponse
} from '@/types/apiResponseTypes';
import ui from '@/components/ui';
import { useNotification } from '@/hooks/useNotification';


interface FilterValues {
    search: string;
    work: string;
    status: string;
    location: string;
    ageRange: { min: number; max: number };
}

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const notification = useNotification();

    // Check token validity periodically
    useEffect(() => {
        const checkTokenValidity = () => {
            if (!AuthManager.isTokenValid()) {
                AuthManager.clearAuthData();
                navigate('/login');
            }
        };
        checkTokenValidity();
    }, [navigate]);

    // Loading states
    const [tableLoading, setTableLoading] = useState(false);
    const [cardLoading, setCardLoading] = useState(false);

    const [, setStaffData] = useState<AdminResponse | null>(null);
    const [membersData, setMembersData] = useState<TableMemberData[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalMembers, setTotalMembers] = useState(0);
    const [sortState, setSortState] = useState<{ key: string | null; direction: "asc" | "desc" }>({
        key: null,
        direction: "asc"
    });
    const [filters, setFilters] = useState<FilterValues>({
        search: '',
        work: '',
        status: '',
        location: '',
        ageRange: { min: 18, max: 65 }
    });

    const mockCards: CardItem[] = [
        {
            title: "Total Members",
            value: "0",
            trend: "up",
            percentage: 10,
            icon: "users",
            color: "primary",
            subtitle: "All registered members",
        },
        {
            title: "Total Members",
            value: "0",
            trend: "up",
            percentage: 10,
            icon: "users",
            color: "primary",
            subtitle: "All registered members",
        },
        {
            title: "Total Members",
            value: "0",
            trend: "up",
            percentage: 10,
            icon: "users",
            color: "primary",
            subtitle: "All registered members",
        },
        {
            title: "Total Members",
            value: "0",
            trend: "up",
            percentage: 10,
            icon: "users",
            color: "primary",
            subtitle: "All registered members",
        },
        {
            title: "Total Members",
            value: "0",
            trend: "up",
            percentage: 10,
            icon: "users",
            color: "primary",
            subtitle: "All registered members",
        },

    ]

    // Dashboard Stats Card
    const [cards, setCards] = useState<CardItem[]>(mockCards);
    const [lastUpdated, setLastUpdated] = useState<Date | string | undefined>(undefined);

    // QuickView Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<TableMemberData | null>(null);

    // Authentication check and staff data extraction
    useEffect(() => {
        const checkAuthentication = () => {
            if (!AuthManager.isAuthenticated()) {
                navigate('/login');
                return;
            }

            const extractedStaffData = AuthManager.getStaffData() as AdminResponse | null;
            if (extractedStaffData) {
                setStaffData(extractedStaffData);
            } else {
                AuthManager.clearAuthData();
                navigate('/login');
            }
        };

        checkAuthentication();
    }, [navigate]);

    const fetchMembersData = useCallback(async (page: number, filterParams: FilterValues, sortKey: string | null = null, sortDirection: "asc" | "desc" = "asc") => {
        setTableLoading(true);

        try {
            const queryString = buildDashboardQueryParams(
                page,
                {
                    search: filterParams.search,
                    work: filterParams.work,
                    status: filterParams.status,
                    location: filterParams.location,
                },
                sortKey,
                sortDirection,
                10
            );

            const endpoint = `/dashboard/members${queryString ? `?${queryString}` : ''}`;

            const apiResponse = await ApiClient.get(endpoint) as DashboardApiResponse;
            if (apiResponse.success && apiResponse.data) {
                setMembersData(apiResponse.data.tableData);
                setTotalPages(apiResponse.pagination?.totalPages || 1);
                setTotalMembers(apiResponse.pagination?.total || 0);
                setCurrentPage(apiResponse.pagination?.page || page);
            } else {
                setMembersData([]);
                setTotalPages(1);
                setTotalMembers(0);
                notification.showError('Failed to fetch members data', "Contact support", 5000);
            }

        } catch (error) {
            notification.showError('Error fetching members data', "Check your network connection", 5000);
            setMembersData([]);
            setTotalPages(1);
            setTotalMembers(0);
        } finally {
            setTableLoading(false);
        }
    }, []);

    // Fetch dashboard cards
    const fetchDashboardCards = useCallback(async () => {
        setCardLoading(true);

        try {
            const apiResponse = await ApiClient.get('/dashboard/stats') as DashboardStatsResponse;
            if (apiResponse.success && apiResponse.data) {
                setCards(apiResponse.data.cards);
                setLastUpdated(apiResponse.data.lastUpdated);
            } else {
                setCards([]);
                notification.showError('Failed to fetch dashboard cards', "Contact support", 5000);
            }

        } catch (error) {
            notification.showError('Error fetching dashboard cards', "Check your network connection", 5000);
            setCards([]);
        } finally {
            setCardLoading(false);
        }
    }, []);

    const refreshDashboardCards = useCallback(async () => {
        setCardLoading(true);

        try {

            const apiResponse = await ApiClient.post('/dashboard/stats/refresh', {}) as DashboardStatsResponse;
            if (apiResponse.success && apiResponse.data) {
                setCards(apiResponse.data.cards);
                setLastUpdated(apiResponse.data.lastUpdated);
            } else {
                setCards([]);
                notification.showError('Failed to fetch dashboard cards', "Contact support", 5000);
            }
        } catch (error) {
            notification.showError('Error refreshing dashboard cards', "Check your network connection", 5000);
            setCards([]);
        }
        finally {
            setCardLoading(false);
        }

    }, []);

    const handleFilterChange = (newFilters: FilterValues) => {
        setFilters(newFilters);
        setCurrentPage(1);
        fetchMembersData(1, newFilters, sortState.key, sortState.direction);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchMembersData(page, filters, sortState.key, sortState.direction);
    };

    const handleSort = (key: string, direction: "asc" | "desc") => {
        setSortState({ key, direction });
        fetchMembersData(currentPage, filters, key, direction);
    };

    useEffect(() => {
        // Only fetch data if user is authenticated
        if (AuthManager.isAuthenticated()) {
            fetchMembersData(currentPage, filters, sortState.key, sortState.direction);
            fetchDashboardCards();
        }
    }, [currentPage, fetchMembersData, filters, sortState]);

    // QuickView Modal Handlers
    const handleRowClick = (row: TableMemberData) => {
        setSelectedMember(row);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedMember(null);
    };

    const handleDeleteUser = (userId: string) => {
        console.log(`Delete user with ID: ${userId}`);
        handleCloseModal();
    };

    const filterItems: types["FilterItemProps"][] = [
        {
            id: "search",
            placeholder: "Search by name or room number",
            type: "search",
            fullWidth: true,
            onChange: (_id: string, value: string | string[] | number | boolean | Date | { start: string; end: string } | null) => {
                const newFilters = { ...filters, search: value as string };
                handleFilterChange(newFilters);
            }
        },
        {
            id: "work",
            label: "Work",
            placeholder: "Select work type",
            type: "select",
            options: [
                { value: "", label: "All Work Types" },
                { value: "Software Engineer", label: "Software Engineer" },
                { value: "Data Analyst", label: "Data Analyst" },
                { value: "Marketing Manager", label: "Marketing Manager" },
                { value: "UI/UX Designer", label: "UI/UX Designer" },
                { value: "DevOps Engineer", label: "DevOps Engineer" },
                { value: "Product Manager", label: "Product Manager" },
                { value: "Sales Executive", label: "Sales Executive" },
                { value: "HR Manager", label: "HR Manager" },
                { value: "Finance Analyst", label: "Finance Analyst" },
                { value: "Content Writer", label: "Content Writer" }
            ],
            onChange: (_id: string, value: string | string[] | number | boolean | Date | { start: string; end: string } | null) => {
                const newFilters = { ...filters, work: value as string };
                handleFilterChange(newFilters);
            }
        },
        {
            id: "status",
            label: "Payment Status",
            placeholder: "Select status",
            type: "select",
            options: [
                { value: "", label: "All Status" },
                { value: "Paid", label: "Paid" },
                { value: "Pending", label: "Pending" }
            ],
            onChange: (_id: string, value: string | string[] | number | boolean | Date | { start: string; end: string } | null) => {
                const newFilters = { ...filters, status: value as string };
                handleFilterChange(newFilters);
            }
        },
        {
            id: "location",
            label: "Location",
            placeholder: "Select location",
            type: "select",
            options: [
                { value: "", label: "All Locations" },
                { value: "Bangalore", label: "Bangalore" },
                { value: "Hyderabad", label: "Hyderabad" },
                { value: "Delhi", label: "Delhi" },
                { value: "Mumbai", label: "Mumbai" },
                { value: "Chennai", label: "Chennai" },
                { value: "Pune", label: "Pune" },
                { value: "Kochi", label: "Kochi" },
                { value: "Kolkata", label: "Kolkata" }
            ],
            onChange: (_id: string, value: string | string[] | number | boolean | Date | { start: string; end: string } | null) => {
                const newFilters = { ...filters, location: value as string };
                handleFilterChange(newFilters);
            }
        }
    ];

    const tableColumns: types["TableColumn"][] = [
        {
            key: "memberId",
            label: "Member ID",
            sortable: true,
            width: "10%",
            align: "center" as const,
        },
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
            key: "rentType",
            label: "Rent Type",
            sortable: true,
            width: "10%"
        },
        {
            key: "roomNo",
            label: "Room No",
            sortable: true,
            width: "10%",
            align: "center" as const
        },
        {
            key: "advanceAmount",
            label: "Advance",
            sortable: true,
            width: "10%"
        },
        {
            key: "rent",
            label: "Rent",
            sortable: true,
            width: "10%",
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
            key: "status",
            label: "Status",
            sortable: false,
            width: "10%",
            align: "center" as const,
            render: (value: unknown) => (
                <span className={`status-badge status-badge--${(value as string).toLowerCase()}`}>
                    {value as string}
                </span>
            )
        }
    ];

    return (
        <>
            <div className='dashboard-page'>
                <div className='dashboard-page__header'>
                    <layouts.HeaderLayout
                        title='Dashboard'
                        subText='Manage and view detailed information of PG members and trends'
                    />
                </div>

                <div className='dashboard-page__content'>
                    <div className='dashboard-page__cards'>
                        <layouts.CardGrid
                            cards={cards}
                            loading={cardLoading}
                            columns={3}
                            gap='md'
                            showRefresh
                            onRefresh={refreshDashboardCards}
                            lastUpdated={lastUpdated}
                            className='dashboard-cards'
                        />
                    </div>

                    <div className='dashboard-page__filter-section'>
                        <layouts.FilterLayout
                            filters={filterItems}
                            className="dashboard-filters"
                            collapsible={true}
                            columns={2}
                            showResetButton
                        />
                    </div>

                    <div className='dashboard-page__table-section'>
                        <layouts.TableLayout
                            columns={tableColumns}
                            data={membersData}
                            loading={tableLoading}
                            pagination={{
                                currentPage: currentPage,
                                totalPages: totalPages,
                                totalItems: totalMembers,
                                onPageChange: handlePageChange
                            }}
                            pageSize={10}
                            currentSort={sortState}
                            onSort={handleSort}
                            onRowClick={(row) => handleRowClick(row as TableMemberData)}
                            emptyMessage="No members found"
                        />
                    </div>
                </div>


                <layouts.QuickViewModal
                    isOpen={isModalOpen}
                    modelLayouts={
                        {
                            paymentInfo: true,
                            documents: true,
                            approvalForm: false
                        }
                    }
                    onClose={handleCloseModal}
                    memberData={selectedMember ? {
                        id: selectedMember.id,
                        memberId: selectedMember.memberId,
                        name: selectedMember.name,
                        roomNo: selectedMember.roomNo,
                        memberType: selectedMember.rentType === 'LONG_TERM' ? "long_term" : "short_term",
                        profileImage: selectedMember.photoUrl,
                        phone: selectedMember.phone,
                        email: selectedMember.email,
                        paymentStatus: selectedMember.status === 'APPROVED' ? "Paid" : "Pending",
                        paymentApprovalStatus: selectedMember.status as "Pending" | "Approved" | "Rejected",
                        age: selectedMember.age,
                        work: selectedMember.work,
                        location: selectedMember.location,
                        advanceAmount: selectedMember.advanceAmount,
                        rent: selectedMember.rent,
                        joinedOn: new Date(selectedMember.dateOfJoining).toLocaleDateString('en-IN'),
                        documents: [{
                            name: 'Aadhar Card',
                            url: selectedMember.aadharUrl
                        }]
                    } : null}
                    onDeleteUser={handleDeleteUser}
                />

            </div>
        </>
    )

}

export default DashboardPage;