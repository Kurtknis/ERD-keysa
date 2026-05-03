import { Search, Sheet, Trash2, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ActionHint, Card, EmptyState } from '../components/UI';
import { useProcurement } from '../context/ProcurementContext';
import { exportEmployees } from '../utils/exportExcel';
import { filterByText } from '../utils/formatters';

const EMPTY_FORM = {
  name: '',
  role: '',
};

export default function EmployeesPage() {
  const { employees, addEmployeeRecord, deleteEmployeeRecord } = useProcurement();
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');

  const filteredEmployees = useMemo(
    () => filterByText(employees, search, (employee) => [employee.id, employee.name, employee.role]),
    [employees, search],
  );

  function handleSubmit(event) {
    event.preventDefault();

    try {
      addEmployeeRecord(form);
      setForm(EMPTY_FORM);
    } catch (error) {
      window.alert(error.message);
    }
  }

  function handleDelete(employee) {
    const confirmed = window.confirm(
      `Delete "${employee.name}"?\n\nEmployees linked to purchase requests cannot be deleted.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      deleteEmployeeRecord(employee.id);
    } catch (error) {
      window.alert(error.message);
    }
  }

  return (
    <div className="page-stack">
      <div className="two-column-grid">
        <Card
          title="Add Employee"
          subtitle="Create clear ownership for requests, approvals, and follow-up actions."
          action={<span className="section-chip">People</span>}
        >
          <ActionHint
            title="Why this matters"
            description="Employees are used as requesters in the PR workflow, so clean master data keeps documents trustworthy."
          />
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Employee Name
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Enter employee name"
              />
            </label>

            <label>
              Role
              <input
                value={form.role}
                onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
                placeholder="Enter employee role"
              />
            </label>

            <button className="primary-button" type="submit">
              <UserPlus size={16} />
              Add Employee
            </button>
            <p className="form-helper">Adds a new employee profile and saves it immediately for future PR selection.</p>
          </form>
        </Card>

        <Card
          title="Search And Export"
          subtitle="Filter employees quickly and download the master list when needed."
          action={
            <button className="secondary-button" onClick={() => exportEmployees(employees)} type="button">
              <Sheet size={16} />
              Export Excel
            </button>
          }
        >
          <ActionHint
            title="What this button does"
            description="Export Excel creates a ready-to-share employee register without needing a backend."
          />
          <div className="field-with-icon">
            <Search size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by ID, name, or role"
            />
          </div>
        </Card>
      </div>

      <Card title="Employee List" subtitle={`${filteredEmployees.length} employee(s) shown`}>
        {filteredEmployees.length === 0 ? (
          <EmptyState
            icon={UserPlus}
            title="No employees found"
            description="Try a different search or add a new employee to support request creation."
          />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.id}</td>
                    <td>{employee.name}</td>
                    <td>{employee.role}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="danger-button small-button"
                          onClick={() => handleDelete(employee)}
                          type="button"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
