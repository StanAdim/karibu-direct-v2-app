/** Rows from `/api/v1/locations/drill` (GET or POST). */
export interface DrillLocationRow {
  id: number
  name: string
  postcode: number
}

/** Profile FK triple (stored on ``users`` extension / ``user_profiles``). */
export interface ProfileGeoIds {
  region_id: number | null
  district_id: number | null
  ward_id: number | null
}
