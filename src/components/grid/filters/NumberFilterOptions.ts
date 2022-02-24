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
      filterFunction: (item: number, value: number) => item < value,
    },
  ];
}

export default new NumberFilterOptions();
