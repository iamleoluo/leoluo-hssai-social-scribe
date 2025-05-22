<script setup lang="ts">
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'

// import { useProjectStore } from '@/stores/projectStore'
import { useSessionStore } from '@/stores/useSessionStore'
// const projectStore = useProjectStore()
const sessionStore = useSessionStore()
</script>

<template>
  <div class="w-full">
    <slot name="project-header"></slot>

    <TabView
      v-model:activeIndex="sessionStore.activeTabIndex"
      :pt="{
        tabpanel: {
          headerAction: ({ parent, context, props }) => ({
            class: [
              'relative font-bold flex items-center p-5 -mb-[2px] border-b-2 rounded-t-md',
              'transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring focus-visible:ring-inset',

              'cursor-pointer select-none',

              context.index === parent.state.d_activeIndex
                ? 'text-deepBlue border-deepBlue'
                : 'text-lightPurple border-transparent hover:text-deepBlue hover:border-deepBlue'
            ]
          })
        }
      }"
    >
      <!--<TabPanel header="錄音室"><slot name="recording-tab" /> </TabPanel>-->

      <!--<TabPanel header="逐字稿" :disabled="!projectStore.tempTranscript?.trim()">-->
      <TabPanel header="逐字稿">
        <slot name="transcript-tab" />
      </TabPanel>
      <!--<TabPanel header="報告初稿" :disabled="!projectStore.tempAiDocument?.trim()">-->
      <TabPanel header="報告初稿" :disabled="sessionStore.reportStage === 'idle'">
        <slot name="ai-doc-tab" />
      </TabPanel>
    </TabView>
  </div>
</template>
