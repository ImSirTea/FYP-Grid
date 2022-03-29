<template>
  <v-app>
    <v-main>
      <grid :grid-configuration="builder" :items="items" />
      <v-btn @click="updateItems">Update Items</v-btn>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, shallowRef } from "@vue/composition-api";
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import Grid from "@/components/grid/Grid.vue";

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
    let count = 0;

    const items = shallowRef(
      Array(1000)
        .fill(0)
        .map((_, index) => {
          // add some variance so we can mess aboot with checking filters
          index % 20 === 0 ? count++ : null;

          return {
            index,
            first: `Adam${index % 20}`,
            last: `Lansley${index % 20}`,
            age: (index % 20) + count,
          };
        }) as Item[]
    );

    const builder = new GridConfiguration<Item>();

    builder.addNumberColumn("index", (item) => item.index);
    builder.addTextColumn("first", (item) => item.first);
    builder.addTextColumn("last", (item) => item.last);
    builder.addTextColumn("wide", (item) => (item.first + item.last).repeat(8));
    builder.addNumberColumn("age", (item) => item.age);
    builder.addTextColumn(
      "updated",
      (item) => "updated" + item.index + item.first
    );
    builder.addNumberColumn("test", (item) => item.index);
    builder
      .withActionColumn()
      .addAction("log for me", (item) => {
        console.log(`Logging from actions: #${item.index}`);
      })
      .addRoute(`redirect to #{index}`, (item) => `#${item.index}`);

    const updateItems = () => {
      const base = Math.floor(Math.random() * 1000000);
      items.value = Array(base)
        .fill(0)
        .map((_, index) => ({
          index,
          first: `Adam-(${base})-${index % 20}`,
          last: `Lansley-(${base})-${index % 20}`,
          age: index % 20,
        })) as Item[];
    };

    return {
      builder,
      items,
      updateItems,
    };
  },
});
</script>

<style lang="scss">
@import "@/styles/_main.scss";
</style>
