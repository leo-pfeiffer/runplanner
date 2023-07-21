import {Week} from "~/types/Week";

export interface Event {
    name: string
    date: Date
    weeks: Week[]
}