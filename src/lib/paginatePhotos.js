export function paginatePhotos(aspects, height, containerWidth, gap) {
  if (!aspects || aspects.length === 0) return []
  if (containerWidth <= 0 || height <= 0) return []

  const pages = []
  let currentPage = []
  let currentUsed = 0

  for (let i = 0; i < aspects.length; i++) {
    const width = Math.floor(height * aspects[i])
    
    if (currentPage.length === 0) {
      currentPage.push(i)
      currentUsed = width
    } else {
      const addedWidth = gap + width
      if (currentUsed + addedWidth <= containerWidth) {
        currentPage.push(i)
        currentUsed += addedWidth
      } else {
        pages.push(currentPage)
        currentPage = [i]
        currentUsed = width
      }
    }
  }
  
  if (currentPage.length > 0) {
    pages.push(currentPage)
  }

  return pages
}
