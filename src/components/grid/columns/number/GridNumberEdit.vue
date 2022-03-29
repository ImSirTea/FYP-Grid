<template>
  <number-field v-model="internalValue" />
</template>

<script lang="ts">
import NumberField from "@/components/controls/inputs/NumberField.vue";
import { defineComponent, computed } from "@vue/composition-api";

export default defineComponent({
  name: "GridNumberEdit",
  components: { NumberField },
  model: {
    event: "input",
    prop: "value",
  },
  props: {
    value: {
      type: Number,
      required: false,
    },
  },
  setup(props, context) {
    const internalValue = computed({
      get: () => props.value,
      set: (value) => context.emit("input", value),
    });

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
