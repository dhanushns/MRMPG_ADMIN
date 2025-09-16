import React from 'react';
import ui from '@/components/ui';
import { formatDate, formatCurrency } from '@/utils';
import type { RelievingRequestData } from '@/types/apiResponseTypes';

interface RelievingRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    memberData: RelievingRequestData | null;
    onApprove: (requestId: string) => void;
    onReject: (requestId: string) => void;
    approveLoading?: boolean;
    rejectLoading?: boolean;
}

const RelievingRequestModal: React.FC<RelievingRequestModalProps> = ({
    isOpen,
    onClose,
    memberData,
    onApprove,
    onReject,
    approveLoading = false,
    rejectLoading = false
}) => {
    if (!isOpen || !memberData) return null;

    const handleApprove = () => {
        onApprove(memberData.id);
    };

    const handleReject = () => {
        onReject(memberData.id);
    };

    return (
        <div className="relieving-request-modal">
            <div className="relieving-request-modal__backdrop" onClick={onClose} />
            <div className="relieving-request-modal__container">
                <div className="relieving-request-modal__header">
                    <div className="relieving-request-modal__title">
                        <h2>Relieving Request Details</h2>
                        <span className="relieving-request-modal__subtitle">
                            Review member's request to leave the PG
                        </span>
                    </div>
                    <button 
                        className="relieving-request-modal__close"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <ui.Icons name="x" size={24} />
                    </button>
                </div>

                <div className="relieving-request-modal__body">
                    {/* Member Profile Section */}
                    <div className="relieving-request-modal__section">
                        <div className="relieving-request-modal__profile">
                            <div className="profile-avatar">
                                <div className="avatar-placeholder">
                                    <ui.Icons name="user" size={32} />
                                </div>
                            </div>
                            <div className="profile-info">
                                <h3 className="member-name">{memberData.memberName}</h3>
                                <div className="member-id">ID: {memberData.memberMemberId}</div>
                                <div className="member-status">
                                    <span className={`status-badge status-badge--${memberData.status.toLowerCase()}`}>
                                        {memberData.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Request Details Section */}
                    <div className="relieving-request-modal__section">
                        <h4 className="section-title">Request Information</h4>
                        <div className="details-grid">
                            <div className="detail-item">
                                <span className="label">Requested Leave Date</span>
                                <span className="value">{formatDate(memberData.requestedLeaveDate)}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Reason for Leaving</span>
                                <span className="value reason-text">{memberData.reason}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Request Date</span>
                                <span className="value">
                                    {memberData.createdAt ? formatDate(memberData.createdAt) : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Member Details Section */}
                    <div className="relieving-request-modal__section">
                        <h4 className="section-title">Member Details</h4>
                        <div className="details-grid">
                            <div className="detail-item">
                                <span className="label">Gender</span>
                                <span className="value">{memberData.memberGender}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Phone</span>
                                <span className="value">{memberData.memberPhone}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Email</span>
                                <span className="value">{memberData.memberEmail}</span>
                            </div>
                        </div>
                    </div>

                    {/* Accommodation Details Section */}
                    <div className="relieving-request-modal__section">
                        <h4 className="section-title">Accommodation Details</h4>
                        <div className="details-grid">
                            <div className="detail-item">
                                <span className="label">PG Name</span>
                                <span className="value">{memberData.pgName}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">PG Location</span>
                                <span className="value">{memberData.pgLocation}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Room Number</span>
                                <span className="value">{memberData.roomNo || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Monthly Rent</span>
                                <span className="value">
                                    {memberData.roomRent ? formatCurrency(memberData.roomRent) : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Financial Details Section */}
                    <div className="relieving-request-modal__section">
                        <h4 className="section-title">Financial Information</h4>
                        <div className="financial-details">
                            <div className="financial-item">
                                <span className="label">Pending Dues</span>
                                <span className="value amount pending">
                                    {formatCurrency(memberData.pendingDues)}
                                </span>
                            </div>
                            <div className="financial-item final-amount">
                                <span className="label">Final Settlement Amount</span>
                                <span className="value amount final">
                                    {formatCurrency(memberData.finalAmount)}
                                </span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer with Action Buttons */}
                <div className="relieving-request-modal__footer">
                    <div className="footer-actions">
                        <ui.Button
                            variant="outline"
                            onClick={onClose}
                            disabled={approveLoading || rejectLoading}
                        >
                            Cancel
                        </ui.Button>
                        <div className="primary-actions">
                            <ui.Button
                                variant="danger"
                                onClick={handleReject}
                                disabled={approveLoading || rejectLoading}
                                loading={rejectLoading}
                                leftIcon={rejectLoading ? undefined : <ui.Icons name="x" size={16} />}
                            >
                                {rejectLoading ? 'Rejecting...' : 'Reject Request'}
                            </ui.Button>
                            <ui.Button
                                variant="primary"
                                onClick={handleApprove}
                                disabled={approveLoading || rejectLoading}
                                loading={approveLoading}
                                leftIcon={approveLoading ? undefined : <ui.Icons name="check" size={16} />}
                            >
                                {approveLoading ? 'Approving...' : 'Approve Request'}
                            </ui.Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RelievingRequestModal;