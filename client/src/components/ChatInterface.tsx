import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEventHandler } from 'react'
import { FiSend, FiSmile, FiPaperclip } from 'react-icons/fi'
import { useSocket } from './SocketProvider'
import { useAuth } from './AuthProvider'
import type { FriendListFriend } from './FriendList'
import '../styles/ChatInterface.css'

type ChatMessage = {
	_id: string
	conversationId: string
	senderId: {
		_id: string
		username: string
		firstName?: string
		lastName?: string
		profilePicture?: string
	}
	text: string
	createdAt: string
	tempId?: string
}

type ChatInterfaceProps = {
	friend: FriendListFriend
	conversationId: string
}

export default function ChatInterface({ friend, conversationId }: ChatInterfaceProps) {
	const { user } = useAuth()
	const { socket } = useSocket()
	const [draft, setDraft] = useState('')
	const [messages, setMessages] = useState<ChatMessage[]>([])
	const [loading, setLoading] = useState(true)
	const viewportRef = useRef<HTMLDivElement | null>(null)

	const friendLabel = useMemo(
		() => friend.firstName || friend.username || 'Friend',
		[friend.firstName, friend.username]
	)

	// Load initial messages when conversation changes
	useEffect(() => {
		const loadMessages = async () => {
			setLoading(true)
			try {
				const res = await fetch(
					`http://localhost:5000/api/conversations/${conversationId}/messages?limit=50`,
					{
						credentials: 'include',
					}
				)

				if (res.ok) {
					const data = await res.json()
					setMessages(data.messages)
				}
			} catch (error) {
				console.error('Error loading messages:', error)
			} finally {
				setLoading(false)
			}
		}

		loadMessages()
	}, [conversationId])

	// Join conversation room and listen for new messages
	useEffect(() => {
		if (!socket || !conversationId) return

		console.log(`🔌 Joining conversation: ${conversationId}`)
		socket.emit('conversation:join', conversationId)

		const handleNewMessage = (data: { message: ChatMessage; tempId?: string }) => {
			console.log(`📨 Received message:new`, data)
			setMessages((prev) => {
				// Remove temp message if it exists and replace with real one
				if (data.tempId) {
					const filtered = prev.filter((m) => m.tempId !== data.tempId)
					return [...filtered, data.message]
				}
				// Add new message if not already present
				if (!prev.find((m) => m._id === data.message._id)) {
					return [...prev, data.message]
				}
				return prev
			})
		}

		const handleMessageError = (data: { tempId?: string; error: string }) => {
			console.error('❌ Message error:', data.error)
			// Remove failed temp message
			if (data.tempId) {
				setMessages((prev) => prev.filter((m) => m.tempId !== data.tempId))
			}
			alert(data.error)
		}

		socket.on('message:new', handleNewMessage)
		socket.on('message:error', handleMessageError)

		return () => {
			// console.log(`🔌 Leaving conversation: ${conversationId}`)
			socket.emit('conversation:leave', conversationId)
			socket.off('message:new', handleNewMessage)
			socket.off('message:error', handleMessageError)
		}
	}, [socket, conversationId])

	// Auto-scroll to bottom when messages change
	useEffect(() => {
		const viewport = viewportRef.current
		if (!viewport) return
		viewport.scrollTop = viewport.scrollHeight
	}, [messages])

	const handleSend = () => {
		const text = draft.trim()
		if (!text || !socket || !user) return

		const tempId = `temp-${Date.now()}`

		console.log(`📤 Sending message to conversation ${conversationId}`, { text, tempId })

		// Optimistic UI: Add temporary message
		const tempMessage: ChatMessage = {
			_id: tempId,
			conversationId,
			senderId: {
				_id: user._id,
				username: user.username ?? user.email ?? 'Unknown',
				firstName: user.firstName,
				lastName: user.lastName,
				profilePicture: user.profilePicture,
			},
			text,
			createdAt: new Date().toISOString(),
			tempId,
		}

		setMessages((prev) => [...prev, tempMessage])
		setDraft('')

		// Send via socket
		socket.emit('message:send', {
			conversationId,
			text,
			tempId,
		})
	}

	const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			handleSend()
		}
	}

	const initials = friend.username?.[0] || friend.firstName?.[0] || '?'

	return (
		<section className="chat-shell" aria-label={`Chat with ${friendLabel}`}>
			<header className="chat-header">
				<div className="chat-header-meta">
					<div className="chat-avatar">
						{friend.profilePicture ? (
							<img src={friend.profilePicture} alt={`${friendLabel}'s avatar`} />
						) : (
							<span>{initials.toUpperCase()}</span>
						)}
					</div>
					<div>
						<p className="chat-title">{friendLabel}</p>
						<span className="chat-subtitle">@{friend.username}</span>
					</div>
				</div>
				<div className="chat-header-actions" aria-hidden="true">
					<FiSmile />
				</div>
			</header>

			<div className="chat-body" ref={viewportRef}>
				{loading ? (
					<p style={{ textAlign: 'center', color: '#999' }}>Loading messages...</p>
				) : messages.length === 0 ? (
					<p style={{ textAlign: 'center', color: '#999' }}>
						No messages yet. Start the conversation!
					</p>
				) : (
					messages.map((message) => {
						const isMe = message.senderId._id === user?._id
						const timestamp = new Date(message.createdAt).toLocaleTimeString('en-US', {
							hour: 'numeric',
							minute: '2-digit',
						})

						return (
							<article
								key={message._id}
								className={`chat-bubble ${isMe ? 'is-me' : 'is-friend'}`}
							>
								<p>{message.text}</p>
								<span className="chat-timestamp">{timestamp}</span>
							</article>
						)
					})
				)}
			</div>

			<footer className="chat-input-row">
				<button type="button" className="chat-icon-button" aria-label="Attach file">
					<FiPaperclip />
				</button>
				<div className="chat-input-wrap">
					<textarea
						value={draft}
						onChange={(e) => setDraft(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder={`Message ${friendLabel}`}
						rows={1}
					/>
				</div>
				<button type="button" className="chat-icon-button send" onClick={handleSend} aria-label="Send">
					<FiSend />
				</button>
			</footer>
		</section>
	)
}
