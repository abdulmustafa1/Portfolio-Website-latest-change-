// Fuzzy search utility functions

// Calculate Levenshtein distance between two strings
export function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
}

// Calculate similarity score (0-1, where 1 is exact match)
export function calculateSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;
  
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return (maxLength - distance) / maxLength;
}

// Fuzzy search function
export function fuzzySearch<T>(
  items: T[],
  query: string,
  getSearchableText: (item: T) => string[],
  threshold: number = 0.6
): T[] {
  if (!query.trim()) return items;

  const queryLower = query.toLowerCase().trim();
  
  return items
    .map(item => {
      const searchableTexts = getSearchableText(item);
      let maxSimilarity = 0;

      // Check each searchable text field
      for (const text of searchableTexts) {
        if (!text) continue;
        
        const textLower = text.toLowerCase();
        
        // Exact substring match gets highest priority
        if (textLower.includes(queryLower)) {
          maxSimilarity = 1;
          break;
        }
        
        // Check word-by-word for partial matches
        const words = textLower.split(/\s+/);
        for (const word of words) {
          const similarity = calculateSimilarity(queryLower, word);
          maxSimilarity = Math.max(maxSimilarity, similarity);
          
          // Also check if query is a substring of the word
          if (word.includes(queryLower)) {
            maxSimilarity = Math.max(maxSimilarity, 0.8);
          }
        }
        
        // Check full text similarity
        const fullSimilarity = calculateSimilarity(queryLower, textLower);
        maxSimilarity = Math.max(maxSimilarity, fullSimilarity);
      }

      return { item, similarity: maxSimilarity };
    })
    .filter(({ similarity }) => similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .map(({ item }) => item);
}

// Specific fuzzy search for tags
export function fuzzySearchTags(tags: { name: string }[], query: string): { name: string }[] {
  return fuzzySearch(
    tags,
    query,
    (tag) => [tag.name],
    0.5 // Lower threshold for tag matching
  );
}