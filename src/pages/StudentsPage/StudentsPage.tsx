import React, { useEffect, useState } from "react";
import "./StudentsPage.scss"
import { useLocation, useNavigate } from "react-router-dom";
import type { types } from "@/types";
import ui from "@/components/ui";
import layouts from "@/components/layouts";

const StudentsPage = (): React.ReactElement => {

    const { search } = useLocation();
    const params = new URLSearchParams(search);
    const enrollmentType = params.get('enrollment') || null;
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

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

    const filters: types["FilterItemProps"][] = [
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

    // sample data
    const studentsData: types["TableData"][] = [
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
            render: (value) => (
                <>
                <span 
                    className="status-badge"
                    style={{
                        color: value === "Paid" ? "#22c55e" : "#ef4444",
                        fontWeight: "500"
                    }}
                >
                    {value as string}
                </span>
                </>
            ),
        },
        {
            key: "aadharCard",
            label: "Aadhar Card",
            align: "center",
            width: "10%",
            render: () => (
                <ui.Button
                    className="view-link"
                    onClick={() => handleViewScreenshot()}
                    variant="transparent"
                    size="small"
                    onHover={{
                        leftIcon: <ui.Icons name="eye" size={16} />
                    }}
                    style={{
                        color: "#e53e3e",
                        textDecoration: "underline",
                        fontWeight: "500"
                    }}
                >
                    View
                </ui.Button>
            ),
        },
        // {
        //     key: "action",
        //     label: "Action",
        //     align: "center",
        //     width: "100px",
        //     render: (_, row) => (
        //         <ui.Button
        //             className="approve-button"
        //             onClick={() => handleApprove(row.id as string)}
        //             variant="success"
        //             size="small"
        //             style={{
        //                 borderRadius: "5px"
        //             }}
        //         >
        //             Approve
        //         </ui.Button>
        //     ),
        // }
    ];

    // Event handlers
    const handleViewScreenshot = () => {
        console.log("View screenshot clicked");
    };

    // const handleApprove = (studentId: string) => {
    //     console.log("Approve clicked for student:", studentId);
    //     setLoading(true);
    //     setTimeout(() => {
    //         setLoading(false);
    //         alert(`Student ${studentId} approved successfully!`);
    //     }, 1000);
    // };

    const handleRowClick = (row: types["TableData"]) => {
        console.log("Row clicked:", row);
    };

    const handleSort = (key: string, direction: "asc" | "desc") => {
        console.log("Sort:", key, direction);
    };

    const handleFilterApply = (filters: Record<string, unknown>) => {
        console.log("Filters applied:", filters);
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 500);
    };

    useEffect(() => {
        if (!enrollmentType) {
            navigate("/students?enrollment=long_term");
        }
    }, [enrollmentType, navigate]);

    return (
        <div className="main-layout">

            <div className="__container">
                <div className="layout-header-section">
                    {enrollmentType === 'long_term' && <layouts.HeaderLayout title="Long Term Enrollment Details" subText="Manage and view detailed information about enrollments" />}
                    {enrollmentType === 'short_term' && <layouts.HeaderLayout title="Short Term Enrollment Details" subText="Manage and view detailed information about short term enrollments" />}
                    {enrollmentType === 'approval_management' && <layouts.HeaderLayout title="Approval Management" subText="Manage and view information about student approval processes" />}

                </div>

                <div className="students-filters-section">
                    <layouts.FilterLayout
                        filters={filters}
                        layout="grid"
                        columns={4}
                        onApply={handleFilterApply}
                        showApplyButton
                        showResetButton
                        collapsible
                    />
                </div>

                <div className="students-table-section">
                    <layouts.TableLayout
                        columns={tableColumns}
                        data={studentsData}
                        loading={loading}
                        pagination={true}
                        pageSize={10}
                        sortable={true}
                        onRowClick={handleRowClick}
                        onSort={handleSort}
                        emptyMessage="No students found"
                        className="students-table"
                    />
                </div>
            </div>

        </div>
    );

};

export default StudentsPage;