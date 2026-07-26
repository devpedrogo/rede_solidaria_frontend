import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  loading?: boolean;
}

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, loading }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>Confirmar</Button>
        </>
      }
    >
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <p className="text-sm text-gray-600 leading-relaxed pt-1">{message}</p>
      </div>
    </Modal>
  );
}
