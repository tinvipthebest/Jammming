import Track from '../Track/Track'

function Tracklist({ tracks, onAdd, onRemove, isRemoval }) {
  return (
    <div className="Tracklist">
      {tracks.map((track) => (
        <Track key={track.id} track={track} onAdd={onAdd} onRemove={onRemove} isRemoval={isRemoval} />
      ))}
    </div>
  )
}

export default Tracklist
