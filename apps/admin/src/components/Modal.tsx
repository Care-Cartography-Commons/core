// interface ModalProps
interface ModalProps {
  children: React.ReactNode
  title: string
  isOpen: boolean
  onClose: () => void
  includeFooter?: boolean
}

export default function Modal({ children, title = "Details", isOpen, onClose, includeFooter = true }: ModalProps) {
  return (
    isOpen && (
      <div
        className="modal show d-block"
        tabIndex={-1}
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                ></button>
            </div>
            <div className="modal-body">{children}</div>
            {includeFooter && (
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
            )}
          </div>
        </div>
      </div>
    )
  )
}