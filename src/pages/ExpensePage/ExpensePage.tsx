import React, { useEffect, useState, useCallback, useRef } from 'react';
import layouts from "@layouts/index";
import ui from "@/components/ui";
import './ExpensePage.scss';
import { AuthManager, ApiClient } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '@/hooks/useNotification';
import type { CardItem, ExpenseStatsResponse, ExpenseTableResponse, ExpenseEntry } from '@/types/apiResponseTypes';
import type { CashEntryFormData, CashEntryType } from '@/components/ui/CashEntryForm/CashEntryForm';

const ExpensePage = (): React.ReactElement => {
    const navigate = useNavigate();
    const notification = useNotification();
    const isInitialLoad = useRef(true);

    // Loading states
    const [cardLoading, setCardLoading] = useState(false);

    // Cards state
    const [cards, setCards] = useState<CardItem[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date | string | undefined>(undefined);

    // Form state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formType, setFormType] = useState<CashEntryType>('cash-in');

    // Table state
    const [tableData, setTableData] = useState<ExpenseEntry[]>([]);
    const [isTableLoading, setIsTableLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalEntries, setTotalEntries] = useState(0);
    const [pageSize] = useState(20); // Fixed page size

    // Check token validity periodically
    useEffect(() => {
        const checkTokenValidity = () => {
            if (!AuthManager.isTokenValid()) {
                AuthManager.clearAuthData();
                navigate('/login');
            }
        };
        checkTokenValidity();
    }, [navigate]);

    // Authentication check and staff data extraction
    useEffect(() => {
        const checkAuthentication = () => {
            if (!AuthManager.isAuthenticated()) {
                navigate('/login');
                return;
            }
        };

        checkAuthentication();
    }, [navigate]);

    // Fetch expense statistics from backend
    const fetchExpenseStats = useCallback(async () => {
        setCardLoading(true);
        try {
            const apiResponse = await ApiClient.get('/expenses/stats') as ExpenseStatsResponse;
            if (apiResponse.success && apiResponse.data) {
                setCards(apiResponse.data.cards || []);
                setLastUpdated(apiResponse.data.lastUpdated);
            } else {
                setCards([]);
                notification.showError(
                    apiResponse.message || 'Failed to fetch expense statistics', 
                    apiResponse.error || "Contact support", 
                    5000
                );
            }
        } catch (error) {
            notification.showError(
                'Error fetching expense statistics', 
                "Check your network connection", 
                5000
            );
            setCards([]);
        } finally {
            setCardLoading(false);
        }
    }, [notification]);

    // Fetch expense table data from backend
    const fetchExpenseTableData = useCallback(async (page: number = 1) => {
        setIsTableLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: pageSize.toString()
            });

            const apiResponse = await ApiClient.get(`/expense/table?${queryParams}`) as ExpenseTableResponse;
            if (apiResponse.success && apiResponse.data) {
                setTableData(apiResponse.data.entries || []);
                setCurrentPage(apiResponse.data.pagination.currentPage);
                setTotalPages(apiResponse.data.pagination.totalPages);
                setTotalEntries(apiResponse.data.pagination.totalEntries);
            } else {
                setTableData([]);
                notification.showError(
                    apiResponse.message || 'Failed to fetch expense table data', 
                    apiResponse.error || "Contact support", 
                    5000
                );
            }
        } catch (error) {
            notification.showError(
                'Error fetching expense table data', 
                "Check your network connection", 
                5000
            );
            setTableData([]);
        } finally {
            setIsTableLoading(false);
        }
    }, [notification, pageSize]);

    // Form handling functions
    const openForm = (type: CashEntryType) => {
        setFormType(type);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
    };

    const handleFormSave = async (data: CashEntryFormData) => {
        try {
            // Here you would typically call your API to save the cash entry
            console.log('Saving cash entry:', data);
            notification.showSuccess(
                `${data.type === 'cash-in' ? 'Cash In' : 'Cash Out'} entry saved successfully`,
                'Entry has been recorded',
                3000
            );
            closeForm();
            // Refresh the stats after saving
            fetchExpenseStats();
        } catch (error) {
            notification.showError(
                'Failed to save cash entry',
                'Please try again',
                5000
            );
        }
    };

    const handleFormSaveAndAddNew = async (data: CashEntryFormData) => {
        try {
            // Here you would typically call your API to save the cash entry
            console.log('Saving cash entry and adding new:', data);
            notification.showSuccess(
                `${data.type === 'cash-in' ? 'Cash In' : 'Cash Out'} entry saved successfully`,
                'Ready for next entry',
                3000
            );
            // Don't close the form, just refresh stats
            fetchExpenseStats();
        } catch (error) {
            notification.showError(
                'Failed to save cash entry',
                'Please try again',
                5000
            );
        }
    };

    // Initial data loading - only runs once when component mounts
    useEffect(() => {
        if (AuthManager.isAuthenticated() && isInitialLoad.current) {
            fetchExpenseStats();
            fetchExpenseTableData(1); // Load first page
            isInitialLoad.current = false;
        }
    }, [fetchExpenseStats, fetchExpenseTableData]);

    // Handle page changes
    const handlePageChange = (page: number) => {
        fetchExpenseTableData(page);
    };

    // Table columns configuration
    const tableColumns = [
        {
            key: 'entryType',
            label: 'Type',
            render: (_: unknown, row: Record<string, unknown>) => {
                const entry = row as unknown as ExpenseEntry;
                return (
                    <span className={`status-badge status-badge--${entry.entryType === 'CASH_IN' ? 'active' : 'inactive'}`}>
                        {entry.entryType === 'CASH_IN' ? 'Cash In' : 'Cash Out'}
                    </span>
                );
            }
        },
        {
            key: 'amount',
            label: 'Amount',
            render: (_: unknown, row: Record<string, unknown>) => {
                const entry = row as unknown as ExpenseEntry;
                return (
                    <span className={`amount ${entry.entryType === 'CASH_IN' ? 'amount--positive' : 'amount--negative'}`}>
                        ₹{entry.amount.toLocaleString()}
                    </span>
                );
            }
        },
        {
            key: 'date',
            label: 'Date',
            render: (_: unknown, row: Record<string, unknown>) => {
                const entry = row as unknown as ExpenseEntry;
                return new Date(entry.date).toLocaleDateString();
            }
        },
        {
            key: 'partyName',
            label: 'Party Name',
            render: (_: unknown, row: Record<string, unknown>) => {
                const entry = row as unknown as ExpenseEntry;
                return entry.partyName || '-';
            }
        },
        {
            key: 'admin',
            label: 'Admin',
            render: (_: unknown, row: Record<string, unknown>) => {
                const entry = row as unknown as ExpenseEntry;
                return entry.admin?.name || '-';
            }
        },
        {
            key: 'pg',
            label: 'PG',
            render: (_: unknown, row: Record<string, unknown>) => {
                const entry = row as unknown as ExpenseEntry;
                return entry.pg?.name || '-';
            }
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_: unknown, row: Record<string, unknown>) => {
                const entry = row as unknown as ExpenseEntry;
                return (
                    <div className="table-actions">
                        <button 
                            className="action-btn action-btn--view"
                            onClick={() => handleViewExpense(entry.id)}
                            title="View Details"
                        >
                            <i className="icon-eye"></i>
                        </button>
                        <button 
                            className="action-btn action-btn--edit"
                            onClick={() => handleEditExpense(entry.id)}
                            title="Edit"
                        >
                            <i className="icon-edit"></i>
                        </button>
                        <button 
                            className="action-btn action-btn--delete"
                            onClick={() => handleDeleteExpense(entry.id)}
                            title="Delete"
                        >
                            <i className="icon-delete"></i>
                        </button>
                    </div>
                );
            }
        }
    ];

    // Table action handlers
    const handleViewExpense = (id: string) => {
        console.log('View expense:', id);
        // TODO: Implement view functionality
    };

    const handleEditExpense = (id: string) => {
        console.log('Edit expense:', id);
        // TODO: Implement edit functionality
    };

    const handleDeleteExpense = (id: string) => {
        console.log('Delete expense:', id);
        // TODO: Implement delete functionality
    };

    return (
        <>
            <div className="expense-page">
                <div className="expense-page__header">
                    <layouts.HeaderLayout
                        title="Expense Management"
                        subText="Track and manage all PG related expenses, categories, and financial records"
                        buttons={[
                            {
                                label: "Cash In",
                                variant: "primary",
                                icon: "plus",
                                size: "small",
                                onClick: () => openForm('cash-in')
                            },
                            {
                                label: "Cash Out",
                                variant: "secondary",
                                icon: "minus",
                                size: "small",
                                onClick: () => openForm('cash-out')
                            },
                        ]}
                    />
                </div>

                <div className="expense-page__content">
                    {/* Cards Section */}
                    <div className="expense-page__stats-section">
                        <layouts.CardGrid
                            cards={cards.length > 0 ? cards : [
                                { icon: "clock" }, 
                                { icon: "clock" }, 
                                { icon: "clock" }, 
                                { icon: "clock" }
                            ]}
                            loading={cardLoading}
                            columns={4}
                            gap='md'
                            showRefresh
                            onRefresh={fetchExpenseStats}
                            lastUpdated={lastUpdated}
                            className='expense-cards'
                        />
                    </div>

                    {/* Table Section */}
                    <div className="expense-page__table-section">
                        <layouts.TableLayout
                            columns={tableColumns}
                            data={tableData as unknown as Record<string, unknown>[]}
                            loading={isTableLoading}
                            pagination={{
                                currentPage: currentPage,
                                totalPages: totalPages,
                                totalItems: totalEntries,
                                onPageChange: handlePageChange
                            }}
                            emptyMessage="No expense records found"
                        />
                    </div>
                </div>
            </div>

            {/* Cash Entry Form */}
            <ui.CashEntryForm
                isOpen={isFormOpen}
                onClose={closeForm}
                onSave={handleFormSave}
                onSaveAndAddNew={handleFormSaveAndAddNew}
                initialType={formType}
            />
        </>
    );
};

export default ExpensePage;