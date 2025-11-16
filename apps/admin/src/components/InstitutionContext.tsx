import { createContext } from 'react'
import type { Institution } from '../types'

export const InstitutionContext = createContext<Institution | null>(null)