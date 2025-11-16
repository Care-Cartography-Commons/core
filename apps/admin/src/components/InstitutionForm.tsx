import { useState, useEffect, useContext } from 'react'

import { api } from '../api'
import { InstitutionContext } from './InstitutionContext'


interface InstitutionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  formType: 'create' | 'edit';
}

export function InstitutionForm({ onSuccess, onCancel, formType }: InstitutionFormProps) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const institution = useContext(InstitutionContext)

  useEffect(() => {
    if (institution) {
      setName(institution.name)
    } else {
      setName('')
    }
  }, [institution])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (formType === 'edit' && institution) {
        await api.updateInstitution(institution.id, { name })
      } else {
        await api.createInstitution({ name })
      }
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save institution')
    } finally {
      setLoading(false)
    }
  }

  return (
          <form onSubmit={handleSubmit}>
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="e.g., Bubbers badekar"
                />
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
                onClick={handleSubmit}
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
