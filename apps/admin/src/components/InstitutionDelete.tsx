import { useContext } from 'react'
import { InstitutionContext } from './InstitutionContext'
import { api } from '../api'

interface InstitutionDeleteProps {
  handleFormSuccess: () => void;
  onCancel: () => void;
}

export function InstitutionDelete({handleFormSuccess, onCancel}: InstitutionDeleteProps) {
  
  const institution = useContext(InstitutionContext)

  const handleDelete = async (id: string) => {
    try {
      await api.deleteInstitution(id)
      handleFormSuccess()
    } catch (err) {
      console.error(err)
    }
  }
  return institution && (
    <>
      <p>Are you sure you want to delete institution{' '}<strong>{institution.name}</strong>?</p>
      <p className="text-danger mb-0">
        This will also delete all associated ratings.
      </p>
      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => handleDelete(institution.id)}
        >
          Delete
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => onCancel}
        >
          Cancel
        </button>
      </div>
    </>
  )
}