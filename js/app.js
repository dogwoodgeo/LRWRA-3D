
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
	//* Create the manhole 3D cylinder symbol
	const cylinderSymbol = {
		type: 'point-3d',
		symbolLayers: [{
			type: 'object',
			width: 5, 
			height: 15,
			depth: 5,
			resource: {primitive: 'cylinder'},
			material: {color: 'red'}
		}]
	}

	//* Create the manhole renderer
	const mhRenderer = {
		type: 'simple',
		symbol: cylinderSymbol
	};

	//* Create the sewer line 3D pipe symbol
	const pipeSymbol = {
		type: "line-3d",
		symbolLayers: [{
			type: "path",
			profile: "circle",
			material: {
				color: 'blue'
			},
			cap: 'round',
			width: 4, // the width in m
			height: 4 // the height in m
		}]
	};

	//* Create the sewer line renderer
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
			offset: 7
		},
		title: 'Sewer Lines',
		outFields: ['*']
	});

	const nodesLayer = new FeatureLayer({
		url: 'https://gis.lrwu.com/server/rest/services/Layers/Sewer_Nodes/FeatureServer',
		renderer: mhRenderer,
		elevationInfo: {
			mode: 'relative-to-ground',
			offset: 0
		},
		title: 'Manholes',
		outFields: ['*']
	});


	map.addMany([linesLayer, nodesLayer]);
});