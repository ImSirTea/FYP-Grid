<template>
  <v-app>
    <v-main>
      <grid :grid-configuration="builder" :items="items" />
      <v-btn class="mr-2" @click="() => (numberOfItems += 100)">Add 100</v-btn>
      <v-btn class="mr-2" @click="() => (numberOfItems += 500)">Add 500</v-btn>
      <v-btn @click="() => (numberOfItems += 1000)">Add 1000</v-btn>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "@vue/composition-api";
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import Grid from "@/components/grid/Grid.vue";
import { GridWidthEnum } from "@/components/grid/columns/Column";

interface Item {
  first: string;
  last: string;
  age: number;
  idx: number;
}

export default defineComponent({
  name: "App",
  components: { Grid },
  setup(props, context) {
    const numberOfItems = ref(5);

    const items = computed(
      () =>
        Array(numberOfItems.value)
          .fill(0)
          .map((_, idx) => ({
            idx,
            first: `Adam${idx % 20}`,
            last: `Lansley${idx % 20}`,
            age: idx % 20,
          })) as Item[]
    );

    const builder = new GridConfiguration<Item>();

    builder.addNumberColumn("idx", (item) => item.idx);
    builder.addTextColumn("first", (item) => item.first);
    builder.addTextColumn("last", (item) => item.last);
    builder.addNumberColumn("age", (item) => item.age);
    builder.addTextColumn(
      "wide",
      (item) => (item.first + item.last).repeat(8),
      { width: GridWidthEnum.XLARGE }
    );

    return {
      builder,
      items,
      numberOfItems,
    };
  },
});
</script>

<style lang="scss">
@import "@/styles/_main.scss";
</style>
