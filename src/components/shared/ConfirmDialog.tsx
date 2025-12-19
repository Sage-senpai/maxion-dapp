// src/components/shared/ConfirmDialog.tsx
// Confirmation dialog for destructive actions
// ============================================================================

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}: ConfirmDialogProps) {
  const colors = {
    danger: COLORS.riskRed,
    warning: COLORS.warningAmber,
    info: COLORS.signalCyan,
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-sm text-gray-300">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 rounded-lg font-medium text-sm"
            style={{
              backgroundColor: COLORS.slateGrey,
              color: '#9CA3AF',
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2 px-4 rounded-lg font-medium text-sm"
            style={{
              backgroundColor: colors[variant],
              color: COLORS.obsidianBlack,
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}