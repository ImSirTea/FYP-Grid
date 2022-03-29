<template>
  <text-field :value="internalValue" @input="updateValue" />
</template>

<script lang="ts">
import TextField from "@/components/controls/inputs/TextField.vue";
import { TextColumn } from "@/components/grid/columns/text/TextColumn";
import { defineComponent, ref, PropType } from "@vue/composition-api";

export default defineComponent({
  name: "GridTextEdit",
  components: { TextField },
  props: {
    item: {
      type: Object as PropType<Record<string, any>>,
      required: true,
    },
    column: {
      type: Object as PropType<TextColumn<any>>,
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
