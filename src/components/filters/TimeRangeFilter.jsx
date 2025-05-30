// Adding necessary React hooks for component state management
import React, { useState, useEffect } from 'react';
// Adding icons for UI elements
import { FiCalendar, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
// Adding date picker component and utilities
import DatePicker from 'react-datepicker';
// Adding date manipulation utilities
import { format, subHours, subDays, startOfDay, endOfDay, isValid, isAfter } from 'date-fns';
// Adding date picker styles
import "react-datepicker/dist/react-datepicker.css";
// Adding toast notifications for user feedback
import { toast } from 'react-toastify';

// Adding predefined quick range options for common time selections
const QUICK_RANGES = [
  { label: 'Last Hour', getValue: () => ({ start: subHours(new Date(), 1), end: new Date() }) },
  { label: 'Last 24 Hours', getValue: () => ({ start: subHours(new Date(), 24), end: new Date() }) },
  { label: 'Today', getValue: () => ({ start: startOfDay(new Date()), end: endOfDay(new Date()) }) },
  { label: 'Yesterday', getValue: () => ({ start: startOfDay(subDays(new Date(), 1)), end: endOfDay(subDays(new Date(), 1)) }) },
  { label: 'Last 7 Days', getValue: () => ({ start: subDays(new Date(), 7), end: new Date() }) }
];

// Adding main TimeRangeFilter component
const TimeRangeFilter = ({ filters, onFilterChange, isOpen, onClose }) => {
   // Adding state management for date selections
  const [startDate, setStartDate] = useState(filters.startTime ? new Date(filters.startTime) : null);
  const [endDate, setEndDate] = useState(filters.endTime ? new Date(filters.endTime) : null);
  // Adding state for tracking active input field
  const [activeInput, setActiveInput] = useState(null); // 'startDate', 'startTime', 'endDate', 'endTime'

  // Adding states for calendar navigation
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Adding state for custom time selection
  const [customTime, setCustomTime] = useState({
    start: { hours: '12', minutes: '00', period: 'AM' },
    end: { hours: '11', minutes: '59', period: 'PM' }
  });

  // Helper to format time for display
  const handleTimeSelect = (hour, minute, isStart) => {
    const targetDate = isStart ? startDate : endDate;
    if (targetDate) {
      const newDate = new Date(targetDate);
      newDate.setHours(hour, minute, 0, 0);
      if (isStart) {
        setStartDate(newDate);
      } else {
        setEndDate(newDate);
      }
    }
  };

  // Adding handler for quick range selection
  const handleQuickRangeSelect = (range) => {
    const { start, end } = range.getValue();
    setStartDate(start);
    setEndDate(end);
  };

  // Adding time range validation helper
  const validateTimeRange = (start, end) => {
    if (!start || !end) {
      toast.error('Please select both start and end times');
      return false;
    }

    if (!isValid(start) || !isValid(end)) {
      toast.error('Invalid date/time selected');
      return false;
    }

    if (isAfter(start, end)) {
      toast.error('Start time cannot be after end time');
      return false;
    }

    return true;
  };

  // Adding handler for time changes
  const handleTimeChange = (type, field, value) => {
    const updatedTime = {
      ...customTime[type],
      [field]: value
    };
    
    setCustomTime(prev => ({
      ...prev,
      [type]: updatedTime
    }));

    const targetDate = type === 'start' ? startDate : endDate;
    if (targetDate) {
      try {
        let hours = parseInt(updatedTime.hours);
        const minutes = parseInt(updatedTime.minutes);

        // Convert to 24-hour format
        if (updatedTime.period === 'PM' && hours !== 12) hours += 12;
        if (updatedTime.period === 'AM' && hours === 12) hours = 0;

        const newDate = new Date(targetDate);
        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        newDate.setSeconds(0);
        newDate.setMilliseconds(0);

        if (type === 'start') {
          setStartDate(newDate);
        } else {
          setEndDate(newDate);
        }
      } catch (error) {
        console.error('Time update error:', error);
        toast.error('Invalid time format');
      }
    }
  };

  // Adding effect to initialize start time when date changes
  useEffect(() => {
    if (startDate) {
      const hours = startDate.getHours();
      const minutes = startDate.getMinutes();
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;

      setCustomTime(prev => ({
        ...prev,
        start: {
          hours: displayHours.toString().padStart(2, '0'),
          minutes: minutes.toString().padStart(2, '0'),
          period
        }
      }));
    }
  }, [startDate]);

  // Adding effect to initialize end time when date changes
  useEffect(() => {
    if (endDate) {
      const hours = endDate.getHours();
      const minutes = endDate.getMinutes();
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;

      setCustomTime(prev => ({
        ...prev,
        end: {
          hours: displayHours.toString().padStart(2, '0'),
          minutes: minutes.toString().padStart(2, '0'),
          period
        }
      }));
    }
  }, [endDate]);

  // Adding custom time input component
  const CustomTimeInput = ({ type }) => {
    const time = customTime[type];
    
    return (
      <div className="flex items-center space-x-2">
        <select
          value={time.hours}
          onChange={(e) => handleTimeChange(type, 'hours', e.target.value)}
          className="w-16 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(hour => (
            <option key={hour} value={hour}>{hour}</option>
          ))}
        </select>

        <span className="text-gray-500">:</span>

        <select
          value={time.minutes}
          onChange={(e) => handleTimeChange(type, 'minutes', e.target.value)}
          className="w-16 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map(minute => (
            <option key={minute} value={minute}>{minute}</option>
          ))}
        </select>

        <select
          value={time.period}
          onChange={(e) => handleTimeChange(type, 'period', e.target.value)}
          className="w-20 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    );
  };

  // Adding handler for applying selected time range
  const handleApply = () => {
    if (!validateTimeRange(startDate, endDate)) {
      return;
    }

    onFilterChange({
      ...filters,
      startTime: startDate?.toISOString() || '',
      endTime: endDate?.toISOString() || ''
    });
    onClose();
  };

  // Adding helper for generating year range options
  const getYearRange = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);
  };

  // Adding month names for month picker
  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Adding custom header component for DatePicker
  const CustomHeader = ({
    date,
    changeYear,
    changeMonth,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
  }) => (
    <div className="flex items-center justify-between px-2 py-2">
      <button
        onClick={decreaseMonth}
        disabled={prevMonthButtonDisabled}
        type="button"
        className={`p-1 rounded-lg hover:bg-gray-100 ${
          prevMonthButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <FiChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex space-x-2">
        <button
          onClick={() => setShowMonthPicker(true)}
          className="text-sm font-medium hover:bg-gray-100 px-2 py-1 rounded-lg"
        >
          {format(date, 'MMMM')}
        </button>
        <button
          onClick={() => setShowYearPicker(true)}
          className="text-sm font-medium hover:bg-gray-100 px-2 py-1 rounded-lg"
        >
          {format(date, 'yyyy')}
        </button>
      </div>

      <button
        onClick={increaseMonth}
        disabled={nextMonthButtonDisabled}
        type="button"
        className={`p-1 rounded-lg hover:bg-gray-100 ${
          nextMonthButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <FiChevronRight className="w-4 h-4" />
      </button>

      {/* Year Picker Overlay */}
      {showYearPicker && (
        <div className="absolute top-0 left-0 w-full bg-white shadow-lg rounded-lg border border-gray-200 p-2 z-30">
          <div className="flex justify-between items-center mb-2 px-2">
            <h4 className="text-sm font-medium">Select Year</h4>
            <button
              onClick={() => setShowYearPicker(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1 max-h-48 overflow-y-auto">
            {getYearRange().map((year) => (
              <button
                key={year}
                onClick={() => {
                  changeYear(year);
                  setShowYearPicker(false);
                }}
                className={`px-2 py-1 text-sm rounded-lg ${
                  year === date.getFullYear()
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Month Picker Overlay */}
      {showMonthPicker && (
        <div className="absolute top-0 left-0 w-full bg-white shadow-lg rounded-lg border border-gray-200 p-2 z-30">
          <div className="flex justify-between items-center mb-2 px-2">
            <h4 className="text-sm font-medium">Select Month</h4>
            <button
              onClick={() => setShowMonthPicker(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {MONTHS.map((month, index) => (
              <button
                key={month}
                onClick={() => {
                  changeMonth(index);
                  setShowMonthPicker(false);
                }}
                className={`px-2 py-1 text-sm rounded-lg ${
                  index === date.getMonth()
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                {month}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Adding conditional render for closed state
  if (!isOpen) return null;

  // Adding main component render
  return (
    <div className="absolute mt-2 w-[480px] bg-white rounded-lg shadow-xl border border-gray-100 p-4 z-20">
      {/* Adding header section */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-gray-700">Select Time Range</h4>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
          <FiX className="w-4 h-4" />
        </button>
      </div>

      {/* Adding quick range selection buttons */}
      <div className="mb-4 flex flex-wrap gap-2">
        {QUICK_RANGES.map((range, index) => (
          <button
            key={index}
            onClick={() => handleQuickRangeSelect(range)}
            className="px-3 py-1.5 text-xs font-medium rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Adding date and time selection grid */}
      <div className="grid grid-cols-2 gap-6 mb-4">
        {/* Adding start date/time section */}
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-gray-700">Start</h5>
          
          {/* Date Selection */}
          <div 
            className={`p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
              activeInput === 'startDate' ? 'ring-2 ring-blue-500 bg-white' : ''
            }`}
            onClick={() => setActiveInput(activeInput === 'startDate' ? null : 'startDate')}
          >
            <p className="text-xs text-gray-500 mb-1">Date</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {startDate ? format(startDate, 'MMM d, yyyy') : 'Select date'}
              </span>
              <FiCalendar className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Time Selection */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-2">Time</p>
            <CustomTimeInput type="start" />
          </div>
        </div>

        {/* End Date/Time */}
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-gray-700">End</h5>
          
          {/* Date Selection */}
          <div 
            className={`p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
              activeInput === 'endDate' ? 'ring-2 ring-blue-500 bg-white' : ''
            }`}
            onClick={() => setActiveInput(activeInput === 'endDate' ? null : 'endDate')}
          >
            <p className="text-xs text-gray-500 mb-1">Date</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {endDate ? format(endDate, 'MMM d, yyyy') : 'Select date'}
              </span>
              <FiCalendar className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Time Selection */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-2">Time</p>
            <CustomTimeInput type="end" />
          </div>
        </div>
      </div>

      {/* Adding calendar or time picker based on active input */}
      {activeInput && (
        <div className="border-t border-gray-100 pt-4 mb-4">
          {activeInput.endsWith('Date') ? (
            <DatePicker
              selected={activeInput === 'startDate' ? startDate : endDate}
              onChange={(date) => {
                if (activeInput === 'startDate') {
                  setStartDate(date);
                } else {
                  setEndDate(date);
                }
                setActiveInput(null);
              }}
              inline
              renderCustomHeader={CustomHeader}
              calendarClassName="!border-0"
              dayClassName={() => 
                'hover:bg-blue-50 rounded-lg transition-colors'
              }
              monthClassName={() => 'font-medium'}
              weekDayClassName={() => 'text-gray-400 font-medium'}
            />
          ) : (
            <div className="p-2">
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 24 }).map((_, hour) => (
                  <button
                    key={hour}
                    onClick={() => {
                      handleTimeSelect(hour, 0, activeInput === 'startTime');
                      setActiveInput(null);
                    }}
                    className="px-3 py-2 text-sm rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    {format(new Date().setHours(hour), 'HH:mm')}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Adding action buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button
          onClick={() => {
            setStartDate(null);
            setEndDate(null);
            setActiveInput(null);
          }}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          Clear
        </button>
        <div className="space-x-2">
          <button
            onClick={() => {
              setActiveInput(null);
              onClose();
            }}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              handleApply();
              setActiveInput(null);
            }}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            disabled={!startDate || !endDate}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeRangeFilter; 