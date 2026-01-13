import React, { type JSX } from 'react'
import '../styles/WelcomScreen.css'

export default function WelcomeScreen(): JSX.Element {
  return (
    <section className="welcome-screen" aria-label="Welcome screen">
      <div className="ws-card">
        <header className="ws-header">
          <h1 className="ws-title">Welcome to Naurr</h1>
          <p className="ws-subtitle">A modern chat app built for fast, friendly conversations.</p>
        </header>

        <div className="ws-body">
          <div className="ws-illustration" aria-hidden>
            <div className="ws-blob">💬</div>
          </div>

          <div className="ws-features">
            <p className="ws-lead">This is a modern chat app.</p>
            <ul className="ws-list">
              <li>Fast, responsive interface</li>
              <li>Simple friend codes to connect</li>
              <li>Privacy-first account controls</li>
            </ul>
            <div className="ws-actions">
              <button className="ws-cta" type="button">Get started</button>
              <button className="ws-ghost" type="button">Learn more</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
