import { useState } from 'react'
import './App.css'
import SearchBar from './components/SearchBar/SearchBar'
import SearchResults from './components/SearchResults/SearchResults'
import Playlist from './components/Playlist/Playlist'

const sampleTracks = [
  { id: 1, name: 'Song One', artist: 'Artist A', album: 'Album X' },
  { id: 2, name: 'Song Two', artist: 'Artist B', album: 'Album Y' },
  { id: 3, name: 'Song Three', artist: 'Artist C', album: 'Album Z' },
]

function App() {
  const [searchResults, setSearchResults] = useState([])
  const [playlistName, setPlaylistName] = useState('New Playlist')
  const [playlistTracks, setPlaylistTracks] = useState([])

  const search = (term) => {
    const t = term.trim().toLowerCase()
    setSearchResults(
      sampleTracks.filter((s) =>
        [s.name, s.artist, s.album].some((f) => f.toLowerCase().includes(t))
      )
    )
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
