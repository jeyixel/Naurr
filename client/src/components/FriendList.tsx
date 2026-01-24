import { useEffect, useMemo, useState } from 'react'
import { FiChevronRight, FiMessageCircle, FiUsers } from 'react-icons/fi'
import "../styles/FriendList.css"

export type FriendListFriend = {
  id: string
  username: string
  firstName?: string
  lastName?: string
  profilePicture?: string | null
}

type FriendsListProps = {
  onSelect?: (friend: FriendListFriend) => void
  selectedId?: string // Currently selected friend's ID, this is a prop passed from parent
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function FriendsList({ onSelect, selectedId }: FriendsListProps) {
  // an array of FriendListFriend objects, intially empty
  const [friends, setFriends] = useState<FriendListFriend[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // useMemo so that the array is only created once even on re-renders
  const skeletonCount = useMemo(() => Array.from({ length: 3 }), [])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    fetch(`${API_BASE}/api/friends`, {
      credentials: 'include',
      signal: controller.signal,
    })
      .then(async (res) => {
        const contentType = res.headers.get('content-type') || ''
        const payload = contentType.includes('application/json')
          ? await res.json().catch(() => ({}))
          : {}
        if (!res.ok) {
          throw new Error(payload?.message || 'Failed to load friends')
        }
        return payload
      })
      .then((payload) => {
        setFriends(payload.friends ?? [])
      })
      .catch((err) => {
        if ((err as DOMException).name === 'AbortError') return
        console.error(err)
        setError(err instanceof Error ? err.message : 'Unable to load friends')
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [])

  return (
    <div className="friends-sidebar-card" aria-live="polite">
      <div className="friends-sidebar-header">
        <div>
          <p className="friends-sidebar-title">Friends</p>
          <span className="friends-sidebar-subtitle">Tap to preview their chat</span>
        </div>
        <FiUsers className="friends-sidebar-icon" aria-hidden="true" />
      </div>

      <div className="friends-sidebar-body">
        {loading ? (
          <ul className="friend-skeleton-list">
            {skeletonCount.map((_, index) => (
              <li key={index} className="friend-skeleton">
                <span className="skeleton-avatar" />
                <span className="skeleton-lines">
                  <span />
                  <span />
                </span>
              </li>
            ))}
          </ul>
        ) : error ? (
          <p className="friend-error">{error}</p>
        ) : friends.length === 0 ? (
          <div className="friend-empty">
            <FiMessageCircle className="friend-empty-icon" aria-hidden="true" />
            <p>You don't have any friends yet.</p>
            <small>Use someone's friend code to connect instantly.</small>
          </div>
        ) : (
          <ul className="friend-list">
            {friends.map((friend) => {
              const initials = friend.username?.[0] || friend.firstName?.[0] || '?'
              return (
                <li key={friend.id}>
                  <button
                    type="button"
                    className={`friend-row ${selectedId === friend.id ? 'is-active' : ''}`}
                    onClick={() => onSelect?.(friend)}
                    aria-pressed={selectedId === friend.id}
                  >
                    <div className="friend-row-avatar">
                      {friend.profilePicture ? (
                        <img src={friend.profilePicture} alt={`${friend.username}'s avatar`} />
                      ) : (
                        <span>{initials.toUpperCase()}</span>
                      )}
                    </div>
                    <div className="friend-row-meta">
                      <p className="friend-row-name">{friend.username}</p>
                      <span className="friend-row-subtitle">
                        {friend.firstName || friend.lastName ? `${friend.firstName ?? ''} ${friend.lastName ?? ''}`.trim() : 'Naurr user'}
                      </span>
                    </div>
                    <FiChevronRight className="friend-row-icon" aria-hidden="true" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
