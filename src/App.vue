<template>
  <v-app>
    <v-main>
      <grid :grid-configuration="builder" :items="items" />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import Grid from "@/components/grid/Grid.vue";
import { WidthEnum } from "@/components/grid/columns/Column";

interface Item {
  first: string;
  last: string;
  age: number;
  idx: number;
}

export default defineComponent({
  name: "App",
  components: { Grid },
  data: () => {
    return {
      items: Array(10000)
        .fill(0)
        .map((_, idx) => ({
          idx,
          first: `Adam${idx % 20}`,
          last: `Lansley${idx % 20}`,
          age: idx % 20,
        })) as Item[],
    };
  },
  setup(props, context) {
    const builder = new GridConfiguration<Item>();

    builder.addNumberColumn("idx", (item) => item.idx);
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

<style lang="scss">
@import "@/styles/_main.scss";
</style>
