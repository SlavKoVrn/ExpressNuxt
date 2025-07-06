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
const search = ref('')

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
    const url = `http://localhost:4000/items?search=${encodeURIComponent(search.value)}&page=${page}&per-page=${perPage}`
    const res = await fetch(url)
    const json = await res.json()

    data.value = json.items || []
    totalRows.value = json.total || 0
  } catch (error) {
    console.error('Error fetching data:', error)
    data.value = []
  } finally {
    loading.value = false
  }
}

// Watch for pagination or search changes and fetch new data
watch(() => pagination.value, fetchData, { deep: true })
watch(() => search.value, () => {
  pagination.value.pageIndex = 0 // Reset to first page on search
  fetchData()
})

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
<div class="container py-5">
  <div class="w-full space-y-4 pb-4">

    <div v-if="loading" class="text-center">Loading...</div>

    <div class="row">
        <div class="col-sm-6">
            <!-- Search Input -->
            <label for="search" class="mr-2 col-form-label-sm">Search:&nbsp;</label>
            <UInput
              v-model="search"
              name="search"
              placeholder="Search..."
              class="max-w-md"
            />
        </div>
        <div class="col-sm-6">
            Records from <strong>{{ pagination.pageIndex * pagination.pageSize + 1 }}</strong> to <strong>{{ pagination.pageIndex * pagination.pageSize + pagination.pageSize }}</strong> of <strong>{{ totalRows }}</strong> total records.
        </div>
    </div>

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
</div>
</template>

<style>
@import "tailwindcss";
@import "@nuxt/ui"; 
.max-w-md {width:85%;}
</style>
