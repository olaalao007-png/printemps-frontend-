<template>
  <q-page style="background: white; min-height: 100vh;" class="q-pa-md">
    <div style="max-width: 1200px; margin: 0 auto;">
      <!-- Header avec bouton PDF -->
      <div class="row items-center q-mb-md">
        <div class="col">
          <div 
            class="text-h5 text-weight-bold text-center" 
            style="background: white; border: 2px solid black; border-radius: 25px; padding: 12px 24px; display: inline-block;"
          >
            Liste des clients
          </div>
        </div>
        <div class="col-auto">
          <q-btn
            icon="picture_as_pdf"
            flat
            round
            color="red"
            size="md"
            @click="exportPDF"
          >
            <q-tooltip>Exporter en PDF</q-tooltip>
          </q-btn>
        </div>
      </div>

      <!-- Tableau -->
      <q-card flat bordered>
        <!-- En-tête orange -->
        <div class="row" style="background: #ff6600;">
          <div class="col-1" style="padding: 15px; border-right: 1px solid white;">
            <div class="text-white text-weight-bold"></div>
          </div>
          <div class="col-5" style="padding: 15px; border-right: 1px solid white;">
            <div class="text-white text-weight-bold">ID</div>
          </div>
          <div class="col-6" style="padding: 15px;">
            <div class="text-white text-weight-bold">NAME</div>
          </div>
        </div>

        <!-- Lignes de données -->
        <div v-if="loading" class="text-center q-pa-lg">
          <q-spinner color="orange" size="50px" />
        </div>

        <div v-else>
          <div 
            v-for="(client, index) in clients" 
            :key="client.id"
            class="row items-center cursor-pointer"
            :style="{ 
              borderBottom: index < clients.length - 1 ? '1px solid #e0e0e0' : 'none',
              background: 'white'
            }"
            @click="onRowClick(client)"
          >
            <div class="col-1" style="padding: 20px 15px; border-right: 1px solid #e0e0e0;">
              <q-checkbox 
                v-model="client.selected" 
                color="orange"
                @click.stop
              />
            </div>
            <div class="col-5" style="padding: 20px 15px; border-right: 1px solid #e0e0e0;">
              <div class="text-weight-bold">#{{ client._id ? client._id.slice(-5) : client.id }}</div>
            </div>
            <div class="col-6" style="padding: 20px 15px;">
              <div class="text-weight-bold">{{ client.nom }} {{ client.prenom }}</div>
            </div>
          </div>

          <!-- Lignes vides pour le design -->
          <div 
            v-for="i in Math.max(0, 3 - clients.length)" 
            :key="'empty-' + i"
            class="row"
            style="border-bottom: 1px solid #e0e0e0; background: white;"
          >
            <div class="col-1" style="padding: 20px 15px; border-right: 1px solid #e0e0e0;">
              <q-checkbox color="orange" disable />
            </div>
            <div class="col-5" style="padding: 20px 15px; border-right: 1px solid #e0e0e0;">
            </div>
            <div class="col-6" style="padding: 20px 15px;">
            </div>
          </div>
        </div>

        <!-- Message si aucun client -->
        <div v-if="!loading && clients.length === 0" class="text-center text-grey-7 q-pa-xl">
          <q-icon name="inbox" size="60px" />
          <div class="q-mt-md text-h6">Aucun client trouvé</div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

export default {
  name: 'ListeFormulairesPage',
  setup() {
    const router = useRouter()
    const $q = useQuasar()
    const loading = ref(false)
    const clients = ref([])

    const fetchClients = async () => {
      loading.value = true
      try {
        const response = await api.get('/clients')
        clients.value = response.data.map(client => ({
          ...client,
          id: client._id || client.id, // Utiliser _id de MongoDB
          selected: false
        }))
      } catch (error) {
        $q.notify({
          color: 'negative',
          message:  error /*'Erreur lors du chargement des clients'*/,
          icon: 'warning'
        })
      } finally {
        loading.value = false
      }
    }

    const onRowClick = (client) => {
      const clientId = client._id || client.id
      router.push(`/detail-formulaire/${clientId}`)
    }

    const exportPDF = () => {
      $q.notify({
        color: 'info',
        message: 'Fonctionnalité à venir',
        icon: 'info'
      })
    }

    onMounted(() => {
      fetchClients()
    })

    return {
      loading,
      clients,
      onRowClick,
      exportPDF
    }
  }
}
</script>