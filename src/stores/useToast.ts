import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

const toasts = ref<Toast[]>([])
let idCounter = 0

export function useToast() {
  const addToast = (message: string, type: ToastType = 'success', duration = 3000) => {
    const id = idCounter++
    const toast = { id, message, type }
    toasts.value.push(toast)

    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  const removeToast = (id: number) => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return {
    toasts,
    addToast,
    removeToast,
  }
}
