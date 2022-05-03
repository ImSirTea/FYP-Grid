<template>
  <span v-if="!isEditing">{{ value }}</span>
  <text-field
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
import TextField from "@/components/controls/inputs/TextField.vue";
import { AnyGridColumn } from "@/components/grid/columns/AbstractColumn";

export default defineComponent({
  name: "GridTextRenderer",
  components: { TextField },
  props: {
    value: {
      type: String,
      required: false,
    },
    isEditing: {
      type: Boolean,
      required: false,
      default: false,
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
