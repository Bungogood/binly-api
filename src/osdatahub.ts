import { osdatahub } from "../config.json"
import axios from "axios";

interface Results {
  header: any
  results: {
    DPA: Result
  }[]
}

interface Result {
  UPRN: string
  UDPRN: string
  ADDRESS: string
  BUILDING_NAME?: string
  BUILDING_NUMBER?: string
  DEPENDENT_LOCALITY?: string
  THOROUGHFARE_NAME: string
  POST_TOWN: string
  POSTCODE: string
  LOCAL_CUSTODIAN_CODE_DESCRIPTION: string
  MATCH: number
}

export interface Location {
	uprn: string
	building_name: string
	street: string
	area?: string
	city: string
	postcode: string
	authroity: string
}

const toLocation = (res: Result): Location => ({
  uprn: res.UPRN,
  building_name: res.BUILDING_NAME ? res.BUILDING_NAME : res.BUILDING_NUMBER,
  street: res.THOROUGHFARE_NAME,
  area: res.DEPENDENT_LOCALITY,
  city: res.POST_TOWN,
  postcode: res.POSTCODE,
  authroity: res.LOCAL_CUSTODIAN_CODE_DESCRIPTION
})

const bestLocation = (results: Results) : Location => {
  return toLocation(results.results[0].DPA)
}

export const findLocation = async (query: string) : Promise<Location> => {
  let url = `https://api.os.uk/search/places/v1/find`;
  return axios.get(url, {
      params: {
        query: query,
        key: osdatahub.apiKey
      }
    }).then((res: {data: Results}) => {
      return bestLocation(res.data);
    })
}

