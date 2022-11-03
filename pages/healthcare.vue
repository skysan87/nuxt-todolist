<template>
  <div>
    <div class="pt-2 px-2">
      <!-- TODO: 日時に変更 -->
      <span>{{ latestData?.timestamp }}</span>
      <span class="ml-2">体重：{{ latestData?.weight }}</span>
      <span class="ml-2">消費カロリー：{{ totalCalorie }}</span>
    </div>

    <!-- ラジオボタンで表示切り替え -->
    <div class="flex-1 flex flex-row pt-2 px-2">
      <label v-for="m in menu" :key="m.value" class="ml-2 align-middle">
        <input v-model="selectedMenu" type="radio" :value="m">
        <span>{{ m.label }}</span>
      </label>
    </div>

    <div class="border-b pt-2" />

    <!-- 体重記録 -->
    <div v-if="selectedMenu === menu.Weight" class="pt-2 px-2">
      <div>
        <input
          v-model="valueWeight"
          type="number"
          class="input-text"
          step="0.1"
          placeholder="体重(kg)を追加"
        >
      </div>
      <div class="pt-2">
        <button class="btn btn-regular" @click="recordWeight">
          登録
        </button>
      </div>
    </div>

    <!-- 運動記録 -->
    <div v-if="selectedMenu === menu.Activity" class="pt-2 px-2">
      <div class="relative">
        <button class="absolute top-0 right-0 h-8 w-8 btn btn-outline" @click="openDialog">
          <fa :icon="['fas', 'edit']" size="sm" />
        </button>
        <div v-for="m in activityMenu" :key="m.label">
          <label class="ml-2 align-middle">
            <input v-model="selectedActivity" type="radio" :value="m" @change="onChangeActivity">
            <span>{{ m.label }}</span>
          </label>
        </div>
        <div class="flex items-center">
          <label class="ml-2 align-middle">
            <input v-model="selectedActivity" type="radio" :value="activityOther" @change="onChangeActivity">
            <span>{{ activityOther.label }}</span>
          </label>
          <input type="text" class="ml-2 input-text" style="width: fit-content;">
        </div>
      </div>

      <div class="border-b pt-2" />

      <div class="pt-2">
        <div class="pb-2">
          <div class="flex items-center">
            <span>実施単位</span>
            <span v-if="selectedActivity?.unit" class="ml-1 badge bg-blue-200">{{ selectedActivity?.value }} {{ selectedActivity?.unit }}</span>
          </div>
          <input
            v-model="valueUnit"
            type="number"
            class="input-text"
            step="1"
            placeholder="実装した回数を追加"
            @input="calcKcal"
          >
        </div>
        <div>
          <span>消費エネルギー</span>
          <input
            v-model="valueKcal"
            type="number"
            class="input-text"
            step="0.1"
            placeholder="kcalを追加"
          >
        </div>

        <div class="pt-2">
          <button class="btn btn-regular" @click="recordActivity">
            登録
          </button>
        </div>
      </div>
    </div>

    <!-- TODO: 記録の表示・編集 -->
  </div>
</template>

<script>
import Vue from 'vue'
import ActivityMenuDialog from '@/components/ActivityMenuDialog'
import { Health } from '@/model/Health'
import { fixFloat } from '@/util/NumberUtil'

const DialogController = Vue.extend(ActivityMenuDialog)

const menu = {
  Activity: { label: '運動', value: 'activity' },
  Weight: { label: '体重', value: 'weight' }
}

const activityOther = { label: 'その他', value: 1, unit: '' }

export default {
  layout: ctx => ctx.$device.isMobile ? 'board_mobile' : 'board',

  data () {
    return {
      menu,
      selectedMenu: null,
      activityOther,
      selectedActivity: null,
      valueKcal: null,
      valueUnit: null,
      valueWeight: null,
      dialog: null
    }
  },

  computed: {
    latestData () {
      return this.$store.getters['Health/getLatest']
    },

    activityMenu () {
      return this.$store.getters['Activity/getMenu']
    },

    totalCalorie () {
      return this.$store.getters['Activity/getTotal']
    }
  },

  mounted () {
    this.init()
  },

  methods: {
    async init () {
      try {
        await this.$store.dispatch('Health/init')
        await this.$store.dispatch('Activity/init')
      } catch (error) {
        console.error(error)
        this.$toast.error('初期化に失敗しました')
      }
    },

    onChangeActivity () {
      if (!this.selectedActivity) {
        return
      }
      this.valueUnit = null
      this.valueKcal = null
    },

    calcKcal () {
      if (!this.selectedActivity) {
        return
      }
      const data = this.valueUnit * this.selectedActivity.value
      this.valueKcal = parseFloat(data.toFixed(2))
    },

    openDialog () {
      delete this.dialog
      this.dialog = new DialogController({
        propsData: {
          parent: this.$root.$el,
          target: this.activityMenu
        }
      })
      this.dialog.$on('update', (result) => {
        this.$store.dispatch('Activity/updateMenu', result)
          .then(() => {
            this.clearActivityInput()
          })
          .catch((error) => {
            console.error(error)
            this.$toast.error('更新に失敗しました')
          })
      })
      this.dialog.$mount()
    },

    recordWeight () {
      if (this.selectedMenu !== menu.Weight) {
        return
      }

      if (!this.valueWeight) {
        return
      }

      this.$store.dispatch('Health/add', {
        type: Health.TYPE_WEIGHT,
        value: fixFloat(this.valueWeight)
      })
        .then(() => {
          this.valueWeight = null
        })
        .catch((error) => {
          console.error(error)
          this.$toast.error('登録に失敗しました')
        })
    },

    recordActivity () {
      if (this.selectedMenu !== menu.Activity) {
        return
      }

      if (!this.selectedActivity) {
        return
      }

      this.$store.dispatch('Activity/addRecord', {
        timestamp: new Date(),
        name: this.selectedActivity.label,
        value: this.valueKcal
      })
        .then(() => {
          this.clearActivityInput()
        })
        .catch((error) => {
          console.error(error)
          this.$toast.error('登録に失敗しました')
        })
    },
    clearActivityInput () {
      this.selectedActivity = null
      this.valueKcal = null
      this.valueUnit = null
    }
  }
}
</script>
