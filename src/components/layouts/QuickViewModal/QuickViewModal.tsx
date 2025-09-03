import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./QuickViewModal.scss";
import ui from "@/components/ui";
import type { QuickViewMemberData } from "@/types/apiResponseTypes";
import { ApiClient } from "@/utils";
import { useNotification } from "@/hooks/useNotification";

// Type for room data from API
interface RoomData {
    roomNo: number;
    rent: number;
}

// Type for room API response
interface RoomApiResponse {
    success: boolean;
    message?: string;
    data?: {
        pgId: string;
        rooms: RoomData[];
    }
}

interface QuickViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    modelLayouts: {
        paymentInfo?: boolean,
        documents?: boolean,
        approvalForm?: boolean,
    };
    memberData: QuickViewMemberData | null;
    onDeleteUser?: (userId: string) => void;
    onApproveUser?: (userId: string, pgId: string, formData: { roomNo: string; rentAmount: string; advanceAmount?: string; pgLocation: string; dateOfJoining?: string }) => void;
    onRejectUser?: (userId: string) => void;
    approveLoading?: boolean;
    rejectLoading?: boolean;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({
    isOpen,
    onClose,
    memberData,
    onDeleteUser,
    onApproveUser,
    onRejectUser,
    modelLayouts,
    approveLoading = false,
    rejectLoading = false
}) => {
    // Document viewer state
    const [documentViewer, setDocumentViewer] = useState<{
        isOpen: boolean;
        imageUrl: string;
        title: string;
    }>({
        isOpen: false,
        imageUrl: '',
        title: ''
    });

    // Form state for approval
    const [formData, setFormData] = useState({
        roomNo: '',
        rentAmount: '',
        advanceAmount: '',
        pgLocation: memberData?.pgLocation || '',
        dateOfJoining: ''
    });

    // Form validation errors
    const [formErrors, setFormErrors] = useState({
        roomNo: '',
        rentAmount: '',
        pgLocation: memberData?.pgLocation || ''
    });

    // Room data and loading state
    const [roomData, setRoomData] = useState<RoomData[]>([]);
    const [roomsLoading, setRoomsLoading] = useState(false);

    // Store the pgid
    const [pgId, setPgId] = useState<string>('');

    // To handle the notification
    const notification = useNotification();

    // Navigation hook
    const navigate = useNavigate();

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen && modelLayouts.approvalForm) {
            setFormData({
                roomNo: memberData?.roomNo || '',
                rentAmount: '',
                advanceAmount: '',
                pgLocation: '',
                dateOfJoining: ''
            });
            setFormErrors({
                roomNo: '',
                rentAmount: '',
                pgLocation: ''
            });
            // Clear room data when modal opens
            setRoomData([]);
            setRoomsLoading(false);
        }
    }, [isOpen, modelLayouts.approvalForm, memberData?.roomNo]);
    // Lock/unlock body scroll when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            // Store the original overflow style
            const originalStyle = window.getComputedStyle(document.body).overflow;

            // Lock the scroll
            document.body.style.overflow = 'hidden';

            // Cleanup function to restore scroll when modal closes
            return () => {
                document.body.style.overflow = originalStyle;
            };
        }
    }, [isOpen]);

    // Function to fetch room data based on PG location
    const fetchRoomData = async (pgLocation: string) => {
        if (!pgLocation.trim()) {
            setRoomData([]);
            return;
        }

        setRoomsLoading(true);
        try {
            const response = await ApiClient.get(`/rooms/location/${pgLocation}`) as RoomApiResponse;
            
            if (response && response.success && response.data) {
                setRoomData(response.data.rooms);
                setPgId(response.data.pgId);
            } else {
                setRoomData([]);
                notification.showError(response.message || 'Failed to fetch room data');
            }
        } catch (error) {
            notification.showError("Failed to fetch room data", error instanceof Error ? error.message : "Contact support", 5000);
            setRoomData([]);
        } finally {
            setRoomsLoading(false);
        }
    };

    // Form handling functions
    const handleFormChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (formErrors[field as keyof typeof formErrors]) {
            setFormErrors(prev => ({ ...prev, [field]: '' }));
        }

        if (field === 'pgLocation') {
            setFormData(prev => ({
                ...prev,
                [field]: value,
                roomNo: '',
                rentAmount: ''
            }));
            
            // Fetch room data for the new PG location
            fetchRoomData(value);
        }

        // Special handling for room selection
        if (field === 'roomNo' && value) {
            const selectedRoom = roomData.find(room => room.roomNo.toString() === value);
            if (selectedRoom) {
                // Auto-fill rent amount based on selected room
                setFormData(prev => ({
                    ...prev,
                    roomNo: value,
                    rentAmount: selectedRoom.rent.toString()
                }));
            }
        }
    };

    const validateForm = () => {
        const errors = { roomNo: '', rentAmount: '', pgLocation: '' };
        let isValid = true;

        if (!formData.roomNo.trim()) {
            errors.roomNo = 'Room number is required';
            isValid = false;
        }

        if (!formData.rentAmount.trim()) {
            errors.rentAmount = 'Rent amount is required';
            isValid = false;
        } else if (isNaN(Number(formData.rentAmount)) || Number(formData.rentAmount) <= 0) {
            errors.rentAmount = 'Please enter a valid rent amount';
            isValid = false;
        }

        if (!formData.pgLocation.trim()) {
            errors.pgLocation = 'PG location is required';
            isValid = false;
        }

        if (formData.advanceAmount && (isNaN(Number(formData.advanceAmount)) || Number(formData.advanceAmount) < 0)) {
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    const handleApproveUser = () => {
        if (validateForm() && onApproveUser && memberData?.id) {
            onApproveUser(memberData.id.toString(), pgId, {
                roomNo: formData.roomNo,
                rentAmount: formData.rentAmount,
                advanceAmount: formData.advanceAmount || undefined,
                pgLocation: formData.pgLocation,
                dateOfJoining: formData.dateOfJoining || undefined
            });
            // Don't close modal here - parent will close it after successful API call
        }
    };

    const handleRejectUser = () => {
        if (onRejectUser && memberData?.id) {
            onRejectUser(memberData.id.toString());
            // Don't close modal here - parent will close it after successful API call
        }
    };

    if (!isOpen || !memberData) return null;

    const handleDeleteUser = () => {
        if (onDeleteUser && memberData.id) {
            onDeleteUser(memberData.id.toString());
            onClose();
        }
    };

    const handleDocumentView = (imageUrl: string, documentName?: string) => {
        setDocumentViewer({
            isOpen: true,
            imageUrl,
            title: documentName || 'Document'
        });
    };

    const handleCloseDocumentViewer = () => {
        setDocumentViewer({
            isOpen: false,
            imageUrl: '',
            title: ''
        });
    };

    return (
        <div className="quick-view-modal-overlay" onClick={() => {
            // Prevent closing modal when loading
            if (!approveLoading && !rejectLoading) {
                onClose();
            }
        }}>
            <div className="quick-view-modal" onClick={(e) => e.stopPropagation()}>
                {/* Loading Overlay */}
                {(approveLoading || rejectLoading) && (
                    <div className="modal-loading-overlay">
                        <div className="loading-content">
                            <ui.Icons name="loader" size={24} className="animate-spin" />
                            <span className="loading-text">
                                {approveLoading ? 'Approving member...' : 'Rejecting member...'}
                            </span>
                        </div>
                    </div>
                )}
                
                {/* Combined Header and Banner Layout */}
                <div className={`quick-view-header-banner header-banner--${memberData.rentType}`}>
                    {/* Header Section */}
                    <div className="header-content">
                        <div className="member-type-badge">
                            <span className="type-badge">
                                {memberData.rentType === 'LONG_TERM' ? 'Long-Term Member' : 'Short-Term Member'}
                            </span>
                        </div>
                        <button 
                            className="close-button" 
                            onClick={() => {
                                // Prevent closing modal when loading
                                if (!approveLoading && !rejectLoading) {
                                    onClose();
                                }
                            }}
                            disabled={approveLoading || rejectLoading}
                        >
                            <ui.Icons name="close" size={20} strokeWidth={2} />
                        </button>
                    </div>

                    {/* Banner Section */}
                    <div className="banner-content">
                        <div className="banner-profile">
                            <div className="profile-image">
                                {memberData.profileImage ? (
                                    <ui.AuthenticatedImage
                                        src={memberData.profileImage}
                                        alt={memberData.name}
                                    />
                                ) : (
                                    <div className="profile-placeholder">
                                        <ui.Icons name="user" size={32} strokeWidth={2} />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="banner-info">
                            <h2 className="member-name">{memberData.name}</h2>
                            <p className="member-id">ID: {memberData.memberId ? memberData.memberId : 'N/A'}</p>
                            <p className="member-room">Room: {memberData.roomNo ? memberData.roomNo : 'N/A'}</p>
                        </div>
                        <div className="banner-actions">
                            <ui.Button
                                variant="transparent"
                                size="small"
                                onClick={() => navigate(`/members/${memberData.id}`)}
                                className="view-profile-btn"
                                leftIcon={<ui.Icons name="user" size={16} />}
                            >
                                View Profile
                            </ui.Button>
                        </div>
                    </div>
                </div>

                {/* Info Layout */}
                <div className={`quick-view-content content--${memberData.rentType}`}>
                    {/* Contact Info */}
                    <div className="info-section">
                        <h3 className={`section-title section-title--${memberData.rentType}`}>
                            <ui.Icons name="phone" size={16} />
                            Contact Information
                        </h3>
                        <div className="info-grid">
                            <div className={`info-item info-item--${memberData.rentType}`}>
                                <span className="info-label">Phone Number:</span>
                                <span className="info-value">{memberData.phone || 'Not provided'}</span>
                            </div>
                            <div className={`info-item info-item--${memberData.rentType}`}>
                                <span className="info-label">Email ID:</span>
                                <span className="info-value">{memberData.email || 'Not provided'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    {modelLayouts.paymentInfo && (
                        <div className="info-section">
                            <h3 className={`section-title section-title--${memberData.rentType}`}>
                                <ui.Icons name="creditCard" size={16} />
                                Payment Information
                            </h3>
                            <div className="info-grid">
                                <div className={`info-item info-item--${memberData.rentType}`}>
                                    <span className="info-label">Payment Status:</span>
                                    <span className={`status-badge status-badge--${memberData.paymentStatus.toLowerCase()}`}>
                                        {memberData.paymentStatus}
                                    </span>
                                </div>
                                <div className={`info-item info-item--${memberData.rentType}`}>
                                    <span className="info-label">Approval Status:</span>
                                    <span className={`approval-badge approval-badge--${memberData.paymentApprovalStatus?.toLowerCase() || 'pending'}`}>
                                        {memberData.paymentApprovalStatus || 'Pending'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Documents */}
                    <div className="info-section">
                        <h3 className={`section-title section-title--${memberData.rentType}`}>
                            <ui.Icons name="fileText" size={16} />
                            Documents
                        </h3>
                        <div className="documents-list">
                            {memberData.documents && memberData.documents.length > 0 ? (
                                memberData.documents.map((document, index) => (
                                    <div key={index} className={`document-item document-item--${memberData.rentType}`}>
                                        <span className="document-name">{document.name}</span>
                                        <ui.Button
                                            variant="transparent"
                                            size="small"
                                            onClick={() => handleDocumentView(document.url, document.name)}
                                            className="view-document-btn"
                                        >
                                            <ui.Icons name="eye" size={14} />
                                            View
                                        </ui.Button>
                                    </div>
                                ))
                            ) : (
                                <p className="no-documents">No documents available</p>
                            )}
                        </div>
                    </div>

                    {/* Approval Form */}
                    {modelLayouts.approvalForm && (
                        <div className="info-section">
                            <h3 className={`section-title section-title--${memberData.rentType}`}>
                                <ui.Icons name="edit" size={16} />
                                Approval Details
                            </h3>
                            <div className={`approval-form approval-form--${memberData.rentType}`}>
                                <div className="form-grid">

                                    <div className="form-group">
                                        <ui.Label htmlFor="pgLocation" required>PG Location</ui.Label>
                                        <ui.Select
                                            id="pgLocation"
                                            variant="custom"
                                            value={formData.pgLocation}
                                            searchable
                                            defaultValue={formData.pgLocation}
                                            onChange={(value) => handleFormChange('pgLocation', value)}
                                            placeholder="Select PG location"
                                            className={`form-input form-input--${memberData.rentType}`}
                                            options={[
                                                { value: '', label: 'Select PG location' },
                                                { value: 'Chennai', label: 'Chennai' },
                                                { value: 'Erode', label: 'Erode' },
                                                { value: 'Guindy', label: 'Guindy' },
                                                { value: 'Salem', label: 'Salem' },
                                            ]}
                                        />
                                        {formErrors.pgLocation && (
                                            <span className="error-message">{formErrors.pgLocation}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <ui.Label htmlFor="roomNo" required>Room Number</ui.Label>
                                        <ui.Select
                                            id="roomNo"
                                            variant="custom"
                                            value={formData.roomNo}
                                            onChange={(value) => handleFormChange('roomNo', value)}
                                            placeholder={roomsLoading ? "Loading rooms..." : !formData.pgLocation ? "Select PG location first" : "Select room number"}
                                            className={`form-input form-input--${memberData.rentType}`}
                                            disabled={roomsLoading || !formData.pgLocation || roomData.length === 0}
                                            options={[
                                                { value: '', label: roomsLoading ? 'Loading rooms...' : !formData.pgLocation ? 'Select PG location first' : 'Select room number' },
                                                ...roomData.map(room => ({
                                                    value: room.roomNo.toString(),
                                                    label: `Room ${room.roomNo}`
                                                }))
                                            ]}
                                        />
                                        {formErrors.roomNo && (
                                            <span className="error-message">{formErrors.roomNo}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <ui.Label htmlFor="rentAmount" required>Rent Amount</ui.Label>
                                        <ui.Input
                                            id="rentAmount"
                                            type="number"
                                            value={formData.rentAmount}
                                            onChange={(e) => handleFormChange('rentAmount', e.target.value)}
                                            placeholder="Enter rent amount"
                                            error={formErrors.rentAmount}
                                            className={`form-input form-input--${memberData.rentType}`}
                                            readOnly={!!formData.roomNo && roomData.some(room => room.roomNo.toString() === formData.roomNo)}
                                        />
                                        {formData.roomNo && roomData.some(room => room.roomNo.toString() === formData.roomNo) && (
                                            <small className="auto-filled-note">
                                                Auto-filled based on selected room
                                            </small>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <ui.Label htmlFor="advanceAmount">Advance Amount</ui.Label>
                                        <ui.Input
                                            id="advanceAmount"
                                            type="number"
                                            value={formData.advanceAmount}
                                            onChange={(e) => handleFormChange('advanceAmount', e.target.value)}
                                            placeholder="Enter advance amount (optional)"
                                            className={`form-input form-input--${memberData.rentType}`}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <ui.Label htmlFor="dateOfJoining">Date Of Joining</ui.Label>
                                        <ui.DateInput
                                            id="dateOfJoining"
                                            value={formData.dateOfJoining}
                                            onChange={(value) => handleFormChange('dateOfJoining', value)}
                                            className={`form-input form-input--${memberData.rentType}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Layout - Actions */}
                <div className="quick-view-footer">
                    <div className="footer-actions">
                        {modelLayouts.approvalForm ? (
                            <div className="approve-user-actions">
                                <ui.Button
                                    variant="danger"
                                    size="medium"
                                    onClick={handleRejectUser}
                                    disabled={rejectLoading || approveLoading}
                                    className="approve-user-btn"
                                    leftIcon={<ui.Icons name={rejectLoading ? "loader" : "close"} size={16} className={rejectLoading ? "animate-spin" : ""} />}
                                >
                                    {rejectLoading ? "Rejecting..." : "Reject"}
                                </ui.Button>
                                <ui.Button
                                    variant="success"
                                    size="medium"
                                    onClick={handleApproveUser}
                                    disabled={approveLoading || rejectLoading}
                                    className="approve-user-btn"
                                    leftIcon={<ui.Icons name={approveLoading ? "loader" : "check"} size={16} className={approveLoading ? "animate-spin" : ""} />}
                                >
                                    {approveLoading ? "Approving..." : "Approve User"}
                                </ui.Button>
                            </div>

                        ) : (
                            <ui.Button
                                variant="danger"
                                size="medium"
                                onClick={handleDeleteUser}
                                className="delete-user-btn"
                                leftIcon={<ui.Icons name="trash" size={16} />}
                            >
                                Delete User
                            </ui.Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Document Viewer Modal */}
            <ui.DocumentViewer
                isOpen={documentViewer.isOpen}
                imageUrl={documentViewer.imageUrl}
                title={documentViewer.title}
                onClose={handleCloseDocumentViewer}
            />
        </div>
    );
};

export default QuickViewModal;
