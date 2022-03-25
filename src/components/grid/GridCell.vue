<template>
  <v-container fluid>
    <v-row>
      <v-col cols="auto">
        <component
          v-bind="$attrs"
          :is="component"
          :value="internalValue"
          @input="internalValue = $event"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { ActionColumn } from "@/components/grid/columns/action/ActionColumn";
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
    const internalValue = computed({
      get: () => {
        if (props.column instanceof ActionColumn) {
          return props.column.actions;
        }

        return props.column.value(props.item);
      },
      set: (newValue: any) => {
        if (!(props.column instanceof ActionColumn)) {
          context.emit("input", newValue);
        }
      },
    });
    const component = computed(() =>
      readonly.value ? props.column.viewRenderer : props.column.editRenderer
    );

    return {
      internalValue,
      component,
    };
  },
});
</script>
