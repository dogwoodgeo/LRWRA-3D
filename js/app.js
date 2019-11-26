
// Initialized here so I can access the object in the browser console to get properties like
// latitude, longitude, & zoom.
let view;

// Load the modules
require([
	'esri/Map',
	'esri/views/SceneView',
	'esri/Basemap',
	'esri/layers/FeatureLayer'
],

function(
	Map,
	SceneView,
	Basemap,
	FeatureLayer
)

// My Code
{
	const pipeSymbol = {
		type: "line-3d",
		symbolLayers: [{
			type: "path",
			profile: "circle",
			material: {
				color: 'blue'
			},
			cap: 'round',
			width: 5, // the width in m
			height: 5 // the height in m
		}]
	};



	const lineRenderer = {
		type: 'simple',
		symbol: pipeSymbol
	};

	//* Using the LRWRA default streets vector tile basemap
	const stVTBasemap = new Basemap({
		portalItem: {
			id: 'f5c8cb30e5b14e19b434d396dbe9df39',
			portal: 'https://gis.lrwu.com/portal'
		}
	});
	
	const map = new Map
	({ 
		basemap: stVTBasemap,
		ground: 'world-elevation'
	});

	view = new SceneView
	({
		container: 'mainDiv',
		map: map,
		qualityProfile: 'high',
		environment: {
			lighting: {
				directShadowsEnabled: true,
				ambientOcclusionEnabled: true
			}
		},
		camera: {
			position: {
				x: -92.26996807060175,
				y: 34.731418195441755,
				z: 1000, //* Altitude in meters
			},
			tilt: 50 //* Perspective in degrees
		}, 
		heading: 200,//* Degrees
	});

	const linesLayer = new FeatureLayer({
		url: 'https://gis.lrwu.com/server/rest/services/Layers/Sewer_Lines/FeatureServer',
		renderer: lineRenderer,
		elevationInfo: {
			mode: 'relative-to-ground',
			offset: 10
		},
		title: 'Sewer Lines',
		outFields: ['*']
	});

	const nodesLayer = new FeatureLayer({
		url: 'https://gis.lrwu.com/server/rest/services/Layers/Sewer_Nodes/FeatureServer',
		elevationInfo: {
			mode: 'relative-to-ground',
			offset: 10
		},
		title: 'Manholes',
		outFields: ['*']
	});


	map.addMany([linesLayer, nodesLayer]);
});