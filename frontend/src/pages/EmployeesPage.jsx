import { Edit2, Search, Sheet, Trash2, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ActionHint, Card, ConfirmModal, DetailModal, EditModal, EmptyState } from '../components/UI';
import { useProcurement } from '../context/ProcurementContext';
import { exportEmployees } from '../utils/exportExcel';
import { filterByText } from '../utils/formatters';

const EMPTY_FORM = {
  name: '',
  role: '',
};

export default function EmployeesPage() {
  const { employees, addEmployeeRecord, updateEmployeeRecord, deleteEmployeeRecord } = useProcurement();
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [modal, setModal] = useState(null); // 'edit' | 'confirm-delete'
  const [target, setTarget] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', role: '' });

  const filteredEmployees = useMemo(
    () => filterByText(employees, search, (employee) => [employee.id, employee.name, employee.role]),
    [employees, search],
  );

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      window.alert('Employee name is required.');
      return;
    }

    if (!form.role.trim()) {
      window.alert('Employee role is required.');
      return;
    }

    try {
      addEmployeeRecord(form);
      setForm(EMPTY_FORM);
    } catch (error) {
      console.error('Add employee failed:', error);
      window.alert(error.message);
    }
  }

  function handleDelete(employee) {
    setTarget(employee);
    setModal('confirm-delete');
  }

  function handleDeleteConfirm() {
    if (!target) return;
    try {
      deleteEmployeeRecord(target.id);
      setModal(null);
      setTarget(null);
    } catch (error) {
      window.alert(error.message);
    }
  }

  function handleEditClick(employee) {
    setTarget(employee);
    setEditForm({ name: employee.name, role: employee.role });
    setModal('edit');
  }

  function handleEditSave() {
    if (!target) return;
    try {
      updateEmployeeRecord(target.id, editForm);
      setModal(null);
      setTarget(null);
    } catch (error) {
      console.error('Update employee failed:', error);
      window.alert(error.message);
    }
  }

  function closeModal() {
    setModal(null);
    setTarget(null);
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
                  <tr
                    key={employee.id}
                    className="row-clickable"
                    onClick={() => setSelectedItem(employee)}
                    title="Click to view details"
                  >
                    <td>{employee.id}</td>
                    <td>{employee.name}</td>
                    <td>{employee.role}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="secondary-button small-button"
                          onClick={(e) => { e.stopPropagation(); handleEditClick(employee); }}
                          type="button"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        <button
                          className="danger-button small-button"
                          onClick={(e) => { e.stopPropagation(); handleDelete(employee); }}
                          type="button"
                        >
                          <Trash2 size={14} /> Delete
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

      {selectedItem && (
        <DetailModal
          title={`Employee — ${selectedItem.name}`}
          onClose={() => setSelectedItem(null)}
          fields={[
            { label: 'Employee ID', value: selectedItem.id },
            { label: 'Full Name', value: selectedItem.name },
            { label: 'Role', value: selectedItem.role },
          ]}
        />
      )}

      {modal === 'edit' && target && (
        <EditModal
          title={`Edit Employee — ${target.name}`}
          fields={[
            {
              name: 'name',
              label: 'Employee Name',
              value: editForm.name,
              onChange: (e) => setEditForm((c) => ({ ...c, name: e.target.value })),
              required: true,
            },
            {
              name: 'role',
              label: 'Role',
              value: editForm.role,
              onChange: (e) => setEditForm((c) => ({ ...c, role: e.target.value })),
              required: true,
            },
          ]}
          onSave={handleEditSave}
          onClose={closeModal}
        />
      )}

      {modal === 'confirm-delete' && target && (
        <ConfirmModal
          title="Delete Employee"
          message={`Delete "${target.name}"?\n\nEmployees linked to purchase requests cannot be deleted.`}
          onConfirm={handleDeleteConfirm}
          onCancel={closeModal}
          confirmLabel="Delete"
          danger
        />
      )}
    </div>
  );
}
