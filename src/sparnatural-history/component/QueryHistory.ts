import { SparnaturalQuery } from "sparnatural";

export interface QueryHistory {
  date: string;
  id: string;
  isFavorite: boolean;
  queryJson: SparnaturalQuery;
}
