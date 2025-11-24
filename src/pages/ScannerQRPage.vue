<template>
  <q-page style="background: white; min-height: 100vh;" class="q-pa-md">
    <div style="max-width: 600px; margin: 0 auto;">
      <q-card flat bordered>
        <q-card-section style="background: #ff6600; color: white;">
          <div class="text-h5 text-weight-bold">Scanner un code QR</div>
        </q-card-section>

        <q-card-section>
          <div v-if="!scanning" class="text-center q-pa-xl">
            <q-icon name="qr_code_scanner" size="120px" color="grey-5" class="q-mb-lg" />
            <div class="text-h6 text-weight-bold text-grey-7 q-mb-xl">
              Scannez un code QR client
            </div>
            <q-btn
              label="Démarrer le scan"
              unelevated
              size="lg"
              icon="camera_alt"
              @click="startScanning"
              style="background: #ff6600; color: white; border-radius: 30px; padding: 12px 40px;"
            />
          </div>

          <div v-else>
            <div class="scanner-container q-mb-lg" style="border-radius: 12px; overflow: hidden;">
              <video ref="videoElement" autoplay playsinline style="width: 100%; display: block;"></video>
              <canvas ref="canvasElement" style="display: none;"></canvas>
            </div>

            <div class="text-center">
              <q-btn
                label="Arrêter"
                unelevated
                icon="stop"
                @click="stopScanning"
                style="background: #f44336; color: white; border-radius: 30px; padding: 10px 40px;"
              />
            </div>
          </div>

          <!-- Résultat -->
          <q-banner v-if="scannedData" class="bg-positive text-white q-mt-lg" rounded>
            <template v-slot:avatar>
              <q-icon name="check_circle" size="md" />
            </template>
            <div class="text-weight-bold">Code QR détecté!</div>
            <div class="text-caption q-mt-xs">Redirection en cours...</div>
          </q-banner>

          <!-- Erreur -->
          <q-banner v-if="error" class="bg-negative text-white q-mt-lg" rounded>
            <template v-slot:avatar>
              <q-icon name="error" size="md" />
            </template>
            {{ error }}
          </q-banner>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import jsQR from 'jsqr'

export default {
  name: 'ScannerQRPage',
  setup() {
    const router = useRouter()
    const $q = useQuasar()
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
        
        // Vérifier si l'API est disponible
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          error.value = 'Votre navigateur ne supporte pas l\'accès à la caméra. Utilisez Chrome ou Safari.'
          return
        }

        console.log('Requesting camera access...')

        // Demander l'accès à la caméra arrière
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: { ideal: 'environment' }, // Caméra arrière en priorité
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        })
        
        console.log('Camera access granted!')
        
        if (videoElement.value) {
          videoElement.value.srcObject = stream
          videoElement.value.setAttribute('playsinline', true) // Important pour iOS
          videoElement.value.play() // Forcer le démarrage
          scanning.value = true
          
          videoElement.value.onloadedmetadata = () => {
            console.log('Video metadata loaded, starting scan...')
            scanQRCode()
          }
        }
      } catch (err) {
        console.error('Camera error:', err)
        
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          error.value = 'Accès à la caméra refusé. Autorisez l\'accès dans les paramètres de votre navigateur, puis rechargez la page.'
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          error.value = 'Aucune caméra trouvée sur cet appareil.'
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          error.value = 'La caméra est déjà utilisée par une autre application. Fermez les autres apps et réessayez.'
        } else if (err.name === 'OverconstrainedError') {
          // Réessayer sans contraintes
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false
            })
            if (videoElement.value) {
              videoElement.value.srcObject = stream
              videoElement.value.setAttribute('playsinline', true)
              videoElement.value.play()
              scanning.value = true
              videoElement.value.onloadedmetadata = () => {
                scanQRCode()
              }
            }
          } catch (e) {
            error.value = 'Impossible d\'accéder à la caméra. Assurez-vous d\'utiliser HTTPS et d\'avoir autorisé l\'accès.'
          }
        } else {
          error.value = `Erreur d'accès caméra: ${err.message}. Assurez-vous d\'utiliser HTTPS.`
        }
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
          
          // Rediriger vers le formulaire
          if (code.data.includes('/form/')) {
            const token = code.data.split('/form/')[1]
            setTimeout(() => {
              router.push(`/form/${token}`)
            }, 1000)
          } else {
            $q.notify({
              color: 'warning',
              message: 'Code QR invalide',
              icon: 'warning'
            })
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
  background: #000;
}
</style>