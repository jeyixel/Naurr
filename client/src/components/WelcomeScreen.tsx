import React, { type JSX } from 'react'
import styles from '../styles/WelcomScreen.module.css'
import welbg from '../assets/welcomscreenbg.png'

export default function WelcomeScreen(): JSX.Element {
  return (
    <div className={styles['welcome-screen-container']} style={{ backgroundImage: `url(${welbg})` }}>
      <div className={styles['text-wrapper']}>
        <h1 className={styles['title']}>Welcome to Naurr</h1>
        <p className={styles['subtitle']}>A modern chat app built for fast, friendly conversations.</p>
      </div>
    </div>
  )
}
