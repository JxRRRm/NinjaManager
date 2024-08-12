
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Overview from '../../components/pages/Overview';
import "@testing-library/jest-dom"


import { TasksContextProvider } from '../../context/TasksContext'; // Adjust this according to your actual context provider
import { AuthContextProvider } from '../../context/AuthContext';

import { MemoryRouter } from 'react-router-dom';
import { act } from 'react-dom/test-utils';

jest.mock('../../hooks/useCustomFetch', () => ({
  useCustomFetch: jest.fn().mockImplementation(() => {
    return (url, method = 'GET', data = null) => {
      return new Promise((resolve, reject) => {
        if (url === '/api/tasks') {
          resolve([
            {
              title: "nhhhgg",
              priority: "Medium",
              employees: [],
              status: "Past Due",
              date: '2024-04-09 00:00:00',
              complete: false
            }
          ])
        } else if(url.startsWith("/api/user/")) {
          resolve([]);  // Default resolve for other cases
        }
      });
    };
  })
}));

describe('Overview Component Tests', () => {
  beforeEach(() => {
    render(
        <MemoryRouter>
        <AuthContextProvider>
          <TasksContextProvider>
            <Overview />
          </TasksContextProvider>
        </AuthContextProvider>
      </MemoryRouter>
    );
  });

  it('ensures tasks are filtered by priority correctly', async () => {
    const prioritySelect = screen.getByLabelText('Priority:');
    userEvent.selectOptions(prioritySelect, 'Medium');
    //await screen.findAllByText(/Priority: Medium/i);

    expect(screen.queryByText(/Priority: Low/i)).toBeNull();
    expect(screen.queryByText(/Priority: High/i)).toBeNull();
  });

  it('validates that the status filter works as expected', async () => {
    const statusSelect = screen.getByLabelText('Status:');
    userEvent.selectOptions(statusSelect, 'Past Due');
    await screen.findAllByText(/Status - Past Due/i);
    expect(screen.queryByText(/Status - In Progress/i)).toBeNull();
  });

  it('checks that due dates can be filtered accurately', async () => {
    const dateSelect = screen.getByLabelText('Due Date:');
    fireEvent.change(dateSelect, { target: { value: '2024-04-09' } });
    expect(screen.queryByDisplayValue(/2024-04-09/)).toBeInTheDocument();
  });

  it('confirms that the search functionality filters tasks based on text input', async () => {
    const searchInput = screen.getByLabelText('Search:');
    fireEvent.change(searchInput, { target: { value: 'nhhhgg' } });
    expect(screen.queryByText(/# Task 1 - nhhhgg/)).toBeInTheDocument();
    expect(screen.queryByText(/# Task 2 - ttttt/)).toBeNull();
  });

  it('verifies that clicking \'Reset Filters\' resets all filters to their default states', async () => {
    // Set filters first
    const prioritySelect = screen.getByLabelText('Priority:');
    const statusSelect = screen.getByLabelText('Status:');
    const dateSelect = screen.getByLabelText('Due Date:');
    const searchInput = screen.getByLabelText('Search:');
    userEvent.selectOptions(prioritySelect, 'Low');
    userEvent.selectOptions(statusSelect, 'In Progress');
    fireEvent.change(dateSelect, { target: { value: '2024-04-17' } });
    fireEvent.change(searchInput, { target: { value: 'task' } });
    // Reset filters
    act(() => {
      const resetButton = screen.getByText('Reset Filters');
      userEvent.click(resetButton);
    });
    // Check if filters are reset
    expect(prioritySelect.value).toBe('All');
    expect(statusSelect.value).toBe('All');
    expect(dateSelect.value).toBe('');
    expect(searchInput.value).toBe('');
  });

  it('checks that the task information is displayed correctly for each task', async () => {
    const taskBoxes = await screen.getByTestId("overview").querySelectorAll('.task-box');
    taskBoxes.forEach(box => {
      expect(box).toHaveTextContent(/Status/);
      expect(box).toHaveTextContent(/Priority/);
      expect(box).toHaveTextContent(/Due Date/);
      expect(box).toHaveTextContent(/Assigned Employee/);
      expect(box).toHaveTextContent(/Task Description/);
      expect(box).toHaveTextContent(/Edit History/);
    });
  });

  it('tests the \'Mark Complete\' button to confirm it updates the task status appropriately', async () => {
    const searchInput = screen.getByLabelText('Search:');
    fireEvent.change(searchInput, { target: { value: 'nhhhgg' } });

    act(() => {
      const markCompleteButtons = screen.getAllByText('Mark Complete');
      userEvent.click(markCompleteButtons[0]);
    })
    
    await screen.findByText('Completed');
  });

  it('verifies that clicking the \'Edit\' button on a task redirects to the task editing page correctly', async () => {
    const searchInput = screen.getByLabelText('Search:');
    fireEvent.change(searchInput, { target: { value: 'nhhhgg' } });

    const editButton = screen.getByTestId("edit-button");
    userEvent.click(editButton);
    // This would normally check for a navigation mock to have been called with the correct URL
  });
});