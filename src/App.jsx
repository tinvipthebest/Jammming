import { useEffect, useState } from 'react'
import Spotify from './util/Spotify'
import './App.css'
import SearchBar from './components/SearchBar/SearchBar'
import SearchResults from './components/SearchResults/SearchResults'
import Playlist from './components/Playlist/Playlist'

function App() {
  const [searchResults, setSearchResults] = useState([])
  const [playlistName, setPlaylistName] = useState('New Playlist')
  const [playlistTracks, setPlaylistTracks] = useState([])

  const [error, setError] = useState(() => {
    const loginError = new URLSearchParams(window.location.search).get('error')
    return loginError ? `Spotify login failed: ${loginError}` : ''
  })

  // Completes the Spotify login when returning from the redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.has('error')) {
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (params.has('code')) {
      Spotify.getAccessToken().catch((e) => setError(e.message))
    }
  }, [])

  const search = async (term) => {
    setError('')
    try {
      setSearchResults(await Spotify.search(term.trim()))
    } catch (e) {
      setError(e.message)
    }
  }

  const addTrack = (track) => {
    setPlaylistTracks((prev) => (prev.some((t) => t.id === track.id) ? prev : [...prev, track]))
  }

  const removeTrack = (track) => {
    setPlaylistTracks((prev) => prev.filter((t) => t.id !== track.id))
  }

  const save = () => {
    // Spotify integration to be added later
    setPlaylistName('New Playlist')
    setPlaylistTracks([])
  }

  return (
    <div>
      <h1>Ja<span className="highlight">mmm</span>ing</h1>
      <SearchBar onSearch={search} />
      {error && <p role="alert">{error}</p>}
      <div className="App-playlist">
        <SearchResults tracks={searchResults} onAdd={addTrack} />
        <Playlist
          name={playlistName}
          tracks={playlistTracks}
          onNameChange={setPlaylistName}
          onRemove={removeTrack}
          onSave={save}
        />
      </div>
    </div>
  )
}

export default App
