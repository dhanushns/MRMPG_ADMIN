import React, { useState, useRef, useEffect, useCallback } from 'react';
import ui from '@/components/ui';
import './WeekPicker.scss';

export interface WeekRange {
  start: Date;
  end: Date;
  weekNumber: number;
  year: number;
}

export interface WeekPickerProps {
  id?: string;
  value?: WeekRange | null;
  onChange: (weekRange: WeekRange | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
  error?: string;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
  showToday?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'outline' | 'filled';
  clearable?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

const WeekPicker: React.FC<WeekPickerProps> = ({
  id,
  value,
  onChange,
  placeholder = "Select a week",
  disabled = false,
  className = "",
  style,
  label,
  error,
  required = false,
  minDate,
  maxDate,
  showToday = true,
  size = 'medium',
  variant = 'outline',
  clearable = true,
  onOpen,
  onClose
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedWeek, setSelectedWeek] = useState<WeekRange | null>(value || null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Update selected week when value prop changes
  useEffect(() => {
    setSelectedWeek(value || null);
  }, [value]);

  // Get week number for a date
  const getWeekNumber = useCallback((date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }, []);

  // Get start and end of week (Monday to Sunday)
  const getWeekRange = useCallback((date: Date): WeekRange => {
    const dayOfWeek = date.getDay();
    const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday
    
    const start = new Date(date);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    
    return {
      start,
      end,
      weekNumber: getWeekNumber(start),
      year: start.getFullYear()
    };
  }, [getWeekNumber]);

  // Get all weeks in current month
  const getWeeksInMonth = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // First day of month
    const firstDay = new Date(year, month, 1);
    // Last day of month
    const lastDay = new Date(year, month + 1, 0);
    
    const weeks: WeekRange[] = [];
    const seenWeeks = new Set<string>();
    
    // Start from the Monday of the week containing the first day
    let current = new Date(firstDay);
    const dayOfWeek = current.getDay();
    const diff = current.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    current.setDate(diff);
    
    // Generate weeks until we pass the last day of month
    while (current <= lastDay || current.getMonth() === month) {
      const weekRange = getWeekRange(current);
      const weekKey = `${weekRange.year}-${weekRange.weekNumber}`;
      
      // Only add weeks that overlap with the current month and haven't been added
      if (!seenWeeks.has(weekKey) && (
        (weekRange.start.getMonth() === month && weekRange.start.getFullYear() === year) ||
        (weekRange.end.getMonth() === month && weekRange.end.getFullYear() === year)
      )) {
        weeks.push(weekRange);
        seenWeeks.add(weekKey);
      }
      
      current.setDate(current.getDate() + 7);
      
      // Safety break to prevent infinite loop
      if (weeks.length > 6) break;
    }
    
    return weeks;
  }, [getWeekRange]);

  // Check if date is within allowed range
  const isDateAllowed = useCallback((date: Date): boolean => {
    if (minDate && date < minDate) return false;
    if (maxDate && date > maxDate) return false;
    return true;
  }, [minDate, maxDate]);

  // Format week range for display
  const formatWeekRange = useCallback((weekRange: WeekRange): string => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric'
    };
    
    const startStr = weekRange.start.toLocaleDateString('en-US', options);
    const endStr = weekRange.end.toLocaleDateString('en-US', options);
    
    return `${startStr} - ${endStr}, ${weekRange.year}`;
  }, []);

  // Handle week selection
  const handleWeekSelect = useCallback((weekRange: WeekRange) => {
    if (!isDateAllowed(weekRange.start) || !isDateAllowed(weekRange.end)) return;
    
    setSelectedWeek(weekRange);
    onChange(weekRange);
    setIsOpen(false);
    onClose?.();
  }, [isDateAllowed, onChange, onClose]);

  // Handle clear selection
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedWeek(null);
    onChange(null);
  }, [onChange]);

  // Handle input click
  const handleInputClick = useCallback(() => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      onOpen?.();
    } else {
      onClose?.();
    }
  }, [disabled, isOpen, onOpen, onClose]);

  // Handle month navigation
  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  }, []);

  // Handle today selection
  const handleToday = useCallback(() => {
    const today = new Date();
    const todayWeek = getWeekRange(today);
    setCurrentMonth(today);
    handleWeekSelect(todayWeek);
  }, [getWeekRange, handleWeekSelect]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Generate calendar weeks
  const weeks = getWeeksInMonth(currentMonth);
  const today = new Date();
  const currentWeek = getWeekRange(today);

  // Get month/year display
  const monthYear = currentMonth.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  const containerClasses = [
    'week-picker',
    `week-picker--${size}`,
    `week-picker--${variant}`,
    disabled && 'week-picker--disabled',
    error && 'week-picker--error',
    isOpen && 'week-picker--open',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} style={style} ref={containerRef}>
      {label && (
        <label htmlFor={id} className="week-picker__label">
          {label}
          {required && <span className="week-picker__required">*</span>}
        </label>
      )}
      
      <div className="week-picker__input-wrapper">
        <div className="week-picker__input-container" onClick={handleInputClick}>
          <div className="week-picker__input-content">
            <ui.Icons name="calendar" className="week-picker__input-icon" />
            <span className={`week-picker__input-text ${!selectedWeek ? 'week-picker__placeholder' : ''}`}>
              {selectedWeek ? formatWeekRange(selectedWeek) : placeholder}
            </span>
          </div>
          
          <div className="week-picker__actions">
            {clearable && selectedWeek && !disabled && (
              <button
                type="button"
                className="week-picker__clear-btn"
                onClick={handleClear}
                aria-label="Clear selection"
              >
                <ui.Icons name="x" size={14} />
              </button>
            )}
            <ui.Icons 
              name={isOpen ? "chevronUp" : "chevronDown"} 
              className="week-picker__chevron" 
              size={16}
            />
          </div>
        </div>

        {isOpen && (
          <div className="week-picker__dropdown">
            <div className="week-picker__dropdown-header">
              <div className="week-picker__month-navigation">
                <button
                  type="button"
                  className="week-picker__nav-btn"
                  onClick={() => navigateMonth('prev')}
                  aria-label="Previous month"
                >
                  <ui.Icons name="chevronLeft" size={18} />
                </button>
                
                <h3 className="week-picker__month-title">{monthYear}</h3>
                
                <button
                  type="button"
                  className="week-picker__nav-btn"
                  onClick={() => navigateMonth('next')}
                  aria-label="Next month"
                >
                  <ui.Icons name="chevronRight" size={18} />
                </button>
              </div>

              {showToday && (
                <button
                  type="button"
                  className="week-picker__today-btn"
                  onClick={handleToday}
                >
                  <ui.Icons name="target" size={14} />
                  Current Week
                </button>
              )}
            </div>

            <div className="week-picker__calendar-container">
              <div className="week-picker__weekdays">
                <div className="week-picker__weekday week-picker__week-col">W</div>
                <div className="week-picker__weekday">Mon</div>
                <div className="week-picker__weekday">Tue</div>
                <div className="week-picker__weekday">Wed</div>
                <div className="week-picker__weekday">Thu</div>
                <div className="week-picker__weekday">Fri</div>
                <div className="week-picker__weekday">Sat</div>
                <div className="week-picker__weekday">Sun</div>
              </div>

              <div className="week-picker__weeks-container">
                {weeks.map((week) => {
                  const isSelected = selectedWeek && 
                    selectedWeek.weekNumber === week.weekNumber && 
                    selectedWeek.year === week.year;
                  const isCurrentWeek = week.weekNumber === currentWeek.weekNumber && 
                    week.year === currentWeek.year;
                  const isDisabled = !isDateAllowed(week.start) || !isDateAllowed(week.end);

                  return (
                    <div
                      key={`${week.year}-${week.weekNumber}`}
                      className={[
                        'week-picker__week-row',
                        isSelected && 'week-picker__week-row--selected',
                        isCurrentWeek && 'week-picker__week-row--current',
                        isDisabled && 'week-picker__week-row--disabled'
                      ].filter(Boolean).join(' ')}
                      onClick={() => handleWeekSelect(week)}
                    >
                      <div className="week-picker__week-number-cell">
                        <span className="week-picker__week-num">{week.weekNumber}</span>
                      </div>
                      
                      {Array.from({ length: 7 }, (_, dayIndex) => {
                        const date = new Date(week.start);
                        date.setDate(week.start.getDate() + dayIndex);
                        const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                        const isToday = date.toDateString() === today.toDateString();
                        
                        return (
                          <div 
                            key={dayIndex}
                            className={[
                              'week-picker__day-cell',
                              !isCurrentMonth && 'week-picker__day-cell--other-month',
                              isToday && 'week-picker__day-cell--today'
                            ].filter(Boolean).join(' ')}
                          >
                            {date.getDate()}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="week-picker__footer">
              <span className="week-picker__footer-text">
                {selectedWeek ? `Week ${selectedWeek.weekNumber}, ${selectedWeek.year}` : 'No week selected'}
              </span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="week-picker__error-message">
          <ui.Icons name="alertTriangle" size={14} />
          {error}
        </div>
      )}
    </div>
  );
};

export default WeekPicker;
