<template>
  <v-app>
    <v-main>
      <grid
        v-model="items"
        :grid-configuration="builder"
        :grid-state="builder.defaultState"
        :grid-height="550"
      />
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
      Array(100)
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

    builder
      .addNumberColumn("index", (item) => item.index)
      .setOption("defaultPin", "left");
    builder.addTextColumn("last1", (item) => item.last + "- 1");
    builder.addTextColumn("first2", (item) => item.first + "- 2");
    builder.addTextColumn("last2", (item) => item.last + "- 2");
    builder.addTextColumn("first3", (item) => item.first + "- 3");
    builder.addTextColumn("last3", (item) => item.last + "- 3");
    builder.addTextColumn("first4", (item) => item.first + "- 4");
    builder.addTextColumn("last4", (item) => item.last + "- 4");
    builder.addTextColumn("first5", (item) => item.first + "- 5");
    builder.addTextColumn("last5", (item) => item.last + "- 5");
    builder.addTextColumn("wide", (item) =>
      (item.first + " " + item.last + " ").repeat(8)
    );
    builder.addNumberColumn("age", (item) => item.age).bindProperty("age");
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
      .addRoute(
        `redirect to /actionRoute/index/{index}`,
        (item) => `/actionRoute/index/${item.index}`
      );
    builder.withRowAction((item) =>
      console.log(`/rowRoute/index/${item.index}`)
    );
    // builder.withRowRoute((item) => `/rowRoute/index/${item.index}`);
    builder
      .addTextColumn("first1", (item) => item.first + "- 1")
      .setOption("defaultPin", "right");

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
