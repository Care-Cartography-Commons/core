import { useState, useEffect } from 'react';
import type { Institution } from '../types';
import { api } from '../api';

interface InstitutionFormProps {
  institution?: Institution | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function InstitutionForm({ institution, onSuccess, onCancel }: InstitutionFormProps) {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!institution;

  useEffect(() => {
    if (institution) {
      setId(institution.id);
      setName(institution.name);
    } else {
      setId('');
      setName('');
    }
  }, [institution]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isEditing) {
        await api.updateInstitution(id, { name });
      } else {
        await api.createInstitution({ id, name });
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save institution');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">
                {isEditing ? 'Edit Institution' : 'Create Institution'}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onCancel}
                disabled={loading}
              ></button>
            </div>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="institutionId" className="form-label">
                  Institution ID
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="institutionId"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  required
                  disabled={isEditing || loading}
                  placeholder="e.g., institution-001"
                />
                {isEditing && (
                  <small className="form-text text-muted">
                    ID cannot be changed
                  </small>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="institutionName" className="form-label">
                  Institution Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="institutionName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="e.g., Copenhagen Library"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Saving...
                  </>
                ) : (
                  <>{isEditing ? 'Update' : 'Create'}</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
