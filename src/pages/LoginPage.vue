<template>
  <div class="flex flex-center" style="min-height: 100vh; background: linear-gradient(135deg, #ff6600 0%, #ff8833 100%);">
    <q-card class="q-pa-md" style="width: 400px; max-width: 90vw;">
      <q-card-section class="text-center">
        <div class="text-h5 text-primary q-mb-md">Printemps_Register</div>

        <!-- Logo -->
        <div class="q-mb-lg">
          <q-img
            src="/printemps.png"
            style="height: 120px; max-width: 200px; margin: 0 auto;"
            fit="contain"
          />
        </div>

        <q-form @submit="onSubmit" class="q-gx-md">
          <div class="q-mb-md">
            <label class="text-orange text-weight-medium" style="display: block; text-align: left; margin-bottom: 8px;">User:</label>
            <q-input
              v-model="username"
              outlined
              dense
              type="text"
              :rules="[val => !!val || 'Champ requis']"
              bg-color="white"
            />
          </div>

          <div class="q-mb-lg">
            <label class="text-orange text-weight-medium" style="display: block; text-align: left; margin-bottom: 8px;">Password:</label>
            <q-input
              v-model="password"
              outlined
              dense
              :type="isPwd ? 'password' : 'text'"
              :rules="[val => !!val || 'Champ requis']"
              bg-color="white"
            >
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>
          </div>

          <q-btn
            label="Connexion"
            type="submit"
            color="primary"
            class="full-width"
            size="lg"
            rounded
            unelevated
            :loading="loading"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

export default {
  name: 'LoginPage',
  setup() {
    const router = useRouter()
    const $q = useQuasar()
    const username = ref('')
    const password = ref('')
    const isPwd = ref(true)
    const loading = ref(false)

    const onSubmit = async () => {
      loading.value = true
      try {
        const response = await api.post('/auth/login', {
          username: username.value,
          password: password.value
        })

        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))

        $q.notify({
          color: 'positive',
          message: 'Connexion réussie',
          icon: 'check'
        })

        router.push('/dashboard')
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: error.response?.data?.message || 'Erreur de connexion',
          icon: 'warning'
        })
      } finally {
        loading.value = false
      }
    }

    return { username, password, isPwd, loading, onSubmit }
  }
}
</script>
