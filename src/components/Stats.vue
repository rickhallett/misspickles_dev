<template>
  <q-table
      title
      :data="data"
      :columns="columns"
      row-key="name"
      class="text-primary"
    />
</template>

<script>
export default {
  name: 'SummaryTable',
  data() {
    return {
      data: this.$store.state.compressedStore,
      columns: this.$store.state.compressedStoreTableCols
    };
  },
  created() {
    
  }
}
</script>