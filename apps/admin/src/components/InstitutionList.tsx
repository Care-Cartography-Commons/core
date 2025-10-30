import { useState, useEffect } from 'react';
import type { Institution } from '../types';
import { api } from '../api';

interface InstitutionListProps {
  onEdit: (institution: Institution) => void;
  onView: (id: string) => void;
  onQR: (url: string) => void;
  refreshTrigger?: number;
}

export function InstitutionList({ onEdit, onView, onQR, refreshTrigger }: InstitutionListProps) {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadInstitutions();
  }, [refreshTrigger]);

  const loadInstitutions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.listInstitutions();
      setInstitutions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load institutions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteInstitution(id);
      setDeleteId(null);
      loadInstitutions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete institution');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
        <button
          className="btn btn-sm btn-outline-danger ms-3"
          onClick={loadInstitutions}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Name</th>
              <th>Ratings</th>
              <th>Status</th>
              <th>Actions</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {institutions.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">
                  No institutions found. Create one to get started.
                </td>
              </tr>
            ) : (
              institutions.map((institution) => (
                <tr key={institution.id}>
                  <td>
                    {institution.name}
                  </td>
                  <td>
                    <span className="badge bg-primary">
                      {institution.rating_count}
                    </span>
                  </td>
                  <td>
                    <span className={"badge bg-" + (institution.status === 'active' ? 'success' : 'secondary')}>
                      {institution.status}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm" role="group">
                      <button
                        className="btn btn-primary"
                        onClick={() => onView(institution.id)}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-warning"
                        onClick={() => onEdit(institution)}
                        >
                        Edit
                      </button>
                      <button
                        className="btn btn-success"
                        onClick={() => onQR(institution.qr_url)}
                        >
                        Get QR code
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => setDeleteId(institution.id)}
                        >
                        Delete
                      </button>
                    </div>
                  </td>
                  <td>{new Date(institution.created_at).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDeleteId(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete institution{' '}
                  <strong>{deleteId}</strong>?
                </p>
                <p className="text-danger mb-0">
                  This will also delete all associated ratings.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDeleteId(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleDelete(deleteId)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
