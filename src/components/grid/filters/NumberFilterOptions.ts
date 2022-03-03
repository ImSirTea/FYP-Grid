import {
  FilterCondition,
  FilterOptions,
} from "@/components/grid/filters/types";
import $tc from "@/textConstants";

export const FilterConditions: FilterCondition<number>[] = [];

class NumberFilterOptions extends FilterOptions<number> {
  public conditions: FilterCondition<number>[] = [
    {
      name: $tc.lessThan,
      filterFunction: (item: number, value: number) => {
        return item < value;
      },
    },
    {
      name: $tc.greaterThan,
      filterFunction: (item: number, value: number) => {
        return item > value;
      },
    },
  ];
}

export default new NumberFilterOptions();
