<template>
  <grid :grid-configuration="builder" :items="items" />
</template>

<script lang="ts">
import { GridBuilder } from "@/components/grid/GridBuilder";
import { defineComponent } from "vue";
import Grid from "@/components/grid/Grid.vue";
import { WidthEnum } from "@/components/grid/columns/Column";

interface Item {
  first: string;
  last: string;
  age: number;
}

export default defineComponent({
  name: "Home",
  components: { Grid },
  data: () => {
    return {
      items: Array(100)
        .fill(0)
        .map((_, idx) => ({
          first: `Adam${idx}`,
          last: `Lansley${idx}`,
          age: idx,
        })),
    };
  },
  setup(props, context) {
    const builder = new GridBuilder<Item>();

    builder.addTextColumn("first", (item) => item.first);
    builder.addTextColumn("last", (item) => item.last);
    builder.addNumberColumn("age", (item) => item.age);
    builder.addTextColumn(
      "wide",
      (item) => (item.first + item.last).repeat(8),
      { width: WidthEnum.XLARGE }
    );

    return {
      builder,
    };
  },
});
</script>
