import { useState, useEffect } from 'react'
import '../styles/CookieConsent.css'

export default function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent')
    if (!consent) {
      setTimeout(() => setShow(true), 1000)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="cookie-consent">
      <div className="cookie-content">
        <span className="cookie-emoji">🍪</span>
        <div className="cookie-text">
          <p>
            <strong>We use cookies!</strong> This site uses cookies to keep you logged in and make your experience smoother.
          </p>
        </div>
        <button onClick={handleAccept} className="cookie-button">
          Got it!
        </button>
      </div>
    </div>
  )
}
