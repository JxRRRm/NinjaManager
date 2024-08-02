// src/pages/Home.js
import { useEffect, useState } from "react";
import { useTasksContext } from "../../hooks/useTasksContext";
import '../../css/Home.css'; // Import your CSS file
import TaskDetails from "../TaskDetails";
import { useAuthContext } from '../../hooks/useAuthContext';
import { useNavigate } from 'react-router-dom'; 
import { useCustomFetch } from '../../hooks/useCustomFetch'; 
import { useLogout } from '../../hooks/useLogout'; 
import moment from 'moment-timezone';
import FiltersBar from "../FiltersBar";

const Home = () => {
  const { tasks, dispatch } = useTasksContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDueDate, setSelectedDueDate] = useState("");
  const { user } = useAuthContext();
  const customFetch = useCustomFetch(); 
  const navigate = useNavigate(); 
  const { logout } = useLogout(); 
  const isPastDue = (date) => new Date(date) < new Date();
  
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

  // Adjusted to format UTC date to Pacific Time for display
  const convertUTCToLocalDate = (utcDate) => {
    return moment.utc(utcDate).tz('America/Los_Angeles').format('YYYY-MM-DD HH:mm');
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
      <div className="home-container">
        <div className="page-title">
          <h2>Home</h2>
        </div>

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

      {/* Task listings */}
      {(selectedStatus === 'All' || selectedStatus === 'In Progress') && (
        <>
          <h3 className="tasks-heading">In Progress</h3>
          <div className="tasks">
            {filterTasks(tasks)
              .filter(task => task.status === 'In Progress')
              .map(task => (
                <TaskDetails 
                  task={{...task, date: convertUTCToLocalDate(task.date)}}
                  key={task._id} 
                />
              ))}
          </div>
        </>
      )}

      {(selectedStatus === 'All' || selectedStatus === 'Past Due') && (
        <>
          <h3 className="tasks-heading">Past Due</h3>
          <div className="tasks">
            {filterTasks(tasks)
              .filter(task => task.status === 'Past Due')
              .map(task => (
                <TaskDetails 
                  task={{ ...task, date: convertUTCToLocalDate(task.date), status: 'Past Due' }}
                  key={task._id} 
                />
              ))}
          </div>
        </>
      )}

      <div><br /><br /></div>
    </div>
  );
};

export default Home;
