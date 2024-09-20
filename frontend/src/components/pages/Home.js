// src/pages/Home.js
import { useEffect, useState } from "react";
import { useTasksContext } from "../../hooks/useTasksContext";
import '../../css/Home.css'; // Import your CSS file
import TaskItem from "../TaskItem";
import { useAuthContext } from '../../hooks/useAuthContext';
import { useNavigate } from 'react-router-dom'; 
import { useCustomFetch } from '../../hooks/useCustomFetch'; 
import { useLogout } from '../../hooks/useLogout'; 
import moment from 'moment-timezone';
import FiltersBar from "../FiltersBar";
import TaskDetailPanel from "../TaskDetailPanel";

const Home = () => {
  const customFetch = useCustomFetch(); 
  const navigate = useNavigate(); 
  const { logout } = useLogout(); 
  const { tasks, dispatch } = useTasksContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDueDate, setSelectedDueDate] = useState("");
  const { user } = useAuthContext();
  const isPastDue = (date) => new Date(date) < new Date();
  const [checkedTasks, setCheckedTasks] = useState({}); // Track checked status of individual tasks
  const [isAnyChecked, setIsAnyChecked] = useState(false); // Track if any checkbox is checked
  const [mainCheckboxChecked, setMainCheckboxChecked] = useState(false); // Track main checkbox state
  const [selectedTask, setSelectedTask] = useState(null);  // State for the selected task

  // Function to handle removing a deleted task from the task list
  const handleTaskDelete = (taskId) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId });
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
  
  useEffect(() => { 
    const fetchAndUpdateTasks = async () => {
      if (!user) return; 
      try {
        const json = await customFetch('/api/tasks');
        // Automatically update task status based on due date
        const updatedTasks = json.map(task => ({
          ...task,
          status: isPastDue(task.date) ? 'Past Due' : task.status
        }));
        dispatch({ type: 'SET_TASKS', payload: updatedTasks });
      } catch (error) {
        console.error("Error fetching tasks:", error);
        if (error.message === 'Unauthorized') {
          logout(); 
          navigate('/login'); 
        }
      }
    };

    fetchAndUpdateTasks();

    // Interval to continuously check and update task status every minute
    const intervalId = setInterval(fetchAndUpdateTasks, 60000); // Every minute

    return () => clearInterval(intervalId);
  }, [user, customFetch, dispatch, selectedStatus, selectedPriority, selectedDueDate, searchTerm]); 


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
                    onClose={handleTaskDelete} // Pass this function to TaskItem
                  />
                </div>
              ))}
            </div>
            <button className="add-button"><i class="fa-solid fa-plus"></i> Create</button>
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