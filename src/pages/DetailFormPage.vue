<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <q-card>
          <q-card-section class="bg-primary text-white">
            <div class="text-h5">
              <q-icon name="person" class="q-mr-sm" />
              Detail du formulaire
            </div>
          </q-card-section>

          <q-card-section v-if="loading" class="text-center">
            <q-spinner color="primary" size="50px" />
          </q-card-section>

          <q-card-section v-else-if="client">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <div class="text-caption text-grey-7 q-mb-xs">Nom:</div>
                <q-input
                  v-model="client.nom"
                  outlined
                  readonly
                  dense
                />
              </div>

              <div class="col-12 col-sm-6">
                <div class="text-caption text-grey-7 q-mb-xs">Contact:</div>
                <q-input
                  v-model="client.contact"
                  outlined
                  readonly
                  dense
                />
              </div>

              <div class="col-12 col-sm-6">
                <div class="text-caption text-grey-7 q-mb-xs">Prestation:</div>
                <q-input
                  v-model="client.prestation"
                  outlined
                  readonly
                  dense
                />
              </div>

              <div class="col-12 col-sm-6">
                <div class="text-caption text-grey-7 q-mb-xs">Date:</div>
                <q-input
                  v-model="formattedDate"
                  outlined
                  readonly
                  dense
                />
              </div>
            </div>
          </q-card-section>

          <q-card-section v-else class="text-center text-grey">
            <q-icon name="error_outline" size="50px" class="q-mb-md" />
            <div>Client non trouvé</div>
          </q-card-section>

          <q-card-actions align="center" class="q-pb-md">
            <q-btn
              label="Retour"
              color="primary"
              style="width: 200px"
              @click="goBack"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

export default {
  name: 'DetailFormulairePage',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const $q = useQuasar()
    const loading = ref(true)
    const client = ref(null)

    const formattedDate = computed(() => {
      if (!client.value?.date) return ''
      const date = new Date(client.value.date)
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    })

    const fetchClient = async () => {
      loading.value = true
      try {
        const response = await api.get(`/clients/${route.params.id}`)
        client.value = response.data
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: error /*'Erreur lors du chargement des données'*/,
          icon: 'warning'
        })
      } finally {
        loading.value = false
      }
    }

    const goBack = () => {
      router.push('/liste-formulaires')
    }

    onMounted(() => {
      fetchClient()
    })

    return {
      loading,
      client,
      formattedDate,
      goBack
    }
  }
}
</script>