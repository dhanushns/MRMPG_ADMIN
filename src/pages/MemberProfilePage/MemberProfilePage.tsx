import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ui from '@/components/ui';
import layouts from '@/components/layouts';
import { useNotification } from '@/hooks/useNotification';

// Types
import type { MemberProfileData, MemberProfileDataReponse, Payment } from '../../types/apiResponseTypes';

// Utils
import { formatDate, formatCurrency, ApiClient } from '../../utils';

import './MemberProfilePage.scss';

const MemberProfilePage: React.FC = () => {
    const { memberId } = useParams<{ memberId: string }>();
    const navigate = useNavigate();
    const notification = useNotification();

    // State
    const [memberData, setMemberData] = useState<MemberProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error,] = useState<string | null>(null);
    const [documentViewer, setDocumentViewer] = useState<{
        isOpen: boolean;
        imageUrl: string;
        title: string;
    }>({ isOpen: false, imageUrl: '', title: '' });
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Payment table columns with proper typing
    const paymentColumns = [
        {
            key: 'month',
            label: 'Month',
            render: (_value: unknown, row: Record<string, unknown>) => {
                const payment = row as unknown as Payment;
                return `${getMonthName(payment.month)} ${payment.year}`;
            }
        },
        {
            key: 'amount',
            label: 'Amount',
            render: (_value: unknown, row: Record<string, unknown>) => {
                const payment = row as unknown as Payment;
                return formatCurrency(payment.amount);
            }
        },
        {
            key: 'dueDate',
            label: 'Due Date',
            render: (_value: unknown, row: Record<string, unknown>) => {
                const payment = row as unknown as Payment;
                return formatDate(payment.dueDate);
            }
        },
        {
            key: 'paidDate',
            label: 'Paid Date',
            render: (_value: unknown, row: Record<string, unknown>) => {
                const payment = row as unknown as Payment;
                return payment.paidDate ? formatDate(payment.paidDate) : '-';
            }
        },
        {
            key: 'status',
            label: 'Status',
            render: (_value: unknown, row: Record<string, unknown>) => {
                const payment = row as unknown as Payment;
                return (
                    <span className={`payment-status payment-status--${payment.paymentStatus.toLowerCase()}`}>
                        {payment.paymentStatus}
                    </span>
                );
            }
        },
        {
            key: 'actions',
            label: 'Documents',
            align: 'center' as const,
            render: (_value: unknown, row: Record<string, unknown>) => {
                const payment = row as unknown as Payment;
                return (
                    <div className="payment-documents">
                        {payment.rentBillScreenshot && (
                            <ui.Button
                                variant="ghost"
                                size="small"
                                onClick={() => payment.rentBillScreenshot && handleDocumentView(payment.rentBillScreenshot, 'Rent Bill')}
                                leftIcon={<ui.Icons name="eye" size={16} />}
                            >

                                Rent Bill
                            </ui.Button>
                        )}
                        {payment.electricityBillScreenshot && (
                            <ui.Button
                                variant="ghost"
                                size="small"
                                onClick={() => payment.electricityBillScreenshot && handleDocumentView(payment.electricityBillScreenshot, 'Electricity Bill')}
                                leftIcon={<ui.Icons name="eye" size={16} />}
                            >
                                Electricity Bill
                            </ui.Button>
                        )}
                    </div>
                );
            }
        }
    ];

    // Helper function to get month name
    const getMonthName = (month: number) => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[month - 1] || 'Unknown';
    };

    useEffect(() => {
        const fetchMemberData = async () => {
            try {
                setLoading(true);
                const apiResponse = await ApiClient.get(`/members/${memberId}`) as MemberProfileDataReponse;
                if (apiResponse.success && apiResponse.data) {
                    setMemberData(apiResponse.data);
                }
                else {
                    notification.showError(apiResponse.error || "Failed to fetch member data", apiResponse.message, 5000);
                }
            } catch (err) {
                notification.showError("Failed to fetch member data", err instanceof Error ? err.message : 'Unknown error', 5000)
                setMemberData(null);
            } finally {
                setLoading(false);
            }
        };

        if (memberId) {
            fetchMemberData();
        }
    }, [memberId]);

    const handleDocumentView = (imageUrl: string, title: string) => {
        setDocumentViewer({
            isOpen: true,
            imageUrl,
            title
        });
    };

    const handleDeleteMember = async () => {
        if (!memberData || !window.confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
            return;
        }

        try {
            setDeleteLoading(true);
            // Replace with actual API call
            // await fetch(`/api/members/${memberId}`, { method: 'DELETE' });


            navigate('/members');
        } catch (err) {
        } finally {
            setDeleteLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        // Handle pagination
        console.log('Page changed to:', page);
    };

    if (loading) {
        return (
            <div className="member-profile-page member-profile-page--loading">
                <div className="loading-spinner">Loading member profile...</div>
            </div>
        );
    }

    if (error || !memberData) {
        return (
            <div className="member-profile-page member-profile-page--error">
                <div className="error-message">
                    <ui.Icons name="alertTriangle" size={48} />
                    <h2>Error Loading Profile</h2>
                    <p>{error || 'Member not found'}</p>
                    <ui.Button onClick={() => navigate('/members')}>
                        <ui.Icons name="arrowLeft" size={16} />
                        Back to Members
                    </ui.Button>
                </div>
            </div>
        );
    }

    // Helper variable for rent type based class names
    const rentTypeClass = memberData.member.rentType.toUpperCase();

    return (
        <div className={`member-profile-page ${rentTypeClass}`}>
            {/* Professional Header with Breadcrumb */}
            <div className="member-profile-header">
                <div className={`header-backdrop header-backdrop--${rentTypeClass}`}></div>
                <div className="header-content">
                    {/* Navigation Bar */}
                    <div className="profile-nav">
                        <ui.Button
                            variant="transparent"
                            size="small"
                            className="back-button"
                            onClick={() => navigate('/members')}
                            leftIcon={<ui.Icons name="arrowLeft" size={16} />}
                        >
                            <span>Back to Members</span>
                        </ui.Button>
                    </div>

                    {/* Member Header Card */}
                    <div className="member-header-card">
                        <div className="profile-section">
                            <div className="profile-avatar">
                                <ui.AuthenticatedImage
                                    src={memberData.member.photoUrl}
                                    alt={memberData.member.name}
                                    className="avatar-image"
                                />
                            </div>

                            <div className="profile-info">
                                <div className="member-title">
                                    <h1 className="member-name">{memberData.member.name}</h1>
                                    <div className="member-badges">
                                        <span className={`rent-badge rent-badge--${memberData.member.rentType.toLowerCase()}`}>
                                            {memberData.member.rentType.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>

                                <div className="member-meta">
                                    <div className={`meta-item meta-item--${rentTypeClass}`}>
                                        <ui.Icons name="building" size={16} />
                                        <span>{memberData.member.pgDetails.name}</span>
                                    </div>
                                    <div className={`meta-item meta-item--${rentTypeClass}`}>
                                        <ui.Icons name="home" size={16} />
                                        <span>Room {memberData.member.roomDetails.roomNo}</span>
                                    </div>
                                    <div className={`meta-item meta-item--${rentTypeClass}`}>
                                        <ui.Icons name="calendar" size={16} />
                                        <span>Joined {formatDate(memberData.member.dateOfJoining)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="quick-stats">
                            <div className="stat-item stat-positive">
                                <div className="stat-value">{formatCurrency(memberData.paymentSummary.totalAmountPaid || 0)}</div>
                                <div className="stat-label">Total Paid</div>
                            </div>
                            <div className="stat-item stat-neutral">
                                <div className="stat-value">{memberData.paymentSummary.totalPayments || 0}</div>
                                <div className="stat-label">Payments Made</div>
                            </div>
                            <div className="stat-item stat-warning">
                                <div className="stat-value">{formatCurrency(memberData.paymentSummary.totalAmountPending || 0)}</div>
                                <div className="stat-label">Pending</div>
                            </div>
                            <div className="stat-item stat-neutral">
                                <div className="stat-value">{memberData.paymentSummary.currentDueDate ? formatDate(memberData.paymentSummary.currentDueDate) : '-'}</div>
                                <div className="stat-label">Due-date</div>
                            </div>
                            </div>
                    </div>
                </div>
            </div>

            {/* Main Content Dashboard */}
            <div className="profile-dashboard">
                <div className="dashboard-container">
                    {/* Overview Cards Section */}
                    <section className="overview-section">
                        <div className="section-header">
                            <h2>Member Overview</h2>
                        </div>

                        <div className="overview-grid">
                            {/* Personal Details Card */}
                            <div className="overview-card personal-card">
                                <div className="card-header">
                                    <div className={`header-icon header-icon--${rentTypeClass}`}>
                                        <ui.Icons name="user" size={20} />
                                    </div>
                                    <div className="header-content">
                                        <h3>Personal Information</h3>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="details-grid">
                                        <div className="detail-row">
                                            <span className="label">Full Name</span>
                                            <span className="value">{memberData.member.name}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Age</span>
                                            <span className="value">{memberData.member.age} years</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Gender</span>
                                            <span className="value">{memberData.member.gender}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Profession</span>
                                            <span className="value">{memberData.member.work}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Member ID</span>
                                            <span className="value member-id">{memberData.member.memberId}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Details Card */}
                            <div className="overview-card contact-card">
                                <div className="card-header">
                                    <div className={`header-icon header-icon--${rentTypeClass}`}>
                                        <ui.Icons name="phone" size={20} />
                                    </div>
                                    <div className="header-content">
                                        <h3>Contact Information</h3>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="contact-list">
                                        <div className={`contact-item contact-item--${rentTypeClass}`}>
                                            <ui.Icons name="mail" size={16} />
                                            <div className="contact-info">
                                                <span className="contact-label">Email</span>
                                                <span className="contact-value">{memberData.member.email}</span>
                                            </div>
                                        </div>
                                        <div className={`contact-item contact-item--${rentTypeClass}`}>
                                            <ui.Icons name="phone" size={16} />
                                            <div className="contact-info">
                                                <span className="contact-label">Phone</span>
                                                <span className="contact-value">{memberData.member.phone}</span>
                                            </div>
                                        </div>
                                        <div className={`contact-item contact-item--${rentTypeClass}`}>
                                            <ui.Icons name="location" size={16} />
                                            <div className="contact-info">
                                                <span className="contact-label">Location</span>
                                                <span className="contact-value">{memberData.member.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Accommodation Details Card */}
                            <div className="overview-card accommodation-card">
                                <div className="card-header">
                                    <div className={`header-icon header-icon--${rentTypeClass}`}>
                                        <ui.Icons name="building" size={20} />
                                    </div>
                                    <div className="header-content">
                                        <h3>Accommodation Details</h3>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="accommodation-info">
                                        <div className="accommodation-main">
                                            <h4>{memberData.member.pgDetails.name}</h4>
                                            <p className="pg-location">{memberData.member.pgDetails.location}</p>
                                        </div>
                                        <div className="accommodation-details">
                                            <div className="detail-group">
                                                <span className="detail-label">Room</span>
                                                <span className="detail-value">{memberData.member.roomDetails.roomNo}</span>
                                            </div>
                                            <div className="detail-group">
                                                <span className="detail-label">Capacity</span>
                                                <span className="detail-value">{memberData.member.roomDetails.capacity} members</span>
                                            </div>
                                            <div className="detail-group">
                                                <span className="detail-label">Monthly Rent</span>
                                                <span className={`detail-value rent-amount rent-amount--${rentTypeClass}`}>{formatCurrency(memberData.member.roomDetails.rent)}</span>
                                            </div>
                                            <div className="detail-group">
                                                <span className="detail-label">Advance Paid</span>
                                                <span className="detail-value">{formatCurrency(memberData.member.advanceAmount)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Documents Section */}
                    <section className="documents-section">
                        <div className="section-header">
                            <h2>Documents & Verification</h2>
                        </div>

                        <div className="documents-grid">
                            {/* ID Proof Document Card */}
                            <div className={`document-card document-card--${rentTypeClass.toLowerCase()}`}>
                                <div className="document-card-header">
                                    <div className="document-icon-wrapper">
                                        <ui.Icons name="fileText" size={24} />
                                    </div>
                                    <div className="document-meta">
                                        <h3 className="document-title">ID Proof</h3>
                                        <span className="document-type">Identity Document</span>
                                    </div>
                                    <div className="verification-badge verified">
                                        <ui.Icons name="checkCircle" size={16} />
                                        <span>Verified</span>
                                    </div>
                                </div>
                                <div className="document-card-body">
                                    <p className="document-description">
                                        Government issued identity document for verification purposes.
                                    </p>
                                    <div className="document-actions">
                                        <ui.Button
                                            variant="primary"
                                            size="small"
                                            onClick={() => handleDocumentView(memberData.member.documentUrl, 'ID Proof')}
                                            leftIcon={<ui.Icons name="eye" size={16} />}
                                        >
                                            View Document
                                        </ui.Button>
                                    </div>
                                </div>
                            </div>

                            {/* Profile Photo Document Card */}
                            <div className={`document-card document-card--${rentTypeClass.toLowerCase()}`}>
                                <div className="document-card-header">
                                    <div className="document-icon-wrapper">
                                        <ui.Icons name="user" size={24} />
                                    </div>
                                    <div className="document-meta">
                                        <h3 className="document-title">Profile Photo</h3>
                                        <span className="document-type">Profile Image</span>
                                    </div>
                                    <div className="verification-badge verified">
                                        <ui.Icons name="checkCircle" size={16} />
                                        <span>Verified</span>
                                    </div>
                                </div>
                                <div className="document-card-body">
                                    <p className="document-description">
                                        Member's profile photograph for identification and records.
                                    </p>
                                    <div className="document-actions">
                                        <ui.Button
                                            variant="primary"
                                            size="small"
                                            onClick={() => handleDocumentView(memberData.member.photoUrl, 'Profile Photo')}
                                            leftIcon={<ui.Icons name="eye" size={16} />}
                                        >
                                            View Photo
                                        </ui.Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Payment History Section */}
                    <section className="history-section">
                        <div className="section-header">
                            <h2>Payment History</h2>
                        </div>

                        <div className="payment-table-container">
                            <layouts.TableLayout
                                data={memberData.paymentHistory.data}
                                columns={paymentColumns}
                                pagination={{
                                    currentPage: memberData.paymentHistory.pagination.page,
                                    totalPages: memberData.paymentHistory.pagination.totalPages,
                                    totalItems: memberData.paymentHistory.pagination.total,
                                    onPageChange: handlePageChange
                                }}
                            />
                        </div>
                    </section>

                    {/* Admin Actions Section */}
                    <section className="admin-section">
                        <div className="admin-card danger-zone">
                            <div className="card-header">
                                <div className="header-icon danger">
                                    <ui.Icons name="alertTriangle" size={20} />
                                </div>
                                <div className="header-content">
                                    <h3>Administrative Actions</h3>
                                    <p>Dangerous operations requiring confirmation</p>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="danger-action">
                                    <div className="action-info">
                                        <h4>Delete Member Account</h4>
                                        <p>Permanently remove this member and all associated data. This action cannot be undone and will affect payment history, room assignments, and other related records.</p>
                                    </div>
                                    <ui.Button
                                        variant="danger"
                                        size="small"
                                        onClick={handleDeleteMember}
                                        disabled={deleteLoading}
                                    >
                                        <ui.Icons name="trash" size={16} />
                                        {deleteLoading ? 'Deleting...' : 'Delete Member'}
                                    </ui.Button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Document Viewer Modal */}
            <ui.DocumentViewer
                isOpen={documentViewer.isOpen}
                imageUrl={documentViewer.imageUrl}
                title={documentViewer.title}
                onClose={() => setDocumentViewer({ isOpen: false, imageUrl: '', title: '' })}
            />
        </div>
    );
};

export default MemberProfilePage;
