import React, { useState, useCallback } from "react";
import type { types } from "@/types";
import ui from "@/components/ui";
import "./FilterLayout.scss";

type FilterValue = string | string[] | number | boolean | Date | { start: string; end: string } | null;

const FilterLayout = ({
    title,
    filters,
    layout = "grid",
    columns = 1,
    spacing = "medium",
    showResetButton = false,
    showApplyButton = false,
    onApply,
    onReset,
    className = "",
    collapsible = false,
    defaultCollapsed = false,
    downloadReport = false
}: types["FilterLayoutProps"]): React.ReactElement => {
    const [filterValues, setFilterValues] = useState<Record<string, FilterValue>>(() => {
        const initialValues: Record<string, FilterValue> = {};
        filters.forEach(filter => {
            initialValues[filter.id] = filter.defaultValue || null;
        });
        return initialValues;
    });

    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleFilterChange = useCallback((id: string, value: FilterValue) => {
        setFilterValues(prev => ({ ...prev, [id]: value }));

        if (errors[id]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[id];
                return newErrors;
            });
        }
        const filter = filters.find(f => f.id === id);
        if (filter?.onChange) {
            filter.onChange(id, value);
        }
    }, [filters, errors]);

    const validateFilters = useCallback(() => {
        const newErrors: Record<string, string> = {};

        filters.forEach(filter => {
            const value = filterValues[filter.id];

            if (filter.required && (!value || (Array.isArray(value) && value.length === 0))) {
                newErrors[filter.id] = `${filter.label || filter.id} is required`;
                return;
            }

            if (filter.validation && value) {
                const error = filter.validation(value);
                if (error) {
                    newErrors[filter.id] = error;
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [filters, filterValues]);

    const handleApply = useCallback(() => {
        if (validateFilters()) {
            onApply?.(filterValues);
        }
    }, [validateFilters, onApply, filterValues]);

    const handleReset = useCallback(() => {
        const resetValues: Record<string, FilterValue> = {};
        filters.forEach(filter => {
            resetValues[filter.id] = filter.defaultValue || null;
        });
        setFilterValues(resetValues);
        setErrors({});
        onReset?.();
    }, [filters, onReset]);

    const renderFilterItem = (filter: types["FilterItemProps"]) => {
        const value = filterValues[filter.id];
        const error = errors[filter.id];

        const getGridSpan = () => {
            if (filter.fullWidth) return columns;
            if (filter.gridSpan) return Math.min(filter.gridSpan, columns);
            return 1;
        };

        const gridSpan = layout === "grid" ? getGridSpan() : 1;

        // For responsive grids, ensure full-width items span correctly at different breakpoints
        const getResponsiveGridSpan = () => {
            if (filter.fullWidth) return "1 / -1"; // Always span full width
            return `span ${gridSpan}`;
        };

        const itemStyle = layout === "grid" ? {
            gridColumn: getResponsiveGridSpan()
        } : {};

        switch (filter.type) {
            case "text":
            case "search":
                return (
                    <div key={filter.id} className="filter-item" style={itemStyle}>
                        {filter.label && <ui.Label>{filter.label}</ui.Label>}
                        <ui.Search
                            id={filter.id}
                            value={(value as string) || ""}
                            placeholder={filter.placeholder}
                            disabled={filter.disabled}
                            className={filter.className}
                            style={filter.style}
                            onChange={(val) => handleFilterChange(filter.id, val)}
                        />
                        {error && <span className="filter-error">{error}</span>}
                    </div>
                );

            case "number":
                return (
                    <div key={filter.id} className="filter-item" style={itemStyle}>
                        {filter.label && <ui.Label>{filter.label}</ui.Label>}
                        <ui.NumberInput
                            id={filter.id}
                            value={(value as number) || 0}
                            placeholder={filter.placeholder}
                            disabled={filter.disabled}
                            className={filter.className}
                            style={filter.style}
                            min={filter.min as number}
                            max={filter.max as number}
                            step={filter.step}
                            onChange={(val) => handleFilterChange(filter.id, val)}
                        />
                        {error && <span className="filter-error">{error}</span>}
                    </div>
                );

            case "date":
                return (
                    <div key={filter.id} className="filter-item" style={itemStyle}>
                        {filter.label && <ui.Label>{filter.label}</ui.Label>}
                        <ui.DateInput
                            id={filter.id}
                            value={(value as string) || ""}
                            disabled={filter.disabled}
                            className={filter.className}
                            style={filter.style}
                            min={filter.min as string}
                            max={filter.max as string}
                            onChange={(val) => handleFilterChange(filter.id, val)}
                        />
                        {error && <span className="filter-error">{error}</span>}
                    </div>
                );

            case "dateRange": {
                const dateRangeValue = value as { start: string; end: string } | null;
                return (
                    <div key={filter.id} className="filter-item filter-item--date-range" style={itemStyle}>
                        {filter.label && <ui.Label>{filter.label}</ui.Label>}
                        <div className="date-range-inputs">
                            <ui.DateInput
                                id={`${filter.id}-start`}
                                value={dateRangeValue?.start || ""}
                                disabled={filter.disabled}
                                className={`${filter.className || ""} date-range-start`}
                                min={filter.min as string}
                                max={dateRangeValue?.end || filter.max as string}
                                onChange={(startDate) => {
                                    const newValue = {
                                        start: startDate,
                                        end: dateRangeValue?.end || ""
                                    };
                                    handleFilterChange(filter.id, newValue);
                                }}
                            />
                            <span className="date-range-separator">to</span>
                            <ui.DateInput
                                id={`${filter.id}-end`}
                                value={dateRangeValue?.end || ""}
                                disabled={filter.disabled}
                                className={`${filter.className || ""} date-range-end`}
                                min={dateRangeValue?.start || filter.min as string}
                                max={filter.max as string}
                                onChange={(endDate) => {
                                    const newValue = {
                                        start: dateRangeValue?.start || "",
                                        end: endDate
                                    };
                                    handleFilterChange(filter.id, newValue);
                                }}
                            />
                        </div>
                        {error && <span className="filter-error">{error}</span>}
                    </div>
                );
            }

            case "select":
                return (
                    <div key={filter.id} className="filter-item" style={itemStyle}>
                        {filter.label && <ui.Label>{filter.label}</ui.Label>}
                        <ui.Select
                            id={filter.id}
                            value={(value as string) || ""}
                            placeholder={filter.placeholder}
                            options={filter.options || []}
                            disabled={filter.disabled}
                            className={filter.className}
                            style={filter.style}
                            onChange={(val) => handleFilterChange(filter.id, val)}
                            onFocus={filter.onFocus}
                            onBlur={filter.onBlur}
                            searchable={filter.searchable}
                            variant={(filter.variant === "native" || filter.variant === "custom") ? filter.variant : "custom"}
                        />
                        {error && <span className="filter-error">{error}</span>}
                    </div>
                );

            case "multiSelect":
                return (
                    <div key={filter.id} className="filter-item" style={itemStyle}>
                        {filter.label && <ui.Label>{filter.label}</ui.Label>}
                        <ui.MultiSelect
                            id={filter.id}
                            value={(value as string[]) || []}
                            options={filter.options || []}
                            disabled={filter.disabled}
                            className={filter.className}
                            style={filter.style}
                            onChange={(val: string[]) => handleFilterChange(filter.id, val)}
                            onFocus={filter.onFocus}
                            onBlur={filter.onBlur}
                            variant={(filter.variant === "list" || filter.variant === "dropdown") ? filter.variant : "dropdown"}
                            placeholder={filter.placeholder}
                            searchable={filter.searchable}
                            maxDisplayItems={filter.maxDisplayItems}
                            showSelectAll={filter.showSelectAll}
                        />
                        {error && <span className="filter-error">{error}</span>}
                    </div>
                );

            case "checkbox":
                return (
                    <div key={filter.id} className="filter-item" style={itemStyle}>
                        <ui.Checkbox
                            id={filter.id}
                            checked={(value as boolean) || false}
                            label={filter.label}
                            disabled={filter.disabled}
                            className={filter.className}
                            style={filter.style}
                            onChange={(val) => handleFilterChange(filter.id, val)}
                        />
                        {error && <span className="filter-error">{error}</span>}
                    </div>
                );

            case "radio":
                return (
                    <div key={filter.id} className="filter-item" style={itemStyle}>
                        {filter.label && <ui.Label>{filter.label}</ui.Label>}
                        <ui.Radio
                            id={filter.id}
                            value={(value as string) || ""}
                            options={filter.options || []}
                            disabled={filter.disabled}
                            className={filter.className}
                            style={filter.style}
                            onChange={(val) => handleFilterChange(filter.id, val)}
                        />
                        {error && <span className="filter-error">{error}</span>}
                    </div>
                );

            default:
                return null;
        }
    };

    const layoutClass = `filter-layout--${layout}`;
    const spacingClass = `filter-layout--spacing-${spacing}`;

    // Calculate responsive column counts based on original columns
    const getResponsiveColumns = (originalColumns: number) => {
        let lg, md, sm;

        switch (originalColumns) {
            case 1:
            case 2:
                lg = originalColumns;
                md = originalColumns;
                sm = originalColumns === 2 ? 2 : 1;
                break;
            case 3:
                lg = 3;
                md = 2;
                sm = 2;
                break;
            case 4:
                lg = 3;
                md = 2;
                sm = 2;
                break;
            case 5:
            case 6:
                lg = 4;
                md = 3;
                sm = 2;
                break;
            default:
                lg = Math.min(originalColumns, 4);
                md = Math.min(originalColumns, 3);
                sm = 2;
        }

        return { lg, md, sm };
    };

    const responsiveCols = getResponsiveColumns(columns);

    const gridStyle = layout === "grid" ? {
        "--columns": columns,
        "--columns-lg": responsiveCols.lg,
        "--columns-md": responsiveCols.md,
        "--columns-sm": responsiveCols.sm
    } as React.CSSProperties : {};

    return (
        <div className={`filter-layout ${layoutClass} ${spacingClass} ${className}`} style={gridStyle}>
            {(title || collapsible) && (
                <div className="filter-layout__header">
                    {title && <h3 className="filter-layout__title">{title}</h3>}
                    {collapsible && (
                        <>
                            <ui.Button type="button" variant="secondary" className="filter-layout__toggle" onClick={() => setIsCollapsed(!isCollapsed)}
                                aria-expanded={!isCollapsed}>
                                <div className="toggle-text">
                                    {isCollapsed ? "Show Filters" : "Hide Filters"}
                                </div>
                                <div className={`toggle-icon ${isCollapsed ? "collapsed" : ""}`}>
                                    <ui.Icons name="chevronDown" strokeWidth={3} />
                                </div>
                            </ui.Button>
                        </>
                    )}
                </div>
            )}

            {(!collapsible || !isCollapsed) && (
                <>
                    <div className="filter-layout__content">
                        {filters.map(renderFilterItem)}
                    </div>

                    {(showResetButton || showApplyButton) && (
                        <div className="filter-layout__actions">
                            {showResetButton && (
                                <ui.Button type="button" variant="outline" className="filter-button" onClick={handleReset}>
                                    Reset
                                </ui.Button>
                            )}
                            {showApplyButton && (
                                <ui.Button type="button" variant="secondary" className="filter-button" onClick={handleApply}>
                                    Apply Filters
                                </ui.Button>
                            )}
                        </div>
                    )}
                </>
            )}
            {downloadReport && (
                <div className="filter-layout__footer">
                    <ui.Button type="button" variant="primary" className="filter-button filter-button__download-report" rightIcon={<ui.Icons name="download" />}>
                        Download Report
                    </ui.Button>
                </div>
            )}
        </div>
    );
};

export default FilterLayout;