<template>
  <number-field :value="internalValue" @input="updateValue" />
</template>

<script lang="ts">
import NumberField from "@/components/controls/inputs/NumberField.vue";
import { NumberColumn } from "@/components/grid/columns/number/NumberColumn";
import { defineComponent, ref, PropType } from "@vue/composition-api";

export default defineComponent({
  name: "GridNumberEdit",
  components: { NumberField },
  props: {
    item: {
      type: Object as PropType<Record<string, any>>,
      required: true,
    },
    column: {
      type: Object as PropType<NumberColumn<any>>,
      required: true,
    },
  },
  setup(props, context) {
    const internalValue = ref(props.column.value(props.item));

    const updateValue = (value) => {
      context.emit("input", value);
    };

    return {
      internalValue,
      updateValue,
    };
  },
});
</script>
