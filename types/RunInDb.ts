import {Run} from "~/types/Run";

export interface RunInDb extends Run {
    id: number | null
}