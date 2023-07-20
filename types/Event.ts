import {Week} from "~/types/Week";

export interface Event {
    id: number
    name: string
    date: Date
    weeks: Week[]
}