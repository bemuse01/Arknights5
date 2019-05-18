var width, height, renderer, scene, camera, mesh, dataArray, particle, point, musicGroup;
	var noise = new SimplexNoise(), TO_RADIANS = Math.PI / 180;
	var mouseX = 0, mouseY = 0;

	width = window.innerWidth;
	height = window.innerHeight;
	extraWidth = width + (width / 20);
	extraHeight = height + (height / 20);
	particle = 10;

init();
	function init(){
		scene = new THREE.Scene();

		musicGroup = new THREE.Group();

		renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas: canvas});
		renderer.setSize(width, height);
		renderer.setClearColor(0x000000);
		renderer.setClearAlpha(0.0);

		camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
		scene.add(camera);
		camera.position.z = 50;

		musicRender();

		window.addEventListener('resize', onWindowResize, false);
		document.addEventListener('mousemove', onDocumentMouseMove, false);

		animate();
	}
	function musicRemove(){

	}
	function musicRender(){
		var audio = new Audio();
		audio.src = 'Why We Lose.mp3';
		audio.play();
		audio.loop = true;

		var context = new AudioContext();
    var src = context.createMediaElementSource(audio);
    var analyser = context.createAnalyser();
    src.connect(analyser);
    analyser.connect(context.destination);
    analyser.fftSize = 512;
    var bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

		$('#play').on('click', function(){
			if(audio.paused){
				audio.play();
				$(this).css({
					'background-image' : "url('image/pause.png')"
				});
			}else{
				audio.pause();
				$(this).css({
					'background-image' : "url('image/play.png')"
				});
			}
		});
		$('#stop').on('click', function(){
			audio.pause();
			audio.currentTime = 0;
			$('#play').css({
					'background-image' : "url('image/play.png')"
				});
		});

		var texture = new THREE.TextureLoader().load('image/particle13.png');
		var geometry = new THREE.RingGeometry(4, 12, 128);
		var material = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			map: texture,
			transparent: true,
			depthTest: false
		});
		mesh = new THREE.Mesh(geometry, material);
		musicGroup.add(mesh);

		var pointTexture = new THREE.TextureLoader().load('image/dust.png');
		var pointGeometry = new THREE.Geometry();
		pointMaterial = new THREE.PointsMaterial({
			map: pointTexture,
			size: 1.5,
			transparent: true,
			depthTest: false
		});

		var viewWidth = camera.getFilmWidth() + camera.getFilmWidth() / 10;
		var viewHeight = camera.getFilmHeight() + camera.getFilmHeight() / 10;
		
		for(var i = 0; i < particle; i++){
			var angle = Math.random() * 90 - 45;
			var cos = Math.cos(angle * TO_RADIANS), sin = Math.sin(angle * TO_RADIANS);

			var pX = Math.random() * viewWidth * 2 - viewWidth,
					pY = Math.random() * viewHeight * 2 - viewHeight,
					vertice = new THREE.Vector3(pX, pY, 0);

			vertice.velocity = new THREE.Vector3(sin, Math.random() * 1, -sin + cos);
			pointGeometry.vertices.push(vertice);
			point = new THREE.Points(pointGeometry, pointMaterial);
		}
		musicGroup.add(point);

		scene.add(musicGroup);
	}

	function onWindowResize(){
		width = window.innerWidth;
		height = window.innerHeight;
		extraWidth = width + (width / 20);
		extraHeight = height + (height / 20);

		camera.aspect = width / height;
		camera.updateProjectionMatrix();

		renderer.setSize(width, height);
	}
	function onDocumentMouseMove(event){
		mouseX = (event.clientX - width / 2);
		mouseY = (event.clientY - height / 2);
	}
	function render(){
		if(true) musicAnimate();
		camera.lookAt(scene.position);
		renderer.render(scene, camera);
	}
	function musicAnimate(){
		analyser.getByteFrequencyData(dataArray);

		var lowerHalfArray = dataArray.slice(0, (dataArray.length/2) - 1);
		var upperHalfArray = dataArray.slice((dataArray.length/2) - 1, dataArray.length - 1);

		var overallAvg = avg(dataArray);
		var lowerMax = max(lowerHalfArray);
		//var lowerAvg = avg(lowerHalfArray);
	 	//var upperMax = max(upperHalfArray);
		var upperAvg = avg(upperHalfArray);

		var overrallAvgFr = overallAvg / dataArray.length;
		var lowerMaxFr = lowerMax / lowerHalfArray.length;
		var upperAvgFr = upperAvg / upperHalfArray.length;

		makeRing(modulate(Math.pow(lowerMaxFr, 0.2), 0, 2, 0, 4), modulate(upperAvgFr, 0, 2, 0, 4));
		makeParticle();

		var currentLength = (100 * audio.currentTime / audio.duration)+"vw";
		$('#current').css({
			'width' : currentLength
		});

		mesh.material.opacity = (0.6 + overrallAvgFr) < 1 ? (0.6 + overrallAvgFr) : 1;
		mesh.position.x = ( mouseX - mesh.position.x ) * 0.00125;
		mesh.position.y = ( - mouseY - mesh.position.y ) * 0.00125;
	}
	
	function makeRing(bassFr, treFr){
		mesh.geometry.vertices.forEach(function(vertex, i){
			if(i < 128){
				var offset = mesh.geometry.parameters.innerRadius;
				var amp = 3;
				var time = window.performance.now();
				vertex.normalize();
				var rf = 0.000075;
				var distance = (offset + bassFr) + noise.noise2D(vertex.x + time * rf * 6, vertex.y + time * rf * 7) * amp * treFr;
				vertex.multiplyScalar(distance);
			}
			else{
				var offset = mesh.geometry.parameters.outerRadius;
				var amp = 1;
				vertex.normalize();
				var distance = (offset + bassFr) + noise.noise2D(vertex.x + time * rf * 6, vertex.y + time * rf * 7) + amp * treFr;
				vertex.multiplyScalar(distance);
			}
		});
    mesh.geometry.verticesNeedUpdate = true;
    mesh.geometry.normalsNeedUpdate = true;
  }
	function makeParticle(){
		var time = window.performance.now();
		var rf = 0.00025;

		for(var i = 0; i < particle; i++){
			var particles = point.geometry.vertices[i];

			var viewWidth = camera.getFilmWidth() + camera.getFilmWidth() / 10;
			var extraViewWidth = camera.getFilmWidth() + camera.getFilmWidth() / 8;
			var viewHeight = camera.getFilmHeight() + camera.getFilmHeight() / 10;
			var extraViewHeight = camera.getFilmHeight() + camera.getFilmHeight() / 8;

			if(Math.abs(particles.x) > extraViewWidth || Math.abs(particles.x) < -extraViewWidth){
				var random = Math.floor(Math.random() * 2);
				if(random == 0){
					particles.x = Math.random() * (extraViewWidth - viewWidth) + viewWidth;
				}else{
					particles.x = Math.random() * (viewWidth - extraViewWidth) - viewWidth;
				}
			}
			if(Math.abs(particles.y) > extraViewHeight || Math.abs(particles.y) < -extraViewHeight){
				var random = Math.floor(Math.random() * 2);
				if(random == 0){
					particles.y = Math.random() * (extraViewHeight - viewHeight) + viewHeight;
				}else{
					particles.y = Math.random() * (viewHeight - extraViewHeight) - viewHeight;
				}
			}

			particles.x += (particles.velocity.x + noise.noise3D(particles.x * rf * 2, particles.y  * rf * 3, time * rf)) * 0.2;
			particles.y += (particles.velocity.y + noise.noise3D(particles.x * rf * 4, particles.y * rf * 5, time * rf)) * 0.2;
		}
		point.geometry.verticesNeedUpdate = true;
	}
	function fractionate(val, minVal, maxVal) {
    return (val - minVal)/(maxVal - minVal);
	}
	function modulate(val, minVal, maxVal, outMin, outMax) {
	    var fr = fractionate(val, minVal, maxVal);
	    var delta = outMax - outMin;
	    return outMin + (fr * delta);
	}
	function avg(arr){
	    var total = arr.reduce(function(sum, b) { return sum + b; });
	    return (total / arr.length);
	}
	function max(arr){
	    return arr.reduce(function(a, b){ return Math.max(a, b); });
	}
	function animate(){
		render();
		requestAnimationFrame(animate);
	}