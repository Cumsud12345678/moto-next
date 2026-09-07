export interface Metadata {
  makes: Array<Default>
  models: Array<Default>
  used_types: Array<Type1>
  cities: Array<Default>
  document: Array<Type1>,
  categories: Array<Default>
  fuel_types: Array<Default>
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