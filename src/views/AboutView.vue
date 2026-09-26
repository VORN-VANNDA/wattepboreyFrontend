<script setup>
import { publicPath } from '../lib/publicLinks'
import { useLocale } from '../composables/useLocale'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { BookOpen, History, Bell, HeartHandshake } from 'lucide-vue-next'

import { useApiResource } from '../composables/useApiResource'
import api from '../lib/api'
import SectionHeading from '../components/SectionHeading.vue'

const { locale, t } = useLocale()

const { data: members, loading: membersLoading, error: membersError, load: loadMembers } = useApiResource(() => api.get('/members'))
const {
  data: settings,
  loading: settingsLoading,
} = useApiResource(() => api.get('/settings'), { initial: {} })

const abbot = computed(
  () => members.value.find((m) => m.is_featured) || members.value.find((m) => m.category === 'monk')
)
const monks = computed(() =>
  members.value.filter((m) => m.category === 'monk' && m.id !== abbot.value?.id)
)
const committee = computed(() => members.value.filter((m) => m.category === 'committee'))
const committeeLead = computed(() => committee.value[0] || null)
const committeeMembers = computed(() => committee.value.slice(1))
const committeeHeading = computed(() =>
  locale.value === 'kh' ? 'រចនាសម្ព័ន្ធគណៈកម្មការវត្ត' : 'Temple Committee Structure'
)

function memberName(member) {
  return locale.value === 'en' && member.name_en ? member.name_en : member.name
}

function memberRole(member) {
  return locale.value === 'en' && member.role_en ? member.role_en : member.role
}

