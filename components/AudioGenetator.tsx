'use client'
import { useState } from 'react'

function AudioGenerator() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [audioUrl, setAudioUrl] = useState('')

  const handleGenerateAudio = async () => {
    setLoading(true)
    setMessage('')
    setAudioUrl('')

    try {
      const response = await fetch('http://localhost:8000/generate_audio/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      if (response.ok) {
        setAudioUrl(url)
        setMessage('Audio generated successfully')
      } else {
        setMessage('Failed to generate audio')
      }
    } catch (error) {
      if (error instanceof Error) {
        setMessage('Error: ' + error.message)
      } else {
        setMessage('Unknown error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='p-4 max-w-md mx-auto mt-10 bg-white shadow-lg rounded-lg'>
      <h2 className='text-lg text-center font-bold mb-4'>Generate Audio</h2>
      <input
        type='text'
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder='Enter text here...'
        className='w-full p-2 border border-gray-300 rounded mb-4'
      />
      <button
        onClick={handleGenerateAudio}
        className={`w-full ${
          loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-700'
        } text-white font-bold py-2 px-4 rounded`}
        disabled={loading}>
        {loading ? 'Generating...' : 'Start'}
      </button>
      {audioUrl && (
        <div className='mt-4'>
          <h2>Generate Audio</h2>
          <audio controls>
            <source src={audioUrl} type='audio/wav' />
            Your browser does not support the audio tag.
          </audio>
        </div>
      )}
      {message && <p className='mt-4 text-center'>{message}</p>}
    </div>
  )
}

export default AudioGenerator
