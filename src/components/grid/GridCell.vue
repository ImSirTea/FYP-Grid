<template>
  <v-container fluid>
    <v-row>
      <v-col cols="auto">
        <component
          v-bind="$attrs"
          :is="component"
          :item="item"
          :column="column"
          @input="$emit('input', $event)"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { AnyGridColumn } from "@/components/grid/columns/Column";
import { defineComponent, PropType, ref, computed } from "@vue/composition-api";

export default defineComponent({
  name: "GridCell",
  props: {
    item: {
      type: Object as PropType<Record<string, any>>,
      required: true,
    },
    column: {
      type: Object as PropType<AnyGridColumn>,
      required: true,
    },
  },
  setup(props, context) {
    const readonly = ref(true);

    const component = computed(() =>
      readonly.value ? props.column.viewRenderer : props.column.editRenderer
    );

    return {
      component,
    };
  },
});
</script>
