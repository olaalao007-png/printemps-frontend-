<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <q-card>
          <q-card-section class="bg-primary text-white">
            <div class="text-h5">Générer un code QR</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="generateQR" class="q-gutter-md">
              <q-input
                v-model="formData.prestation"
                outlined
                label="Type de prestation"
                :rules="[val => !!val || 'Champ requis']"
              >
                <template v-slot:prepend>
                  <q-icon name="work" />
                </template>
              </q-input>

              <q-input
                v-model="formData.date"
                outlined
                label="Date de l'événement"
                type="date"
                :rules="[val => !!val || 'Champ requis']"
              >
                <template v-slot:prepend>
                  <q-icon name="event" />
                </template>
              </q-input>

              <q-input
                v-model.number="formData.quantity"
                outlined
                label="Nombre de codes à générer"
                type="number"
                min="1"
                :rules="[val => val > 0 || 'Doit être supérieur à 0']"
              >
                <template v-slot:prepend>
                  <q-icon name="numbers" />
                </template>
              </q-input>

              <div class="row justify-end q-gutter-sm">
                <q-btn
                  label="Annuler"
                  color="grey"
                  flat
                  @click="resetForm"
                />
                <q-btn
                  label="Générer"
                  type="submit"
                  color="primary"
                  :loading="loading"
                  icon="qr_code"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>

        <!-- Affichage des QR codes générés -->
        <q-card v-if="generatedQRs.length > 0" class="q-mt-md">
          <q-card-section class="bg-secondary text-white">
            <div class="text-h6">Codes QR générés</div>
          </q-card-section>

          <q-card-section>
            <div class="row q-col-gutter-md">
              <div
                v-for="(qr, index) in generatedQRs"
                :key="index"
                class="col-12 col-sm-6 col-md-4"
              >
                <q-card bordered>
                  <q-card-section class="text-center">
                    <div v-html="qr.svg" class="q-mb-md"></div>
                    <div class="text-caption">Token: {{ qr.token }}</div>
                  </q-card-section>
                  <q-card-actions align="center">
                    <q-btn
                      flat
                      color="primary"
                      label="Télécharger"
                      icon="download"
                      @click="downloadQR(qr, index)"
                    />
                  </q-card-actions>
                </q-card>
              </div>
            </div>

            <div class="q-mt-md text-center">
              <q-btn
                label="Télécharger tout (ZIP)"
                color="primary"
                icon="folder_zip"
                @click="downloadAllQRs"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import QRCode from 'qrcode'

export default {
  name: 'GenererQRPage',
  setup() {
    const $q = useQuasar()
    const loading = ref(false)
    const formData = ref({
      prestation: '',
      date: '',
      quantity: 1
    })
    const generatedQRs = ref([])

    const generateQR = async () => {
      loading.value = true
      try {
        const response = await api.post('/qr/generate', formData.value)
        
        // Générer les SVG pour chaque token
        generatedQRs.value = await Promise.all(
          response.data.tokens.map(async (token) => {
            const url = `${window.location.origin}/#/form/${token}`
            const svg = await QRCode.toString(url, { type: 'svg', width: 200 })
            return { token, svg, url }
          })
        )

        $q.notify({
          color: 'positive',
          message: `${response.data.tokens.length} code(s) QR généré(s)`,
          icon: 'check'
        })
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: error.response?.data?.message || 'Erreur lors de la génération',
          icon: 'warning'
        })
      } finally {
        loading.value = false
      }
    }

    const downloadQR = async (qr, index) => {
      const canvas = document.createElement('canvas')
      await QRCode.toCanvas(canvas, qr.url, { width: 400 })
      
      const link = document.createElement('a')
      link.download = `qr-code-${index + 1}.png`
      link.href = canvas.toDataURL()
      link.click()
    }

    const downloadAllQRs = async () => {
      // Pour télécharger tous les QR codes, vous aurez besoin de JSZip
      // npm install jszip
      $q.notify({
        color: 'info',
        message: 'Fonctionnalité à implémenter avec JSZip',
        icon: 'info'
      })
    }

    const resetForm = () => {
      formData.value = {
        prestation: '',
        date: '',
        quantity: 1
      }
      generatedQRs.value = []
    }

    return {
      loading,
      formData,
      generatedQRs,
      generateQR,
      downloadQR,
      downloadAllQRs,
      resetForm
    }
  }
}
</script>