let indexedNodes;

async function getSchemaData() {
	console.log('Starting ALL');
	let response = await fetch("./schemaorg-current-http.jsonld");
	let schemaData = await response.json();
	// updateDOMGotRe   sponse();

	console.log(schemaData);
	return schemaData;
}


async function getNodeListAndEdgeList() {
	let schemaData = await getSchemaData();
	console.log(`Got ${schemaData["@graph"].length} total edges`);

	let edgeList = [];
	let nodeList = [];

	schemaData["@graph"].forEach((element) => {
		let nodeEL = {};

		if (element["@id"] !== null) {
			element.id = element["@id"];
			nodeEL = {
				id: element["@id"],
				'@id': element["@id"],
				label: element["rdfs:label"],
				type: element["@type"]
			};
			nodeList.push(nodeEL);

		}
		let allElProps = Object.keys(element);
		allElProps.forEach((prop) => {
			//if Literal
			if (typeof element[prop] !== 'object' && element[prop] !== null) {
				// nodeEL[prop] = element[prop];
				//let it just be a prop in the Node -> saved in the nodelist
			} else if (Array.isArray(element[prop])) {
				element[prop].forEach((eachVal) => {
					edgeList.push({
						id: element["id"],
						prop: prop,
						val: eachVal["id"]
					})
				})
				// console.log(element[prop]);
			} else {
				if (element[prop]["@id"] !== null) {
					// console.log(`${prop} : ${element[prop]}`);
					edgeList.push({
						id: element["@id"],
						prop: prop,
						val: element[prop]["@id"]
					});
				}
			}
		});
	});
	console.log({ edgeList });
	console.log({ nodeList });
	return {
		nodeList: nodeList,
		edgeList: edgeList
	}
}


window.addEventListener('load', async function () {

	let graph_data = await getNodeListAndEdgeList();
	console.log(graph_data);
	
	goPlot(graph_data);
	document.getElementById('graph-force-prop-select').addEventListener('change', (event) => {
		goPlot(graph_data, event.target.value)
	})
	// Chrome OS

});
async function goPlot(graph_data, force_graph_prop = 'all') {

	let selectedProp = force_graph_prop;
	let nodeList = graph_data.nodeList
	let propIDLIst = [...new Set(graph_data.edgeList.map(x => x.prop))]
	let edgeList = graph_data.edgeList
		.filter(x => x.prop == selectedProp || force_graph_prop === 'all')
		.filter(x => x.target !== null)
		.map(x => {
			return {	
				source: x.id,
				target: x.val
			}
		});
	let nodeIDList = nodeList.map(x => x["@id"]);
	edgeList = edgeList.filter(x => nodeIDList.indexOf(x.source) >= 0 && nodeIDList.indexOf(x.target)>=0);
	console.log(`nodes: ${JSON.stringify(nodeList)}; `);
	console.log({ nodeList });
	console.log({ edgeList });

	document.getElementById("forceGraph").setAttribute('forcegraph',
		// `nodes: [{"id": 1, "name": "first"}, {"id": 2, "name": "second"}, {"id": 3, "name": "thgree"}, {"id": "karo", "name": "kaaro"}]; links: [{"source": 1, "target": 2}, {"source": 1, "target": 3}, {"source": 1, "target": "karo"}]`);
		`nodes: ${JSON.stringify(nodeList)}; links: ${JSON.stringify(edgeList)}; node-auto-color-by:"type"; node-label:"label"`)
	console.log({ nodeList });
	console.log({ edgeList });
	addPropNamesToDOM(propIDLIst);

}

async function addPropNamesToDOM(propIDList) {
	let selectMainNode = document.getElementById('graph-force-prop-select');
	let optionList = [];
	propIDList.forEach(prop => {
		let optEL = document.createElement('option');
		optEL.setAttribute('value', prop);
		optEL.innerHTML = prop;
		selectMainNode.appendChild(optEL);
	});
	
}