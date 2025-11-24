<template>
  <q-page style="background: white; min-height: 100vh;" class="q-pa-md">
    <div style="max-width: 1200px; margin: 0 auto;">
      <div class="text-h4 text-weight-bold q-mb-lg" style="color: #ff6600;">
        <q-icon name="dashboard" class="q-mr-sm" />
        Tableau de bord
      </div>

      <!-- Statistique simple -->
      <q-card flat bordered class="q-mb-lg">
        <q-card-section style="background: #ff6600; color: white;">
          <div class="text-center">
            <div class="text-h6">Total Clients</div>
            <div class="text-h2 text-weight-bold q-mt-sm">{{ totalClients }}</div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Actions rapides -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-sm-6">
          <q-card flat bordered class="cursor-pointer" @click="navigateTo('/generer-qr')" style="height: 100%;">
            <q-card-section class="text-center q-pa-lg">
              <q-icon name="qr_code" size="64px" style="color: #ff6600;" class="q-mb-md" />
              <div class="text-h6 text-weight-bold">Générer un QR Code</div>
              <div class="text-caption text-grey-7 q-mt-sm">
                Créer de nouveaux codes QR pour vos clients
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6">
          <q-card flat bordered class="cursor-pointer" @click="navigateTo('/scanner-qr')" style="height: 100%;">
            <q-card-section class="text-center q-pa-lg">
              <q-icon name="qr_code_scanner" size="64px" style="color: #ff6600;" class="q-mb-md" />
              <div class="text-h6 text-weight-bold">Scanner un QR Code</div>
              <div class="text-caption text-grey-7 q-mt-sm">
                Scanner les codes QR de vos clients
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12">
          <q-card flat bordered class="cursor-pointer" @click="navigateTo('/liste-formulaires')">
            <q-card-section class="text-center q-pa-lg">
              <q-icon name="list_alt" size="64px" style="color: #ff6600;" class="q-mb-md" />
              <div class="text-h6 text-weight-bold">Liste des Clients</div>
              <div class="text-caption text-grey-7 q-mt-sm">
                Consulter tous les formulaires soumis
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Derniers clients -->
      <q-card flat bordered>
        <q-card-section style="background: #ff6600; color: white;">
          <div class="text-h6 text-weight-bold">Derniers clients enregistrés</div>
        </q-card-section>

        <q-card-section>
          <q-list v-if="recentClients.length > 0" separator>
            <q-item
              v-for="client in recentClients"
              :key="client._id || client.id"
              clickable
              @click="viewClientDetail(client)"
            >
              <q-item-section avatar>
                <q-avatar style="background: #ff6600;" text-color="white">
                  {{ getInitials(client.nom, client.prenom) }}
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-bold">{{ client.nom }} {{ client.prenom }}</q-item-label>
                <q-item-label caption class="text-grey-7">{{ client.contact }}</q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-item-label caption>{{ client.prestation }}</q-item-label>
                <q-item-label caption>{{ formatDate(client.date) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <div v-else class="text-center text-grey-7 q-pa-xl">
            <q-icon name="inbox" size="60px" />
            <div class="q-mt-md text-h6">Aucun client enregistré</div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'src/boot/axios'

export default {
  name: 'DashboardPage',
  setup() {
    const router = useRouter()
    const totalClients = ref(0)
    const recentClients = ref([])

    const fetchRecentClients = async () => {
      try {
        const response = await api.get('/clients?limit=5&sort=desc')
        recentClients.value = response.data
      } catch (error) {
        console.error('Error fetching clients:', error)
      }
    }

    const fetchTotalClients = async () => {
      try {
        const response = await api.get('/clients/stats')
        totalClients.value = response.data.totalClients
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    const navigateTo = (path) => {
      router.push(path)
    }

    const viewClientDetail = (client) => {
      const clientId = client._id || client.id
      router.push(`/detail-formulaire/${clientId}`)
    }

    const getInitials = (nom, prenom) => {
      const n = nom ? nom.charAt(0).toUpperCase() : ''
      const p = prenom ? prenom.charAt(0).toUpperCase() : ''
      return n + p
    }

    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }

    onMounted(() => {
      fetchTotalClients()
      fetchRecentClients()
    })

    return {
      totalClients,
      recentClients,
      navigateTo,
      viewClientDetail,
      getInitials,
      formatDate
    }
  }
}
</script>