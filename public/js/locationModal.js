/**
 * MediGuide AI - Location Changer & Geolocation Service
 * Featured with Kolkata & West Bengal regional hubs, GPS auto-detect, and global cities.
 */

class LocationModalService {
  constructor() {
    this.currentCityLabel = 'Kolkata, WB (50 km)';
    this.initEventListeners();
    this.loadSavedLocation();
  }

  loadSavedLocation() {
    const savedLabel = localStorage.getItem('mg_user_location_label');
    const savedLat = localStorage.getItem('mg_user_lat');
    const savedLng = localStorage.getItem('mg_user_lng');

    if (savedLat && savedLng) {
      window.userLat = parseFloat(savedLat);
      window.userLng = parseFloat(savedLng);
      this.currentCityLabel = savedLabel || `${window.userLat.toFixed(2)}°, ${window.userLng.toFixed(2)}°`;
    } else {
      // Default to Kolkata center
      window.userLat = 22.5726;
      window.userLng = 88.3639;
      this.currentCityLabel = 'Kolkata, WB (50 km)';
    }
    this.updateNavbarLocationBadge();
  }

  initEventListeners() {
    const badge = document.getElementById('userLocationBadge');
    const modal = document.getElementById('locationModal');
    const btnClose = document.getElementById('btnCloseLocationModal');
    const btnDetectGPS = document.getElementById('btnDetectGpsModal');
    const cityPresetButtons = document.querySelectorAll('.city-preset-btn');
    const customInput = document.getElementById('customCityInput');
    const btnApplyCustom = document.getElementById('btnApplyCustomCity');

    if (badge) {
      badge.addEventListener('click', () => {
        if (modal) modal.classList.add('active');
      });
    }

    if (btnClose && modal) {
      btnClose.addEventListener('click', () => {
        modal.classList.remove('active');
      });
    }

    // Preset City Buttons (Kolkata, Salt Lake, Howrah, Mumbai, Delhi, NY, London, Toronto)
    cityPresetButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const city = btn.getAttribute('data-city');
        const lat = parseFloat(btn.getAttribute('data-lat'));
        const lng = parseFloat(btn.getAttribute('data-lng'));

        cityPresetButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        this.setLocation(lat, lng, city);
        if (modal) modal.classList.remove('active');
      });
    });

    // GPS Auto-detect
    if (btnDetectGPS) {
      btnDetectGPS.addEventListener('click', () => {
        if (!navigator.geolocation) {
          window.showToast('Geolocation is not supported by your browser', 'error', '❌');
          return;
        }

        btnDetectGPS.innerHTML = '<span>⏳</span> Detecting GPS Location...';

        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            let cityLabel = `GPS (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`;

            try {
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
              const data = await res.json();
              if (data && data.address) {
                cityLabel = data.address.city || data.address.state_district || data.address.state || 'Local Area';
              }
            } catch (e) {
              // Fallback to GPS coords
            }

            this.setLocation(lat, lng, cityLabel);
            btnDetectGPS.innerHTML = '<span>🎯</span> Detect My Current GPS Location';
            if (modal) modal.classList.remove('active');
            window.showToast(`Location set to ${cityLabel}`, 'success', '📍');
          },
          (err) => {
            btnDetectGPS.innerHTML = '<span>🎯</span> Detect My Current GPS Location';
            window.showToast('Could not access GPS. Please choose a city below.', 'warning', '⚠️');
          },
          { timeout: 8000 }
        );
      });
    }

    // Custom city search / lat-lng
    if (btnApplyCustom && customInput) {
      btnApplyCustom.addEventListener('click', async () => {
        const query = customInput.value.trim();
        if (!query) return;

        // Check if query is lat,lng format
        if (query.includes(',')) {
          const parts = query.split(',').map((p) => parseFloat(p.trim()));
          if (!isNaN(parts[0]) && !isNaN(parts[1])) {
            this.setLocation(parts[0], parts[1], 'Custom Location');
            if (modal) modal.classList.remove('active');
            return;
          }
        }

        // Geocode via Nominatim
        btnApplyCustom.textContent = 'Searching...';
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
          const data = await res.json();
          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            const label = data[0].display_name.split(',')[0];
            this.setLocation(lat, lng, label);
            if (modal) modal.classList.remove('active');
            window.showToast(`Location set to ${label}`, 'success', '📍');
          } else {
            window.showToast('City not found. Please try another name.', 'warning', '⚠️');
          }
        } catch (e) {
          window.showToast('Could not connect to geocoding service.', 'error', '❌');
        } finally {
          btnApplyCustom.textContent = 'Apply';
        }
      });
    }
  }

  setLocation(lat, lng, label) {
    window.userLat = lat;
    window.userLng = lng;
    this.currentCityLabel = `${label} (${window.selectedRadiusKm} km)`;

    localStorage.setItem('mg_user_lat', lat.toString());
    localStorage.setItem('mg_user_lng', lng.toString());
    localStorage.setItem('mg_user_location_label', label);

    this.updateNavbarLocationBadge();

    // Reload doctors & hospitals for the new coordinates
    if (window.loadProvidersData) {
      window.loadProvidersData();
    }

    window.showToast(`Updated location to ${label}`, 'info', '📍');
    if (window.audioFx) window.audioFx.playClick();
  }

  updateNavbarLocationBadge() {
    const navText = document.getElementById('navLocationText');
    if (navText) {
      navText.textContent = this.currentCityLabel;
    }
    const profileLoc = document.getElementById('profileLocationDisplay');
    if (profileLoc) {
      profileLoc.textContent = this.currentCityLabel.replace(/\(.*\)/, '').trim();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.locationModalService = new LocationModalService();
});
