export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

export interface Header {
  key: string
  value: string
  enabled: boolean
}

export interface Request {
  id: string
  name: string
  method: HttpMethod
  url: string
  headers: Header[]
  body?: string
  collectionId?: string
}

export interface Response {
  status: number
  statusText: string
  headers: Record<string, string>
  data: unknown
  time: number
}

export interface Collection {
  id: string
  name: string
  requests: Request[]
}

export interface RequestState {
  currentRequest: Request | null
  response: Response | null
  loading: boolean
  error: string | null
}

