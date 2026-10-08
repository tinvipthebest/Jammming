import { useState } from 'react'

function SearchBar({ onSearch }) {
  const [term, setTerm] = useState('')

  return (
    <div className="SearchBar">
      <input
        placeholder="Enter A Song, Album, or Artist"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />
      <button className="SearchButton" onClick={() => onSearch(term)}>Search</button>
    </div>
  )
}

export default SearchBar
