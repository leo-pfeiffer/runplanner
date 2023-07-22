import {Week} from "~/types/Week";

export interface WeekInDb  extends Week {
    id: number | null
}