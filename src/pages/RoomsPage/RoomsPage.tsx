import React, { useState, useEffect, useCallback } from "react";
import layouts from "@/components/layouts";
import ui from "@/components/ui";
import type { types } from "@/types";
import "./RoomsPage.scss";

interface RoomData {
    [key: string]: unknown;
    id: number;
    roomNo: string;
    capacity: number;
    occupied: number;
    status: "fully_occupied" | "partially_occupied" | "vacant";
    rent: number;
    members: {
        id: number;
        name: string;
        memberType: "long_term" | "short_term";
    }[];
    totalRooms: number;
    occupiedRooms: number;
    vacantRooms: number;
    partialOccupiedRooms: number;
}

interface FilterValues {
    search: string;
    status: string;
}

const RoomPage = (): React.ReactElement => {
    const [roomsData, setRoomsData] = useState<RoomData[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRooms, setTotalRooms] = useState(0);
    const [sortState, setSortState] = useState<{ key: string | null; direction: "asc" | "desc" }>({
        key: null,
        direction: "asc"
    });
    const [filters, setFilters] = useState<FilterValues>({
        search: '',
        status: ''
    });

    // Room statistics
    const [roomStats, setRoomStats] = useState({
        totalRooms: 0,
        occupiedRooms: 0,
        vacantRooms: 0,
        partialRooms: 0
    });

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null);
 

    const fetchRoomsData = useCallback(async (page: number, filterParams: FilterValues, sortKey: string | null = null, sortDirection: "asc" | "desc" = "asc") => {
        setLoading(true);

        // api call
        setTimeout(()=>{
            setLoading(false);
        },2000)
        
    }, []);

    const handleFilterChange = (newFilters: FilterValues) => {
        setFilters(newFilters);
        setCurrentPage(1);
        fetchRoomsData(1, newFilters, sortState.key, sortState.direction);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchRoomsData(page, filters, sortState.key, sortState.direction);
    };

    const handleSort = (key: string, direction: "asc" | "desc") => {
        setSortState({ key, direction });
        fetchRoomsData(currentPage, filters, key, direction);
    };

    // Room action handlers
    const handleAddRoom = () => {
        setIsAddModalOpen(true);
    };

    const handleEditRoom = (room: RoomData) => {
        setSelectedRoom(room);
        setIsEditModalOpen(true);
    };

    const handleDeleteRoom = (room: RoomData) => {
        setSelectedRoom(room);
        setIsDeleteModalOpen(true);
    };

    const handleRowClick = (room: RoomData) => {
        console.log("Room details:", room);
        // You can implement a detailed view modal here
    };

    const confirmDeleteRoom = () => {
        if (selectedRoom) {
            if (selectedRoom.occupied > 0) {
                alert(`Cannot delete room ${selectedRoom.roomNo}. Please remove all ${selectedRoom.occupied} members first.`);
                return;
            }
            
            console.log(`Deleting room: ${selectedRoom.roomNo}`);
            // Here you would typically call an API to delete the room
            setIsDeleteModalOpen(false);
            setSelectedRoom(null);
            // Refresh data
            fetchRoomsData(currentPage, filters, sortState.key, sortState.direction);
        }
    };

    useEffect(() => {
        fetchRoomsData(currentPage, filters, sortState.key, sortState.direction);
    }, [currentPage, fetchRoomsData, filters, sortState]);

    const roomCards = [
        {
            title: "Total Rooms",
            value: roomStats.totalRooms.toString(),
            icon: "home" as const,
            color: "primary" as const,
            subtitle: "All rooms in PG",
        },
        {
            title: "Occupied Rooms",
            value: roomStats.occupiedRooms.toString(),
            trend: "up" as const,
            percentage: Math.round((roomStats.occupiedRooms / roomStats.totalRooms) * 100),
            icon: "users" as const,
            color: "success" as const,
            subtitle: "Fully occupied",
        },
        {
            title: "Vacant Rooms",
            value: roomStats.vacantRooms.toString(),
            icon: "home" as const,
            color: "warning" as const,
            subtitle: "Available for booking",
        },
        {
            title: "Partial Rooms",
            value: roomStats.partialRooms.toString(),
            icon: "userMinus" as const,
            color: "info" as const,
            subtitle: "Partially occupied",
        }
    ];

    const filterItems: types["FilterItemProps"][] = [
        {
            id: "search",
            placeholder: "Search by room number or member name",
            type: "search",
            fullWidth: true,
            onChange: (_id: string, value: string | string[] | number | boolean | Date | { start: string; end: string } | null) => {
                const newFilters = { ...filters, search: value as string };
                handleFilterChange(newFilters);
            }
        },
        {
            id: "status",
            label: "Occupancy Status",
            placeholder: "Select status",
            type: "select",
            options: [
                { value: "", label: "All Status" },
                { value: "vacant", label: "Vacant" },
                { value: "partially_occupied", label: "Partially Occupied" },
                { value: "fully_occupied", label: "Fully Occupied" }
            ],
            onChange: (_id: string, value: string | string[] | number | boolean | Date | { start: string; end: string } | null) => {
                const newFilters = { ...filters, status: value as string };
                handleFilterChange(newFilters);
            }
        }
    ];

    const tableColumns: types["TableColumn"][] = [
        {
            key: "roomNo",
            label: "Room No",
            sortable: true,
            width: "15%",
            align: "center" as const,
            render: (value: unknown) => (
                <span className="room-number">{value as string}</span>
            )
        },
        {
            key: "occupied",
            label: "Occupied",
            sortable: true,
            width: "15%",
            align: "center" as const,
            render: (value: unknown, row: unknown) => {
                const roomData = row as RoomData;
                return (
                    <span className={`occupancy occupancy--${roomData.status.replace('_', '-')}`}>
                        {value as number}/{roomData.capacity}
                    </span>
                );
            }
        },
        {
            key: "status",
            label: "Status",
            sortable: false,
            width: "20%",
            align: "center" as const,
            render: (value: unknown) => (
                <span className={`status-badge status-badge--${(value as string).replace('_', '-')}`}>
                    {(value as string).replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </span>
            )
        },
        {
            key: "rent",
            label: "Rent",
            sortable: true,
            width: "20%",
            align: "center" as const,
            render: (value: unknown) => (
                <div className="amount">
                    <ui.Icons name="indianRupee" size={14} />
                    <span>{(value as number).toLocaleString()}</span>
                </div>
            )
        },
        {
            key: "actions",
            label: "Actions",
            sortable: false,
            width: "30%",
            align: "center" as const,
            render: (_value: unknown, row: unknown) => {
                const roomData = row as RoomData;
                return (
                    <div className="room-actions">
                        <ui.Button
                            variant="transparent"
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEditRoom(roomData);
                            }}
                            className="action-btn edit-btn"
                        >
                            <ui.Icons name="edit" size={14} />
                        </ui.Button>
                        <ui.Button
                            variant="transparent"
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteRoom(roomData);
                            }}
                            className="action-btn delete-btn"
                        >
                            <ui.Icons name="trash" size={14} />
                        </ui.Button>
                    </div>
                );
            }
        }
    ];

    return (
        <>
            <div className="room-page">
                <div className="room-page__header">
                    <layouts.HeaderLayout 
                        title="Room Management" 
                        subText="Manage and view detailed information of all PG rooms and their occupancy status"
                    />
                </div>

                <div className="room-page__content">
                    <div className="room-page__cards">
                        <layouts.CardGrid 
                            cards={roomCards} 
                            loading={loading} 
                            columns={4} 
                            gap='md' 
                            className='room-cards' 
                        />
                    </div>

                    <div className="room-page__actions">
                        <ui.Button
                            variant="primary"
                            size="medium"
                            onClick={handleAddRoom}
                            className="add-room-btn"
                            leftIcon={<ui.Icons name="plus" size={16} />}
                        >
                            Add New Room
                        </ui.Button>
                    </div>

                    <div className="room-page__filters">
                        <layouts.FilterLayout
                            filters={filterItems}
                            className="room-filters"
                            collapsible={true}
                            columns={2}
                            showResetButton
                        />
                    </div>

                    <div className="room-page__table">
                        <layouts.TableLayout
                            columns={tableColumns}
                            data={roomsData}
                            loading={loading}
                            pagination={{
                                currentPage: currentPage,
                                totalPages: totalPages,
                                totalItems: totalRooms,
                                onPageChange: handlePageChange
                            }}
                            pageSize={10}
                            currentSort={sortState}
                            onSort={handleSort}
                            onRowClick={(row) => handleRowClick(row as RoomData)}
                            emptyMessage="No rooms found"
                            className="rooms-table"
                        />
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && selectedRoom && (
                <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
                    <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Confirm Delete</h3>
                            <button onClick={() => setIsDeleteModalOpen(false)}>
                                <ui.Icons name="close" size={20} />
                            </button>
                        </div>
                        <div className="modal-content">
                            <p>Are you sure you want to delete room <strong>{selectedRoom.roomNo}</strong>?</p>
                            {selectedRoom.occupied > 0 && (
                                <div className="warning-message">
                                    <ui.Icons name="alertTriangle" size={16} />
                                    <span>This room has {selectedRoom.occupied} member(s). Please remove all members before deletion.</span>
                                </div>
                            )}
                        </div>
                        <div className="modal-actions">
                            <ui.Button
                                variant="secondary"
                                size="medium"
                                onClick={() => setIsDeleteModalOpen(false)}
                            >
                                Cancel
                            </ui.Button>
                            <ui.Button
                                variant="danger"
                                size="medium"
                                onClick={confirmDeleteRoom}
                                disabled={selectedRoom.occupied > 0}
                            >
                                Delete Room
                            </ui.Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Room Modal */}
            {(isAddModalOpen || isEditModalOpen) && (
                <AddEditRoomModal
                    isOpen={isAddModalOpen || isEditModalOpen}
                    isEdit={isEditModalOpen}
                    roomData={isEditModalOpen ? selectedRoom : null}
                    onClose={() => {
                        setIsAddModalOpen(false);
                        setIsEditModalOpen(false);
                        setSelectedRoom(null);
                    }}
                    onSave={(roomData) => {
                        console.log(isEditModalOpen ? 'Updating room:' : 'Creating room:', roomData);
                        // Here you would typically call an API to save/update the room
                        setIsAddModalOpen(false);
                        setIsEditModalOpen(false);
                        setSelectedRoom(null);
                        // Refresh data
                        fetchRoomsData(currentPage, filters, sortState.key, sortState.direction);
                    }}
                />
            )}
        </>
    );
}

