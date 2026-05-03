import type { EventCategory } from '~/types'

/** Maps API category name/slug keywords to Material Symbols for browse sidebar. */
export function eventCategoryMaterialIcon(
  category: Pick<EventCategory, 'name' | 'slug'>
): string {
  const blob = `${category.slug ?? ''} ${category.name}`.toLowerCase()
  if (blob.includes('music') || blob.includes('concert')) return 'music_note'
  if (blob.includes('food') || blob.includes('drink') || blob.includes('wine')) return 'restaurant'
  if (blob.includes('business') || blob.includes('summit') || blob.includes('network')) {
    return 'business_center'
  }
  if (
    blob.includes('art')
    || blob.includes('culture')
    || blob.includes('gallery')
    || blob.includes('theatre')
    || blob.includes('theater')
  ) {
    return 'palette'
  }
  if (blob.includes('sport') || blob.includes('fitness')) return 'fitness_center'
  if (blob.includes('tech') || blob.includes('code')) return 'code'
  return 'sell'
}