// Admin-editable via Admin → ការកំណត់ (Settings). Falls back to this
// original text if the setting hasn't been filled in yet.
const historyText = computed(() => {
  if (settings.value?.about_history_text) return settings.value.about_history_text
  return locale.value === 'kh'
    ? 'វត្តទេពបុរី ស្ថិតនៅភូមិខ្នារ-ត្បែង ឃុំក្រាំងធ្នង់ ស្រុកបាទី ខេត្តតាកែវ ខាងកើតជាប់ស្រែភូមិខ្នារ ខាងលិចជាប់ភូមិត្បែង ខាងជើងជាប់ផ្លូវលំ ខាងត្បូងជាប់ចម្ការមានចំងាយ ៤៩គីឡូម៉ែត្រពីទីរួមខេត្តតាកែវ។ឈ្មោះដើមហៅវត្តទេពបុរីត្រូវបានកសាងឡើងតាំងពីឆ្នាំ១៩៥៥ដល់១៩៥៦ដោយព្រះគ្រូឃោសាវិសុទ្ធ ឡុង ឪ និងលោកអាចារ្យគណៈកម្មការព្រមទាំងពុទ្ធបរិស័ទចំណុះជើងវត្តហេតុដែលនាំឲហៅថា វត្តទេពបុរី ព្រោះមកពីចាស់ព្រឹទ្ធាចារ្យទាំងពីរភូមិគឺភូមិខ្នារ និងភូមិត្បែង បានពិភាក្សាគ្នាដាក់ឈ្មោះវត្តនេះហៅថាវត្តទេពបុរីជាផ្លូវការជាប់រហូតមកដល់បច្ចុប្បន្ន។មុនឆ្នាំ ១៩៧៥ វត្ដទេពបុរី នេះដើមឡើយ ក្រោយពីបុណ្យពាក់កណ្តាលសាសនាហើយចាស់ទុំបានពិភាក្សាគ្នាជាមួយព្រះតេជគុណព្រះនាម ឡុង ឪ វិន័យធរស្រុកបាទីបានសុំព្រះយោបល់អំពីព្រះមេគណខេត្តព្រះនាម លុក យូរ ដើម្បីផ្លាស់សុំពី អាស្រមឲទៅជាវត្តពេញសិទ្ធិក្រោមការជ្រោមជ្រែងឧបត្ថម្ភដោយពុទ្ធបរិស័ទទាំងពីរភូមិគឺភូមិខ្នារនិងភូមិត្បែងបានកសាងមានដូចជា កុដិតូច ពីរខ្នង ធ្វើអំពីឈើប្រក់ស្លឹកសាលាឆាន់ មួយខ្នងធ្វើអំពីឈើប្រក់ស្លឹកដែរព្រះវិហារមួយខ្នងធ្វើអំពីឈើប្រក់ស័ង្កសី។១៩៥៥ ដល់ ១៩៥៦ កសាងជាអាស្រមសមាធិបានទទួលការអនុញ្ញាតិធ្វើជាវត្ត ឈ្មោះហៅថា វត្តទេពបុរី។ពីឆ្នាំ១៩៥៧ដល់១៩៦០ព្រះតេជគុណ ពៅ គង់ ចៅអធិការបានកសាងកូនកុដិតូចមួយខ្នងពលៃមួយខ្នង សាលាធម្មសភាមួយខ្នងធ្វើអំពីឈើ។ពីឆ្នាំ ១៩៦០ ដល់១៩៧៥ ព្រះតេជគុណសួង សឿនចៅអធិការវត្តបានកសាងសាលាធម្មសភាជាថ្មីសាលាទទួលភ្ញៀវមួយខ្នង សាលាបឋមសិក្សាមួយខ្នង៦បន្ទប់ធ្វើអំពីថ្ម។ស្ថានភាពវត្តចាប់ពីឆ្នាំ ១៩៧៥ ដល់ឆ្នាំ ១៩៧៩ ទីវត្តអារាមនេះត្រូវរបបប្រល័យពូជសាសន៍ប៉ុលពតបានវាយកំទេចបំផ្លាញចោលអស់រាល់សមិទ្ធផលនានានៅក្នុងវត្ដ មានដូចជាកុដិព្រះវិហារ សាលាឆាន់ហើយបានចាប់ព្រះសង្ឃផ្សឹកនិងធ្វើទារុណកម្មយ៉ាងធ្ងន់ធ្ងរថែមទៀត។ក្រោយថ្ងៃរំដោះ៧មករាឆ្នាំ១៩៧៩ដល់បច្ចុប្បន្ន ក្រោមការដឹកនាំរបស់  រណសិរ្សសាមគ្គីសង្គ្រោះជាតិកម្ពុជាបច្ចុប្បន្ន រណសិរ្សសាមគ្គីបានអភិវឌ្ឍមាតុភូមិកម្ពុជាព្រះពុទ្ធសាសនាត្រូវបានបង្កើតឡើងវិញ។នៅឆ្នាំ ១៩៨៣ ព្រះតេជ - គុណព្រះនាម ឡុង សោម និងលោកអាចារ្យគណៈកម្មការរួមទាំងពុទ្ធបរិស័ទចំណុះជើងវត្ត  និងមកពីទីក្រុងភ្នំពេញព្រមទាំងពុទ្ធបរិស័ទជិតឆ្ងាយបានរៀបចំកាប់ឆ្ការព្រៃសំអាត ទីអារាមឲបានស្អាតដើម្បីចាប់ផ្តើមកសាងរាល់ សមិទ្ធផលនានា ឡើងវិញរហូតមកដល់បច្ចុប្បន្ននេះក្រោមការដឹកនាំដោយ ព្រះតេជគុណ ព្រះនាម  ភួង ម៉ិញ បានជួសជុលសាលាឆាន់កសាងព្រះវិហារកុដិ៣ខ្នងហោរត្រៃមួយខ្នងអាស្រមបារមីមួយខ្នងអាស្រមព្រះគោព្រះកែវមួយខ្នងសាលាទទួលភ្ញៀវពីរខ្នងរោងបាយមួយខ្នងរោងម៉ាស៊ីនភ្លើងមួយខ្នង សាលារៀនពីរខ្នង ស្រះទឹកមួយអណ្ដូងទឹក ៣ បង្គោលភ្លើង ៩២ ដើមចេតិយប្រាំមួយ  បន្ទប់អនាម័យបីខ្នងមាន១៣បន្ទប់របងព័ទ្ធជុំវិញរួមទាំងបានដាំដើមឈើជច្រើដើមថែមទៀតផង។ដោយឡែក ក្នុងទសវត្សរ៍ចុងក្រោយនេះ សមិទ្ធផលធំៗជាច្រើនទៀតក៏ត្រូវបានលេចចេញជារូបរាងឡើងជាបន្តបន្ទាប់ គួរជាទីមោទនៈ រួមមាន៖o	ឆ្នាំ២០១២ ដល់ ឆ្នាំ២០២៤៖ បានកសាងសាលាធម្មសភាចំនួន ១ខ្នង យ៉ាងស្កឹមស្កៃ រហូតបានរួចរាល់ជាស្ថាពរ។o	ឆ្នាំ ២០១៨៖ បានកសាងកុដិថ្មីបន្ថែមចំនួន ១ ខ្នងទៀត។o	ឆ្នាំ២០១៩៖ បានកសាងអគារសាលាអនុគណស្រុកបាទីចំនួន ១ខ្នង(កម្ពស់ ២ជាន់) ដើម្បីបម្រើដល់កិច្ចការរដ្ឋបាលសង្ឃ។o	ឆ្នាំ២០២០៖ បានចាក់សាបបេតុងរៀបចំសណ្តាប់ធ្នាប់ សម្រួលដល់ការធ្វើដំណើរនៅក្នុងបរិវេណវត្តទាំងមូល។o	ឆ្នាំ២០២២៖ បានកសាងប្រាសាទមួយដ៏ស្រស់ស្អាតសម្រាប់តម្កល់ព្រះពុទ្ធរូប ដែលទទួលបានប្រសិទ្ធនាមថា «ប្រាសាទភទ្ទកប្ប»។ទន្ទឹមនឹងសមិទ្ធផលដ៏ច្រើនសន្ធឹកសន្ធាប់ទាំងនេះ បច្ចុប្បន្នព្រះអង្គក៏កំពុងតែបន្តដឹកនាំកសាងរបងព័ទ្ធជុំវិញទីអារាម ដើម្បីលើកកម្ពស់សោភណភាព និងសន្តិសុខបន្ថែមទៀតផងដែរ។'
    : "Wat Tepborey was founded many generations ago and has long served as a spiritual and cultural refuge for local Buddhist devotees. Throughout its history, the temple has consistently prioritized the preservation and promotion of Buddhism and Cambodian heritage."
})

