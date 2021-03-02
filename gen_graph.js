let indexedNodes;

async function getSchemaData() {
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
		
	if(element["@id"] !== null) {
		element.id = element["@id"];
		nodeList.push(element);
	}
	let allElProps = Object.keys(element);
        allElProps.forEach((prop) => {
            //if Literal
            if (typeof element[prop] !== 'object' &&  element[prop] !== null ) {
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
                if(element[prop]["@id"] !== null) {
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
	console.log({edgeList});
	console.log({nodeList});
	return {
		nodeList: nodeList,
		edgeList: edgeList
	}
}

async function theGo() {
	let schemaData = await getSchemaData();
	console.log(`Got ${schemaData["@graph"].length} total edges`);
    let edgeList = [];
	indexedNodes = {};
	indexedNodes = {
		"rdfs:Class": {
			isParentOf: [],
		},
	}; // filling a root node
	schemaData["@graph"].forEach((element) => {
		indexedNodes[element["@id"]] = element;
		indexedNodes[element["@id"]].isParentOf = [];

        	});
	let baseClasses = schemaData["@graph"].filter(
		(n) => n["@type"] === "rdfs:Class"
	);
	let propertyClasses = schemaData["@graph"].filter(
		(n) => n["@type"] === "rdf:Property"
	);

	console.log(`Base Classes: ${baseClasses.length}`);
	console.log(`Properties L: ${propertyClasses.length}`);
	console.log(`EdgeList: ${edgeList.length}`);
    console.log({edgeList});

	let subClassChain = {};
	schemaData["@graph"].forEach((element) => {
		if (element["rdfs:subClassOf"]) {
			if (Array.isArray(element["rdfs:subClassOf"])) {
				element["rdfs:subClassOf"].forEach((n) => {
					let nameOfParentId = n["@id"];
					let nameOfElement = element["@id"];
					// console.log(` ${nameOfParentId} -> ${nameOfElement}`);
					indexedNodes[nameOfParentId].isParentOf.push(nameOfElement);
				});
			} else {
				let nameOfParentId = element["rdfs:subClassOf"]["@id"];
				let nameOfElement = element["@id"];
				// console.log(` ${nameOfParentId} -> ${nameOfElement}`);

				indexedNodes[nameOfParentId].isParentOf.push(nameOfElement);
			}
		}
	});
	console.log(indexedNodes);


}

();