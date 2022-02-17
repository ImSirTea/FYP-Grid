<template>
  <v-app>
    <v-main>
      <grid :grid-configuration="builder" :items="items" />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import { GridBuilder } from "@/components/grid/GridBuilder";
import Grid from "@/components/grid/Grid.vue";
import { WidthEnum } from "@/components/grid/columns/Column";

interface Item {
  first: string;
  last: string;
  age: number;
}

export default defineComponent({
  name: "App",
  components: { Grid },
  data: () => {
    return {
      // items: Array(100)
      //   .fill(0)
      //   .map((_, idx) => ({
      //     first: `Adam${idx}`,
      //     last: `Lansley${idx}`,
      //     age: idx,
      //   })),
      items: [
        { first: "Adam0", last: "Lansley0", age: 22 },
        { first: "Adam1", last: "Lansley0", age: 22 },
        { first: "Adam0", last: "Lansley0", age: 23 },
      ] as Item[],
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
