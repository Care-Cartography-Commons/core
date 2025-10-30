import { useState } from 'react';
import { InstitutionList } from './components/InstitutionList';
import { InstitutionForm } from './components/InstitutionForm';
import { InstitutionDetailView } from './components/InstitutionDetail';
import { Toast } from './components/Toast';
import type { Institution } from './types';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

function App() {
  const [showForm, setShowForm] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);
  const [viewingInstitutionId, setViewingInstitutionId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [toast, setToast] = useState<ToastState | null>(null);

  const handleCreateNew = () => {
    setEditingInstitution(null);
    setShowForm(true);
  };

  const handleEdit = (institution: Institution) => {
    setEditingInstitution(institution);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    const wasEditing = !!editingInstitution;
    setEditingInstitution(null);
    setRefreshTrigger((prev) => prev + 1);
    setToast({
      message: wasEditing ? 'Institution updated successfully' : 'Institution created successfully',
      type: 'success',
    });
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingInstitution(null);
  };

  const handleView = (id: string) => {
    setViewingInstitutionId(id);
  };

  const handleCloseDetail = () => {
    setViewingInstitutionId(null);
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-1">Care Cartography Commons</h1>
          <p className="text-muted mb-0">Administration Panel</p>
        </div>
        <button className="btn btn-primary" onClick={handleCreateNew}>
          Create Institution
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Institutions</h5>
        </div>
        <div className="card-body p-0">
          <InstitutionList
            onEdit={handleEdit}
            onView={handleView}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>

      {showForm && (
        <InstitutionForm
          institution={editingInstitution}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {viewingInstitutionId && (
        <InstitutionDetailView
          institutionId={viewingInstitutionId}
          onClose={handleCloseDetail}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;
