'use client'

import { useToastStore } from '@/stores/toast-store'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col-reverse items-center gap-2 w-full max-w-[440px] px-4 pointer-events-none">
      {toasts.map((toast) => {
        const config = {
          success: { icon: CheckCircle2, bg: 'bg-emerald-deep' },
          error: { icon: XCircle, bg: 'bg-red-600' },
          info: { icon: Info, bg: 'bg-charcoal' },
        }[toast.type]

        const Icon = config.icon

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto w-full ${config.bg} text-white px-5 py-3.5 shadow-xl flex items-center gap-3 animate-toast-in`}
            role="alert"
          >
            <Icon size={18} className="shrink-0" />
            <p className="text-sm flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
