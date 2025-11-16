import { useState } from 'react'
import { InstitutionList } from './components/InstitutionList'
import { InstitutionForm } from './components/InstitutionForm'
import Modal from './components/Modal'
import { InstitutionDetailView } from './components/InstitutionDetail'
import { InstitutionDelete } from './components/InstitutionDelete'
import { Toast } from './components/Toast'
import { InstitutionContext } from './components/InstitutionContext'
import type { Institution } from './types'

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

type FormType = 'create' | 'edit';
type ModalType = FormType | 'delete' | 'view' | null;


function App() {
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null)
  
  const closeModal = () => {
    setActiveModal(null)
    setSelectedInstitution(null)
  }

  const handleFormSuccess = (message: string, type: 'success') => {
    closeModal()
    setSelectedInstitution(null)
    setRefreshTrigger((prev) => prev + 1)
    setToast({
      message,
      type: type,
    })
  }

  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [toast, setToast] = useState<ToastState | null>(null)

  const handleQR = (url: string) => {
    window.open(url, '_blank')
  }
  

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-1">Care Cartography Commons</h1>
          <p className="text-muted mb-0">Administration Panel</p>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveModal('create')}>
          Create Institution
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Institutions</h5>
        </div>
        <div className="card-body p-0">
          <InstitutionList
            setActiveModal={setActiveModal}
            onQR={handleQR}
            refreshTrigger={refreshTrigger}
            selectInstitution={setSelectedInstitution}
          />
        </div>
      </div>

      


      <InstitutionContext value = {selectedInstitution}>
        
        <Modal isOpen={activeModal === 'view'} onClose={closeModal} title="Institution Details">
          <InstitutionDetailView onClose={closeModal} />
        </Modal>
        
        <Modal
          isOpen={activeModal === 'create'}
          onClose={closeModal}
          title="New Institution"
          includeFooter={false}
        >
          <InstitutionForm
            onSuccess={() => handleFormSuccess('Institution created successfully', 'success')}
            onCancel={closeModal}
            formType={'create'}
          />
        </Modal>

        <Modal
          isOpen={activeModal === 'edit'}
          onClose={closeModal}
          title="Edit Institution"
          includeFooter={false}
        >
          <InstitutionForm
            onSuccess={() => handleFormSuccess('Successfully updated institution', 'success')}
            onCancel={closeModal}
            formType={'edit'}
          />
        </Modal>

        <Modal
          isOpen={activeModal === 'delete'}
          onClose={closeModal}
          title="Institution Details"
          includeFooter={false}
        >
          <InstitutionDelete
            onCancel={closeModal}
            handleFormSuccess={() => handleFormSuccess('Institution deleted successfully', 'success')}
          />
        </Modal>

      </InstitutionContext>
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default App