// Add/Edit Room Modal Component
interface AddEditRoomModalProps {
    isOpen: boolean;
    isEdit: boolean;
    roomData: RoomData | null;
    onClose: () => void;
    onSave: (roomData: Partial<RoomData>) => void;
}

const AddEditRoomModal: React.FC<AddEditRoomModalProps> = ({
    isOpen,
    isEdit,
    roomData,
    onClose,
    onSave
}) => {
    const [formData, setFormData] = useState({
        roomNo: '',
        capacity: '',
        rent: '',
    });

    const [formErrors, setFormErrors] = useState({
        roomNo: '',
        capacity: '',
        rent: ''
    });

    // Initialize form data
    useEffect(() => {
        if (isOpen) {
            if (isEdit && roomData) {
                setFormData({
                    roomNo: roomData.roomNo,
                    capacity: roomData.capacity.toString(),
                    rent: roomData.rent.toString(),
                });
            } else {
                setFormData({
                    roomNo: '',
                    capacity: '',
                    rent: '',
                });
            }
            setFormErrors({ roomNo: '', capacity: '', rent: '' });
        }
    }, [isOpen, isEdit, roomData]);

    const handleInputChange = (field: string, value: string | string[]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Clear error when user starts typing
        if (formErrors[field as keyof typeof formErrors]) {
            setFormErrors(prev => ({ ...prev, [field]: '' }));
        }
    };


    const validateForm = () => {
        const errors = { roomNo: '', capacity: '', rent: '' };
        let isValid = true;

        if (!formData.roomNo.trim()) {
            errors.roomNo = 'Room number is required';
            isValid = false;
        }

        if (!formData.capacity.trim()) {
            errors.capacity = 'Capacity is required';
            isValid = false;
        } else if (isNaN(Number(formData.capacity)) || Number(formData.capacity) < 1) {
            errors.capacity = 'Please enter a valid capacity number';
            isValid = false;
        }

        if (!formData.rent.trim()) {
            errors.rent = 'Rent amount is required';
            isValid = false;
        } else if (isNaN(Number(formData.rent)) || Number(formData.rent) <= 0) {
            errors.rent = 'Please enter a valid rent amount';
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    const handleSave = () => {
        if (validateForm()) {
            const roomDataToSave = {
                ...formData,
                capacity: Number(formData.capacity),
                rent: Number(formData.rent)
            };
            onSave(roomDataToSave);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="room-form-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{isEdit ? 'Edit Room' : 'Add New Room'}</h3>
                    <button onClick={onClose}>
                        <ui.Icons name="close" size={20} />
                    </button>
                </div>
                
                <div className="modal-content">
                    <div className="form-grid">
                        <div className="form-group">
                            <ui.Label htmlFor="roomNo" required>Room Number</ui.Label>
                            <ui.Input
                                id="roomNo"
                                type="text"
                                value={formData.roomNo}
                                onChange={(e) => handleInputChange('roomNo', e.target.value)}
                                placeholder="Enter room number (e.g., 101, A-201)"
                                error={formErrors.roomNo}
                                disabled={isEdit} // Disable room number editing
                            />
                        </div>

                        <div className="form-group">
                            <ui.Label htmlFor="capacity" required>Capacity</ui.Label>
                            <ui.Input
                                id="capacity"
                                type="number"
                                value={formData.capacity}
                                onChange={(e) => handleInputChange('capacity', e.target.value)}
                                placeholder="Enter room capacity"
                                error={formErrors.capacity}
                                min="1"
                                max="6"
                            />
                        </div>

                        <div className="form-group">
                            <ui.Label htmlFor="rent" required>Monthly Rent (₹)</ui.Label>
                            <ui.Input
                                id="rent"
                                type="number"
                                value={formData.rent}
                                onChange={(e) => handleInputChange('rent', e.target.value)}
                                placeholder="Enter monthly rent"
                                error={formErrors.rent}
                                min="0"
                            />
                        </div>
                    </div>
                </div>

                <div className="modal-actions">
                    <ui.Button
                        variant="secondary"
                        size="medium"
                        onClick={onClose}
                    >
                        Cancel
                    </ui.Button>
                    <ui.Button
                        variant="primary"
                        size="medium"
                        onClick={handleSave}
                    >
                        {isEdit ? 'Update Room' : 'Create Room'}
                    </ui.Button>
                </div>
            </div>
        </div>
    );
};

export default RoomPage;