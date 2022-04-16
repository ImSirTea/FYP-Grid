import { AnyGridColumn } from "@/components/grid/columns/AbstractColumn";
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import {
  AnyWithRowIndex,
  GridState,
  rowIndex,
} from "@/components/grid/GridState";
import { h } from "@vue/composition-api";
import { VNode } from "vue";
import GridRow from "@/components/grid/GridRow.vue";

interface PinnedColumnGroups {
  left: AnyGridColumn[];
  centre: AnyGridColumn[];
  right: AnyGridColumn[];
}

export class GridData {
  // Data for building
  #gridConfiguration!: GridConfiguration<any>;
  #gridState!: GridState;
  #internalItems!: AnyWithRowIndex[];
  #rowHeight!: number;

  lastRowBoundaries = {
    lastMin: 0,
    lastMax: 0,
  };

  // Header rows
  headerRows = {
    left: [] as VNode[],
    centre: [] as VNode[],
    right: [] as VNode[],
  };

  // Body rows
  bodyRows = {
    left: [] as VNode[],
    centre: [] as VNode[],
    right: [] as VNode[],
  };

  constructor(
    gridConfiguration: GridConfiguration<any>,
    gridState: GridState,
    items: AnyWithRowIndex[],
    rowHeight: number
  ) {
    this.#gridConfiguration = gridConfiguration;
    this.#gridState = gridState;
    this.#rowHeight = rowHeight;

    // Inject grid indexes into a copy of our prop items, so we can maintain sort order
    this.#internalItems = gridState.injectGridIndexes(items);
  }

  get cssUnit() {
    return "px";
  }

  get #visibleColumns() {
    return this.#gridConfiguration.columns
      .filter((column) => !this.#gridState.columnStates[column.key].isHidden)
      .sort(this.sortOnOrder);
  }

  get columns() {
    const columns: PinnedColumnGroups = {
      left: [],
      centre: [],
      right: [],
    };

    this.#visibleColumns.forEach((column) => {
      const pin = this.#gridState.columnStates[column.key].pin;
      columns[pin].push(column);
    });

    return columns;
  }

  get sortOnOrder() {
    return (a: AnyGridColumn, b: AnyGridColumn) => {
      const aOrder = this.#gridState.columnStates[a.key].order;
      const bOrder = this.#gridState.columnStates[b.key].order;

      return aOrder - bOrder;
    };
  }

  // ONLY TO BE USED IN RENDER CONTEXT
  buildBodyRows(newMin: number, newMax: number) {
    const { lastMin, lastMax } = this.lastRowBoundaries;
    const currentTotalRows = lastMax - lastMin;

    let buildMin = newMin;
    let buildMax = newMax;
    let buildFunction: "push" | "unshift" = "push";

    const reusableRows = Math.max(0, lastMax - newMin);

    // If we have rows we can reuse, we should build around them
    if (reusableRows) {
      // Our minimum row index has moved up (scrolling down)
      // We should have rows up to our last max we've already built
      if (newMin >= lastMin) {
        buildMin = lastMax;
        const numberToRemove = currentTotalRows - (newMin - lastMin);
        this.bodyRows.left.splice(0, numberToRemove);
        this.bodyRows.centre.splice(0, numberToRemove);
        this.bodyRows.right.splice(0, numberToRemove);
      }

      // Our minimum row index has moved down (scrolling up)
      // We should have rows up to our last min we've already built
      if (newMin < lastMin) {
        buildMax = lastMin;
        buildFunction = "unshift";
        const numberToRemove = currentTotalRows - (newMax - lastMin);
        this.bodyRows.left.splice(
          currentTotalRows - numberToRemove,
          currentTotalRows
        );
        this.bodyRows.centre.splice(
          currentTotalRows - numberToRemove,
          currentTotalRows
        );
        this.bodyRows.right.splice(
          currentTotalRows - numberToRemove,
          currentTotalRows
        );
      }
    }

    this.#internalItems.slice(buildMin, buildMax).forEach((item, index) => {
      const rowNumber = index + newMin;
      let totalColumns = 0;

      // Build our left pinned columns
      if (this.columns.left.length) {
        this.bodyRows.left[buildFunction](
          this.#buildRow(item, rowNumber, this.columns.left, totalColumns)
        );

        totalColumns += this.columns.left.length;
      }

      // Build our centre pins
      if (this.columns.centre.length) {
        this.bodyRows.left[buildFunction](
          this.#buildRow(item, rowNumber, this.columns.centre, totalColumns)
        );

        totalColumns += this.columns.centre.length;
      }

      // Finally the right
      if (this.columns.right.length) {
        this.bodyRows.left[buildFunction](
          this.#buildRow(item, rowNumber, this.columns.centre, totalColumns)
        );
      }
    });

    this.lastRowBoundaries = {
      lastMin: newMin,
      lastMax: newMax,
    };

    return this.bodyRows;
  }

  #buildRow(
    item: AnyWithRowIndex,
    rowNumber: number,
    columns: AnyGridColumn[],
    columnStartIndex: number
  ) {
    return h(GridRow, {
      attrs: {
        role: "row",
        "aria-rowindex": rowNumber + 1,
      },
      class: {
        "grid-row": true,
        "grid-row-hovered": item[rowIndex] === this.#gridState.rowHovered,
      },
      style: {
        top: rowNumber * this.#rowHeight + this.cssUnit,
        height: this.#rowHeight + this.cssUnit,
      },
      props: {
        item,
        columns,
        columnStartIndex,
      },
      nativeOn: {
        mouseenter: () => {
          this.#gridState.rowHovered = item[rowIndex];
        },
        mouseleave: () => {
          this.#gridState.rowHovered = null;
        },
      },
    });
  }
}
