import React, { useEffect } from "react";
import "./QuickViewModal.scss";
import ui from "@/components/ui";

interface QuickViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    memberData: {
        id: number;
        name: string;
        roomNo: string;
        memberType: "long_term" | "short_term";
        profileImage?: string;
        phone?: string;
        email?: string;
        paymentStatus: "Paid" | "Pending";
        paymentApprovalStatus: "Approved" | "Pending" | "Rejected";
        documents?: {
            name: string;
            imageUrl: string;
        }[];
    } | null;
    onDeleteUser?: (userId: number) => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({
    isOpen,
    onClose,
    memberData,
    onDeleteUser
}) => {
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

    if (!isOpen || !memberData) return null;

    const handleDeleteUser = () => {
        if (onDeleteUser && memberData.id) {
            onDeleteUser(memberData.id);
            onClose();
        }
    };

    const handleDocumentView = (imageUrl: string) => {
        // Create a modal to view the document image
        const modal = document.createElement('div');
        modal.className = 'document-viewer-modal';
        modal.innerHTML = `
            <div class="document-viewer-overlay" onclick="this.parentElement.remove()">
                <div class="document-viewer-content" onclick="event.stopPropagation()">
                    <button class="document-viewer-close" onclick="this.closest('.document-viewer-modal').remove()">×</button>
                    <img src="${imageUrl}" alt="Document" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
                </div>
            </div>
        `;
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
        `;
        document.body.appendChild(modal);
    };

    return (
        <div className="quick-view-modal-overlay" onClick={onClose}>
            <div className="quick-view-modal" onClick={(e) => e.stopPropagation()}>
                {/* Combined Header and Banner Layout */}
                <div className={`quick-view-header-banner header-banner--${memberData.memberType}`}>
                    {/* Header Section */}
                    <div className="header-content">
                        <div className="member-type-badge">
                            <span className="type-badge">
                                {memberData.memberType === 'long_term' ? 'Long-Term Member' : 'Short-Term Member'}
                            </span>
                        </div>
                        <button className="close-button" onClick={onClose}>
                            <ui.Icons name="close" size={20} strokeWidth={2} />
                        </button>
                    </div>
                    
                    {/* Banner Section */}
                    <div className="banner-content">
                        <div className="banner-profile">
                            <div className="profile-image">
                                {memberData.profileImage ? (
                                    <img src={memberData.profileImage} alt={memberData.name} />
                                ) : (
                                    <div className="profile-placeholder">
                                        <ui.Icons name="user" size={32} strokeWidth={2} />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="banner-info">
                            <h2 className="member-name">{memberData.name}</h2>
                            <p className="member-id">ID: {memberData.id}</p>
                            <p className="member-room">Room: {memberData.roomNo}</p>
                        </div>
                    </div>
                </div>

                {/* Info Layout */}
                <div className={`quick-view-content content--${memberData.memberType}`}>
                    {/* Contact Info */}
                    <div className="info-section">
                        <h3 className={`section-title section-title--${memberData.memberType}`}>
                            <ui.Icons name="phone" size={16} />
                            Contact Information
                        </h3>
                        <div className="info-grid">
                            <div className={`info-item info-item--${memberData.memberType}`}>
                                <span className="info-label">Phone Number:</span>
                                <span className="info-value">{memberData.phone || 'Not provided'}</span>
                            </div>
                            <div className={`info-item info-item--${memberData.memberType}`}>
                                <span className="info-label">Email ID:</span>
                                <span className="info-value">{memberData.email || 'Not provided'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="info-section">
                        <h3 className={`section-title section-title--${memberData.memberType}`}>
                            <ui.Icons name="creditCard" size={16} />
                            Payment Information
                        </h3>
                        <div className="info-grid">
                            <div className={`info-item info-item--${memberData.memberType}`}>
                                <span className="info-label">Payment Status:</span>
                                <span className={`status-badge status-badge--${memberData.paymentStatus.toLowerCase()}`}>
                                    {memberData.paymentStatus}
                                </span>
                            </div>
                            <div className={`info-item info-item--${memberData.memberType}`}>
                                <span className="info-label">Approval Status:</span>
                                <span className={`approval-badge approval-badge--${memberData.paymentApprovalStatus.toLowerCase()}`}>
                                    {memberData.paymentApprovalStatus}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Documents */}
                    <div className="info-section">
                        <h3 className={`section-title section-title--${memberData.memberType}`}>
                            <ui.Icons name="fileText" size={16} />
                            Documents
                        </h3>
                        <div className="documents-list">
                            {memberData.documents && memberData.documents.length > 0 ? (
                                memberData.documents.map((document, index) => (
                                    <div key={index} className={`document-item document-item--${memberData.memberType}`}>
                                        <span className="document-name">{document.name}</span>
                                        <ui.Button
                                            variant="transparent"
                                            size="small"
                                            onClick={() => handleDocumentView(document.imageUrl)}
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
                </div>

                {/* Footer Layout - Actions */}
                <div className="quick-view-footer">
                    <ui.Button
                        variant="danger"
                        size="medium"
                        onClick={handleDeleteUser}
                        className="delete-user-btn"
                        leftIcon={<ui.Icons name="trash" size={16} />}
                    >
                        Delete User
                    </ui.Button>
                </div>
            </div>
        </div>
    );
};

export default QuickViewModal;
