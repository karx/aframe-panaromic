
window.addEventListener( 'load', function () {

    
	function setCustomObject( object ) {

		viewer.src = FAKE_SCENE;
		scene.setObject( object );

	}

	function handleFile( file ) {

		const extension = file.name.split( '.' ).pop().toLowerCase();
		const reader = new FileReader();

		switch ( extension ) {

			case 'jpg':
			case 'jpeg':
			case 'png':
			case 'heic':

				reader.onload = function(event) {
					document.getElementById('progress').innerHTML = '';
					console.log(event.target.result);
					document.getElementById('theSky').setAttribute('src', event.target.result);
					// document.getElementById('theSky').
				  };
				
				reader.readAsDataURL( file );

				break;

			case 'fbx':

				reader.addEventListener( 'load', async function ( event ) {

					const { FBXLoader } = await import( './loaders/FBXLoader.js' );

					const object = new FBXLoader().parse( event.target.result );

					object.traverse( function ( child ) {

						const material = child.material;

						if ( material && material.isMeshPhongMaterial ) {

							child.material = DEFAULT_MATERAL;

						}

					} );

					setCustomObject( object );

				}, false );
				reader.readAsArrayBuffer( file );

				break;

			case 'glb':
			case 'gltf':

				viewer.src = URL.createObjectURL( file );

				break;

			case 'obj':

				reader.addEventListener( 'load', async function ( event ) {

					const { OBJLoader } = await import( './loaders/OBJLoader.js' );

					const object = new OBJLoader().parse( event.target.result );

					object.traverse( function ( child ) {

						const material = child.material;

						if ( material && material.isMeshPhongMaterial ) {

							child.material = DEFAULT_MATERAL;

						}

					} );

					setCustomObject( object );

				}, false );
				reader.readAsText( file );

				break;

			case 'ply':

				reader.addEventListener( 'load', async function ( event ) {

					const { PLYLoader } = await import( './loaders/PLYLoader.js' );

					const geometry = new PLYLoader().parse( event.target.result );

					geometry.computeVertexNormals();

					setCustomObject( new Mesh( geometry, DEFAULT_MATERAL ) );

				}, false );
				reader.readAsArrayBuffer( file );

				break;

			case 'stl':

				reader.addEventListener( 'load', async function ( event ) {

					const { STLLoader } = await import( './loaders/STLLoader.js' );

					const geometry = new STLLoader().parse( event.target.result );

					setCustomObject( new Mesh( geometry, DEFAULT_MATERAL ) );

				}, false );
				reader.readAsBinaryString( file );

				break;

		}

	}

	document.addEventListener( 'dragover', function ( event ) {

		event.preventDefault();
		event.dataTransfer.dropEffect = 'copy';

	}, false );

	document.addEventListener( 'drop', function ( event ) {

		event.preventDefault();
		handleFile( event.dataTransfer.files[ 0 ] );

	}, false );

	// Chrome OS

	if ( 'launchData' in window && Array.isArray( window.launchData.items ) ) {

		var item = window.launchData.items[ 0 ];

		item.entry.file( handleFile );

	}

} );
