import axios from 'axios';
import { parse } from 'node-html-parser';
import { Collection, insertCollections } from "./db"
import { Location } from './location';

export const addCollections = async (loc: Location) => {
  let authMapper: Record<string, (loc: Location) => Promise<Collection[]>> = {
    "CITY OF GLASGOW": glasgowScraper
  }
  let scraper = authMapper[loc.authroity];
  if (scraper) {
    insertCollections(await scraper(loc))
  }
}

export const glasgowScraper = async (loc: Location) : Promise<Collection[]> => {
  const url = "https://www.glasgow.gov.uk/forms/refuseandrecyclingcalendar/PrintCalendar.aspx"
  const res = await axios.get(url, { params: { uprn: loc.uprn } });
  const html = parse(res.data)

  let collections : Collection[] = []

  let year = Number(html.querySelector("div#Year").innerHTML)
  let monthTables = html.querySelectorAll("table[title='Calendar']")
  for (const monthTable of monthTables) {
    let month = /(.*)(?:_Calendar)/.exec(monthTable.id).pop()
    for (const dayTable of monthTable.querySelectorAll("table.calendar-day")) {
      const day = Number(dayTable.querySelector("td").innerHTML)
      const date = new Date(`${year}-${month}-${day}`);
      for (const img of dayTable.querySelectorAll("img")) {
        if (img.attrs.alt) {
          const color = /(.*)(?: Bin)/.exec(img.attrs.alt).pop().toUpperCase()
          collections.push({
            uprn: loc.uprn,
            color: color,
            date: date
          })
        }
      }
    }
  }
  return collections
}
