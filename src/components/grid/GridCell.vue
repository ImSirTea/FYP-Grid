<template>
  <!-- Weirdly, we need to use custom, 
    and manually provide the a definitions to allow for @click events properly -->
  <router-link :to="rowRoute" custom v-slot="{ href, navigate }">
    <a ref="link" :href="href" @click="onRowClick($event, navigate)">
      <component
        ref="span"
        v-bind="$attrs"
        :is="component"
        :item="item"
        :column="column"
        :value="internalValue"
        @input="$emit('input', value)"
      />
    </a>
  </router-link>
</template>

<script lang="ts">
import { AnyGridColumn } from "@/components/grid/columns/Column";
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import {
  defineComponent,
  PropType,
  ref,
  computed,
  inject,
} from "@vue/composition-api";

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
    const gridConfiguration =
      inject<GridConfiguration<Record<string, any>>>("gridConfiguration")!;

    const readonly = ref(true);

    const link = ref(null);

    const internalValue = computed({
      get: () => props.column.value(props.item),
      set: (value) => context.emit("input", value),
    });

    const component = computed(() =>
      readonly.value ? props.column.viewRenderer : props.column.editRenderer
    );

    const rowRoute = computed(() =>
      gridConfiguration.rowRoute
        ? gridConfiguration.rowRoute(props.item)
        : undefined
    );

    const onRowClick = (
      event: MouseEvent,
      navigate: (event: MouseEvent) => void
    ) => {
      // If we are clicking the blank space
      if (event.target === link.value) {
        navigate(event);
        return;
      }

      // Otherwise, prevent our navigation and attempt our row-action if it exists
      event.preventDefault();
      gridConfiguration.rowAction?.(props.item);
    };

    return {
      component,
      internalValue,
      rowRoute,
      onRowClick,
      link,
    };
  },
});
</script>
