<template>
  <checkbox-field
    :value="value"
    class="pa-0 ma-0"
    dense
    hide-details
    :ripple="false"
    @input="$emit('input', $event)"
  />
</template>

<script lang="ts">
import CheckboxField from "@/components/controls/inputs/CheckboxField.vue";
import { SelectColumn } from "@/components/grid/columns/select/SelectColumn";
import { AnyWithRowIndex } from "@/components/grid/GridState";
import { defineComponent, PropType } from "@vue/composition-api";

export default defineComponent({
  components: { CheckboxField },
  name: "GridSelectView",
  props: {
    item: {
      type: Object as PropType<AnyWithRowIndex>,
      required: true,
    },
    column: {
      type: Object as PropType<SelectColumn<AnyWithRowIndex>>,
      required: true,
    },
    value: {
      type: Boolean,
      required: false,
    },
  },
});
</script>
