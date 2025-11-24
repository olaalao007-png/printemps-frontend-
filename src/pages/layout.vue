<template>
  <q-layout view="hHh lpR fFf">
    <q-drawer
      v-model="drawer"
      show-if-above
      :width="200"
      :breakpoint="500"
      style="background: #ff6600;"
      class="text-white"
    >
      <q-scroll-area class="fit">
        <div class="q-pa-md">
          <!-- Admin Dashboard -->
          <q-btn
            flat
            no-caps
            class="full-width text-left q-mb-md bg-white text-dark"
            style="border-radius: 20px; padding: 12px 16px;"
            @click="navigateTo('/dashboard')"
          >
            <q-icon name="person" size="sm" class="q-mr-sm" />
            <span class="text-weight-medium">Admin Dashboard</span>
          </q-btn>

          <q-separator color="orange-8" class="q-my-lg" />

          <!-- Generer un code QR -->
          <q-btn
            flat
            no-caps
            class="full-width text-left q-mb-lg bg-white text-dark"
            style="border-radius: 20px; padding: 12px 16px;"
            @click="navigateTo('/generer-qr')"
          >
            <span class="text-weight-medium">Generer un code QR</span>
          </q-btn>

          <!-- Scanner un code QR -->
          <q-btn
            flat
            no-caps
            class="full-width text-left q-mb-lg bg-white text-dark"
            style="border-radius: 20px; padding: 12px 16px;"
            @click="navigateTo('/scanner-qr')"
          >
            <span class="text-weight-medium">Scanner un code QR</span>
          </q-btn>

          <!-- Liste des formulaires -->
          <q-btn
            flat
            no-caps
            class="full-width text-left q-mb-lg bg-white text-dark"
            style="border-radius: 20px; padding: 12px 16px;"
            @click="navigateTo('/liste-formulaires')"
          >
            <span class="text-weight-medium">Liste des formulaires</span>
          </q-btn>

          <!-- Deconnexion -->
          <q-btn
            flat
            no-caps
            class="full-width text-left bg-white text-dark"
            style="border-radius: 20px; padding: 12px 16px;"
            @click="logout"
          >
            <span class="text-weight-medium">Deconnexion</span>
          </q-btn>
        </div>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

export default {
  name: 'MainLayout',
  setup() {
    const router = useRouter()
    const $q = useQuasar()
    const drawer = ref(true)

    const navigateTo = (path) => {
      router.push(path)
    }

    const logout = () => {
      $q.dialog({
        title: 'Déconnexion',
        message: 'Voulez-vous vraiment vous déconnecter ?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
        $q.notify({
          color: 'info',
          message: 'Déconnexion réussie',
          icon: 'logout'
        })
      })
    }

    return {
      drawer,
      navigateTo,
      logout
    }
  }
}
</script>