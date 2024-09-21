// src/pages/Home.js
import { useEffect, useState } from "react";
import { useTasksContext } from "../../hooks/useTasksContext";
import '../../css/Home.css'; // Import your CSS file
import TaskItem from "../TaskItem";
import { useAuthContext } from '../../hooks/useAuthContext'; 
import moment from 'moment-timezone';
import FiltersBar from "../FiltersBar";
import TaskDetailPanel from "../TaskDetailPanel";
import { useRef } from 'react'; // Import useRef

const Home = () => {
  const { tasks, dispatch } = useTasksContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDueDate, setSelectedDueDate] = useState("");
  const { user } = useAuthContext();
  const [checkedTasks, setCheckedTasks] = useState({}); // Track checked status of individual tasks
  const [isAnyChecked, setIsAnyChecked] = useState(false); // Track if any checkbox is checked
  const [mainCheckboxChecked, setMainCheckboxChecked] = useState(false); // Track main checkbox state
  const [selectedTask, setSelectedTask] = useState(null);  // State for the selected task
  const [showInput, setShowInput] = useState(false); // State to manage visibility of input
  const inputRef = useRef(null); // Reference to the input field

  
  // Function to handle creating a new task
  const handleCreateTask = async (title) => {
    // Replace this with your actual task creation logic, e.g., an API call
    const newTask = {
      title,
      date: new Date(),
      description: '',
      priority: 'LOW', // Default priority, adjust as needed
      status: 'TODO',
      createdBy: user._id, // Replace with the actual user ID from context
    };

    // Simulate dispatching the new task to the context (or make an API call)
    dispatch({ type: 'CREATE_TASK', payload: newTask });

    // Reset input and hide input field
    setShowInput(false);
    inputRef.current.value = '';
  };

  // Handle button click to show input field
  const handleAddButtonClick = () => {
    setShowInput(true);
    setTimeout(() => inputRef.current.focus(), 0); // Focus the input field after it's displayed
  };

  // Handle key press in the input field
  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && inputRef.current.value.trim() !== '') {
      handleCreateTask(inputRef.current.value.trim());
    }
  };

  // Function to handle selecting a task
  const handleTaskClick = (task) => {
    setSelectedTask(task);  // Set the clicked task as the selected task
  };

  // Function to close the detail panel
  const closeTaskDetailPanel = () => {
    setSelectedTask(null);  // Deselect the task (close the panel)
  };


  // Handle main checkbox change
  const handleMainCheckboxChange = (event) => {
    const isChecked = event.target.checked;
    setMainCheckboxChecked(isChecked);

    // Update all tasks' check state when main checkbox is toggled
    const updatedCheckedTasks = {};
    tasks.forEach(task => {
      updatedCheckedTasks[task._id] = isChecked;
    });
    setCheckedTasks(updatedCheckedTasks);

    // Check if any tasks are now checked
    setIsAnyChecked(isChecked);
  };

  // Handle individual task checkbox state changes
  const handleTaskCheckboxChange = (taskId, isChecked) => {
    setCheckedTasks(prevChecked => {
      const updatedChecked = { ...prevChecked, [taskId]: isChecked };

      // Check if at least one checkbox is checked
      const anyChecked = Object.values(updatedChecked).some(checked => checked);
      setIsAnyChecked(anyChecked);

      return updatedChecked;
    });
  };


  const filterTasks = (taskList) => {
    return (taskList || []).filter(task => {
      const statusMatch = selectedStatus === 'All' || task.status === selectedStatus;
      const priorityMatch = selectedPriority === 'All' || task.priority.toLowerCase() === selectedPriority.toLowerCase();
      const dueDateMatch = !selectedDueDate || moment.utc(task.date).tz('America/Los_Angeles').format('YYYY-MM-DD') === selectedDueDate;
      const searchMatch = !searchTerm || task.title.toLowerCase().includes(searchTerm.toLowerCase());
      const notCompleted = !task.completed; // Check if task is not completed or not deleted
      const notdeleted = !task.deleted; // Check if task is not deleted
      return priorityMatch && statusMatch && dueDateMatch && searchMatch && notCompleted && notdeleted;
    });
  };

  const resetFilters = () => {
    setSelectedPriority("All");
    setSelectedStatus("All");
    setSelectedDueDate(""); 
    setSearchTerm(""); 
  };

  return (
    <div className="home">
      <div className="top-container"></div>
      <div className="body-container">
        <div className="side-bar"></div>
        <div className="content-container">
          <div className="tool-bar">
            <FiltersBar
                tasks={tasks}
                selectedPriority={selectedPriority}
                setSelectedPriority={setSelectedPriority}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                selectedDueDate={selectedDueDate}
                setSelectedDueDate={setSelectedDueDate}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                resetFilters={resetFilters}
              /> 
          </div>
          <div className="tasks-container">
            <div className="tasks-container-header">
              <input
                className="header-checkbox"
                type="checkbox"
                checked={mainCheckboxChecked}
                onChange={handleMainCheckboxChange}
              />
              <h4>All Tasks</h4>
            </div>
            <div className="tasks-wrapper">
              {filterTasks(tasks).map(task => (
                <div key={task._id} onClick={() => handleTaskClick(task)}>
                  <TaskItem
                    task={task}
                    isChecked={checkedTasks[task._id] || false}
                    onCheckboxChange={(checked) => handleTaskCheckboxChange(task._id, checked)}
                    showAllCheckboxes={isAnyChecked}
                  />
                </div>
              ))}
            </div>
            {!showInput ? (
            <button className="add-button" onClick={handleAddButtonClick}>
              <i className="fa-solid fa-plus"></i> Create
            </button>
            ) : (
            <input
              type="text"
              className="task-input"
              ref={inputRef}
              placeholder="What needs to be done?"
              onKeyDown={handleInputKeyDown} 
              onBlur={() => setShowInput(false)} // Hide input on losing focus
            />
          )}
          </div>
        </div>
        {/* Render TaskDetailPanel when a task is selected */}
        {selectedTask && (
        <TaskDetailPanel 
          task={selectedTask} 
          onClose={closeTaskDetailPanel}
        />
        )}
      </div>
    </div>
  );
};

export default Home;