import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import CalendarPage from './Calendar';
import { MemoryRouter } from 'react-router-dom'; // Import MemoryRouter
import { AuthContextProvider } from "../../context/AuthContext"
import '@testing-library/jest-dom';

  it('Displays today\'s date correctly', () => {
    const { getByTestId } = render(     
      <MemoryRouter> <AuthContextProvider>
        <CalendarPage />
      </AuthContextProvider></MemoryRouter> 
    );
    const todayString = getByTestId("1").textContent  ;
    const today = new Date();
    const thisString = `Today is ${today.toLocaleDateString('en-CA', { month: 'long' })} ${today.getDate()}, ${today.getFullYear()}`;
    expect(todayString).toEqual(thisString);
  });

  it('Displays the agenda labels correctly', () => {
    const { getByTestId } = render(     
      <MemoryRouter> <AuthContextProvider>
        <CalendarPage />
      </AuthContextProvider></MemoryRouter> 
    );
    const agendaHeader = getByTestId("2").textContent  ;
    const agendaDate = getByTestId("3").textContent
    const today = new Date();
    const thisString = `${today.toLocaleDateString('en-CA', { month: 'long' })} ${today.getDate()}, ${today.getFullYear()}`;
    const col_1 = getByTestId("4").textContent;
    const col_2 = getByTestId("5").textContent;
    const col_3 = getByTestId("6").textContent;
    expect(agendaHeader).toEqual("Agenda");
    expect(agendaDate).toEqual(thisString);
    expect(col_1).toEqual("Due");
    expect(col_2).toEqual("Task");
    expect(col_3).toEqual("Complete");
  });

  it('React date picker functions as expected',() => {
    const { getByLabelText, getByTestId } = render(
      <MemoryRouter>
        <AuthContextProvider>
          <CalendarPage />
        </AuthContextProvider>
      </MemoryRouter>
    );
    // checks to see if datepicker previous month button and next month button are present
    const dp_PrevBtn = getByLabelText('Previous Month')
    expect(dp_PrevBtn).toBeInTheDocument();
    const dp_NextBtn = getByLabelText('Next Month')
    expect(dp_NextBtn).toBeInTheDocument();
    // checks to see if datepicker month label is present and has correct value
    let dp_MonthLabel = document.getElementsByClassName('react-datepicker__current-month')[0].textContent;
    expect(dp_MonthLabel).toEqual('May 2024');
    // checks to see if datepicker previous button works correctly
    fireEvent.click(dp_PrevBtn);
    dp_MonthLabel = document.getElementsByClassName('react-datepicker__current-month')[0].textContent;
    expect(dp_MonthLabel).toEqual('April 2024');
    // checks to see if datepicker next button works correctly
    fireEvent.click(dp_NextBtn);
    fireEvent.click(dp_NextBtn);
    dp_MonthLabel = document.getElementsByClassName('react-datepicker__current-month')[0].textContent;
    expect(dp_MonthLabel).toEqual('June 2024');
    // checks the functionality of selecting a date on the datepicker
    let dp_Option = getByLabelText('Choose Friday, June 28th, 2024');
    expect(dp_Option).toBeInTheDocument();
    fireEvent.click(dp_Option);
    let agendaDate = getByTestId("3").textContent;
    expect(agendaDate).toEqual("June 28, 2024");
  });

  it('All react big calendar toolbar buttons work as expected', () => {
    const { getByRole, getByTestId } = render(     
      <MemoryRouter> <AuthContextProvider>
        <CalendarPage />
      </AuthContextProvider></MemoryRouter> 
    );
    // Find buttons by their role + name
    const todayButton = getByRole('button', { name: 'Today' });
    const backButton = getByRole('button', { name: 'Back' });
    const nextButton = getByRole('button', { name: 'Next' });
    const monthButton = getByRole('button', { name: 'Month' });
    const weekButton = getByRole('button', { name: 'Week' });
    const dayButton = getByRole('button', { name: 'Day' });
    // Assert that all buttons are present
    expect(todayButton).toBeInTheDocument();
    expect(backButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
    expect(monthButton).toBeInTheDocument();
    expect(weekButton).toBeInTheDocument();
    expect(dayButton).toBeInTheDocument();

    // Check initial value of agenda date and rbc view label
    let agendaDate = getByTestId("3").textContent;
    expect(agendaDate).toEqual("May 3, 2024");
    let rbcViewLabel = document.getElementsByClassName('rbc-toolbar-label')[0].textContent;
    expect(rbcViewLabel).toEqual("April 28 – May 04");

    // Simulate button clicks
      // Month View
        // Click month view button
        fireEvent.click(monthButton); 
        // Check if labels are correct 
        rbcViewLabel = document.getElementsByClassName('rbc-toolbar-label')[0].textContent;
        expect(rbcViewLabel).toEqual("May 2024"); 

        // Month view: click next button 5x
        for (let i = 0; i < 5; i++) {
          fireEvent.click(nextButton);
        }  
        // Check if labels are correct 
        rbcViewLabel = document.getElementsByClassName('rbc-toolbar-label')[0].textContent;
        expect(rbcViewLabel).toEqual("October 2024");
        agendaDate = getByTestId("3").textContent;
        expect(agendaDate).toEqual("October 3, 2024");

        // Month view: back button click
        fireEvent.click(backButton);  
        // Check if labels are correct 
        rbcViewLabel = document.getElementsByClassName('rbc-toolbar-label')[0].textContent;
        expect(rbcViewLabel).toEqual("September 2024");  
        agendaDate = getByTestId("3").textContent;
        expect(agendaDate).toEqual("September 3, 2024");
        // click back button again
        fireEvent.click(backButton);  
        // Check if labels are correct 
        rbcViewLabel = document.getElementsByClassName('rbc-toolbar-label')[0].textContent;
        expect(rbcViewLabel).toEqual("August 2024");  
        agendaDate = getByTestId("3").textContent;
        expect(agendaDate).toEqual("August 3, 2024");

        // Month view: today button click
        fireEvent.click(todayButton); 
        // Check if labels are correct 
        rbcViewLabel = document.getElementsByClassName('rbc-toolbar-label')[0].textContent;
        expect(rbcViewLabel).toEqual("May 2024");  
        agendaDate = getByTestId("3").textContent;
        expect(agendaDate).toEqual("May 3, 2024");

    // Week View
      // Click week view button
        fireEvent.click(weekButton);
        // Check if labels are correct 
        rbcViewLabel = document.getElementsByClassName('rbc-toolbar-label')[0].textContent;
        expect(rbcViewLabel).toEqual("April 28 – May 04");
        agendaDate = getByTestId("3").textContent;
        expect(agendaDate).toEqual("May 3, 2024");

        // Week view: click back button 5x
        for (let i = 0; i < 5; i++) {
          fireEvent.click(backButton);
        }
        // Check if labels are correct  
        rbcViewLabel = document.getElementsByClassName('rbc-toolbar-label')[0].textContent;
        expect(rbcViewLabel).toEqual("March 24 – 30");
        agendaDate = getByTestId("3").textContent;
        expect(agendaDate).toEqual("March 29, 2024");

        // Week view: next button click
        fireEvent.click(nextButton);  
        // Check if labels are correct 
        rbcViewLabel = document.getElementsByClassName('rbc-toolbar-label')[0].textContent;
        expect(rbcViewLabel).toEqual("March 31 – April 06");  
        agendaDate = getByTestId("3").textContent;
        expect(agendaDate).toEqual("April 5, 2024");
        // click next button again
        fireEvent.click(nextButton);  
        // Check if labels are correct 
        rbcViewLabel = document.getElementsByClassName('rbc-toolbar-label')[0].textContent;
        expect(rbcViewLabel).toEqual("April 07 – 13");  
        agendaDate = getByTestId("3").textContent;
        expect(agendaDate).toEqual("April 12, 2024");

        // Week view: today button click
        fireEvent.click(todayButton); 
        rbcViewLabel = document.getElementsByClassName('rbc-toolbar-label')[0].textContent;
        expect(rbcViewLabel).toEqual("April 28 – May 04");  
        agendaDate = getByTestId("3").textContent;
        expect(agendaDate).toEqual("May 3, 2024");

    // Day View
      // Click day view button
      fireEvent.click(dayButton);
      // Check if labels are correct
      rbcViewLabel = document.getElementsByClassName('rbc-toolbar-label')[0].textContent;
      expect(rbcViewLabel).toEqual("Friday May 03");
      agendaDate = getByTestId("3").textContent
      expect(agendaDate).toEqual("May 3, 2024");

      // Day view: click next button 5x
      for (let i = 0; i < 5; i++) {
        fireEvent.click(nextButton);
      }  
      // Check if labels are correct
      rbcViewLabel = document.getElementsByClassName('rbc-toolbar-label')[0].textContent;
      expect(rbcViewLabel).toEqual("Wednesday May 08");
      agendaDate = getByTestId("3").textContent
      expect(agendaDate).toEqual("May 8, 2024");

      // day view back button click
      fireEvent.click(backButton);
      rbcViewLabel = document.getElementsByClassName('rbc-toolbar-label')[0].textContent;
      expect(rbcViewLabel).toEqual("Tuesday May 07");
      agendaDate = getByTestId("3").textContent
      expect(agendaDate).toEqual("May 7, 2024");
      // click back button again
      fireEvent.click(backButton);
      rbcViewLabel = document.getElementsByClassName('rbc-toolbar-label')[0].textContent;
      expect(rbcViewLabel).toEqual("Monday May 06");
      agendaDate = getByTestId("3").textContent
      expect(agendaDate).toEqual("May 6, 2024");

      // Day view: today button click
      fireEvent.click(todayButton);
      rbcViewLabel = document.getElementsByClassName('rbc-toolbar-label')[0].textContent;
      expect(rbcViewLabel).toEqual("Friday May 03");
  });
  
  it('Selecting a date on rbc works as expected', async () => {
    const { getByText } = render(
      <MemoryRouter>
        <AuthContextProvider>
          <CalendarPage />
        </AuthContextProvider>
      </MemoryRouter>
    );
    // Click on a column header in week view
    fireEvent.click(getByText('01 Wed'));
    // Verify changes, e.g., a task list for the selected day or the date being highlighted
    await waitFor(() => {
      const selectedDayTasks = getByText('May 1, 2024');
      expect(selectedDayTasks).toBeInTheDocument();
    });
    // Navigate to month view
    fireEvent.click(getByText('Month'));
    // Click on a day number
    fireEvent.click(getByText('02')); // Click on the first day of the month shown
    // Verify changes, e.g., a task list for the selected day or the date being highlighted
    await waitFor(() => {
      const selectedDayTasks = getByText('May 2, 2024');
      expect(selectedDayTasks).toBeInTheDocument();
    });
  });
