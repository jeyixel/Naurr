import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEventHandler } from 'react'
import { FiSend, FiSmile, FiPaperclip } from 'react-icons/fi'
import type { FriendListFriend } from './FriendList'
import '../styles/ChatInterface.css'

type ChatMessage = {
	id: string
	sender: 'me' | 'friend'
	text: string
	timestamp: string
}

type ChatInterfaceProps = {
	friend: FriendListFriend
}

export default function ChatInterface({ friend }: ChatInterfaceProps) {
	const [draft, setDraft] = useState('')
	const [messages, setMessages] = useState<ChatMessage[]>(() => defaultMessages(friend))
	const viewportRef = useRef<HTMLDivElement | null>(null)

	const friendLabel = useMemo(
		() => friend.firstName || friend.username || 'Friend',
		[friend.firstName, friend.username]
	)

	useEffect(() => {
		setMessages(defaultMessages(friend))
	}, [friend])

	useEffect(() => {
		const viewport = viewportRef.current
		if (!viewport) return
		viewport.scrollTop = viewport.scrollHeight
	}, [messages])

	const handleSend = () => {
		const text = draft.trim()
		if (!text) return

		const outgoing: ChatMessage = {
			id: `me-${Date.now()}`,
			sender: 'me',
			text,
			timestamp: 'Now',
		}

		setMessages((prev) => [...prev, outgoing])
		setDraft('')
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
				{messages.map((message) => (
					<article
						key={message.id}
						className={`chat-bubble ${message.sender === 'me' ? 'is-me' : 'is-friend'}`}
					>
						<p>{message.text}</p>
						<span className="chat-timestamp">{message.timestamp}</span>
					</article>
				))}
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

function defaultMessages(friend: FriendListFriend): ChatMessage[] {
	const who = friend.firstName || friend.username || 'Your friend'
	return [
		{
			id: 'seed-1',
			sender: 'friend',
			text: `Hey, it's ${who}! This space will show our messages soon.`,
			timestamp: '2:45 PM',
		},
		{
			id: 'seed-2',
			sender: 'me',
			text: 'Nice, looks good already. I will send you a message when it is wired to the backend.',
			timestamp: '2:46 PM',
		},
	]
}
