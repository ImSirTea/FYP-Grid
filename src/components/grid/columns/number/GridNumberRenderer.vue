<template>
  <span v-if="!isEditing">{{ value }}</span>
  <number-field
    v-else
    v-bind="$attrs"
    :value="value"
    class="pa-0 ma-0"
    dense
    hide-details
    @input="$emit('input', $event)"
  />
</template>

<script lang="ts">
import { defineComponent, PropType } from "@vue/composition-api";
import NumberField from "@/components/controls/inputs/NumberField.vue";
import { AnyGridColumn } from "@/components/grid/columns/AbstractColumn";

export default defineComponent({
  name: "GridNumberRenderer",
  components: { NumberField },
  props: {
    value: {
      type: Number,
      required: false,
    },
    isEditing: {
      type: Boolean,
      required: true,
    },
    item: {
      type: Object as PropType<any>,
      required: false,
    },
    column: {
      type: Object as PropType<AnyGridColumn>,
      required: false,
    },
  },
});
</script>
