import React, { useState, useEffect, useCallback } from "react";
import layouts from "@/components/layouts";
import ui from "@/components/ui";
import type { types } from "@/types";
import type {
    CardItem,
    RoomData,
    RoomsApiResponse,
    RoomsFilterResponse,
    RoomsStatsResponse,
} from '@/types/apiResponseTypes';
import "./RoomsPage.scss";
import { useNotification } from "@/hooks/useNotification";
import { ApiClient, AuthManager } from "@/utils";
import { useNavigate } from "react-router-dom";

interface FilterValues {
    search: string;
    pgId: string;
    occupancyStatus: string;
}

const RoomPage = (): React.ReactElement => {
    const [roomsData, setRoomsData] = useState<RoomData[]>([]);
    const [pgDetails, setPgDetails] = useState<{
        id: string;
        name: string;
        type: string;
        location: string;
    } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRooms, setTotalRooms] = useState(0);
    const [sortState, setSortState] = useState<{ key: string | null; direction: "asc" | "desc" }>({
        key: null,
        direction: "asc"
    });
    const [filters, setFilters] = useState<FilterValues>({
        search: '',
        pgId: '',
        occupancyStatus: ''
    });

    const [filterItems, setFilterItems] = useState<types["FilterItemProps"][]>([]);

    // Room statistics
    const [roomStats, setRoomStats] = useState<CardItem[]>([{ icon: "clock" }, { icon: "clock" }, { icon: "clock" }, { icon: "clock" }]);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null);

    //Loading states
    const [filterLoading, setFilterLoading] = useState(false);
    const [roomStatsLoading, setRoomStatsLoading] = useState(false);
    const [roomDataLoading, setRoomDataLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);

    const notification = useNotification();
    const navigate = useNavigate();

    useEffect(() => {
        if (AuthManager.isAuthenticated()) {
            fetchFilters();
            fetchRoomStats(filters);
            fetchRoomsData(currentPage, filters, sortState.key, sortState.direction);
        }
        else {
            navigate("/login");
        }
    }, []);

    // fetch rooms data
    const fetchRoomsData = useCallback(async (page: number, filterParams: FilterValues, sortKey: string | null = null, sortDirection: "asc" | "desc" = "asc") => {
        setRoomDataLoading(true);
        try {
            // Build query parameters
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                ...(filterParams.search && { search: filterParams.search }),
                ...(filterParams.occupancyStatus && { occupancyStatus: filterParams.occupancyStatus }),
                ...(sortKey && { sortBy: sortKey }),
                ...(sortKey && { sortOrder: sortDirection })
            });

            const apiResponse = await ApiClient.get(`/rooms/${filterParams.pgId}?${queryParams.toString()}`) as RoomsApiResponse;

            if (apiResponse.success && apiResponse.data) {
                setRoomsData(apiResponse.data.rooms || []);
                setPgDetails(apiResponse.data.pgDetails || null);
                setCurrentPage(apiResponse.data.pagination?.page || 1);
                setTotalPages(apiResponse.data.pagination?.totalPages || 1);
                setTotalRooms(apiResponse.data.pagination?.total || 0);
            } else {
                notification.showError(apiResponse.error || "Failed to fetch rooms data", apiResponse.message, 5000);
                setRoomsData([]);
            }
        } catch (err) {
            notification.showError("Failed to fetch rooms data", err instanceof Error ? err.message : "Check your internet connection and try again.", 5000);
            setRoomsData([]);
        } finally {
            setRoomDataLoading(false);
        }
    }, [notification]);

    //fetch filters
    const fetchFilters = useCallback(async () => {
        setFilterLoading(true);
        try {
            const apiResponse = await ApiClient.get("/rooms/filters") as RoomsFilterResponse;
            if (apiResponse.success && apiResponse.data) {
                setFilterItems(apiResponse.data.filters);
            }
            else {
                notification.showError(apiResponse.error || "Failed to fetch filters", apiResponse.message, 5000);
            }

        } catch (err) {
            notification.showError("Failed to fetch filters", err instanceof Error ? err.message : "Check your internet connection and try again.", 5000);
        }
        finally {
            setFilterLoading(false);
        }
    }, [notification]);

    const fetchRoomStats = useCallback(async (filters: FilterValues) => {
        setRoomStatsLoading(true);
        try {

            let endPoint;
            if (filters.pgId) {
                endPoint = `/rooms/${filters.pgId}/stats`;
            } else {
                endPoint = '/rooms/stats';
            }

            const apiResponse = await ApiClient.get(endPoint) as RoomsStatsResponse;

            if (apiResponse.success && apiResponse.data) {
                setRoomStats(apiResponse.data.cards || []);
            }
            else {
                notification.showError(apiResponse.error || "Failed to fetch room stats", apiResponse.message, 5000);
            }

        } catch (err) {
            notification.showError("Failed to fetch room stats", err instanceof Error ? err.message : "Check your internet connection and try again.", 5000);
        }
        finally {
            setRoomStatsLoading(false);
        }
    }, [notification]);

    const handleFilterChange = (newFilters: FilterValues) => {
        setFilters(newFilters);
        setCurrentPage(1);
        fetchRoomsData(1, newFilters, sortState.key, sortState.direction);
        fetchRoomStats(newFilters);
    };

    const handleFilterApply = (filters: Record<string, any>) => {
        const newFilters: FilterValues = {
            search: filters.search || '',
            pgId: filters.pgLocation || '',
            occupancyStatus: filters.occupancyStatus || ''
        };
        handleFilterChange(newFilters);
    };

    const handleFilterReset = () => {
        const resetFilters: FilterValues = { search: '', pgId: '', occupancyStatus: '' };
        handleFilterChange(resetFilters);
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
    
    const handleRowClick = (room: RoomData) => {
        console.log("Room details:", room);
        // You can implement a detailed view modal here
    };

    const confirmDeleteRoom = async (roomId: string) => {
        setSaveLoading(true);
        try {
            const apiResponse = await ApiClient.delete(`/rooms/${roomId}`) as { success: boolean; message?: string; error?: string };

            if (apiResponse.success) {
                const roomToDelete = selectedRoom;
                notification.showSuccess("Room deleted successfully", `Room ${roomToDelete?.roomNo} has been deleted.`, 5000);
                setIsEditModalOpen(false);
                setSelectedRoom(null);
                // Refresh data
                fetchRoomsData(currentPage, filters, sortState.key, sortState.direction);
                fetchRoomStats(filters);
            } else {
                notification.showError(apiResponse.error || "Failed to delete room", apiResponse.message, 5000);
            }
        } catch (err) {
            notification.showError("Failed to delete room", err instanceof Error ? err.message : "An error occurred while deleting the room.", 5000);
        } finally {
            setSaveLoading(false);
        }
    };

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
            render: (_value: unknown, row: unknown) => {
                const roomData = row as RoomData;
                return (
                    <span className={`occupancy occupancy--${roomData.status.replace('_', '-')}`}>
                        {roomData.currentOccupancy}/{roomData.capacity}
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
            render: (_value: unknown, row: unknown) => {
                const roomData = row as RoomData;
                return (
                    <span className={`status-badge status-badge--${roomData.statusValue.replace('_', '-')}`}>
                        {roomData.statusValue.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                );
            }
        },
        {
            key: "rentAmount",
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

                    <div className="room-page__filters">
                        <layouts.FilterLayout
                            filters={filterItems}
                            loading={filterLoading}
                            className="room-filters"
                            columns={3}
                            showResetButton
                            showApplyButton
                            onApply={handleFilterApply}
                            onReset={handleFilterReset}
                        />
                    </div>

                    <div className="room-page__cards">
                        <layouts.CardGrid
                            cards={roomStats}
                            loading={roomStatsLoading}
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

                    <div className="room-page__table">
                        <layouts.TableLayout
                            columns={tableColumns}
                            data={roomsData}
                            loading={roomDataLoading}
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

            {/* Room Modal */}
            {(isAddModalOpen || isEditModalOpen) && (
                <layouts.RoomModal
                    isOpen={isAddModalOpen || isEditModalOpen}
                    isEdit={isEditModalOpen}
                    roomData={isEditModalOpen ? selectedRoom : null}
                    pgDetails={pgDetails}
                    filterItems={filterItems}
                    onClose={() => {
                        setIsAddModalOpen(false);
                        setIsEditModalOpen(false);
                        setSelectedRoom(null);
                    }}
                    onSave={async (roomData) => {
                        setSaveLoading(true);
                        try {
                            let apiResponse;
                            if (isEditModalOpen && selectedRoom) {
                                // Update existing room
                                apiResponse = await ApiClient.put(`/rooms/${selectedRoom.id}`, roomData) as { success: boolean; message?: string; error?: string };
                                if (apiResponse.success) {
                                    notification.showSuccess("Room updated successfully", `Room ${roomData.roomNo} has been updated successfully.`, 5000);
                                } else {
                                    notification.showError(apiResponse.error || "Failed to update room", apiResponse.message, 5000);
                                    return;
                                }
                            } else {
                                // Create new room
                                apiResponse = await ApiClient.post(`/rooms/${roomData.pgLocation}`, roomData) as { success: boolean; message?: string; error?: string };
                                if (apiResponse.success) {
                                    notification.showSuccess("Room created successfully", `Room ${roomData.roomNo} has been created successfully.`, 5000);
                                } else {
                                    notification.showError(apiResponse.error || "Failed to create room", apiResponse.message, 5000);
                                    return;
                                }
                            }

                            // Close modal and refresh data
                            setIsAddModalOpen(false);
                            setIsEditModalOpen(false);
                            setSelectedRoom(null);

                            // Refresh all data
                            await Promise.all([
                                fetchRoomsData(currentPage, filters, sortState.key, sortState.direction),
                                fetchRoomStats(filters)
                            ]);
                        } catch (err) {
                            const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
                            notification.showError(
                                isEditModalOpen ? "Failed to update room" : "Failed to create room",
                                errorMessage,
                                5000
                            );
                        } finally {
                            setSaveLoading(false);
                        }
                    }}
                    onDelete={confirmDeleteRoom}
                    loading={saveLoading}
                />
            )}
        </>
    );
}

export default RoomPage;