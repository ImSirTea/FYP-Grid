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
  index: number;
}

export default defineComponent({
  name: "App",
  components: { Grid },
  setup(props, context) {
    const numberOfItems = ref(10000);

    const items = computed(
      () =>
        Array(numberOfItems.value)
          .fill(0)
          .map((_, index) => ({
            index,
            first: `Adam${index % 20}`,
            last: `Lansley${index % 20}`,
            age: index % 20,
          })) as Item[]
    );

    const builder = new GridConfiguration<Item>();

    builder.addNumberColumn("index", (item) => item.index);
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
