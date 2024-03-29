<template>
  <v-app>
    <v-main>
      <grid
        ref="gridRef"
        v-model="items"
        :grid-configuration="builder"
        :grid-state="builder.defaultState"
        :grid-height="550"
      />
      <!-- <v-btn @click="updateItems">Update Items</v-btn> -->
      <v-btn v-if="gridRef" @click="getRows">Get Selected</v-btn>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, shallowRef } from "@vue/composition-api";
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import Grid, { useGrid } from "@/components/grid/Grid.vue";
import { numberInRange } from "@/components/util/rules";
import Item, { buildItems } from "@/types/item";

export default defineComponent({
  name: "App",
  components: { Grid },
  setup(props, context) {
    const { gridRef } = useGrid<Item>();

    const items = shallowRef(buildItems(1000));

    const builder = new GridConfiguration<Item>();

    builder
      .addNumberColumn("index", (item) => item.index)
      .setOptions({ defaultPin: "left" });
    builder.withSelectColumn();
    builder.addTextColumn("last1", (item) => item.last + "- 1");
    builder.addTextColumn("first2", (item) => item.first + "- 2");
    builder.addTextColumn("last2", (item) => item.last + "- 2");
    builder.addTextColumn("first3", (item) => item.first + "- 3");
    builder.addTextColumn("last3", (item) => item.last + "- 3");
    builder.addTextColumn("first4", (item) => item.first + "- 4");
    builder.addTextColumn("last4", (item) => item.last + "- 4");
    builder
      .addTextColumn("postcode", (item) => item.address.postcode)
      .setValueSetter((item, value) => {
        item.address.postcode = value;
      });
    builder
      .addTextColumn("addressline1", (item) => item.address.addressLine1)
      .setValueSetter((item, value) => {
        item.address.addressLine1 = value;
      });
    builder.addTextColumn("wide", (item) =>
      (item.first + " " + item.last + " ").repeat(8)
    );
    builder
      .addNumberColumn("age", (item) => item.age)
      .setValueSetter((item, value) => {
        item.age = value;
      })
      .addRules([numberInRange(0, 100)]);
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
    // builder.withRowAction((item) =>
    //   console.log(`/rowRoute/index/${item.index}`)
    // );
    builder.withRowRoute((item) => `/rowRoute/index/${item.index}`);
    builder
      .addTextColumn("first1", (item) => item.first + "- 1")
      .setOptions({ defaultPin: "right" });

    const updateItems = () => {
      const base = Math.floor(Math.random() * 1000000);
      items.value = buildItems(base);
    };

    const getRows = () => {
      if (gridRef.value) {
        console.log(gridRef.value.getSelectedRows());
      }
    };

    return {
      builder,
      items,
      updateItems,
      gridRef,
      getRows,
    };
  },
});
</script>

<style lang="scss">
@import "@/styles/_main.scss";
</style>
