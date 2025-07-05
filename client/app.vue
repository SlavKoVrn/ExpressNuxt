<script setup lang="ts">
import { getPaginationRowModel } from '@tanstack/vue-table'
import type { TableColumn } from '@nuxt/ui'

const table = useTemplateRef('table')

type Payment = {
  id: number
  text: string
}

// Reactive data and loading state
const data = ref<Payment[]>([])
const loading = ref(false)
const totalRows = ref(0)

// Pagination state
const pagination = ref({
  pageIndex: 0,
  pageSize: 20
})

// Fetch data from server
const fetchData = async () => {
  loading.value = true
  const page = pagination.value.pageIndex + 1 // Server uses 1-based index
  const perPage = pagination.value.pageSize

  try {
    const res = await fetch(`http://localhost:4000/items?page=${page}&per-page=${perPage}`)
    const json = await res.json()

    console.log(json.items)

    data.value = json.items || []
    totalRows.value = json.total || 0
  } catch (error) {
    console.error('Error fetching data:', error)
    data.value = []
  } finally {
    loading.value = false
  }
}

// Watch for pagination changes and fetch new data
watch(() => pagination.value, fetchData, { deep: true })

onMounted(() => {
  fetchData()
})

// Columns definition remains unchanged
const columns: TableColumn<Payment>[] = [
  {
    accessorKey: 'id',
    header: 'Id',
    cell: ({ row }) => `#${row.getValue('id')}`
  },
  {
    accessorKey: 'text',
    header: 'Text'
  },
]
</script>

<template>
  <div class="w-full space-y-4 pb-4">

    <div v-if="loading" class="text-center">Loading...</div>

    <div class="flex justify-center border-t border-default pt-4">
      <UPagination
        :default-page="(pagination.pageIndex || 0) + 1"
        :items-per-page="pagination.pageSize"
        :total="totalRows"
        @update:page="(p) => pagination.pageIndex = p - 1"
      />
    </div>

    <UTable
      ref="table"
      v-model:pagination="pagination"
      :data="data"
      :columns="columns"
      :loading="loading"
      :pagination-row-count="totalRows"
      class="flex-1"
    />

    <div v-if="loading" class="text-center">Loading...</div>

    <div class="flex justify-center border-t border-default pt-4">
      <UPagination
        :default-page="(pagination.pageIndex || 0) + 1"
        :items-per-page="pagination.pageSize"
        :total="totalRows"
        @update:page="(p) => pagination.pageIndex = p - 1"
      />
    </div>
  </div>
</template>

<style>
@import "tailwindcss";
@import "@nuxt/ui"; 
</style>
