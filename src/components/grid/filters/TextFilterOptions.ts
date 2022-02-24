import {
  FilterCondition,
  FilterOptions,
} from "@/components/grid/filters/types";
import $tc from "@/textConstants";

class TextFilterOptions extends FilterOptions<string> {
  public conditions: FilterCondition<string>[] = [
    {
      name: $tc.contains,
      filterFunction: (item: string, value: string) =>
        item.trim().toLowerCase().includes(value.trim().toLowerCase()),
    },
  ];
}

export default new TextFilterOptions();
