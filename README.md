<h2>ООО "Цифровые решения". Fullstack разработчик</h2>

<h2>Тестовое задание для разработчика</h2>
<h3>Сделать список/таблицу с тестовыми значениями от 1 до 1 000 000 со следующим функционалом:</h3>
<ul>
<li>Каждая строка должна иметь функционал выбора (галочкой, или иным способом), в том числе множественного выбора (несколько строк);</li>
<li>Фильтрация поиском;</li>
<li>Сортировка элементов (Drag&Drop);</li>
<li>Сортировка отфильтрованного через поиск результата;</li>
<li>При количестве элементов больше 20, он не должен загружать их все сразу, а подгружать их при скролле по 20 шт;</li>
<li>При перезагрузке страницы выбранные и отсортированные элементы должны отображаться в том порядке, в котором они были до обновления страницы, но не более 20, остальные должны опять подгружаться при скролле.</li>
<li>Результаты сортировки и выбора должны хранится на сервере (база не нужна, достаточно хранить во время жизни приложения);</li>
<li>В результатах поиска тоже должно быть не более 20 элементов, остальные подгружаются при скроле результатов поиска.</li>
</ul>

<h3>Бэк: express</h3>
<h3>Фронт: на ваш выбор</h3>
<h4>У себя на тестовом хостинге развернуть результат и скинуть ссылку.</h4>

<h4>1. Express server</h4>

```bash
mkdir server
touch server/package.json
```

```bash
{
  "name": "express-server",
  "version": "1.0.0",
  "scripts": {
    "start": "node src/index.js",
    "server": "nodemon src/index.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

```bash
cd server
npm install
```

server/src/index.js

```bash
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4000;
const { generateItems } = require('./items');

app.use(cors());
app.use(express.json());

app.get('/items', (req, res) => {
  const { search = '', page = 1, 'per-page': perPage = 20 } = req.query;

  let data = generateItems();
  if (search) {
    data = data.filter(item => item.text.includes(search));
  }

  const total = data.length;
  const start = (Number(page) - 1) * Number(perPage);
  const end = start + Number(perPage);
  const result = data.slice(start, end);

  res.json({
    items: result,
    total,
    page: Number(page),
    perPage: Number(perPage)
  });
});

app.listen(PORT, () => console.log(`Express server running on http://localhost:${PORT}`));
```

server/src/items.js

```bash
const generateItems = () => {
  const items = [];
  for (let i = 1; i <= 1000000; i++) {
    items.push({ id: i, text: `Item ${i}` });
  }
  return items;
};

exports.generateItems = generateItems;
```

запуск сервера

```bash
npm start
```

<h4>2. Nuxt client</h4>

```bash
npx nuxi@latest init ./client
```
<ul>
<li>Welcome to Nuxt!</li>
<li>Which package manager would you like to use? ENTER (npm default)</li>
<li>Installing dependencies... Installation completed.</li>
<li>Initialize git repository? NO</li>
<li>Would you like to install any of the official modules? SPACE + @nuxt/ui – The Intuitive UI Library powered by Reka UI and Tailwind CSS</li>
<li>Nuxt project has been created with the v3 template. Next steps:</li>
<li>› cd client</li>
<li>› Start development server with npm run dev</li>
</ul>

Добавить модули

```bash
npm install @tanstack/vue-query usebootstrap
```

client/nuxt.config.ts

```bash
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', 'usebootstrap']
})
```

client/app.vue

```bash
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
```

запуск установленного клиента

```bash
cd client
npm run dev -- -o
```

