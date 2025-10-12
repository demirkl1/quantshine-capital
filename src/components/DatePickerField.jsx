import React, { useState, useRef } from "react";
import "./DatePickerField.css";

const DatePickerField = ({ selected, onChange, placeholder }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(selected || new Date());
  const calendarRef = useRef();

  const toggleCalendar = () => setShowCalendar(!showCalendar);

  const handleDateClick = (day) => {
    const newDate = new Date(currentDate);
    newDate.setDate(day);
    setCurrentDate(newDate);
    onChange(newDate);
    setShowCalendar(false);
  };

  const handleMonthChange = (e) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(parseInt(e.target.value));
    setCurrentDate(newDate);
  };

  const handleYearChange = (e) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(parseInt(e.target.value));
    setCurrentDate(newDate);
  };

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

  const months = [
    "Ocak","Şubat","Mart","Nisan","Mayıs","Haziran",
    "Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"
  ];

  const years = [];
  const currentYear = new Date().getFullYear();
  for(let i = currentYear - 100; i <= currentYear; i++) years.push(i);

  const days = [];
  const numDays = daysInMonth(currentDate.getMonth(), currentDate.getFullYear());
  for(let i=1;i<=numDays;i++) days.push(i);

  return (
    <div className="custom-datepicker" ref={calendarRef}>
      <div className="datepicker-input" onClick={toggleCalendar}>
        <input 
          type="text"
          readOnly
          value={selected ? selected.toLocaleDateString("tr-TR") : ""}
          placeholder={placeholder}
        />
        <span className="calendar-icon">📅</span>
      </div>

      {showCalendar && (
        <div className="calendar-popup">
          <div className="calendar-header">
            <select value={currentDate.getMonth()} onChange={handleMonthChange}>
              {months.map((m, idx) => <option key={idx} value={idx}>{m}</option>)}
            </select>
            <select value={currentDate.getFullYear()} onChange={handleYearChange}>
              {years.map((y, idx) => <option key={idx} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="calendar-days">
            {days.map((day) => (
              <div
                key={day}
                className={`calendar-day ${currentDate.getDate() === day ? "selected" : ""}`}
                onClick={() => handleDateClick(day)}
              >
                {day}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePickerField;
