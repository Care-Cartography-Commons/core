import { useState, useEffect, useContext } from 'react'

import { api } from '../api'
import { InstitutionContext } from './InstitutionContext'


interface InstitutionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  formType: 'create' | 'edit';
}

export function InstitutionForm({ onSuccess, onCancel, formType }: InstitutionFormProps) {
  const [newInstitution, setNewInstitution] = useState({
    name: '',
    activation_date: '',
    deactivation_date: '',
    paused: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const institution = useContext(InstitutionContext)

  useEffect(() => {
    if (institution) {
      setNewInstitution({
        name: institution.name,
        activation_date: institution.activation_date.split('T')[0],
        deactivation_date: institution.deactivation_date.split('T')[0],
        paused: institution.paused
      })
    }
  }, [institution])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (formType === 'edit' && institution) {
        await api.updateInstitution(institution.id, newInstitution)
      } else {
        await api.createInstitution(newInstitution)
      }
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save institution')
    } finally {
      setLoading(false)
    }
  }

  console.log(newInstitution)

  return (
          <form onSubmit={submit}>
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <div className="mb-3">
                <label htmlFor="institutionName" className="form-label">
                  Institution Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="institutionName"
                  value={newInstitution.name}
                  onChange={(e) => setNewInstitution({ ...newInstitution, name: e.target.value })}
                  required
                  disabled={loading}
                  placeholder="e.g., Bubbers badekar"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="activationDate" className="form-label">
                  Activation date
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="activationDate"
                  value={newInstitution.activation_date}
                  onChange={(e) => setNewInstitution({ ...newInstitution, activation_date: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="deactivationDate" className="form-label">
                  Deactivation date
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="deactivationDate"
                  value={newInstitution.deactivation_date}
                  onChange={(e) => setNewInstitution({ ...newInstitution, deactivation_date: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div className="mb-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="paused"
                    checked={newInstitution.paused}
                    onChange={(e) => setNewInstitution({ ...newInstitution, paused: e.target.checked })}
                    disabled={loading}
                  />
                  <label className="form-check-label" htmlFor="paused">
                    Pause data collection
                  </label>
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
                onClick={submit}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Saving...
                  </>
                ) : (
                  <>{formType === 'edit' ? 'Update' : 'Create'}</>
                )}
              </button>
            </div>
          </form>
        
  )
}