const historyImageUrl = computed(() => settings.value?.about_history_image_url || null)

const goals = computed(() => {
  const kh = [
    { icon: BookOpen, title: 'ផ្សព្វផ្សាយព្រះធម៌', desc: 'ចែករំលែកធម៌ និងធម៌អប់រំបែបផ្សព្វផ្សាយបានយ៉ាងទូលំទូលាយ។' },
    { icon: History, title: 'អតីតប្រវត្តិត្រូវ', desc: 'ថែរក្សាកំណត់ត្រាប្រវត្តិវត្តអារាមសម្រាប់មនុស្សជំនាន់ក្រោយ។' },
    { icon: Bell, title: 'ដំណឹងបុណ្យទាន', desc: 'ផ្តល់ព័ត៌មានទាន់ពេលវេលាអំពីកម្មវិធីនិងពិធីបុណ្យទាននានា។' },
    { icon: HeartHandshake, title: 'សទ្ធាប្រកបគុណ', desc: 'បង្កើនកម្លាំងសាមគ្គីភាព និងសម្រួលដល់ការចូលរួមចំណែកបុណ្យទាន។' },
  ]
  const en = [
    { icon: BookOpen, title: 'Share the Dhamma', desc: 'Make Buddhist teachings and reflections widely accessible.' },
    { icon: History, title: 'Preserve Our History', desc: "Keep a record of the temple's history for future generations." },
    { icon: Bell, title: 'Event Announcements', desc: 'Share timely information about ceremonies and events.' },
    { icon: HeartHandshake, title: 'Grow Our Community', desc: 'Strengthen community bonds and make giving easy for everyone.' },
  ]
  return locale.value === 'kh' ? kh : en
})
</script>

