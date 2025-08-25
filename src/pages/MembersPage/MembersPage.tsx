import React, {  useState, useMemo, useCallback } from "react";
import "./MembersPage.scss"
import { useLocation } from "react-router-dom";
import type { types } from "@/types";
import ui from "@/components/ui";
import layouts from "@/components/layouts";

const MembersPage = (): React.ReactElement => {

    const { search } = useLocation();
    const params = useMemo(() => new URLSearchParams(search), [search]);
    const enrollmentType = params.get('enrollment') || 'long_term';
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalMembers, setTotalMembers] = useState(0);
    const [sortState, setSortState] = useState<{ key: string | null; direction: "asc" | "desc" }>({
        key: null,
        direction: "asc"
    });
    const [membersData, setMembersData] = useState<types["TableData"][]>([]);
    const [currentFilters, setCurrentFilters] = useState<Record<string, unknown>>({});

    const getData = useCallback(async (page = 1, filters = {}, sort = sortState) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                type: enrollmentType,
                ...Object.entries(filters).reduce((acc, [key, value]) => {
                    if (value !== null && value !== undefined && value !== '') {
                        acc[key] = String(value);
                    }
                    return acc;
                }, {} as Record<string, string>)
            });

            if (sort.key) {
                queryParams.append('sortBy', sort.key);
                queryParams.append('sortOrder', sort.direction);
            }

            console.log("Data fetched");

            const response = await fetch(`/api/members?${queryParams}`);  // api call
            const data = await response.json();

            setMembersData(data.members || []);
            setTotalMembers(data.total || 0);
            setTotalPages(data.totalPages || 1);
            setCurrentPage(page);
        } catch (error) {
            console.error('Error fetching members data:', error);
            setMembersData([]);
            setTotalMembers(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [enrollmentType, sortState]);


    const getHeader = () => {
        switch (enrollmentType) {
            case 'long_term':
                return {
                    title: "Long Term Enrollment Details",
                    subText: "Manage and view detailed information about long-term enrollments",
                    pageInfo: `Total Members: ${totalMembers}`
                };
            case 'short_term':
                return {
                    title: "Short Term Enrollment Details",
                    subText: "Manage and view detailed information about short-term enrollments",
                    pageInfo: `Total Members: ${totalMembers}`
                };
            default:
                return {
                    title: "Long Term Enrollment Details",
                    subText: "Manage and view detailed information about long-term enrollments",
                    pageInfo: `Total Members: ${totalMembers}`
                };
        }
    };

 
    const getFilters = useCallback((): types["FilterItemProps"][] => {
        const baseFilters: types["FilterItemProps"][] = [
            {
                id: "search",
                type: "search" as const,
                placeholder: "Search by name, ID, or room number...",
                fullWidth: true,
                gridSpan: 4
            }
        ];

        if (enrollmentType === 'long_term') {
            return [
                ...baseFilters,
                {
                    id: "work",
                    type: "select" as const,
                    label: "Work Type",
                    options: [
                        { value: "student", label: "Student" },
                        { value: "employee", label: "Employee" },
                        { value: "other", label: "Other" }  
                    ],
                    placeholder: "Select work type..."
                },
                {
                    id: "location",
                    type: "multiSelect" as const,
                    label: "Location",
                    options: [
                        { value: "erode", label: "Erode" },
                        { value: "salem", label: "Salem" },
                        { value: "tirupur", label: "Tirupur" },
                        { value: "coimbatore", label: "Coimbatore" }
                    ],
                    variant: "dropdown" as const,
                    placeholder: "Select locations",
                    searchable: true,
                    showSelectAll: true
                },
                {
                    id: "paymentStatus",
                    type: "select" as const,
                    label: "Payment Status",
                    options: [
                        { value: "paid", label: "Paid" },
                        { value: "pending", label: "Pending" },
                        { value: "overdue", label: "Overdue" }
                    ],
                    placeholder: "Select payment status..."
                }
            ];
        } else {
            return [
                ...baseFilters,
                {
                    id: "checkInDate",
                    type: "date" as const,
                    label: "Check-in Date",
                    placeholder: "Select check-in date"
                },
                {
                    id: "paymentStatus",
                    type: "select" as const,
                    label: "Payment Status",
                    options: [
                        { value: "paid", label: "Paid" },
                        { value: "pending", label: "Pending" },
                        { value: "overdue", label: "Overdue" }
                    ],  
                    placeholder: "Select payment status..."
                }
            ];
        }
    }, [enrollmentType]);


    const getColumns = useCallback((): types["TableColumn"][] => {
        const baseColumns: types["TableColumn"][] = [
            {
                key: "name",
                label: "Name",
                sortable: true,
                align: "left",
                render: (value) => (
                    <span className="student-name">{value as string}</span>
                ),
                width: "15%",
                style: { color: "var(--primary-color)" }
            },
            {
                key: "id",
                label: "Member ID",
                sortable: true,
                align: "center",
                width: "12%",
            },
            {
                key: "roomNo",
                label: "Room No",
                sortable: true,
                align: "center",
                width: "10%",
            }
        ];

        if (enrollmentType === 'long_term') {
            return [
                ...baseColumns,
                {
                    key: "work",
                    label: "Work",
                    sortable: true,
                    align: "center",
                    width: "12%",
                },
                {
                    key: "location",
                    label: "Location",
                    sortable: true,
                    align: "center",
                    width: "12%",
                },
                {
                    key: "rent",
                    label: "Rent",
                    sortable: true,
                    align: "center",
                    width: "12%",
                    render: (value) => (
                        <div className="amount">
                            <ui.Icons name="indianRupee" size={14} />
                            <span>{value as string}</span>
                        </div>
                    ),
                },
                {
                    key: "advance",
                    label: "Advance",
                    sortable: false,
                    align: "center",
                    width: "12%",
                    render: (value) => (
                        <div className="amount">
                            <ui.Icons name="indianRupee" size={14} />
                            <span>{value as string}</span>
                        </div>
                    ),
                },
                {
                    key: "payment",
                    label: "Payment",
                    sortable: false,
                    align: "center",
                    width: "15%",
                    render: (value: unknown) => (
                        <span className={`status-badge status-badge--${(value as string).toLowerCase()}`}>
                            {value as string}
                        </span>
                    ),
                }
            ];
        } else {
            return [
                ...baseColumns,
                {
                    key: "work",
                    label: "Work",
                    sortable: true,
                    align: "center",
                    width: "12%",
                },
                {
                    key: "location",
                    label: "Location",
                    sortable: true,
                    align: "center",
                    width: "12%",
                },
                {
                    key: "dailyRate",
                    label: "Daily Rate",
                    sortable: true,
                    align: "center",
                    width: "12%",
                    render: (value) => (
                        <div className="amount">
                            <ui.Icons name="indianRupee" size={14} />
                            <span>{value as string}</span>
                        </div>
                    ),
                },
                {
                    key: "payment",
                    label: "payment",
                    sortable: false,
                    align: "center",
                    width: "15%",
                    render: (value: unknown) => (
                        <span className={`status-badge status-badge--${(value as string).toLowerCase()}`}>
                            {value as string}
                        </span>
                    ),
                }
            ];
        }
    }, [enrollmentType]);

    const handleRowClick = (row: types["TableData"]) => {
        console.log("Row clicked:", row); // implement the QuickViewModel and set user details props.
    };

    const handleSort = (key: string, direction: "asc" | "desc") => {
        setSortState({ key, direction });
        getData(currentPage, currentFilters, { key, direction });
    };

    const handleFilterApply = async (filters: Record<string, unknown>) => {
        setLoading(true);
        setCurrentFilters(filters);
        try {
            await getData(1, filters); // Reset to page 1 when applying filters
        } finally {
            setLoading(false);
        }
    };

    const handleFilterReset = async () => {
        setLoading(true);
        setCurrentFilters({});
        try {
            await getData(1, {}); // Reset to page 1 with no filters
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        getData(page, currentFilters);
    };

    const headerConfig = getHeader();
    const filtersConfig = getFilters();
    const columnsConfig = getColumns();
    // getData(currentPage, currentFilters, sortState);

    return (
        <>
            <div className="members-page">
                <div className="members-page__header">
                    <layouts.HeaderLayout
                        title={headerConfig.title}
                        subText={headerConfig.subText}
                        pageInfo={headerConfig.pageInfo}
                    />
                </div>

                <div className="members-page__content">
                    <div className="members-page__filter-section">
                        <layouts.FilterLayout
                            filters={filtersConfig}
                            layout="grid"
                            columns={4}
                            onApply={handleFilterApply}
                            onReset={handleFilterReset}
                            showApplyButton
                            showResetButton
                            collapsible
                            className="members-filters"
                        />
                    </div>

                    <div className="members-page__table-section">
                        <layouts.TableLayout
                            columns={columnsConfig}
                            data={membersData}
                            loading={loading}
                            pagination={{
                                currentPage: currentPage,
                                totalPages: totalPages,
                                totalItems: totalMembers,
                                onPageChange: handlePageChange
                            }}
                            pageSize={10}
                            currentSort={sortState}
                            sortable={true}
                            onRowClick={handleRowClick}
                            onSort={handleSort}
                            emptyMessage={`No ${enrollmentType.replace('_', '-')} members found`}
                            className="students-table"
                        />
                    </div>
                </div>
            </div>
        </>
    );

};

export default MembersPage;