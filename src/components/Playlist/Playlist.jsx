import Tracklist from '../Tracklist/Tracklist'

function Playlist({ name, tracks, onNameChange, onRemove, onSave }) {
  return (
    <div className="Playlist">
      <input value={name} onChange={(e) => onNameChange(e.target.value)} />
      <Tracklist tracks={tracks} onRemove={onRemove} isRemoval={true} />
      <button className="Playlist-save" onClick={onSave}>Save To Spotify</button>
    </div>
  )
}

export default Playlist
