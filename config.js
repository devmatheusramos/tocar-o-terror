// Preencha os URLs oficiais quando tiver.
// Enquanto estiver vazio, o botao do play da faixa mostra "em breve".
// Quando preencher `spotify` ou `audio`, o play abre o link ou toca o audio.
window.ALBUM = {
  album: {
    title: 'Trilha sonora perfeita pra tocar o terror',
    artist: 'OgTeuBala',
    year: 2026,
    city: 'Recife · PE'
  },
  platforms: [
    { name: 'Spotify',     url: '' },
    { name: 'YouTube',     url: '' },
    { name: 'Apple Music', url: '' },
    { name: 'Deezer',      url: '' }
  ],
  // Cada faixa pode ter { audio: 'assets/faixa.mp3' } E/OU { spotify: 'https://open.spotify.com/track/...' }.
  // Prioridade no play: audio local > spotify > toast "em breve".
  tracks: [
    { n: '01', name: 'Raça Ruim',           feat: 'OgTeuBala, Perseverança BG', spotify: '', audio: '' },
    { n: '02', name: 'Capota Barca',        feat: 'OgTeuBala',                   spotify: '', audio: '' },
    { n: '03', name: 'Malokeiro Original',  feat: 'OgTeuBala',                   spotify: '', audio: '' },
    { n: '04', name: 'Maquinadão',          feat: 'Brenu x TeuBala',             spotify: '', audio: '' },
    { n: '05', name: 'Menores Matador',     feat: 'OgTeuBala',                   spotify: '', audio: '' },
    { n: '06', name: 'Sarra Com a Xereca',  feat: 'OgTeuBala, TBala',            spotify: '', audio: '' },
    { n: '07', name: 'Terror Da Cena',      feat: 'OgTeuBala, Rock7, Eo Ciri',   spotify: '', audio: '' }
  ],
  products: [
    { id: 'regata',     name: 'Regata',     image: 'assets/regata.webp',     url: '' },
    { id: 'moletom',    name: 'Moletom',    image: 'assets/moletom.webp',    url: '' },
    { id: 'bermuda',    name: 'Bermuda',    image: 'assets/bermuda.webp',    url: '' },
    { id: 'five-panel', name: 'Five panel', image: 'assets/five-panel.webp', url: '' },
    { id: 'pochete',    name: 'Pochete',    image: 'assets/pochete.webp',    url: '' }
  ]
};
