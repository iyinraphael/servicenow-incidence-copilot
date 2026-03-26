import kbArticles from './data/kb_articles.json' with { type: 'json' }

/**
 * Search the KB for articles relevant to the given incident.
 *
 * Strategy:
 *   1. Tokenize the incident text into lowercase words
 *   2. Score each article by keyword overlap
 *   3. Boost articles whose services match the affected_service field
 *   4. Return the top N results with scores
 *
 * This is deliberately simple. No embeddings, no vector DB.
 * For 10-15 articles, keyword matching is transparent and debuggable.
 */
export function searchKnowledgeBase(incident, topN = 3) {
  // Step 1: Build a set of search terms from the incident
  // Combine title + description, lowercase, strip punctuation, split into words
  const rawText = `${incident.title} ${incident.description}`.toLowerCase()
  const searchTerms = rawText
    .replace(/[^a-z0-9\s]/g, ' ')  // strip punctuation
    .split(/\s+/)                    // split on whitespace
    .filter(word => word.length > 2) // drop tiny words like "is", "an", "to"

  // Step 2: Score each article
  const scored = kbArticles.map(article => {
    let score = 0

    // Keyword match: count how many search terms appear in the article's keywords
    const articleKeywords = article.keywords.map(k => k.toLowerCase())
    for (const term of searchTerms) {
      if (articleKeywords.some(kw => kw.includes(term) || term.includes(kw))) {
        score += 1
      }
    }

    // Service boost: if the incident's affected service matches, add bonus points
    // This is a strong signal — if someone says "VPN" and the article is about VPN, weight it
    const incidentService = (incident.affected_service || '').toLowerCase()
    if (incidentService && article.services.some(s => s.toLowerCase() === incidentService)) {
      score += 3
    }

    // Title match bonus: if search terms appear in the article title, that's a strong signal
    const titleLower = article.title.toLowerCase()
    for (const term of searchTerms) {
      if (titleLower.includes(term)) {
        score += 0.5
      }
    }

    return { ...article, score }
  })

  // Step 3: Sort by score descending and take top N
  const results = scored
    .filter(a => a.score > 0)          // drop articles with zero relevance
    .sort((a, b) => b.score - a.score) // highest score first
    .slice(0, topN)

  // Step 4: Format the output
  // Return the shape your UI and the Claude prompt will consume
  return results.map((article, index) => ({
    article_id: article.article_id,
    title: article.title,
    snippet: article.content.slice(0, 300) + (article.content.length > 300 ? '...' : ''),
    full_content: article.content,
    score: Math.round(article.score * 100) / 100,
    rank: index + 1,
    resolution_time_minutes: article.resolution_time_minutes,
    match_reason: buildMatchReason(article, searchTerms, incident.affected_service),
  }))
}

/**
 * Build a human-readable explanation of why this article matched.
 * This goes in the UI so the analyst understands the retrieval logic.
 */
function buildMatchReason(article, searchTerms, affectedService) {
  const reasons = []

  // Which keywords matched?
  const matchedKeywords = article.keywords.filter(kw =>
    searchTerms.some(term => kw.includes(term) || term.includes(kw))
  )
  if (matchedKeywords.length > 0) {
    reasons.push(`Keyword matches: ${matchedKeywords.slice(0, 5).join(', ')}`)
  }

  // Service match?
  const incidentService = (affectedService || '').toLowerCase()
  if (incidentService && article.services.some(s => s.toLowerCase() === incidentService)) {
    reasons.push(`Service match: ${affectedService}`)
  }

  return reasons.join(' · ') || 'Partial text overlap'
}