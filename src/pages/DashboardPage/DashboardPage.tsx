import React, { useState, useEffect, useCallback } from 'react';
import layouts from "@layouts/index";
import type { types } from "@/types";
import './DashboardPage.scss';

interface MemberData {
    [key: string]: unknown;
    id: number;
    name: string;
    work: string;
    location: string;
    age: number;
    roomNo: string;
    rentAmount: number;
    status: "Paid" | "Pending";
    memberType: "long_term" | "short_term";
    profileImage?: string;
    phone?: string;
    email?: string;
    paymentApprovalStatus: "Approved" | "Pending" | "Rejected";
    documents?: {
        name: string;
        imageUrl: string;
    }[];
}

// type FilterValue = string | string[] | number | boolean | Date | { start: string; end: string } | null;

interface FilterValues {
    search: string;
    work: string;
    status: string;
    location: string;
    ageRange: { min: number; max: number };
}

const DashboardPage: React.FC = () => {
    const [membersData, setMembersData] = useState<MemberData[]>([]);
    const [loading, setLoading] = useState(false);
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
    // QuickView Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);

    const generateSampleData = (): MemberData[] => {
        const baseData = [
            { 
                id: 1, 
                name: "Rajesh Kumar", 
                work: "Software Engineer", 
                location: "Bangalore", 
                age: 28, 
                roomNo: "A-101", 
                rentAmount: 15000, 
                status: "Paid",
                memberType: "long_term",
                phone: "+91 9876543210",
                email: "rajesh.kumar@email.com",
                paymentApprovalStatus: "Approved",
                documents: [
                    { name: "Aadhar Card", imageUrl: "/src/assets/images/profile-temp.jpg" },
                    { name: "PAN Card", imageUrl: "/src/assets/images/profile-temp.jpg" }
                ]
            },
            { 
                id: 2, 
                name: "Priya Sharma", 
                work: "Data Analyst", 
                location: "Hyderabad", 
                age: 25, 
                roomNo: "B-204", 
                rentAmount: 12000, 
                status: "Pending",
                memberType: "short_term",
                phone: "+91 9876543211",
                email: "priya.sharma@email.com",
                paymentApprovalStatus: "Pending",
                documents: [
                    { name: "Aadhar Card", imageUrl: "/src/assets/images/profile-temp.jpg" }
                ]
            },
            { 
                id: 3, 
                name: "Amit Singh", 
                work: "Marketing Manager", 
                location: "Delhi", 
                age: 32, 
                roomNo: "C-302", 
                rentAmount: 18000, 
                status: "Paid",
                memberType: "long_term",
                phone: "+91 9876543212",
                email: "amit.singh@email.com",
                paymentApprovalStatus: "Approved",
                documents: [
                    { name: "Aadhar Card", imageUrl: "/src/assets/images/profile-temp.jpg" },
                    { name: "Driving License", imageUrl: "/src/assets/images/profile-temp.jpg" }
                ]
            }
        ] as MemberData[];

        // Generate additional simplified data
        const additionalData = [];
        for (let i = 4; i <= 30; i++) {
            additionalData.push({
                id: i,
                name: `Member ${i}`,
                work: ["Software Engineer", "Data Analyst", "Marketing Manager", "UI/UX Designer"][Math.floor(Math.random() * 4)],
                location: ["Bangalore", "Hyderabad", "Delhi", "Mumbai", "Chennai"][Math.floor(Math.random() * 5)],
                age: 22 + Math.floor(Math.random() * 20),
                roomNo: `${["A", "B", "C"][Math.floor(Math.random() * 3)]}-${100 + i}`,
                rentAmount: 10000 + Math.floor(Math.random() * 15000),
                status: Math.random() > 0.5 ? "Paid" : "Pending",
                memberType: Math.random() > 0.6 ? "long_term" : "short_term",
                phone: `+91 987654${String(3200 + i).padStart(4, '0')}`,
                email: `member${i}@email.com`,
                paymentApprovalStatus: ["Approved", "Pending", "Rejected"][Math.floor(Math.random() * 3)],
                documents: [
                    { name: "Aadhar Card", imageUrl: "/src/assets/images/profile-temp.jpg" }
                ]
            } as MemberData);
        }

        return [...baseData, ...additionalData];
    };

    const fetchMembersData = useCallback(async (page: number, filterParams: FilterValues, sortKey: string | null = null, sortDirection: "asc" | "desc" = "asc") => {
        setLoading(true);
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
        let allData = generateSampleData();
        
        if (filterParams.search) {
            allData = allData.filter(member => 
                member.name.toLowerCase().includes(filterParams.search.toLowerCase()) ||
                member.roomNo.toLowerCase().includes(filterParams.search.toLowerCase())
            );
        }
        
        if (filterParams.work) {
            allData = allData.filter(member => member.work === filterParams.work);
        }
        
        if (filterParams.status) {
            allData = allData.filter(member => member.status === filterParams.status);
        }
        
        if (filterParams.location) {
            allData = allData.filter(member => member.location === filterParams.location);
        }
        
        allData = allData.filter(member => 
            member.age >= filterParams.ageRange.min && 
            member.age <= filterParams.ageRange.max
        );
        
        // Apply sorting
        if (sortKey) {
            allData.sort((a, b) => {
                const aValue = a[sortKey as keyof MemberData];
                const bValue = b[sortKey as keyof MemberData];
                
                if (typeof aValue === "string" && typeof bValue === "string") {
                    const comparison = aValue.localeCompare(bValue);
                    return sortDirection === "asc" ? comparison : -comparison;
                }
                
                if (typeof aValue === "number" && typeof bValue === "number") {
                    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
                    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
                    return 0;
                }
                
                // Convert to string for comparison as fallback
                const aString = String(aValue || "");
                const bString = String(bValue || "");
                const comparison = aString.localeCompare(bString);
                return sortDirection === "asc" ? comparison : -comparison;
            });
        }
        
        const pageSize = 10;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedData = allData.slice(startIndex, endIndex);
        
        setMembersData(paginatedData);
        setTotalMembers(allData.length);
        setTotalPages(Math.ceil(allData.length / pageSize));
        setLoading(false);
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
        fetchMembersData(currentPage, filters, sortState.key, sortState.direction);
    }, [currentPage, fetchMembersData, filters, sortState]);

    // QuickView Modal Handlers
    const handleRowClick = (row: MemberData) => {
        setSelectedMember(row);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedMember(null);
    };

    const handleDeleteUser = (userId: number) => {
        console.log(`Delete user with ID: ${userId}`);
        // Here you would typically call an API to delete the user
        // For now, just close the modal
        handleCloseModal();
    };

    const sampleCards = [
        {
            title: "Total Members",
            value: "12,439",
            trend: "up" as const,
            percentage: 12,
            icon: "users" as const,
            color: "primary" as const,
            subtitle: "Compared to last month",
        },
        {
            title: "Rent Collection",
            value: "89,432",
            trend: "up" as const,
            percentage: 8,
            icon: "indianRupee" as const,
            color: "success" as const,
            subtitle: "August 2025",
        },
        {
            title: "New Members",
            value: "12",
            trend: "down" as const,
            percentage: -3,
            icon: "userMinus" as const,
            color: "error" as const,
            subtitle: "Lesser than previous month",
        },
        {
            title: "Pending Payment Approvals",
            value: "10",
            icon: "clock" as const,
            color: "warning" as const,
            subtitle: "Awaiting admin action",
            badge: {
                text: "Action Required",
                color: "error" as const
            },
            onClick: () => console.log("Open approvals dashboard")
        },
         {
            title: "Pending Registration Approvals",
            value: "4",
            icon: "file" as const,
            color: "warning" as const,
            subtitle: "Awaiting admin action",
            badge: {
                text: "Action Required",
                color: "error" as const
            },
            onClick: () => console.log("Open approvals dashboard")
        }
    ];

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
            key: "name",
            label: "Name",
            sortable: true,
            width: "15%",
            align: "left" as const,
        },
        {
            key: "work",
            label: "Work",
            sortable: true,
            width: "20%"
        },
        {
            key: "location",
            label: "Location",
            sortable: true,
            width: "12%"
        },
        {
            key: "age",
            label: "Age",
            sortable: true,
            width: "8%",
            align: "center" as const
        },
        {
            key: "roomNo",
            label: "Room No",
            sortable: true,
            width: "10%",
            align: "center" as const
        },
        {
            key: "rentAmount",
            label: "Rent Amount",
            sortable: true,
            width: "12%",
            align: "center" as const,
            render: (value: unknown) => `₹${(value as number).toLocaleString()}`
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
                        <layouts.CardGrid cards={sampleCards} loading={false} columns={3} gap='md' className='dashboard-cards' />
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
                            loading={loading}
                            pagination={{
                                currentPage: currentPage,
                                totalPages: totalPages,
                                totalItems: totalMembers,
                                onPageChange: handlePageChange
                            }}
                            pageSize={10}
                            currentSort={sortState}
                            onSort={handleSort}
                            onRowClick={(row) => handleRowClick(row as MemberData)}
                            emptyMessage="No members found"
                        />
                    </div>
                </div>

              
                <layouts.QuickViewModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    memberData={selectedMember ? {
                        id: selectedMember.id,
                        name: selectedMember.name,
                        roomNo: selectedMember.roomNo,
                        memberType: selectedMember.memberType,
                        profileImage: selectedMember.profileImage,
                        phone: selectedMember.phone,
                        email: selectedMember.email,
                        paymentStatus: selectedMember.status,
                        paymentApprovalStatus: selectedMember.paymentApprovalStatus,
                        documents: selectedMember.documents
                    } : null}
                    onDeleteUser={handleDeleteUser}
                />

            </div>
        </>
    )

}

export default DashboardPage;