import { atom, createStore } from 'jotai'

// In-memory only — never persisted
export const accessTokenAtom = atom(null)
export const userAtom        = atom(null)
export const initializedAtom = atom(false)
export const loadingAtom     = atom(false)
export const authErrorAtom   = atom(null)

// Shared store instance used by both React and the axios interceptor
export const authStore = createStore()
