// src/components/FiltersBar.js
import React from 'react';

const FiltersBar = ({
  tasks,
  selectedPriority,
  setSelectedPriority,
  selectedStatus,
  setSelectedStatus,
  selectedDueDate,
  setSelectedDueDate,
  searchTerm,
  setSearchTerm,
  resetFilters
}) => {
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePriorityChange = (e) => {
    setSelectedPriority(e.target.value);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const handleDueDateChange = (e) => {
    setSelectedDueDate(e.target.value);
  };

  return (
    <div className="filters-bar">
      <div className="filter-wrapper">
        {/* Status filter */}
        <label htmlFor="status">Status:</label>
        <select id="status" className="filter-select" value={selectedStatus} onChange={handleStatusChange}>
          <option value="All">All</option>
          <option value="In Progress">In Progress</option>
          <option value="Past Due">Past Due</option>
        </select>
      </div>

      <div className="filter-wrapper">
        {/* Priority filter */}
        <label htmlFor="priority">Priority:</label>
        <select id="priority" className="filter-select" value={selectedPriority} onChange={handlePriorityChange}>
          <option value="All">All</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="filter-wrapper">
        {/* Due date filter */}
        <label htmlFor="due-date">Due Date:</label>
        <input type="date" id="due-date" className="filter-input" value={selectedDueDate} onChange={handleDueDateChange} />
      </div>

      <div className="filter-wrapper search-wrapper">
        {/* Search filter */}
        <label htmlFor="search">Search:</label>
        <input
          type="text"
          id="search"
          className="filter-input"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="clear-button">
        <button onClick={resetFilters}>Reset Filters</button>
      </div>
    </div>
  );
};

export default FiltersBar;
