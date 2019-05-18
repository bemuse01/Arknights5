var width, height, renderer, scene, camera, TO_RADIANS = Math.PI / 180, point, pointArray = [], group, particleGroup, minGroup;
var lineMesh = [], count = 0, opacityArray = [], particle, particles, idleAnim, array = [];
var musicMesh, audio, analyser, dataArray, musicParticle, musicPoint, musicGroup, musicAnim, material, pointMaterial;
var noise = new SimplexNoise(), clock = new THREE.Clock();
var mouseX = 0, mouseY = 0;

	width = window.innerWidth;
	height = window.innerHeight;
	extraHeight = height + (height / 20);
	particles = Math.round(width / 32);
	musicParticle = 10;
	
	init();
	function init(){
		scene = new THREE.Scene();

		renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas: canvas});
		renderer.setSize(width, height);
		renderer.setClearColor(0x000000);
		renderer.setClearAlpha(0.0);

		camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
		scene.add(camera);
		camera.position.z = 50;

		group = new THREE.Group();
		particleGroup = new THREE.Group();
		minGroup = new THREE.Group();
		musicGroup = new THREE.Group();
		
		idleRender();
		musicRender();

		document.querySelector('.second > div:nth-child(2)').addEventListener('click', function(){
			$('#canvasWrap').css('background-image', "url('../image/bg/canvas_bg_1.png')");
            $('#appsWrap').fadeOut(500);
			scene.add(group);
			scene.add(particleGroup);
			scene.add(minGroup);
            idleAnim = true;
            $('#apps').css({
                'transform' : 'translate(0px, 30px)',
                'opacity' : '0'
			});
			$('#controls').css('display', 'none');
			$('.blackFrame').css('display', 'block');
		});
		document.querySelector('.firstButton').addEventListener('click', function(){
            $('#appsWrap').fadeIn(500);
			idleAnim = false;
            idleRemove();
            $('#apps').css({
                'transform' : 'translate(0px, 0px)',
                'opacity' : '1'
			});
			$('#controls').css('display', 'block');
			$('.blackFrame').css('display', 'none');

			if(!(audio.paused)){
				musicAnim = false;
				musicRemove();
				audio.pause();
				audio.currentTime = 0;
				$('#play').css({
					'background-image' : "url('../image/app/play.png')"
				});  
			}
		});

		document.querySelector('#musicSlideWrap img:nth-child(1)').addEventListener('click', function(){
			$('#canvasWrap').css('background-image', "url('../image/bg/canvas_bg_2.jpg')");
			$('#appsWrap').fadeOut(500);
			$('#current').css('background', 'black');
			material.map = new THREE.TextureLoader().load('../image/texture/particle13.png');
			pointMaterial.map = new THREE.TextureLoader().load('../image/texture/dust.png');
			scene.add(musicGroup);
            musicAnim = true;
            $('#apps').css({
                'transform' : 'translate(0px, 30px)',
                'opacity' : '0'
			});
			audio.src = '../song/Why We Lose.ogg';
			audio.play();
            $('#play').css({
                'background-image' : "url('../image/app/pause.png')"
            });
		});
		document.querySelector('#musicSlideWrap img:nth-child(2)').addEventListener('click', function(){
			$('#canvasWrap').css('background-image', "url('../image/bg/canvas_bg_3.jpg')");
			$('#appsWrap').fadeOut(500);
			$('#current').css('background', 'white');
			material.map = new THREE.TextureLoader().load('../image/texture/particle12.png');
			pointMaterial.map = new THREE.TextureLoader().load('../image/texture/snow.png');
			scene.add(musicGroup);
            musicAnim = true;
            $('#apps').css({
                'transform' : 'translate(0px, 30px)',
                'opacity' : '0'
			});
			audio.src = '../song/aLIEz.ogg';
			audio.play();
            $('#play').css({
                'background-image' : "url('../image/app/pause.png')"
            });
		});

		window.addEventListener('resize', onWindowResize, false);
		document.addEventListener('mousemove', onDocumentMouseMove, false);

		animate();
	}
	function idleRemove(){
		for(var i = 0; i < group.children.length; i++){
			group.children[i].geometry.dispose();
			group.children[i].material.dispose();
		}
		for(var i = 0; i < particleGroup.children.length; i++){
			particleGroup.children[i].geometry.dispose();
			particleGroup.children[i].material.dispose();
		}
		for(var i = 0; i < minGroup.children.length; i++){
			minGroup.children[i].geometry.dispose();
			minGroup.children[i].material.dispose();
		}
		scene.remove(group);
		scene.remove(particleGroup);
		scene.remove(minGroup);
	}
	function idleRender(){
		var geometry = new THREE.IcosahedronGeometry(11.5, 1);
		var lineTexture = new THREE.TextureLoader().load('../image/texture/line1.png');
		
		var animationGroup = new THREE.AnimationObjectGroup();

		var vecArray = [
			new THREE.Vector3(-3, 6, 0),
			new THREE.Vector3(3, 6, 0),
			new THREE.Vector3(7, 0, 0),
			new THREE.Vector3(3, -6, 0),
			new THREE.Vector3(-3, -6, 0),
			new THREE.Vector3(-7, 0, 0),
			new THREE.Vector3(-3, 6, 0)
		];
		for(var i = 0; i < vecArray.length; i++){
			var minLineGeo = new THREE.Geometry();
			if(i + 1 < vecArray.length){
				minLineGeo.vertices.push(vecArray[i], vecArray[i+1]);
			}
			var minLines = new MeshLine();
			minLines.setGeometry(minLineGeo);
			var minLineMat = new MeshLineMaterial({
				useAlphaMap: 1,
				alphaMap: lineTexture,
				color: new THREE.Color(0xfde73c),
				resolution: new THREE.Vector2(width, height),
				transparent: true,
				opacity: 0,
				lineWidth: 1/4
			});
			var minLineMesh = new THREE.Mesh(minLines.geometry, minLineMat);
			minGroup.add(minLineMesh);
			animationGroup.add(minLineMesh);
		}
		
		var scaleKF = new THREE.VectorKeyframeTrack( '.scale', [ 0, 1, 2 ], [ 1.2, 1.2, 1.2, 1.8, 1.8, 1.8, 2.05, 2.05, 2.05 ] );
		var opacityKF = new THREE.NumberKeyframeTrack( '.material.opacity', [ 0, 1, 2 ], [ 0, 0.5, 0 ] );
		var clip = new THREE.AnimationClip( 'Action', 3, [ scaleKF ,opacityKF ] );
		mixer = new THREE.AnimationMixer(animationGroup);

		var clipAction = mixer.clipAction(clip);
		clipAction.play();

		var pointGeometry = new THREE.SphereGeometry(0.3, 8, 8);
		for(var i = 0; i < geometry.vertices.length; i++){
			var pointMaterial = new THREE.MeshBasicMaterial({
				color: 0xfde73c,
				transparent: true,
				opacity: 0.5,
				depthTest: false
			});
			point = new THREE.Mesh(pointGeometry, pointMaterial);
			point.position.x = geometry.vertices[i].x;
			point.position.y = geometry.vertices[i].y;
			point.position.z = geometry.vertices[i].z;

			pointArray.push(point);
			group.add(point);
		}

		var x1 = geometry.vertices[0].x,
			y1 = geometry.vertices[0].y,
			z1 = geometry.vertices[0].z;
		var x2 = geometry.vertices[1].x,
			y2 = geometry.vertices[1].y,
			z2 = geometry.vertices[1].z;
		var distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));

		var lineGeometry, lines, lineMaterial;
		for(var i = 0; i < geometry.vertices.length; i++){
			for(var j = i + 1; j < geometry.vertices.length; j++){
				var x1 = geometry.vertices[i].x,
					y1 = geometry.vertices[i].y,
					z1 = geometry.vertices[i].z;
				var x2 = geometry.vertices[j].x,
					y2 = geometry.vertices[j].y,
					z2 = geometry.vertices[j].z;
				var d = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));
				if(d <= distance){
					lineGeometry = new THREE.Geometry();
					lineGeometry.vertices.push(
						new THREE.Vector3(x1, y1, z1),
						new THREE.Vector3(x2, y2, z2)
					);
					lines = new MeshLine();
					lines.setGeometry(lineGeometry);
					lineMaterial = new MeshLineMaterial({
						useAlphaMap: 1,
						alphaMap: lineTexture,
						color: new THREE.Color(0xfde73c),
						resolution: new THREE.Vector2(width, height),
						transparent: true,
						opacity: 0.7,
						lineWidth: 1/4
					});
					lineMesh[count] = new THREE.Mesh(lines.geometry, lineMaterial);
					var random = Math.random();
					opacityArray.push(random);
					group.add(lineMesh[count]);
					count++;
				}
			}
		}

		particleTexture = new THREE.TextureLoader().load('../image/texture/snow.png');
		var particleGeometry = new THREE.Geometry();
		var particleMaterial = new THREE.PointsMaterial({
			map: particleTexture,
			size: 10,
			transparent: true,
			opacity: 0.025,
			depthTest: false
		});
		for(var i = 0; i < particles; i++){
			var angle = Math.random() * 90 - 90 / 2;
			var cos = Math.cos(angle * TO_RADIANS), sin = Math.sin(angle * TO_RADIANS);

			var pX = Math.random() * (width / 4) - (width / 4) / 2,
				pY = Math.random() * height - height / 2,
				vertice = new THREE.Vector3(pX, pY, -width / 2);

				vertice.velocity = new THREE.Vector3(sin, Math.random() * 5 + 3, Math.random() * 1 + 1);
				particleGeometry.vertices.push(vertice);

				particle = new THREE.Points(particleGeometry, particleMaterial);
				particleGroup.add(particle);
		}
	}

	function musicRemove(){
        for(var i = 0; i < musicGroup.children.length; i++){
            musicGroup.children[i].geometry.dispose();
			musicGroup.children[i].material.dispose();
        }
        scene.remove(musicGroup);
	}
	function musicRender(){
		audio = new Audio();
		audio.loop = true;

		var context = new AudioContext();
		var src = context.createMediaElementSource(audio);
		analyser = context.createAnalyser();
		src.connect(analyser);
		analyser.connect(context.destination);
		analyser.fftSize = 512;
		var bufferLength = analyser.frequencyBinCount;
		dataArray = new Uint8Array(bufferLength);

		$('#play').on('click', function(){
			if(audio.paused){
				audio.play();
				$(this).css({
					'background-image' : "url('../image/app/pause.png')"
				});
			}else{
				audio.pause();
				$(this).css({
					'background-image' : "url('../image/app/play.png')"
				});
			}
		});
		$('#stop').on('click', function(){
			audio.pause();
			audio.currentTime = 0;
			$('#play').css({
					'background-image' : "url('../image/app/play.png')"
			});
		});

		ringTexture = new THREE.TextureLoader().load('../image/texture/particle13.png');
		var geometry = new THREE.RingGeometry(4, 12, 128);
		material = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			map: ringTexture,
			transparent: true,
			depthTest: false
		});
		musicMesh = new THREE.Mesh(geometry, material);
		musicGroup.add(musicMesh);

		var pointTexture = new THREE.TextureLoader().load('../image/texture/dust.png');
		var pointGeometry = new THREE.Geometry();
		pointMaterial = new THREE.PointsMaterial({
			map: pointTexture,
			size: 1.5,
			transparent: true,
			depthTest: false
		});

		var viewWidth = camera.getFilmWidth() + camera.getFilmWidth() / 10;
		var viewHeight = camera.getFilmHeight() + camera.getFilmHeight() / 10;
		
		for(var i = 0; i < musicParticle; i++){
			var angle = Math.random() * 90 - 45;
			var cos = Math.cos(angle * TO_RADIANS), sin = Math.sin(angle * TO_RADIANS);

			var pX = Math.random() * viewWidth * 2 - viewWidth,
					pY = Math.random() * viewHeight * 2 - viewHeight,
					vertice = new THREE.Vector3(pX, pY, 0);

			vertice.velocity = new THREE.Vector3(sin, Math.random() * 1, -sin + cos);
			pointGeometry.vertices.push(vertice);
	        musicPoint = new THREE.Points(pointGeometry, pointMaterial);
		}
		musicGroup.add(musicPoint);
	}

	function onWindowResize(){
		width = window.innerWidth;
		height = window.innerHeight;

		camera.aspect = width / height;
		camera.updateProjectionMatrix();

		renderer.setSize(width, height);
	}
	function onDocumentMouseMove(event){
		mouseX = (event.clientX - width / 2);
		mouseY = (event.clientY - height / 2);
	}
	function render(){
		if(idleAnim) idleAnimate();
		if(musicAnim) musicAnimate();
		camera.lookAt(scene.position);
		renderer.render(scene, camera);
	}
	function idleAnimate(){
		var time = window.performance.now();
		var rf = 0.00001;
		var rf1 = 0.00008;
		var rf2 = 0.0003;
		var delta = clock.getDelta();

		group.rotation.x += noise.noise2D(time * rf * 2, time * rf * 3) * 0.01;
		group.rotation.y += noise.noise2D(time * rf * 3, time * rf * 4) * 0.01;
		minGroup.rotation.z += noise.noise2D(time * rf * 3, time * rf * 4) * 0.01;
		//minGroup.rotation.y -= 0.01;

		for(var i = 0; i < lineMesh.length; i++){
			lineMesh[i].material.opacity = 1 - Math.abs(noise.noise2D(opacityArray[i] * time * rf1 * 2, opacityArray[i] * time * rf1 * 3));
		}
		for(var i = 0; i < pointArray.length; i++){
			pointArray[i].material.opacity = Math.abs(noise.noise2D(opacityArray[i] * time * rf2 * 2, opacityArray[i] * time * rf2 * 3)) / 2;
		}

		makeParticle();

		if (mixer){
			mixer.update( delta * 1.5);
		}
	}
	function makeParticle(){
		for(var i = 0; i < particles; i++){
			var points = particle.geometry.vertices[i];
			if(Math.abs(points.y) > height / 2){
				points.x = Math.random() * (width / 4) - (width / 4) / 2;
				points.y -= height;
				//points.z = -width / 2;
			}

			points.x += points.velocity.x;
			points.y += points.velocity.y;
			//points.z += points.velocity.z;
		}

		particle.geometry.verticesNeedUpdate = true;
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
		makeParticle2();

		var currentLength = (100 * audio.currentTime / audio.duration)+"vw";
		$('#current').css({
			'width' : currentLength
		});

		musicMesh.material.opacity = (0.6 + overrallAvgFr) < 1 ? (0.6 + overrallAvgFr) : 1;
		musicMesh.position.x = ( mouseX - musicMesh.position.x ) * 0.00125;
		musicMesh.position.y = ( - mouseY - musicMesh.position.y ) * 0.00125;
	}
	function makeRing(bassFr, treFr){
		musicMesh.geometry.vertices.forEach(function(vertex, i){
			if(i < 128){
				var offset = musicMesh.geometry.parameters.innerRadius;
				var amp = 3;
				var time = window.performance.now();
				vertex.normalize();
				var rf = 0.000075;
				var distance = (offset + bassFr) + noise.noise2D(vertex.x + time * rf * 6, vertex.y + time * rf * 7) * amp * treFr;
				vertex.multiplyScalar(distance);
			}
			else{
				var offset = musicMesh.geometry.parameters.outerRadius;
				var amp = 1;
				vertex.normalize();
				var distance = (offset + bassFr) + noise.noise2D(vertex.x + time * rf * 6, vertex.y + time * rf * 7) + amp * treFr;
				vertex.multiplyScalar(distance);
			}
		});
		musicMesh.geometry.verticesNeedUpdate = true;
		musicMesh.geometry.normalsNeedUpdate = true;
  	}
	function makeParticle2(){
		var time = window.performance.now();
		var rf = 0.00025;

		for(var i = 0; i < musicParticle; i++){
			var particles = musicPoint.geometry.vertices[i];

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
		musicPoint.geometry.verticesNeedUpdate = true;
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