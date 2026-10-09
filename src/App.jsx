import { useState, useEffect } from 'react'
import './App.css'

const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY
const CHECKIN_INTERVAL = 20 * 60 * 1000 // 20 minutes

function App() {
  const [goal, setGoal] = useState('')
  const [savedGoal, setSavedGoal] = useState(null)
  const [checkinMsg, setCheckinMsg] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [focusMode, setFocusMode] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('dailyGoal')
    if (saved) {
      setSavedGoal(saved)
    }
  }, [])

  useEffect(() => {
    if (!savedGoal || !focusMode) return

    const checkIn = async () => {
      setIsLoading(true)
      try {
        const screenshotData = await window.electron.takeScreenshot()
        if (!screenshotData.success) {
          console.error('Screenshot failed:', screenshotData.error)
          setIsLoading(false)
          return
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': CLAUDE_API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 100,
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'image',
                    source: {
                      type: 'base64',
                      media_type: 'image/png',
                      data: screenshotData.image,
                    },
                  },
                  {
                    type: 'text',
                    text: `The user's goal is: "${savedGoal}". Give a 1-sentence supportive check-in. Be brief, warm, and ADHD-friendly. No more than 15 words.`,
                  },
                ],
              },
            ],
          }),
        })

        const data = await response.json()
        const message = data.content[0].text
        setCheckinMsg(message)

        // Text-to-speech
        const utterance = new SpeechSynthesisUtterance(message)
        speechSynthesis.speak(utterance)
      } catch (error) {
        console.error('Check-in failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const timer = setInterval(checkIn, CHECKIN_INTERVAL)
    return () => clearInterval(timer)
  }, [savedGoal, focusMode])

  const handleSave = () => {
    localStorage.setItem('dailyGoal', goal)
    setSavedGoal(goal)
    setGoal('')
    setFocusMode(true)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave()
    }
  }

  return (
    <div className="app">
      <div className="floating-window">
        <h1>DoubleBrain</h1>

        {!savedGoal ? (
          <>
            <p>What's your goal today?</p>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g. Apply to 20 jobs"
              className="goal-input"
              autoFocus
            />
            <button onClick={handleSave} className="save-btn">
              Start Focus
            </button>
          </>
        ) : (
          <>
            <div className="goal-display">
              <p><strong>Goal:</strong> {savedGoal}</p>
              <p className="focus-status">
                {focusMode ? '🎯 Focus mode ON' : 'Off'}
              </p>
            </div>

            {isLoading && <p className="loading">Checking in...</p>}

            {checkinMsg && (
              <div className="checkin-msg">
                <p>💬 {checkinMsg}</p>
              </div>
            )}

            <button
              onClick={() => setFocusMode(!focusMode)}
              className={`toggle-btn ${focusMode ? 'active' : ''}`}
            >
              {focusMode ? 'Pause' : 'Resume'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default App
