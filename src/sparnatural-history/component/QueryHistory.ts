import { ISparJson } from "sparnatural/src/sparnatural/generators/json/ISparJson";

export interface QueryHistory {
  date: string;
  id: string;
  isFavorite: boolean;
  queryJson: ISparJson;
}
