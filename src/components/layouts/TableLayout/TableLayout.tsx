import React, { useState, useMemo } from "react";
import "./TableLayout.scss";
import ui from "@/components/ui";
import type { types } from "@/types";

type SortState = {
    key: string | null;
    direction: "asc" | "desc";
};

const TableLayout: React.FC<types["TableLayoutProps"]> = ({
    columns,
    data,
    loading = false,
    pagination = true,
    pageSize = 10,
    sortable = true,
    className = "",
    onRowClick,
    onSort,
    emptyMessage = "No data available"
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortState, setSortState] = useState<SortState>({ key: null, direction: "asc" });

    const sortedData = useMemo(() => {
        if (!sortState.key) return data;

        return [...data].sort((a, b) => {
            const aValue = a[sortState.key!];
            const bValue = b[sortState.key!];

            if (typeof aValue === "string" && typeof bValue === "string") {
                const comparison = aValue.localeCompare(bValue);
                return sortState.direction === "asc" ? comparison : -comparison;
            }

            if (typeof aValue === "number" && typeof bValue === "number") {
                if (aValue < bValue) return sortState.direction === "asc" ? -1 : 1;
                if (aValue > bValue) return sortState.direction === "asc" ? 1 : -1;
                return 0;
            }

            // Convert to string for comparison as fallback
            const aString = String(aValue || "");
            const bString = String(bValue || "");
            const comparison = aString.localeCompare(bString);
            return sortState.direction === "asc" ? comparison : -comparison;
        });
    }, [data, sortState]);

    const paginatedData = useMemo(() => {
        if (!pagination) return sortedData;

        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return sortedData.slice(startIndex, endIndex);
    }, [sortedData, currentPage, pageSize, pagination]);

    const totalPages = Math.ceil(sortedData.length / pageSize);

    const handleSort = (columnKey: string) => {
        if (!sortable) return;

        const column = columns.find(col => col.key === columnKey);
        if (!column?.sortable) return;

        const newDirection =
            sortState.key === columnKey && sortState.direction === "asc"
                ? "desc"
                : "asc";

        setSortState({ key: columnKey, direction: newDirection });
        onSort?.(columnKey, newDirection);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
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
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
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
                      ${sortState.key === column.key ? 'sorted' : ''}
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
                                                            sortState.key === column.key
                                                                ? sortState.direction === "asc"
                                                                    ? "chevronUp"
                                                                    : "chevronDown"
                                                                : "chevronDown"
                                                        }
                                                        size={14}
                                                        strokeWidth={3}
                                                        className={`sort-icon ${sortState.key === column.key ? 'active' : ''
                                                            }`}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="empty-state">
                                        <div className="empty-content">
                                            <ui.Icons name="file" size={48} className="empty-icon" />
                                            <p>{emptyMessage}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((row, rowIndex) => (
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