import $tc from "@/textConstants";

export type FilterFunction<T> = (item: T, value: T) => boolean;

export enum FilterOperator {
  and,
  or,
}

export interface FilterCondition<T> {
  name: string;
  filterFunction: FilterFunction<T>;
}

export interface FilterConnection {
  name: string;
  operator: FilterOperator;
}

export interface FilterOption<T> {
  filterFunction?: FilterFunction<T>;
  value?: any;
  operator?: FilterOperator;
}

export abstract class FilterOptions<T> {
  abstract conditions: FilterCondition<T>[];

  public operators: FilterConnection[] = [
    {
      name: $tc.and,
      operator: FilterOperator.and,
    },
    {
      name: $tc.or,
      operator: FilterOperator.or,
    },
  ];
}
