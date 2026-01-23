import React, { type JSX } from 'react'
import styles from '../styles/WelcomScreen.module.css'
import welbg from '../assets/welcomscreenbg.png'

export default function WelcomeScreen(): JSX.Element {
  return (
    // add a background image or gradient to the welcome screen container
    <div className={styles['welcome-screen-container']} style={{ backgroundImage: `url(${welbg})` }}>
      <section className={styles['welcome-screen']} aria-label="Welcome screen">
        <div className={styles['ws-card']}>
          <header className={styles['ws-header']}>
            <h1 className={styles['ws-title']}>Welcome to Naurr</h1>
            <p className={styles['ws-subtitle']}>A modern chat app built for fast, friendly conversations.</p>
          </header>
          <div className={styles['ws-body']}>
            <div className={styles['ws-illustration']} aria-hidden>
              <div className={styles['ws-blob']}>💬</div>
            </div>
            <div className={styles['ws-features']}>
              <p className={styles['ws-lead']}>This is a modern chat app.</p>
              <ul className={styles['ws-list']}>
                <li>Fast, responsive interface</li>
                <li>Simple friend codes to connect</li>
                <li>Privacy-first account controls</li>
              </ul>
              <div className={styles['ws-actions']}>
                <button className={styles['ws-cta']} type="button">Get started</button>
                <button className={styles['ws-ghost']} type="button">Learn more</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
