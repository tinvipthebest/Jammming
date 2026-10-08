const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || window.location.origin + '/'
const scope = 'playlist-modify-public playlist-modify-private'
const authEndpoint = 'https://accounts.spotify.com/authorize'
const tokenEndpoint = 'https://accounts.spotify.com/api/token'
const apiBase = 'https://api.spotify.com/v1'

const STORAGE_KEY = 'spotify_token'
const VERIFIER_KEY = 'spotify_code_verifier'

const randomString = (length) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from(crypto.getRandomValues(new Uint8Array(length)), (x) => chars[x % chars.length]).join('')
}

const challengeFor = async (verifier) => {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

const storeToken = ({ access_token, expires_in }) => {
  const token = { accessToken: access_token, expiresAt: Date.now() + expires_in * 1000 }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(token))
  return token.accessToken
}

const getStoredToken = () => {
  try {
    const token = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return token && token.expiresAt > Date.now() ? token.accessToken : null
  } catch {
    return null
  }
}

const redirectToSpotify = async () => {
  const verifier = randomString(64)
  sessionStorage.setItem(VERIFIER_KEY, verifier)
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope,
    code_challenge_method: 'S256',
    code_challenge: await challengeFor(verifier),
  })
  window.location.assign(`${authEndpoint}?${params}`)
}

const exchangeCode = async (code) => {
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: sessionStorage.getItem(VERIFIER_KEY),
    }),
  })
  if (!response.ok) throw new Error('Spotify token exchange failed')
  sessionStorage.removeItem(VERIFIER_KEY)
  return storeToken(await response.json())
}

const Spotify = {
  // Returns a valid access token, or redirects the user to Spotify to log in (returns null).
  async getAccessToken() {
    const stored = getStoredToken()
    if (stored) return stored

    const code = new URLSearchParams(window.location.search).get('code')
    if (code) {
      // Clear the code from the URL so a refresh doesn't reuse it
      window.history.replaceState({}, document.title, window.location.pathname)
      return exchangeCode(code)
    }

    await redirectToSpotify()
    return null
  },

  logout() {
    localStorage.removeItem(STORAGE_KEY)
  },

  // Authenticated request helper: Spotify.request('/search?type=track&q=abc')
  async request(path, options = {}) {
    const accessToken = await Spotify.getAccessToken()
    if (!accessToken) return null
    const response = await fetch(`${apiBase}${path}`, {
      ...options,
      headers: { Authorization: `Bearer ${accessToken}`, ...options.headers },
    })
    if (response.status === 401) {
      Spotify.logout()
      throw new Error('Spotify session expired')
    }
    if (!response.ok) throw new Error(`Spotify request failed: ${response.status}`)
    return response.json()
  },

  async search(term) {
    if (!term) return []
    const data = await Spotify.request(`/search?type=track&q=${encodeURIComponent(term)}`)
    if (!data || !data.tracks) return []
    return data.tracks.items.map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0]?.name ?? '',
      album: track.album.name,
      uri: track.uri,
    }))
  },

  async savePlaylist(name, trackUris) {
    if (!name || !trackUris.length) return
    const jsonHeaders = { 'Content-Type': 'application/json' }
    const playlist = await Spotify.request('/me/playlists', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ name }),
    })
    if (!playlist) return
    return Spotify.request(`/playlists/${playlist.id}/tracks`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ uris: trackUris }),
    })
  },
}

export default Spotify
