import { useState, useEffect } from 'react'
import type { Institution } from '../types'
import { api } from '../api'
import { MdDelete, MdQrCode, MdFormatListBulleted } from 'react-icons/md'
import { IoMdSettings } from 'react-icons/io'

interface InstitutionListProps {
  setActiveModal: (modal: 'view' | 'edit' | 'delete' | null) => void;
  onQR: (url: string) => void;
  selectInstitution: (institution: Institution) => void;
  refreshTrigger?: number;
}

export function InstitutionList({ setActiveModal, onQR, selectInstitution, refreshTrigger }: InstitutionListProps) {
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadInstitutions()
  }, [refreshTrigger])

  const loadInstitutions = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.listInstitutions()
      setInstitutions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load institutions')
    } finally {
      setLoading(false)
    }
  }

  const handleModalActivation = (e: React.MouseEvent, institution: Institution, modalType: 'view' | 'edit' | 'delete') => {
    e.stopPropagation()
    selectInstitution(institution)
    setActiveModal(modalType)
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
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
    )
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
                    <span className={'badge bg-' + (institution.status === 'active' ? 'success' : 'secondary')}>
                      {institution.status}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm action-btns" role="group">
                      <button
                        className="btn btn-primary"
                        onClick={(e) => handleModalActivation(e, institution, 'view')}
                      >
                        <MdFormatListBulleted />
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={(e) => handleModalActivation(e, institution, 'edit')}
                        >
                        <IoMdSettings />
                      </button>
                      <button
                        className="btn btn-success"
                        onClick={(e) => {e.stopPropagation(); onQR(institution.qr_url)}}
                        >
                        <MdQrCode />
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={(e) => handleModalActivation(e, institution, 'delete')}
                        >
                          <MdDelete />
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

      
    </>
  )
}
