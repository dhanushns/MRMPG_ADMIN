import React, { useEffect, useState, useMemo } from "react";
import "./MembersPage.scss"
import { useLocation, useNavigate } from "react-router-dom";
import type { types } from "@/types";
import ui from "@/components/ui";
import layouts from "@/components/layouts";
import ApprovalManagementTab from "./ApprovalManagementTab";

const MembersPage = (): React.ReactElement => {

    const { search } = useLocation();
    const params = useMemo(() => new URLSearchParams(search), [search]);
    const enrollmentType = params.get('enrollment') || 'long_term';
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalMembers, setTotalMembers] = useState(0);
    const [activeTab, setActiveTab] = useState(enrollmentType);
    const [sortState, setSortState] = useState<{ key: string | null; direction: "asc" | "desc" }>({
        key: null,
        direction: "asc"
    });
    const [membersData, setMembersData] = useState<types["TableData"][]>([]);

    // Tab configuration with counts
    const tabsConfig = [
        {
            id: 'long_term',
            label: 'Long Term',
            count: 25,
        },
        {
            id: 'short_term', 
            label: 'Short Term',
            count: 15,
        },
        {
            id: 'approval_management',
            label: 'Approval Management',
            count: 8,
        }
    ];

    // Tab change handler
    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        setCurrentPage(1); // Reset to first page when changing tabs
        navigate(`/students?enrollment=${tabId}`, { replace: true });
    };

    const generateSampleData = (): types["TableData"][] => [
        { name: "Gokul", id: "ID001", work: "Student", location: "Erode", age: 20, roomNo: "1201", rent: "5000", status: "Paid", advance: "2000", aadharCard: "view" },
        { name: "Manoj", id: "ID002", work: "IT", location: "Salem", age: 22, roomNo: "1202", rent: "5500", status: "Pending", advance: "2500", aadharCard: "view" },
        { name: "Mani", id: "ID003", work: "Teacher", location: "Tirupur", age: 25, roomNo: "1203", rent: "6000", status: "Paid", advance: "3000", aadharCard: "view" },
        { name: "Kiruthik", id: "ID004", work: "Student", location: "Coimbatore", age: 19, roomNo: "1204", rent: "4500", status: "Pending", advance: "1500", aadharCard: "view" },
        { name: "Sandy", id: "ID005", work: "IT", location: "Erode", age: 24, roomNo: "1205", rent: "5200", status: "Paid", advance: "2200", aadharCard: "view" },
        { name: "Abishek", id: "ID006", work: "Student", location: "Salem", age: 21, roomNo: "1206", rent: "4800", status: "Pending", advance: "1800", aadharCard: "view" },
        { name: "Ajith", id: "ID007", work: "Teacher", location: "Tirupur", age: 28, roomNo: "1207", rent: "6500", status: "Paid", advance: "3500", aadharCard: "view" },
        { name: "Fizur", id: "ID008", work: "Student", location: "Coimbatore", age: 20, roomNo: "1208", rent: "4700", status: "Pending", advance: "1700", aadharCard: "view" },
        { name: "Boopesh", id: "ID009", work: "IT", location: "Erode", age: 26, roomNo: "1209", rent: "5800", status: "Paid", advance: "2800", aadharCard: "view" },
        { name: "Jaga", id: "ID010", work: "Student", location: "Salem", age: 19, roomNo: "1210", rent: "4300", status: "Pending", advance: "1300", aadharCard: "view" },
        { name: "Raja", id: "ID011", work: "Teacher", location: "Tirupur", age: 30, roomNo: "1211", rent: "7000", status: "Paid", advance: "4000", aadharCard: "view" },
        { name: "Kumar", id: "ID012", work: "Student", location: "Coimbatore", age: 22, roomNo: "1212", rent: "5100", status: "Pending", advance: "2100", aadharCard: "view" },
        { name: "Ravi", id: "ID013", work: "IT", location: "Erode", age: 25, roomNo: "1213", rent: "5400", status: "Paid", advance: "2400", aadharCard: "view" },
        { name: "Suresh", id: "ID014", work: "Student", location: "Salem", age: 18, roomNo: "1214", rent: "4200", status: "Pending", advance: "1200", aadharCard: "view" },
        { name: "Ramesh", id: "ID015", work: "Teacher", location: "Tirupur", age: 27, roomNo: "1215", rent: "6200", status: "Paid", advance: "3200", aadharCard: "view" },
        { name: "Vinoth", id: "ID016", work: "Student", location: "Coimbatore", age: 21, roomNo: "1216", rent: "4900", status: "Pending", advance: "1900", aadharCard: "view" },
        { name: "Prakash", id: "ID017", work: "IT", location: "Erode", age: 29, roomNo: "1217", rent: "6100", status: "Paid", advance: "3100", aadharCard: "view" },
        { name: "Dinesh", id: "ID018", work: "Student", location: "Salem", age: 20, roomNo: "1218", rent: "4600", status: "Pending", advance: "1600", aadharCard: "view" },
        { name: "Karthik", id: "ID019", work: "Teacher", location: "Tirupur", age: 31, roomNo: "1219", rent: "7200", status: "Paid", advance: "4200", aadharCard: "view" },
        { name: "Muthu", id: "ID020", work: "Student", location: "Coimbatore", age: 19, roomNo: "1220", rent: "4400", status: "Pending", advance: "1400", aadharCard: "view" },
        { name: "Senthil", id: "ID021", work: "IT", location: "Erode", age: 26, roomNo: "1221", rent: "5600", status: "Paid", advance: "2600", aadharCard: "view" },
        { name: "Bala", id: "ID022", work: "Student", location: "Salem", age: 23, roomNo: "1222", rent: "5300", status: "Pending", advance: "2300", aadharCard: "view" },
        { name: "Ganesh", id: "ID023", work: "Teacher", location: "Tirupur", age: 28, roomNo: "1223", rent: "6400", status: "Paid", advance: "3400", aadharCard: "view" },
        { name: "Vignesh", id: "ID024", work: "Student", location: "Coimbatore", age: 20, roomNo: "1224", rent: "4800", status: "Pending", advance: "1800", aadharCard: "view" },
        { name: "Arjun", id: "ID025", work: "IT", location: "Erode", age: 24, roomNo: "1225", rent: "5300", status: "Paid", advance: "2300", aadharCard: "view" },
        { name: "Harish", id: "ID026", work: "Student", location: "Salem", age: 21, roomNo: "1226", rent: "4700", status: "Pending", advance: "1700", aadharCard: "view" },
        { name: "Naveen", id: "ID027", work: "Teacher", location: "Tirupur", age: 29, roomNo: "1227", rent: "6800", status: "Paid", advance: "3800", aadharCard: "view" },
        { name: "Deepak", id: "ID028", work: "Student", location: "Coimbatore", age: 22, roomNo: "1228", rent: "5000", status: "Pending", advance: "2000", aadharCard: "view" },
        { name: "Sathish", id: "ID029", work: "IT", location: "Erode", age: 27, roomNo: "1229", rent: "5700", status: "Paid", advance: "2700", aadharCard: "view" },
        { name: "Moorthy", id: "ID030", work: "Student", location: "Salem", age: 18, roomNo: "1230", rent: "4100", status: "Pending", advance: "1100", aadharCard: "view" }
    ];

    const workOptions = [
        { value: "1", label: "Student" },
        { value: "2", label: "IT" },
        { value: "3", label: "Teacher" },
    ];

    const locationOptions = [
        { value: "Erode", label: "Erode" },
        { value: "Salem", label: "Salem" },
        { value: "Tirupur", label: "Tirupur" },
        { value: "Coimbatore", label: "Coimbatore" },
    ];

    const roomOptions = [
        { value: "1201", label: "Room 1201" },
        { value: "1202", label: "Room 1202" },
        { value: "1203", label: "Room 1203" },
        { value: "1204", label: "Room 1204" },
    ];

    const filterItems: types["FilterItemProps"][] = [
        { id: "search", type: "search" as const, placeholder: "Search by name or other criteria...", fullWidth: true, gridSpan: 3 },
        {
            id: "work",
            type: "select" as const,
            label: "Work",
            options: workOptions,
            variant: "custom" as const,
            searchable: true,
            placeholder: "Choose work type..."
        },
        {
            id: "multiLocation",
            type: "multiSelect" as const,
            label: "Select Location",
            options: locationOptions,
            variant: "dropdown" as const,
            placeholder: "Select multiple locations",
            searchable: true,
            showSelectAll: true,
            maxDisplayItems: 4
        },
        {
            id: "multiRoom",
            type: "multiSelect" as const,
            label: "Multiple Rooms",
            options: roomOptions,
            variant: "dropdown" as const,
            placeholder: "Select multiple rooms",
            searchable: true,
            showSelectAll: true,
            maxDisplayItems: 4
        },
        {
            id: "rentStatus",
            type: "select" as const,
            label: "Rent Status",
            options: [
                { value: "paid", label: "Paid" },
                { value: "pending", label: "Pending" },
            ],
        }
    ];


    // Table columns
    const tableColumns: types["TableColumn"][] = [
        {
            key: "name",
            label: "Name",
            sortable: true,
            align: "center",
            render: (value) => (
                <span className="student-name">{value as string}</span>
            ),
            width: "10%",
            style: {
                color: "var(--primary-color)"
            }

        },
        {
            key: "id",
            label: "ID",
            sortable: true,
            align: "center",
            width: "10%",
        },
        {
            key: "work",
            label: "Work",
            sortable: false,
            align: "center",
            width: "10%",
        },
        {
            key: "location",
            label: "Location",
            sortable: true,
            align: "center",
            width: "10%",
        },
        {
            key: "age",
            label: "Age",
            sortable: true,
            align: "center",
            width: "10%",
        },
        {
            key: "roomNo",
            label: "Room No",
            sortable: true,
            align: "center",
            width: "10%",
        },
        {
            key: "advance",
            label: "Advance",
            sortable: false,
            align: "center",
            width: "10%",
            render: (value) => (
                <>
                    <div className="amount" style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <ui.Icons name="indianRupee" size={16} />
                        <span className="student-rent">{value as string}</span>
                    </div>
                </>
            ),
        },
        {
            key: "rent",
            label: "Rent",
            sortable: false,
            align: "center",
            width: "10%",
            render: (value) => (
                <>
                    <div className="amount" style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <ui.Icons name="indianRupee" size={16} />
                        <span className="student-rent">{value as string}</span>
                    </div>
                </>
            ),
        },
        {
            key: "status",
            label: "Status",
            sortable: false,
            align: "center",
            width: "10%",
            render: (value: unknown) => (
                <span className={`status-badge status-badge--${(value as string).toLowerCase()}`}>
                    {value as string}
                </span>
            ),
        },
    ];

    const handleRowClick = (row: types["TableData"]) => {
        console.log("Row clicked:", row);
    };

    const handleSort = (key: string, direction: "asc" | "desc") => {
        console.log("Sort:", key, direction);
        setSortState({ key, direction });
    };

    const handleFilterApply = (filters: Record<string, unknown>) => {
        console.log("Filters applied:", filters);
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 500);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);

        // Calculate the start and end indices for the current page
        const pageSize = 10;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        // Get all sample data and slice for the current page
        const allData = generateSampleData();
        const pageData = allData.slice(startIndex, endIndex);

        setMembersData(pageData);
    };

    useEffect(() => {
        // Update active tab when URL changes
        const currentEnrollmentType = params.get('enrollment') || 'long_term';
        setActiveTab(currentEnrollmentType);
    }, [params]);

    useEffect(() => {
        // Initialize with sample data - load first page (0-9)
        const sampleData = generateSampleData();
        const pageSize = 10;
        const firstPageData = sampleData.slice(0, pageSize);

        setMembersData(firstPageData);
        setTotalMembers(sampleData.length);
        setTotalPages(Math.ceil(sampleData.length / pageSize));
    }, [activeTab]); // Reload data when active tab changes

    // Get content based on active tab
    const getTabContent = () => {
        switch (activeTab) {
            case 'long_term':
                return {
                    title: "Long Term Enrollment Details",
                    subText: "Manage and view detailed information about long-term enrollments",
                    pageInfo: `Total Members: ${totalMembers}`,
                    showTable: true
                };
            case 'short_term':
                return {
                    title: "Short Term Enrollment Details", 
                    subText: "Manage and view detailed information about short-term enrollments",
                    pageInfo: `Total Members: ${totalMembers}`,
                    showTable: true
                };
            case 'approval_management':
                return {
                    title: "Approval Management",
                    subText: "Manage and view information about member approval processes",
                    pageInfo: `Pending Approvals: 8`,
                    showTable: false 
                };
            default:
                return {
                    title: "Members",
                    subText: "Manage member information",
                    pageInfo: "",
                    showTable: true
                };
        }
    };

    const tabContent = getTabContent();

    return (
        <>
            <div className="members-page">
                <div className="members-page__header">
                    <layouts.HeaderLayout
                        title={tabContent.title}
                        subText={tabContent.subText}
                        pageInfo={tabContent.pageInfo}
                    />
                </div>

                <div className="members-page__tabs">
                    <ui.Tabs
                        tabs={tabsConfig}
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                        size="medium"
                        showCounts={true}
                        className="members-tabs"
                    />
                </div>

                <div className="members-page__content">
                    {tabContent.showTable ? (
                        <>
                            <div className="members-page__filter-section">
                                <layouts.FilterLayout
                                    filters={filterItems}
                                    layout="grid"
                                    columns={4}
                                    onApply={handleFilterApply}
                                    showApplyButton
                                    showResetButton
                                    collapsible
                                    className="members-filters"
                                />
                            </div>

                            <div className="members-page__table-section">
                                <layouts.TableLayout
                                    columns={tableColumns}
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
                                    emptyMessage="No students found"
                                    className="students-table"
                                />
                            </div>
                        </>
                    ) : (
                        <div className="members-page__approval-content">
                            <ApprovalManagementTab />
                        </div>
                    )}
                </div>
            </div>
        </>
    );

};

export default MembersPage;