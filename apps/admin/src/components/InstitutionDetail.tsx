import { useState, useEffect, useContext } from 'react'
import type { InstitutionDetail } from '../types'
import { api } from '../api'
import { InstitutionContext } from './InstitutionContext'

export function InstitutionDetailView() {
  const [institutionData, setInstitutionData] = useState<InstitutionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const institution = useContext(InstitutionContext)
  
  useEffect(() => {
    const loadInstitution = async () => {
      try {
        setLoading(true)
        setError(null)
        if (institution === null) {
          throw new Error('No institution selected')
        }
        const data = await api.getInstitution(institution.id)
        setInstitutionData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load institution')
      } finally {
        setLoading(false)
      }
    }
    loadInstitution()
  }, [institution])
  
  return loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : error ? (
              <div className="alert alert-danger" role="alert">
                <p>An error occurred: {error}</p>
              </div>
            ) : institutionData ? (
              <>
                <div className="mb-4 institution-summary">

                  <h6 className="text-muted">Name</h6>
                  <strong><p className="mb-3">{institutionData.name}</p></strong>

                  <h6 className="text-muted">Created</h6>
                  <p className="mb-2">
                    {new Date(institutionData.created_at).toLocaleString()}
                  </p>
                  <h6 className="text-muted">Start date</h6>
                  <p className="mb-2">
                    {new Date(institutionData.activation_date).toLocaleString()}
                  </p>
                  <h6 className="text-muted">End date</h6>
                  <p className="mb-2">
                    {new Date(institutionData.deactivation_date).toLocaleString()}
                  </p>
                </div>

                <hr />

                <h6 className="mb-3">
                  Ratings (total: {institutionData.ratings.length})
                </h6>

                {institutionData.ratings.length === 0 ? (
                  <p className="text-muted">No ratings yet.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Rating</th>
                          <th>Submitted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {institutionData.ratings.map((rating) => (
                          <tr key={rating.id}>
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
            ) : (
              <p className="text-muted">No institution data available.</p>
            )
}