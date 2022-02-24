import $tc from "@/textConstants";

export interface FilterCondition<T> {
  name: string;
  filterFunction: (item: T, value: T) => boolean;
}

export interface FilterConnection {
  name: string;
  operator: string;
}

export interface FilterOption<T> {
  condition?: FilterCondition<T>;
  value?: any;
  connection?: FilterConnection;
}

export abstract class FilterOptions<T> {
  abstract conditions: FilterCondition<T>[];

  public connections: FilterConnection[] = [
    {
      name: $tc.and,
      operator: "&&",
    },
    {
      name: $tc.or,
      operator: "||",
    },
  ];
}
