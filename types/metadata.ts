export interface Metadata {
  makes: Array<Default>
  models: Array<Default>
  cities: Array<Default>
  categories: Array<Default>
  fuelTypes: Array<Default>
  transmissions: Array<Default>
  colors: Array<Default>
  equipments: Array<Default>
}

export interface Default {
  _id: string,
  label: string,
  logo?: string,
  make?: string
}

export interface Type1 {
  _id: string,
  label: string,
  status: boolean | null;
}