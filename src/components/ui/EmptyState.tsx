import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ message = 'Nenhum registro encontrado' }: { message?: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <Inbox className="w-10 h-10 mb-2" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
