import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// jsdom does not implement <dialog>.showModal()/close()
HTMLDialogElement.prototype.showModal = vi.fn(function showModal() {
  this.setAttribute('open', '')
})
HTMLDialogElement.prototype.close = vi.fn(function close() {
  this.removeAttribute('open')
  this.dispatchEvent(new Event('close'))
})
