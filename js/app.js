
// Initialized here so I can access the object in the browser console to get properties like
// latitude, longitude, & zoom.
let view;

// Load the modules
require([
	'esri/Map',
	'esri/views/SceneView',
	'esri/Basemap',
	'esri/layers/FeatureLayer',
	'esri/widgets/Search',
	'esri/widgets/Expand'
],

function(
	Map,
	SceneView,
	Basemap,
	FeatureLayer,
	Search,
	Expand
)

{	

	//* Set extent
	extent = {
		xmax: -10239233,
		xmin: -10326560,
		ymax: 4154450,
		ymin: 4101949, 
		spatialReference: {
			wkid: 3857
		}
	};

	//* Create the manhole 3D cylinder symbol
	const cylinderSymbol = {
		type: 'point-3d',
		symbolLayers: [{
			type: 'object',
			width: 5, 
			height: 20,
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

	//* Manhole labels
	const mhLabelClass = {
		labelExpressionInfo: {	
			expression: '$feature.MH_NO',
		},	
		symbol: {
			type: "label-3d",  // autocasts as new TextSymbol3DLayer()
			symbolLayers: [{
				type: 'text',
				material: { color: 'black'},
				halo: {
					color: 'white',
					size: 1
				},
				size: 10,  // Defined in points
			}],
			verticalOffset: {
				screenLength: 50,
				maxWorldLength: 50,
				minWorldLength: 1
			},
			callout: {
				type: "line", // autocasts as new LineCallout3D()
				size: 0.5,
				color: 'black',
				border: {
					color: 'white'
				}
			},
			minScale: 500,
			labelPlacement: 'center-center',
			}
	};

	//* Using the LRWRA default streets vector tile basemap
	const stVTBasemap = new Basemap({
		portalItem: {
			id: 'f5c8cb30e5b14e19b434d396dbe9df39',
			portal: 'https://gis.lrwu.com/portal'
		}
	});
	
	//* Sewer line popup template
	const slPopup = {
		title: '{UPS_MH} to {DWN_MH}',
		content: [
			{
				type: 'fields',
				fieldInfos: [
					{
						fieldName: 'UNITTYPE',
						label: 'Unit Type'
					},
					{
						fieldName: 'PIPETYPE',
						label: 'Pipe Type'
					},
					{
						fieldName: 'PIPELEN',
						label: 'Length'
					},
					{
						fieldName: 'PIPEDIAM',
						label: 'Diameter'
					},
					{
						fieldName: 'UPDPTH',
						label: 'Upstream Depth'
					},
					{
						fieldName: 'DOWNDPTH',
						label: 'Downstream Depth'
					},
					{
						fieldName: 'INSTDATE',
						label: 'Install Date',
						format: {
							dateFormat: 'day-short-month-year'
						}
					},
					{
						fieldName: 'COMPKEY',
						label: 'CompKey'
					},
				]
			}
		]
	}

	//* Manhole popup template
	const mhPopup = {
		title: '{MH_NO}',
		content: [
			{
				type: 'fields',
				fieldInfos: [
					{
						fieldName: 'SERVSTAT',
						label: 'Service Status'
					},
					{
						fieldName: 'UNITTYPE',
						label: 'Unit Type'
					},
					{
						fieldName: 'INSTDATE',
						label: 'Install Date',
						format: {
							dateFormat: 'day-short-month-year'
						}
					},
					{
						fieldName: 'DROPMH',
						label: 'Drop(Y/N)'
					},
					{
						fieldName: 'OWN',
						label: 'Ownership'
					},
					{
						fieldName: 'COMPKEY',
						label: 'CompKey'
					},
					{
						fieldName: 'MHDPTH',
						label: 'Depth'
					},
					{
						fieldName: 'SAFETYMSG',
						label: 'Safety Message'
					}
				]
			}
		]

	};


	//* Map 
	const map = new Map
	({ 
		basemap: stVTBasemap,
		ground: 'world-elevation'
	});

	//* Ground opacity and navigate underground
	map.ground.opacity = 0.8;
	map.ground.navigationConstraint = {
		type: 'none'
	};

	//* SceneView 
	view = new SceneView
	({
		container: 'mainDiv',
		map: map,
		viewingMode: 'local',
		clippingArea: extent,
		extent: extent,
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
				z: 500, //* Altitude in meters
			},
			tilt: 50 //* Perspective in degrees
		}, 
		heading: 200,//* Degrees
	});

	const expandContent = '<h3 style="color: #2D9773">LRWRA 3D</h3>' + 
	'<span style="color: #2D9773">' + 
	'This is a 3D representation of the Little Rock Water Reclamation Authority\'s sewer system.<br><br>' + 
	'<span style="color: #2D9773"><b>Subsurface Navigation</b></span><br>' + 
	'<span style="color: #2D9773">Right-click, hold, and drag the mouse to rotate or change view angle and navigate underground.</span><br><br>' + 
	'<span style="color: #2D9773"><b>Important</b></span><br>' +
	'<span style="color: #2D9773">Subsurface depths/elevations of features are NOT representative of real world attributes. Absolute values relative the ground elevation are used for manhole and sewer line depths. This will be addressed in future updates.</span><br><br>' + 
	'<span style="color: #2D9773 ; font-weight: 900">Contact</span><br>' +
	'<span style="color: #2D9773">Bradley Jones</span><br>' +
	'<a href="mailto:Bradley.Jones@lrwra.com">Bradley.Jones@lrwra.com</a><br>' 

	//* Lines Layer
	const linesLayer = new FeatureLayer({
		url: 'https://gis.lrwu.com/server/rest/services/Layers/Sewer_Lines/FeatureServer',
		renderer: lineRenderer,
		popupTemplate: slPopup,
		elevationInfo: {
			mode: 'relative-to-ground',
			offset: -15
		},
		title: 'Sewer Lines',
		outFields: ['*'],
		featureReduction: {
			type: 'selection'
		},
		minScale: 3000
	});

	//* Nodes Layer
	const nodesLayer = new FeatureLayer({
		url: 'https://gis.lrwu.com/server/rest/services/Layers/Sewer_Nodes/FeatureServer',
		renderer: mhRenderer,
		popupTemplate: mhPopup,
		labelingInfo: [mhLabelClass],
		elevationInfo: {
			mode: 'relative-to-ground',
			offset: -19
		},
		title: 'Manholes',
		outFields: ['*'],
		featureReduction: {
			type: 'selection'
		},
		minScale: 3000
	});

	//* Search widget
	const search = new Search({
		view: view,
		allPlaceholder: 'Manhole',
		sources: [
			{
				layer: nodesLayer,
				searchFields: ['MH_NO'],
				displayField: 'MH_NO',
				exactMatch: false,
				outFields: ['*'],
				name: 'Manhole Number',
				placeholder: 'Example: -3F004',
				maxResults: 6,
				maxSuggestions: 6,
				suggestionsEnabled: true,
				zoomScale: 300
			}
		]
	});

	view.ui.add(search, {
		position: "top-right"
	});

	infoExpand = new Expand({
		expandIconClass: 'esri-icon-description',
		view: view,
		content: expandContent,
		expanded: true,
	})
	view.ui.add(infoExpand, 'top-right');

	//* Add layers
	map.addMany([linesLayer, nodesLayer]);
});