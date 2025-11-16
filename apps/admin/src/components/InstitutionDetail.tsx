import { useState, useEffect } from 'react';
import type { InstitutionDetail } from '../types';
import { api } from '../api';

interface InstitutionDetailProps {
  institutionId: string;
  onClose: () => void;
}

export function InstitutionDetailView({ institutionId, onClose }: InstitutionDetailProps) {
  const [institution, setInstitution] = useState<InstitutionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    const loadInstitution = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getInstitution(institutionId);
        setInstitution(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load institution');
      } finally {
        setLoading(false);
      }
    };
    loadInstitution();
  }, [institutionId]);
  
  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Institution Details</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : error ? (
              <div className="alert alert-danger" role="alert">
                <p>An error occurred: {error}</p>
              </div>
            ) : institution ? (
              <>
                <div className="mb-4 institution-summary">
                  <h6 className="text-muted">Institution ID</h6>
                  <p className="mb-2">
                    <code className="text-secondary">{institution.id}</code>
                  </p>

                  <h6 className="text-muted">Name</h6>
                  <p className="mb-2">{institution.name}</p>

                  <h6 className="text-muted">Created</h6>
                  <p className="mb-2">
                    {new Date(institution.created_at).toLocaleString()}
                  </p>
                </div>

                <hr />

                <h6 className="mb-3">
                  Ratings (total: {institution.ratings.length})
                </h6>

                {institution.ratings.length === 0 ? (
                  <p className="text-muted">No ratings yet.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Rating</th>
                          <th>Submitted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {institution.ratings.map((rating) => (
                          <tr key={rating.id}>
                            <td>{rating.id}</td>
                            <td>
                              <span className="badge bg-primary">
                                {rating.rating}
                              </span>
                            </td>
                            <td>{new Date(rating.created_at).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : null}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
