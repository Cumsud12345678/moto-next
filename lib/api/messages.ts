import { api } from "../axios";

export async function getMessages() {
  const res = await api.get(
    '/api/messages',
    { withCredentials: true }
  )

  return res.data.data
}

export async function setMessages(ids: string[]) {
  const res = await api.put(
    '/api/messages/not/view',
    { ids: ids },
    { withCredentials: true }
  )

  return res.data
}

export async function getNotViewCount() {
  const res = await api.get(
    '/api/messages/not/view',
    { withCredentials: true }
  )

  return res.data.total
}