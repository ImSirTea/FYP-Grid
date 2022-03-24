<template>
  <number-field :value="internalValue" @input="updateValue" />
</template>

<script lang="ts">
import NumberField from "@/components/controls/inputs/NumberField.vue";
import { defineComponent, ref } from "@vue/composition-api";

export default defineComponent({
  name: "GridNumberEdit",
  components: { NumberField },
  props: {
    value: {
      type: Number,
      required: false,
    },
  },
  setup(props, context) {
    const internalValue = ref(props.value);

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
