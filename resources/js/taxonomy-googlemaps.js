(function (window, document, $, undefined) {

	'use strict';

	const createHTMLMapMarker = require('@posterno/google-maps-html-marker');

	window.PosternoTaxonomyMap = {};

	// The library to load the gmap api.
	const loadGoogleMapsApi = require('load-google-maps-api')

	// Parameters for the api request.
	const apiConfig = {
		key: pnoMapSettings.google_maps_api_key,
	}

	// Determine the type of marker selected.
	const markerType = pnoMapSettings.marker_type

	/**
	 * Run the script.
	 */
	PosternoTaxonomyMap.init = function () {
		PosternoTaxonomyMap.cacheSelectors();
		PosternoTaxonomyMap.loadMap();
	}

	/**
	 * Cache required selectors.
	 */
	PosternoTaxonomyMap.cacheSelectors = function () {
		PosternoTaxonomyMap.map_elements = $('.pno-taxonomy-map');
	}

	PosternoTaxonomyMap.getMarkers = function () {
		return pnoTaxonomyMarkers
	}

	/**
	 * Load Google maps and then create maps.
	 */
	PosternoTaxonomyMap.loadMap = function () {

		// Make sure there's an element before loading the api.
		if (!PosternoTaxonomyMap.map_elements) {
			return;
		}

		loadGoogleMapsApi(apiConfig).then(function (googleMaps) {

			$(PosternoTaxonomyMap.map_elements).each(function () {

				var singleMap = $(this)

				var startingCenter = {
					lat: parseFloat(pnoMapSettings.starting_lat),
					lng: parseFloat(pnoMapSettings.starting_lng),
				};

				if (singleMap.length) {

					const map = new googleMaps.Map(singleMap[0], {
						center: startingCenter,
						zoom: 12,
						fullscreenControl: false,
						streetViewControl: false,
						mapTypeControl: false,
					})

					var bounds = new google.maps.LatLngBounds();

					// Get found listings.
					const AvailableMarkers = PosternoTaxonomyMap.getMarkers()

					// Loop listings and create a marker.
					Object.keys( AvailableMarkers ).forEach(function (key) {

						var Listing = AvailableMarkers[key]

						var Coordinates = {
							lat: parseFloat( Listing.coordinates.lat ),
							lng: parseFloat( Listing.coordinates.lng )
						}

						if ( markerType === 'default' ) {
							var marker = new google.maps.Marker({
								position: Coordinates,
								map: map,
							});
						} else {
							const latLng = new google.maps.LatLng( Coordinates.lat, Coordinates.lng );
							var marker = createHTMLMapMarker({
								latlng: latLng,
								map: map,
								html: pnoMapSettings.marker_content
							});
						}

						bounds.extend(marker.position)

					});

					// Center the map so that all markers can be seen.
					map.setCenter(bounds.getCenter())
					map.fitBounds(bounds)

				}

			});

		}).catch(function (error) {
			console.error(error)
		})

	}

	document.addEventListener('DOMContentLoaded', function () {
		PosternoTaxonomyMap.init();
	});

})(window, document, jQuery);