<script setup lang="ts">
import BasicLayout from '@/components/BasicLayout.vue'
import { ref } from 'vue'
import Calendar from 'primevue/calendar'
import Button from 'primevue/button'
import ChartJS from 'chart.js/auto'
import Chart from 'primevue/chart'
import ProgressSpinner from 'primevue/progressspinner'
import apiClient from '@/api/axiosClient'

const startDate = ref(new Date(new Date().setDate(new Date().getDate() - 14)))
const endDate = ref(new Date())
const chartDataOverview = ref({})
const chartDataMode = ref({})
const chartDataSendMsg = ref({})
let isEverydayAccessLoading = ref(false)

const fetchData = async () => {
  if (startDate.value && endDate.value) {
    isEverydayAccessLoading.value = true
    const startStr = startDate.value.toISOString().split('T')[0]
    const endStr = endDate.value.toISOString().split('T')[0]

    const response = await fetch(
      `${apiClient.defaults.baseURL}/traffic?start=${startStr}&end=${endStr}`
    )

    const data = await response.json()

    if (Array.isArray(data)) {
      chartDataOverview.value = {
        labels: data.map((item) => item.date), // ✅ 提取日期
        datasets: [
          {
            label: '當日訪問次數',
            data: data.map((item) => item.total_access), // ✅ 提取访问次数
            fill: false,
            borderColor: '#42A5F5',
            tension: 0.4
          },
          {
            label: '當日獨立 IP 數',
            data: data.map((item) => item.distinct_ips),
            fill: false,
            borderColor: '#66BB6A',
            tension: 0.4
          }
        ]
      }

      chartDataMode.value = {
        labels: data.map((item) => item.date), // ✅ 提取日期
        datasets: [
          {
            label: '當日 Mode1 預測次數',
            data: data.map((item) => item.mode1_count), // ✅ 提取访问次数
            fill: false,
            borderColor: '#42A5F5',
            tension: 0.4
          },
          {
            label: '當日 Mode2 預測次數',
            data: data.map((item) => item.mode2_count), // ✅ 提取访问次数
            fill: false,
            borderColor: '#66BB6A',
            tension: 0.4
          },
          {
            label: '當日 Mode3 預測次數',
            data: data.map((item) => item.mode3_count), // ✅ 提取访问次数
            fill: false,
            borderColor: '#eda077',
            tension: 0.4
          }
        ]
      }

      chartDataSendMsg.value = {
        labels: data.map((item) => item.date), // ✅ 提取日期
        datasets: [
          {
            label: '當日 Le 姊對話次數(單輪)',
            data: data.map((item) => item.send_messages_count), // ✅ 提取访问次数
            fill: false,
            borderColor: '#f07f94',
            tension: 0.4
          }
        ]
      }
    } else {
      console.error('Unexpected API response:', data)
    }
    isEverydayAccessLoading.value = false
  }
}
</script>

<template>
  <BasicLayout>
    <div class="p-4 h-full min-h-[80vh]">
      <h1 class="text-2xl font-bold mb-4">流量監測</h1>
      <div class="flex flex-col flex-between lg:flex-row lg:space-x-4 mb-4">
        <div class="flex flex-col mb-2 lg:m-0">
          <p>開始日期</p>
          <Calendar v-model="startDate" placeholder="開始日期" class="" />
        </div>
        <div class="flex flex-col">
          <p>結束日期</p>
          <Calendar v-model="endDate" placeholder="結束日期" class="" />
        </div>
        <Button label="查詢" @click="fetchData" />
      </div>
      <div class="relative h-full">
        <Chart type="line" :data="chartDataOverview" />
        <div class="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
          <div class="w-full lg:w-1/2">
            <Chart type="line" :data="chartDataMode" />
          </div>
          <div class="w-full lg:w-1/2">
            <Chart type="line" :data="chartDataSendMsg" />
          </div>
        </div>

        <div
          v-if="isEverydayAccessLoading"
          class="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-60 z-10"
        >
          <ProgressSpinner />
        </div>
      </div>
    </div>
  </BasicLayout>
</template>
