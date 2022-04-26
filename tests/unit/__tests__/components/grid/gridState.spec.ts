import { GridConfiguration } from "@/components/grid/GridConfiguration";
import { Item } from "@/App.vue";

describe("GridState", () => {
  const gridConfiguration = new GridConfiguration<Item>();
  // const firstNameColumn = gridConfiguration.addTextColumn(
  //   "firstName",
  //   (item) => item.first
  // );
  // const indexColumn = gridConfiguration.addNumberColumn(
  //   "index",
  //   (item) => item.index
  // );

  // const items = buildItems(50);
  // const gridState = gridConfiguration.defaultState;
  it("Sorting Functionality", () => {
    const gridConfiguration = new GridConfiguration<Item>();
    // Ascending
    // gridState.toggleSort(indexColumn);
    // expect(items.every((item, index) => item.index === index)).toBe(true);
    // // Descending
    // gridState.toggleSort(indexColumn);
    // expect(
    //   items.every((item, index) => item.index === items.length - index)
    // ).toBe(true);
  });
});
