import { createContext, useReducer } from 'react';

export const TasksContext = createContext();

export const tasksReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TASKS':
      return { 
        tasks: action.payload 
      };
    case 'CREATE_TASK':
      return { 
        tasks: [action.payload, ...state.tasks] 
      };
    case 'DELETE_TASK':
      return {
        tasks: state.tasks.filter((task) => task._id !== action.payload._id)
      };
    case 'UPDATE_TASK': 
      const updatedTask = action.payload;
      const updatedTasks = state.tasks.map((task) => {
        if (task._id === updatedTask._id) {
          return updatedTask;
        }
        return task;
      });
      return {
        ...state,
        tasks: updatedTasks
      };
    default:
      return state;
  }
};

export const TasksContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(tasksReducer, { 
    tasks: []  // Initialize as an empty array
  });
  
  return (
    <TasksContext.Provider value={{ ...state, dispatch }}>
      {children}
    </TasksContext.Provider>
  );
};
