import React from "react";
import "./TableLayout.scss";
import ui from "@/components/ui";
import type { types } from "@/types";

const TableLayout: React.FC<types["TableLayoutProps"]> = ({
    columns,
    data,
    loading = false,
    pagination = true,
    pageSize = 10,
    sortable = true,
    currentSort = { key: null, direction: "asc" },
    className = "",
    onRowClick,
    onSort,
    emptyMessage = "No data available"
}) => {
    // Determine if we're using external pagination
    const isExternalPagination = typeof pagination === 'object' && pagination !== null;
    const currentPage = isExternalPagination ? pagination.currentPage : 1;
    const totalPages = isExternalPagination ? pagination.totalPages : Math.ceil(data.length / pageSize);
    const totalItems = isExternalPagination ? pagination.totalItems : data.length;

    const handleSort = (columnKey: string) => {
        if (!sortable || !onSort) return;

        const column = columns.find(col => col.key === columnKey);
        if (!column?.sortable) return;

        // Toggle direction based on current sort state
        const newDirection = 
            currentSort.key === columnKey && currentSort.direction === "asc" 
                ? "desc" 
                : "asc";
        
        onSort(columnKey, newDirection);
    };

    const handlePageChange = (page: number) => {
        if (isExternalPagination) {
            pagination.onPageChange(page);
        }
        // Remove internal pagination handling since we're using only external functions
    };

    const renderCell = (column: types["TableColumn"], row: types["TableData"], rowIndex: number): React.ReactNode => {
        const value = row[column.key];

        if (column.render) {
            return column.render(value, row, rowIndex);
        }

        // Convert unknown values to displayable content
        if (value === null || value === undefined) {
            return "-";
        }

        if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
            return String(value);
        }

        // For complex objects, you might want to handle them differently
        return String(value);
    };

    const renderPagination = () => {
        if (!pagination || totalPages <= 1) return null;

        const getVisiblePages = () => {
            const delta = 2;
            const range = [];
            const rangeWithDots = [];

            for (let i = Math.max(2, currentPage - delta);
                i <= Math.min(totalPages - 1, currentPage + delta);
                i++) {
                range.push(i);
            }

            if (currentPage - delta > 2) {
                rangeWithDots.push(1, '...');
            } else {
                rangeWithDots.push(1);
            }

            rangeWithDots.push(...range);

            if (currentPage + delta < totalPages - 1) {
                rangeWithDots.push('...', totalPages);
            } else {
                rangeWithDots.push(totalPages);
            }

            return rangeWithDots;
        };

        return (
            <div className="table-pagination">
                <div className="pagination-info">
                    <span>
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
                    </span>
                </div>
                <div className="pagination-controls">
                    <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <ui.Icons name="chevronLeft" size={16} strokeWidth={3} />
                    </button>

                    {getVisiblePages().map((page, index) => (
                        <button
                            key={index}
                            className={`pagination-btn ${page === currentPage ? 'active' : ''} ${page === '...' ? 'dots' : ''}`}
                            onClick={() => typeof page === 'number' && handlePageChange(page)}
                            disabled={page === '...'}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <ui.Icons name="chevronRight" size={16} strokeWidth={3} />
                    </button>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className={`table-layout ${className}`}>
                <div className="table-loading">
                    <ui.Icons name="refresh" size={24} className="loading-spinner" />
                    <span>Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`table-layout ${className}`}>
            <div className="table-container">
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        className={`
                      ${column.align ? `text-${column.align}` : 'text-left'}
                      ${column.sortable && sortable ? 'sortable' : ''}
                      ${currentSort.key === column.key ? 'sorted' : ''}
                    `}
                                        style={{ width: column.width }}
                                        onClick={() => handleSort(column.key)}
                                    >
                                        <div className="th-content">
                                            <span>{column.label}</span>
                                            {column.sortable && sortable && (
                                                <div className="sort-icons">
                                                    <ui.Icons
                                                        name={
                                                            currentSort.key === column.key
                                                                ? currentSort.direction === "asc"
                                                                    ? "chevronUp"
                                                                    : "chevronDown"
                                                                : "chevronDown"
                                                        }
                                                        size={14}
                                                        strokeWidth={3}
                                                        className={`sort-icon ${currentSort.key === column.key ? 'active' : ''}`}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="empty-state">
                                        <div className="empty-content">
                                            <ui.Icons name="file" size={48} className="empty-icon" />
                                            <p>{emptyMessage}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                data.map((row, rowIndex) => (
                                    <tr
                                        key={rowIndex}
                                        className={onRowClick ? 'clickable' : ''}
                                        onClick={() => onRowClick?.(row, rowIndex)}
                                    >
                                        {columns.map((column) => (
                                            <td
                                                key={`${rowIndex}-${column.key}`}
                                                className={`
                                                    ${column.align ? `text-${column.align}` : 'text-left'} 
                                                    ${column.className || ''} 
                                                    ${column.key === 'action' || column.key === 'screenshot' ? 'action-column' : ''}
                                                `.trim()}
                                                style={column.style}
                                            >
                                                {renderCell(column, row, rowIndex)}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {renderPagination()}
        </div>
    );
};

export default TableLayout;