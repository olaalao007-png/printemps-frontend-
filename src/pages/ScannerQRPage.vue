<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <q-card>
          <q-card-section class="bg-primary text-white">
            <div class="text-h5">Scanner un code QR</div>
          </q-card-section>

          <q-card-section>
            <div v-if="!scanning" class="text-center q-pa-lg">
              <q-icon name="qr_code_scanner" size="100px" color="grey-5" class="q-mb-md" />
              <div class="text-h6 text-grey-7 q-mb-md">
                Scannez un code QR
              </div>
              <q-btn
                label="Démarrer le scan"
                color="primary"
                size="lg"
                icon="camera_alt"
                @click="startScanning"
              />
            </div>

            <div v-else>
              <div class="scanner-container q-mb-md">
                <video ref="videoElement" autoplay playsinline></video>
                <canvas ref="canvasElement" style="display: none;"></canvas>
              </div>

              <div class="text-center">
                <q-btn
                  label="Arrêter le scan"
                  color="negative"
                  icon="stop"
                  @click="stopScanning"
                />
              </div>
            </div>

            <!-- Résultat du scan -->
            <q-banner v-if="scannedData" class="bg-positive text-white q-mt-md" rounded>
              <template v-slot:avatar>
                <q-icon name="check_circle" />
              </template>
              <div class="text-weight-bold">Code QR détecté!</div>
              <div class="q-mt-sm">{{ scannedData }}</div>
            </q-banner>

            <!-- Erreur -->
            <q-banner v-if="error" class="bg-negative text-white q-mt-md" rounded>
              <template v-slot:avatar>
                <q-icon name="error" />
              </template>
              {{ error }}
            </q-banner>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
//import { useQuasar } from 'quasar'
import jsQR from 'jsqr'

export default {
  name: 'ScannerQRPage',
  setup() {
    const router = useRouter()
    //const $q = useQuasar()
    const scanning = ref(false)
    const scannedData = ref(null)
    const error = ref(null)
    const videoElement = ref(null)
    const canvasElement = ref(null)
    let stream = null
    let animationFrame = null

    const startScanning = async () => {
      try {
        error.value = null
        scannedData.value = null
        
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        })
        
        if (videoElement.value) {
          videoElement.value.srcObject = stream
          scanning.value = true
          
          videoElement.value.onloadedmetadata = () => {
            scanQRCode()
          }
        }
      } catch (err) {
        error.value = 'Impossible d\'accéder à la caméra. Veuillez vérifier les permissions.'
        console.error('Camera error:', err)
      }
    }

    const scanQRCode = () => {
      if (!scanning.value || !videoElement.value || !canvasElement.value) return

      const video = videoElement.value
      const canvas = canvasElement.value
      const context = canvas.getContext('2d')

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight
        canvas.width = video.videoWidth
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)

        if (code) {
          scannedData.value = code.data
          stopScanning()
          
          // Si c'est un lien vers un formulaire, rediriger
          if (code.data.includes('/form/')) {
            const token = code.data.split('/form/')[1]
            router.push(`/form/${token}`)
          }
          
          return
        }
      }

      animationFrame = requestAnimationFrame(scanQRCode)
    }

    const stopScanning = () => {
      scanning.value = false
      
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
        stream = null
      }
      
      if (videoElement.value) {
        videoElement.value.srcObject = null
      }
    }

    onUnmounted(() => {
      stopScanning()
    })

    return {
      scanning,
      scannedData,
      error,
      videoElement,
      canvasElement,
      startScanning,
      stopScanning
    }
  }
}
</script>

<style scoped>
.scanner-container {
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
}

.scanner-container video {
  width: 100%;
  height: auto;
  display: block;
}
</style>