<template>
  <div>
    <!-- Page header -->
    <section class="bg-forest-dark py-20 text-center text-white">
      <h1 class="font-display text-3xl sm:text-4xl">{{ t('about.title') }}</h1>
    </section>

    <!-- History + photos -->
    <section class="mx-auto max-w-7xl px-5 py-20 lg:px-10">
      <div class="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)] lg:gap-16">
        <div>
          <SectionHeading :title="t('about.historyHeading')" align="start" />

          <p class="mt-6 whitespace-pre-line text-[20px] leading-[2] text-justify text-gray-600">
            {{ historyText }}
          </p>
        </div>

        <aside class="lg:sticky lg:top-24 lg:self-start">
          <div v-if="settingsLoading" class="space-y-6">
            <div class="aspect-[16/10] animate-pulse rounded-xl2 bg-cream" />
          </div>

          <figure v-else-if="historyImageUrl"
            class="fade-in overflow-hidden rounded-xl2 bg-cream shadow-card ring-1 ring-black/5">
            <img :src="historyImageUrl" alt="ប្រវត្តិវត្តទេពបុរី" class="aspect-[16/10] w-full object-cover" />
          </figure>

          <!-- Fallback (no photo yet, or failed to load) — decorative section, keep it quiet -->
          <div v-else class="grid aspect-[16/10] place-items-center rounded-xl2 bg-cream text-sm text-gray-400">
            វត្តទេពបុរី
          </div>
        </aside>
        
      </div>
    </section>
    


    <!-- Goals grid -->
    <section class="bg-cream py-20">
      <div class="mx-auto max-w-7xl px-5 lg:px-10">
        <SectionHeading :title="t('about.goalsHeading')" />
        <div class="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="goal in goals" :key="goal.title" class="card p-6 text-center">
            <div class="mx-auto grid h-12 w-12 place-items-center rounded-full bg-forest/10 text-forest">
              <component :is="goal.icon" class="h-6 w-6" />
            </div>
            <h4 class="mt-4 font-khmer font-semibold text-forest">{{ goal.title }}</h4>
            <p class="mt-2 text-sm leading-relaxed text-gray-500">{{ goal.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Team org chart -->
    <section class="mx-auto max-w-4xl px-5 py-20 text-center lg:px-10">
      <SectionHeading :title="t('about.teamHeading')" />

      <div v-if="membersLoading" class="mt-12 space-y-12">
        <div class="mx-auto aspect-[3/4] w-28 animate-pulse bg-cream sm:w-36" />
        <div class="mx-auto grid max-w-md grid-cols-2 gap-12">
          <div class="mx-auto aspect-[3/4] w-24 animate-pulse bg-cream" />
          <div class="mx-auto aspect-[3/4] w-24 animate-pulse bg-cream" />
        </div>
      </div>

      <div v-else-if="membersError"
        class="mx-auto mt-12 max-w-md rounded-xl2 border border-red-100 bg-red-50 px-6 py-8 text-center">
        <p class="text-sm text-red-600">មិនអាចទាញយកព័ត៌មានក្រុមការងារបានទេ សូមព្យាយាមម្តងទៀត។</p>
        <button type="button"
          class="mt-3 rounded-full border border-red-300 px-4 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
          @click="loadMembers()">
          ព្យាយាមម្តងទៀត
        </button>
      </div>

      <template v-else>
        <div v-if="abbot" class="fade-in mt-12">
          <RouterLink :to="publicPath('members', abbot.id)" class="group inline-block max-w-2xl">
            <img :src="abbot.image_url || 'https://placehold.co/300x400/1A3626/F7F6F1?text=Abbot'"
              :alt="memberName(abbot)"
              class="mx-auto aspect-[3/4] w-28 object-cover object-top shadow-sm ring-1 ring-black/5 transition-transform group-hover:scale-[1.02] sm:w-36" />
            <h3 class="mt-3 font-khmer text-base font-bold leading-8 text-forest group-hover:text-gold-dark">
              {{ memberName(abbot) }}
            </h3>
            <p class="mx-auto mt-1 max-w-2xl text-xs font-semibold leading-6 text-forest sm:text-sm">
              {{ memberRole(abbot) }}
            </p>
          </RouterLink>
        </div>

        <div v-if="monks.length"
          class="fade-in mx-auto mt-10 grid max-w-lg grid-cols-1 gap-x-20 gap-y-10 sm:grid-cols-2">
          <RouterLink v-for="monk in monks" :key="monk.id" :to="publicPath('members', monk.id)"
            class="group mx-auto block w-32 text-center sm:w-36">
            <img :src="monk.image_url || 'https://placehold.co/240x320/D9603A/F7F6F1?text=Monk'" :alt="memberName(monk)"
              class="mx-auto aspect-[3/4] w-24 object-cover object-top shadow-sm ring-1 ring-black/5 transition-transform group-hover:scale-[1.02] sm:w-28" />
            <p class="mt-3 font-khmer text-sm font-semibold leading-7 text-forest group-hover:text-gold-dark">
              {{ memberName(monk) }}
            </p>
            <p class="mt-1 text-[11px] leading-5 text-gray-500">{{ memberRole(monk) }}</p>
          </RouterLink>
        </div>

        <div v-if="committee.length" class="fade-in mt-24">
          <h3 class="font-display text-2xl leading-[1.7] text-forest sm:text-3xl">
            {{ committeeHeading }}
          </h3>

          <RouterLink v-if="committeeLead" :to="publicPath('members', committeeLead.id)"
            class="group mx-auto mt-10 block w-36 text-center">
            <img :src="committeeLead.image_url || 'https://placehold.co/260x340/2C5038/F7F6F1?text=Member'"
              :alt="memberName(committeeLead)"
              class="mx-auto aspect-[3/4] w-32 object-cover object-top shadow-sm ring-1 ring-black/5 transition-transform group-hover:scale-[1.02]" />
            <p class="mt-3 font-khmer text-sm font-semibold leading-7 text-forest group-hover:text-gold-dark">
              {{ memberName(committeeLead) }}
            </p>
            <p class="mt-1 text-[11px] leading-5 text-gray-500">{{ memberRole(committeeLead) }}</p>
          </RouterLink>

          <div v-if="committeeMembers.length"
            class="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-x-10 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
            <RouterLink v-for="person in committeeMembers" :key="person.id" :to="publicPath('members', person.id)"
              class="group mx-auto block w-28 text-center sm:w-32">
              <img :src="person.image_url || 'https://placehold.co/240x320/2C5038/F7F6F1?text=Member'"
                :alt="memberName(person)"
                class="mx-auto aspect-[3/4] w-24 object-cover object-top shadow-sm ring-1 ring-black/5 transition-transform group-hover:scale-[1.02] sm:w-28" />
              <p
                class="mt-3 font-khmer text-xs font-semibold leading-6 text-forest group-hover:text-gold-dark sm:text-sm">
                {{ memberName(person) }}
              </p>
              <p class="mt-1 text-[11px] leading-5 text-gray-500">{{ memberRole(person) }}</p>
            </RouterLink>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>
