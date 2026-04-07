export default defineEventHandler(async (event) => {
  const { id } = getQuery(event)
  
  if (!id) {
    throw createError({ statusCode: 400, message: 'ID vidéo requis' })
  }

  try {
    const youtubeUrl = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&controls=1&showinfo=0&iv_load_policy=3&disablekb=1`
    
    const response = await fetch(youtubeUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    })
    
    if (!response.ok) throw new Error(`YouTube error: ${response.status}`)
    
    let html = await response.text()
    
    // Supprimer branding YouTube
    html = html
      .replace(/YouTube/g, 'EduAI')
      .replace(/youtube\.com/g, 'eduai.bj')
      .replace(/youtube-nocookie\.com/g, 'eduai.bj')
      .replace(/www\.gstatic\.com/g, 'cdn.eduai.bj')
    
    // CSS pour cacher éléments YouTube
    const hideCSS = `
      <style>
        .ytp-chrome-top,
        .ytp-title-channel,
        .ytp-title-text,
        .ytp-watermark,
        .ytp-more-videos-view,
        .ytp-pause-overlay,
        .ytp-related-on-error-overlay,
        .ytp-endscreen-content {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
        }
        .html5-video-player { background: #000 !important; }
        body { overflow: hidden !important; }
      </style>
    `
    
    html = html.replace('</head>', `${hideCSS}</head>`)
    
    setResponseHeaders(event, {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=3600'
    })
    
    return html
    
  } catch (error) {
    console.error('Proxy YouTube error:', error)
    throw createError({ 
      statusCode: 500, 
      message: 'Erreur de chargement vidéo' 
    })
  }
})