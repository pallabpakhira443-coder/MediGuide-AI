/**
 * MediGuide AI - Interactive Leaflet Medical Geolocation Map Service
 * Clean Light Medical Aesthetic with Radius Radar Rings & Custom Doctor Markers.
 */

class MapService {
  constructor() {
    this.map = null;
    this.userMarker = null;
    this.markersGroup = null;
    this.radiusCircle = null;
    this.currentLat = 22.5726;
    this.currentLng = 88.3639;
  }

  initMap(containerId = 'healthcareMap', lat = 22.5726, lng = 88.3639) {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    this.currentLat = lat;
    this.currentLng = lng;

    const mapElem = document.getElementById(containerId);
    if (!mapElem) return;

    // Initialize Leaflet map
    this.map = L.map(containerId, {
      zoomControl: true,
      attributionControl: false,
    }).setView([lat, lng], 12);

    // Clean, crisp Positron / Voyager Light tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(this.map);

    this.markersGroup = L.layerGroup().addTo(this.map);

    // Add Patient user location marker
    this.setUserLocation(lat, lng, window.selectedRadiusKm || 50);
  }

  setUserLocation(lat, lng, radiusKm = 50) {
    this.currentLat = lat;
    this.currentLng = lng;

    if (!this.map) return;

    // User pin marker
    const userIcon = L.divIcon({
      className: 'user-pin-marker',
      html: `
        <div style="position: relative; width: 26px; height: 26px;">
          <div style="width: 26px; height: 26px; border-radius: 50%; background: #0284c7; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.5);"></div>
          <div style="position: absolute; top: -5px; left: -5px; width: 36px; height: 36px; border-radius: 50%; border: 2px solid #0284c7; opacity: 0.5;"></div>
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });

    this.userMarker = L.marker([lat, lng], { icon: userIcon })
      .bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; color: #0f172a; padding: 4px;">
          <strong style="color: #0284c7; font-size: 13px;">📍 Your Location (${window.userLocationName || 'Selected City'})</strong><br>
          <span style="font-size: 11px; color: #64748b;">Radius: ${radiusKm} km</span>
        </div>
      `)
      .addTo(this.markersGroup);

    // Radius circle in meters
    const radiusMeters = radiusKm * 1000;
    this.radiusCircle = L.circle([lat, lng], {
      radius: radiusMeters,
      color: '#0284c7',
      fillColor: '#0284c7',
      fillOpacity: 0.05,
      weight: 1.5,
      dashArray: '4, 6',
    }).addTo(this.markersGroup);
  }

  updateMap(lat, lng, doctors = [], radiusKm = 50) {
    if (!this.map) {
      this.initMap('healthcareMap', lat, lng);
    }

    if (!this.markersGroup) return;
    this.markersGroup.clearLayers();

    this.setUserLocation(lat, lng, radiusKm);
    const bounds = [[lat, lng]];

    doctors.forEach((doc) => {
      const coords = doc.location?.coordinates;
      if (!coords) return;

      const docLat = coords[1];
      const docLng = coords[0];
      bounds.push([docLat, docLng]);

      const sym = doc.currency === 'INR' ? '₹' : '$';

      const docIcon = L.divIcon({
        className: 'doctor-map-pin',
        html: `
          <div style="background: #ffffff; border: 2px solid #0284c7; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.15); font-size: 16px; cursor: pointer;">
            🩺
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([docLat, docLng], { icon: docIcon })
        .bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; color: #0f172a; padding: 4px; min-width: 180px;">
            <strong style="font-size: 13px; color: #0f172a;">${doc.name}</strong><br>
            <span style="font-size: 11px; color: #0284c7; font-weight: 600;">${doc.specialization}</span><br>
            <span style="font-size: 11px; color: #64748b;">📍 ${doc.clinicName || doc.address} (${doc.distanceKm} km)</span><br>
            <span style="font-size: 12px; font-weight: 700; color: #059669;">Fee: ${sym}${doc.fee}</span><br>
            <button type="button" style="margin-top: 6px; width: 100%; background: #0284c7; color: #fff; border: none; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;" onclick="window.bookingModal.openBookingModal('${doc._id}')">
              Book Appointment ✓
            </button>
          </div>
        `)
        .addTo(this.markersGroup);
    });

    if (bounds.length > 1) {
      this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else {
      this.map.setView([lat, lng], 12);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.mapService = new MapService();
});
