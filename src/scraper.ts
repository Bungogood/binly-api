import axios from 'axios';
import { HTMLElement, parse } from 'node-html-parser';
import { Collection } from "./db"
import { Location } from "./osdatahub"

export const scrape = async (locs: Location[]) : Promise<Collection[]> => {
  scraper(locs[0])
  return []
}

export const scraper = async (loc: Location) : Promise<Collection[]> => {
  const url = "https://www.glasgow.gov.uk/forms/refuseandrecyclingcalendar/PrintCalendar.aspx"
  const res = await axios.get(url, { params: { uprn: loc.uprn } });
  const html = parse(res.data)

  // out.childNodes
  let monthTables = html.querySelector("table[title='Calendar']")
  let month = monthTables.id
  for (const dayTable of monthTables.querySelectorAll("table.calendar-day")) {
    const day : number = Number(dayTable.querySelector("td").innerHTML)
    for (const img of dayTable.querySelectorAll("img")) {
      console.log(img)
    }
    console.log(day)
  }
  
  // 
  return []
}
