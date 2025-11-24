<template>
  <q-page class="flex flex-center" style="background: linear-gradient(135deg, #ff6600 0%, #ff8833 100%); min-height: 100vh;">
    <q-card class="q-pa-md" style="width: 500px; max-width: 90vw;">
      <q-card-section class="text-center">
        <div class="text-h5 text-primary q-mb-md">Formulaire Client</div>
        
        <!-- Logo placeholder -->
        <div class="q-mb-lg">
          <q-img
            src="/logo.png"
            style="height: 100px; max-width: 180px; margin: 0 auto;"
            fit="contain"
          />
        </div>

        <q-banner v-if="tokenError" class="bg-negative text-white q-mb-md" rounded>
          <template v-slot:avatar>
            <q-icon name="error" />
          </template>
          {{ tokenError }}
        </q-banner>

        <q-form v-else @submit="onSubmit" class="q-gx-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <label class="text-grey-8 text-weight-medium" style="display: block; text-align: left; margin-bottom: 8px;">
                Nom:
              </label>
              <q-input
                v-model="formData.nom"
                outlined
                dense
                :rules="[val => !!val || 'Champ requis']"
                bg-color="white"
              />
            </div>

            <div class="col-12 col-sm-6">
              <label class="text-grey-8 text-weight-medium" style="display: block; text-align: left; margin-bottom: 8px;">
                Prénom:
              </label>
              <q-input
                v-model="formData.prenom"
                outlined
                dense
                :rules="[val => !!val || 'Champ requis']"
                bg-color="white"
              />
            </div>

            <div class="col-12">
              <label class="text-grey-8 text-weight-medium" style="display: block; text-align: left; margin-bottom: 8px;">
                Contact:
              </label>
              <q-input
                v-model="formData.contact"
                outlined
                dense
                type="tel"
                :rules="[val => !!val || 'Champ requis']"
                bg-color="white"
              />
            </div>

            <div class="col-12">
              <label class="text-grey-8 text-weight-medium" style="display: block; text-align: left; margin-bottom: 8px;">
                Prestation:
              </label>
              <q-input
                v-model="prestationInfo.prestation"
                outlined
                dense
                readonly
                bg-color="grey-3"
              />
            </div>

            <div class="col-12">
              <label class="text-grey-8 text-weight-medium" style="display: block; text-align: left; margin-bottom: 8px;">
                Date:
              </label>
              <q-input
                v-model="prestationInfo.date"
                outlined
                dense
                readonly
                bg-color="grey-3"
              />
            </div>
          </div>

          <div class="q-mt-lg">
            <q-btn
              label="Soumettre"
              type="submit"
              color="primary"
              class="full-width"
              size="lg"
              rounded
              unelevated
              :loading="loading"
              :disable="tokenError !== null"
            />
          </div>
        </q-form>

        <div v-if="submitted" class="q-mt-lg">
          <q-banner class="bg-positive text-white" rounded>
            <template v-slot:avatar>
              <q-icon name="check_circle" />
            </template>
            Formulaire soumis avec succès!
          </q-banner>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

export default {
  name: 'PublicFormPage',
  setup() {
    const route = useRoute()
    const $q = useQuasar()
    const loading = ref(false)
    const submitted = ref(false)
    const tokenError = ref(null)
    
    const formData = ref({
      nom: '',
      prenom: '',
      contact: ''
    })

    const prestationInfo = ref({
      prestation: '',
      date: ''
    })

    const validateToken = async () => {
      try {
        const token = route.params.token
        const response = await api.get(`/qr/validate/${token}`)
        
        prestationInfo.value = {
          prestation: response.data.prestation,
          date: new Date(response.data.eventDate).toLocaleDateString('fr-FR')
        }
      } catch (error) {
        tokenError.value = error.response?.data?.message || 'Token invalide ou expiré'
      }
    }

    const onSubmit = async () => {
      loading.value = true
      try {
        const token = route.params.token
        await api.post(`/qr/submit/${token}`, formData.value)
        
        submitted.value = true
        $q.notify({
          color: 'positive',
          message: 'Formulaire soumis avec succès',
          icon: 'check'
        })

        // Réinitialiser le formulaire après 3 secondes
        setTimeout(() => {
          formData.value = {
            nom: '',
            prenom: '',
            contact: ''
          }
          submitted.value = false
        }, 3000)
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: error.response?.data?.message || 'Erreur lors de la soumission',
          icon: 'warning'
        })
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      validateToken()
    })

    return {
      loading,
      submitted,
      tokenError,
      formData,
      prestationInfo,
      onSubmit
    }
  }
}
</script>