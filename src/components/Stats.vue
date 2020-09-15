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
      data: [],
      columns: []
    };
  },
  created() {
    this.data = this.$store.state.compressedStore;
    this.columns = this.$store.state.compressedStoreTableCols;
  }
}
</script>