/**
 * MediGuide AI - Image & Medical Document Upload & Live Camera Capture
 */

class ImageUploadService {
  constructor() {
    this.currentFile = null;
    this.videoStream = null;
    this.initEventListeners();
  }

  initEventListeners() {
    const fileInput = document.getElementById('medicalFileInput');
    const btnRemove = document.getElementById('btnRemoveImage');
    const btnCamera = document.getElementById('btnCameraInput');
    const btnCaptureSnap = document.getElementById('btnCaptureSnap');
    const btnCloseCamera = document.getElementById('btnCloseCamera');

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleFileSelection(e.target.files[0]);
        }
      });
    }

    if (btnRemove) {
      btnRemove.addEventListener('click', () => this.clearFile());
    }

    if (btnCamera) {
      btnCamera.addEventListener('click', () => this.openCameraModal());
    }

    if (btnCaptureSnap) {
      btnCaptureSnap.addEventListener('click', () => this.captureSnapshot());
    }

    if (btnCloseCamera) {
      btnCloseCamera.addEventListener('click', () => this.closeCameraModal());
    }
  }

  handleFileSelection(file) {
    this.currentFile = file;
    const previewStrip = document.getElementById('imagePreviewStrip');
    const previewImg = document.getElementById('previewImg');
    const previewName = document.getElementById('previewName');
    const previewSize = document.getElementById('previewSize');

    if (previewName) previewName.textContent = file.name;
    if (previewSize) previewSize.textContent = `${(file.size / 1024).toFixed(1)} KB • Medical Image`;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (previewImg) previewImg.src = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      if (previewImg) previewImg.src = 'https://cdn-icons-png.flaticon.com/512/337/337946.png'; // Document icon
    }

    if (previewStrip) previewStrip.style.display = 'flex';
    if (window.audioFx) window.audioFx.playClick();
  }

  clearFile() {
    this.currentFile = null;
    const fileInput = document.getElementById('medicalFileInput');
    const previewStrip = document.getElementById('imagePreviewStrip');
    if (fileInput) fileInput.value = '';
    if (previewStrip) previewStrip.style.display = 'none';
  }

  async openCameraModal() {
    const modal = document.getElementById('cameraModal');
    const video = document.getElementById('cameraVideo');
    if (!modal || !video) return;

    modal.classList.add('active');

    try {
      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      video.srcObject = this.videoStream;
      video.play();
    } catch (err) {
      console.warn('Camera access unavailable:', err.message);
      alert('Camera access denied or unavailable on this device. Please use the Upload Photo button.');
      this.closeCameraModal();
    }
  }

  captureSnapshot() {
    const video = document.getElementById('cameraVideo');
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const snapFile = new File([blob], `clinical_snap_${Date.now()}.jpg`, { type: 'image/jpeg' });
        this.handleFileSelection(snapFile);
        this.closeCameraModal();
        if (window.audioFx) window.audioFx.playSuccess();
      }
    }, 'image/jpeg', 0.9);
  }

  closeCameraModal() {
    const modal = document.getElementById('cameraModal');
    if (modal) modal.classList.remove('active');

    if (this.videoStream) {
      this.videoStream.getTracks().forEach((track) => track.stop());
      this.videoStream = null;
    }
  }

  getFile() {
    return this.currentFile;
  }
}

const imageUploadService = new ImageUploadService();
window.imageUploadService = imageUploadService;
