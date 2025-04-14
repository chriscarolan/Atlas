import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import ManagerLayout from '../components/ManagerLayout';
import '../styles/Employees.css'; // Create this CSS file
import '../styles/Table.css'; // Reusing action menu styles from Table.css
import '../styles/Modal.css'; // Reusing modal styles
import { FaPlus, FaEdit, FaTrashAlt, FaSearch, FaUpload, FaEllipsisV, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { formatTimeTo12Hour } from '../utils/formatTime'; // Import the utility function

// --- Sample Data ---
// In a real app, employee details and hours would come from the backend.
const sampleEmployees = [
  {
    employeeId: 101,
    name: 'Alice Johnson',
    hourlyWage: 20.00,
    jobTitle: 'Lead Butcher',
    dateHired: '2023-01-15',
    phoneNumber: '555-123-4567',
    email: 'alice.j@example.com',
    approvalStatus: 'Pending',
    timesheet: {
      Monday: { clockIn: '09:00', clockOut: '17:00', hours: 8, dailyPay: 160.00 },
      Tuesday: { clockIn: '09:00', clockOut: '17:00', hours: 8, dailyPay: 160.00 },
      Wednesday: { clockIn: '09:00', clockOut: '17:00', hours: 8, dailyPay: 160.00 },
      Thursday: { clockIn: '09:00', clockOut: '17:00', hours: 8, dailyPay: 160.00 },
      Friday: { clockIn: '09:00', clockOut: '17:00', hours: 8, dailyPay: 160.00 },
      Saturday: { clockIn: '-', clockOut: '-', hours: 0, dailyPay: 0 },
      Sunday: { clockIn: '-', clockOut: '-', hours: 0, dailyPay: 0 },
    },
    weeklyGross: 800.00
  },
  {
    employeeId: 102,
    name: 'Bob Smith',
    hourlyWage: 18.50,
    jobTitle: 'Cashier',
    dateHired: '2023-06-01',
    phoneNumber: '555-987-6543',
    email: 'bob.s@example.com',
    approvalStatus: 'Pending',
    timesheet: {
      Monday: { clockIn: '10:00', clockOut: '18:00', hours: 8, dailyPay: 148.00 },
      Tuesday: { clockIn: '10:00', clockOut: '18:00', hours: 8, dailyPay: 148.00 },
      Wednesday: { clockIn: '-', clockOut: '-', hours: 0, dailyPay: 0 },
      Thursday: { clockIn: '10:00', clockOut: '18:00', hours: 8, dailyPay: 148.00 },
      Friday: { clockIn: '10:00', clockOut: '14:00', hours: 4, dailyPay: 74.00 },
      Saturday: { clockIn: '-', clockOut: '-', hours: 0, dailyPay: 0 },
      Sunday: { clockIn: '-', clockOut: '-', hours: 0, dailyPay: 0 },
    },
    weeklyGross: 518.00
  },
   // Add more employees as needed
];

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function ManagerEmployees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState(sampleEmployees);
  const [totalWeeklyExpense, setTotalWeeklyExpense] = useState(0);
  const [openEmployeeMenuId, setOpenEmployeeMenuId] = useState(null); // State for employee action menu
  const [fireModalState, setFireModalState] = useState({ isOpen: false, employeeId: null, employeeName: '' }); // State for fire confirmation
  const [confirmationModalState, setConfirmationModalState] = useState({
    isOpen: false,
    actionType: null,
    employeeId: null,
    employeeName: '',
    title: '',
    message: ''
  });

  // Calculate total weekly salary expense
  useEffect(() => {
    const totalExpense = employees.reduce((sum, emp) => sum + emp.weeklyGross, 0);
    setTotalWeeklyExpense(totalExpense);
  }, [employees]);

  // --- Employee Action Menu --- 
  const handleEmployeeMenuToggle = (e, employeeId) => {
    e.stopPropagation(); // Prevent card click/etc.
    setOpenEmployeeMenuId(prevId => (prevId === employeeId ? null : employeeId));
  };

  // Close menu if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openEmployeeMenuId !== null && !event.target.closest('.employee-action-menu-container')) {
        setOpenEmployeeMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openEmployeeMenuId]);

  // --- Action Handlers --- 
  const handleEditEmployee = (e, employeeId) => {
    e.stopPropagation();
    setOpenEmployeeMenuId(null);
    navigate(`/employees/edit/${employeeId}`);
  };

  const handleFireClick = (e, employeeId, employeeName) => {
    e.stopPropagation();
    setOpenEmployeeMenuId(null);
    setFireModalState({ isOpen: true, employeeId: employeeId, employeeName: employeeName });
  };

  // --- NEW: Timesheet Approval Handlers ---
  const handleApproveClick = (e, employeeId, employeeName) => {
    e.stopPropagation();
    setConfirmationModalState({
        isOpen: true,
        actionType: 'approve',
        employeeId,
        employeeName,
        title: 'Confirm Timesheet Approval',
        message: `Are you sure you want to approve the timesheet for ${employeeName}? Please double-check the hours and pay before confirming.`
    });
  };

  const handleDenyClick = (e, employeeId, employeeName) => {
    e.stopPropagation();
    setConfirmationModalState({
        isOpen: true,
        actionType: 'deny',
        employeeId,
        employeeName,
        title: 'Confirm Timesheet Denial',
        message: `Are you sure you want to deny the timesheet for ${employeeName}? This action should be taken if there are discrepancies. Please ensure this is correct before confirming.`
    });
  };

  // --- Modal Handlers --- 
  const handleConfirmFire = () => {
    const { employeeId, employeeName } = fireModalState;
    console.log(`Firing employee: ${employeeName} (ID: ${employeeId})`);
    // TODO: API call to fire employee (update status, restrict access)
    setEmployees(prev => prev.filter(emp => emp.employeeId !== employeeId));
    setFireModalState({ isOpen: false, employeeId: null, employeeName: '' });
  };

  const handleCancelFire = () => {
    setFireModalState({ isOpen: false, employeeId: null, employeeName: '' });
  };

  // --- NEW: Generic Confirmation Modal Handlers ---
  const handleConfirmAction = () => {
    const { actionType, employeeId, employeeName } = confirmationModalState;

    // Update employee state based on action
    setEmployees(prevEmployees =>
      prevEmployees.map(emp => {
        if (emp.employeeId === employeeId) {
          const newStatus = actionType === 'approve' ? 'Approved' : 'Denied';
          console.log(`${actionType === 'approve' ? 'Approving' : 'Denying'} timesheet for ${employeeName} (ID: ${employeeId}). New status: ${newStatus}`);
          // TODO: API Call to update timesheet status
          return { ...emp, approvalStatus: newStatus };
        }
        return emp;
      })
    );

    // Close the modal
    setConfirmationModalState({ isOpen: false, actionType: null, employeeId: null, employeeName: '', title: '', message: '' });
  };

  const handleCancelAction = () => {
    // Just close the modal
    setConfirmationModalState({ isOpen: false, actionType: null, employeeId: null, employeeName: '', title: '', message: '' });
  };

  return (
    <ManagerLayout pageTitle="Employees & Timesheets">
       {/* Add controls bar */}
       <div className="page-actions-bar">
            <div className="total-salary-expense">
                <span>TOTAL WEEKLY EXPENSE (Approved):</span>
                 {/* TODO: Calculate approved expense only */}
                <span>${totalWeeklyExpense.toFixed(2)}</span>
            </div>
            <Link to="/employees/add" className="button button-primary add-employee-button">
                <FaPlus /> Add Employee
            </Link>
       </div>

      {/* Employee Cards Grid */}
      <div className="employees-grid">
        {employees.length > 0 ? (
          employees.map((employee) => {
            const isMenuOpen = openEmployeeMenuId === employee.employeeId;
            return (
              <div key={employee.employeeId} className="employee-card">
                {/* Card Header with Name, Actions, and Action Menu */}
                <div className="employee-card-header">
                    <div className="header-left"> {/* Group name and status */}
                        <h3>{employee.name}</h3>
                         {/* NEW: Display Approval Status */}
                        <div className={`approval-status ${employee.approvalStatus.toLowerCase()}`}>
                            Status: {employee.approvalStatus}
                        </div>
                    </div>
                    <div className="header-right"> {/* Group buttons and menu */}
                         {/* NEW: Timesheet Approval Actions */}
                         <div className="timesheet-approval-actions">
                             <button
                                className="button button-success button-small"
                                onClick={(e) => handleApproveClick(e, employee.employeeId, employee.name)}
                                disabled={employee.approvalStatus === 'Approved' || employee.approvalStatus === 'Denied'} // Disable if Approved or Denied
                             >
                                <FaCheckCircle /> Approve
                             </button>
                             <button
                                className="button button-warning button-small"
                                onClick={(e) => handleDenyClick(e, employee.employeeId, employee.name)}
                                disabled={employee.approvalStatus === 'Approved' || employee.approvalStatus === 'Denied'} // Disable if Approved or Denied
                             >
                                <FaTimesCircle /> Deny
                             </button>
                         </div>
                         {/* Existing Action Menu */}
                         <div className="employee-action-menu-container action-menu-container">
                            <button
                                onClick={(e) => handleEmployeeMenuToggle(e, employee.employeeId)}
                                className="icon-button menu-dots-button">
                               <FaEllipsisV />
                            </button>
                            {isMenuOpen && (
                                <div className="action-menu">
                                   <button onClick={(e) => handleEditEmployee(e, employee.employeeId)}><FaEdit /> Edit Employee</button>
                                   <button onClick={(e) => handleFireClick(e, employee.employeeId, employee.name)} className="danger"><FaTrashAlt /> Fire Employee</button>
                                </div>
                            )}
                         </div>
                    </div>
                </div>
                
                {/* Timesheet List */}
                <div className="timesheet-list">
                  <div className="timesheet-header-row">
                     <span>Day</span>
                     <span>Clock In</span>
                     <span>Clock Out</span>
                     <span>Daily Pay</span>
                  </div>
                  {daysOfWeek.map(day => {
                    const dayData = employee.timesheet[day] || { clockIn: '-', clockOut: '-', dailyPay: 0 };
                    return (
                      <div key={day} className="timesheet-item">
                        <span>{day}</span>
                        {/* Format the times */}
                        <span>{formatTimeTo12Hour(dayData.clockIn)}</span>
                        <span>{formatTimeTo12Hour(dayData.clockOut)}</span>
                        <span>${dayData.dailyPay.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="card-weekly-gross">
                  <span>Weekly Gross:</span>
                  <span>${employee.weeklyGross.toFixed(2)}</span>
                </div>
              </div>
            );
          })
        ) : (
          <p>No employee data available. Add an employee to get started.</p>
        )}
      </div>

      {/* Fire Confirmation Modal */}
      {fireModalState.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h4>Confirm Firing Employee</h4>
            <p>Are you sure you want to fire <strong>{fireModalState.employeeName}</strong>? This action cannot be undone and will restrict their access.</p>
            <div className="modal-actions">
              <button onClick={handleCancelFire} className="button button-secondary">Cancel</button>
              <button onClick={handleConfirmFire} className="button button-danger">Confirm Fire</button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Generic Confirmation Modal for Approve/Deny */}
      {confirmationModalState.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h4>{confirmationModalState.title}</h4>
            <p>{confirmationModalState.message}</p>
            <div className="modal-actions">
              <button onClick={handleCancelAction} className="button button-secondary">Cancel</button>
              <button
                onClick={handleConfirmAction}
                 // Use success style for approve confirm, danger for deny confirm
                className={`button ${confirmationModalState.actionType === 'approve' ? 'button-success' : 'button-danger'}`}
              >
                Confirm {confirmationModalState.actionType === 'approve' ? 'Approval' : 'Denial'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ManagerLayout>
  );
}

export default ManagerEmployees; 