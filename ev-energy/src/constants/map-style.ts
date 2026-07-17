import type { MapStyleElement } from 'react-native-maps';

/**
 * Muted grayscale Google Maps style so charger markers and the UI chrome stand out.
 * POI icons are hidden so Google's built-in green EV "spark" pins do not appear —
 * we replace those with our own charger markers.
 */
export const MapStyle: MapStyleElement[] = [
  { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#bdbdbd' }],
  },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
  { featureType: 'poi', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  {
    featureType: 'poi.attraction',
    elementType: 'geometry.fill',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'poi.attraction',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.attraction',
    elementType: 'labels.text.fill',
    stylers: [{ visibility: 'on' }],
  },
  { featureType: 'poi.business', stylers: [{ visibility: 'on' }] },
  {
    featureType: 'poi.business',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.business',
    elementType: 'labels.text.fill',
    stylers: [{ visibility: 'on' }],
  },
  { featureType: 'poi.government', stylers: [{ visibility: 'on' }] },
  {
    featureType: 'poi.government',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.government',
    elementType: 'labels.text.fill',
    stylers: [{ visibility: 'on' }],
  },
  { featureType: 'poi.medical', stylers: [{ visibility: 'on' }, { weight: 1 }] },
  {
    featureType: 'poi.medical',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] },
  {
    featureType: 'poi.park',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  { featureType: 'poi.place_of_worship', stylers: [{ visibility: 'on' }] },
  {
    featureType: 'poi.place_of_worship',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.place_of_worship',
    elementType: 'labels.text.fill',
    stylers: [{ visibility: 'on' }],
  },
  { featureType: 'poi.school', stylers: [{ visibility: 'on' }] },
  {
    featureType: 'poi.school',
    elementType: 'geometry.fill',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'poi.school',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.school',
    elementType: 'labels.text.fill',
    stylers: [{ visibility: 'on' }],
  },
  { featureType: 'poi.sports_complex', stylers: [{ visibility: 'on' }] },
  {
    featureType: 'poi.sports_complex',
    elementType: 'geometry.fill',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'poi.sports_complex',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.sports_complex',
    elementType: 'labels.text.fill',
    stylers: [{ visibility: 'on' }],
  },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  {
    featureType: 'road.arterial',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#757575' }],
  },
  { featureType: 'road.highway', stylers: [{ visibility: 'on' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dadada' }] },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#616161' }],
  },
  { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  { featureType: 'transit.line', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] },
  { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
  {
    featureType: 'transit.station',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  { featureType: 'transit.station.airport', stylers: [{ visibility: 'on' }] },
  { featureType: 'transit.station.rail', stylers: [{ visibility: 'on' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9c9c9' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
];
