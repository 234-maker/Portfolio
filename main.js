import * as THREE from 'three';

/* ==================================
   1. Canvas and Scene Setup
   ================================== */
const canvas = document.querySelector('#bg-canvas');
const scene = new THREE.Scene();

// We keep background completely transparent so CSS handles the main bg color if needed
// Or we can set scene background matching css:
scene.background = new THREE.Color(0x0b1121); 

// Add minimal fog to match bg color and add depth
scene.fog = new THREE.FogExp2(0x0b1121, 0.04);

// Camera Setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 10;

// Renderer Setup
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Optimize performance
renderer.setSize(window.innerWidth, window.innerHeight);

/* ==================================
   2. Main Geometry: Tech Torus Knot
   ================================== */
const torusGroup = new THREE.Group();
scene.add(torusGroup);

// The base geometry
const torusGeo = new THREE.TorusKnotGeometry(3, 0.8, 128, 32);

// Material 1: Wireframe style matching "Teal" accent #2dd4bf
const wireMat = new THREE.MeshBasicMaterial({
    color: 0x2dd4bf,
    wireframe: true,
    transparent: true,
    opacity: 0.1
});
const wireMesh = new THREE.Mesh(torusGeo, wireMat);
torusGroup.add(wireMesh);

// Material 2: Points overlay matching "Sky Blue" accent #38bdf8
const pointsMat = new THREE.PointsMaterial({
    color: 0x38bdf8,
    size: 0.05,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});
const pointsMesh = new THREE.Points(torusGeo, pointsMat);
torusGroup.add(pointsMesh);


/* ==================================
   3. Ambient Particles (Data Dust)
   ================================== */
const particlesGeo = new THREE.BufferGeometry();
const particleCount = 600;

const posArray = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount * 3; i++) {
    // Spread particles across a wide area (-15 to +15)
    posArray[i] = (Math.random() - 0.5) * 30;
}
particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particleMat = new THREE.PointsMaterial({
    size: 0.03,
    color: 0xffffff,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending
});
const particlesMesh = new THREE.Points(particlesGeo, particleMat);
scene.add(particlesMesh);

/* ==================================
   4. Mouse Interactivity (Parallax)
   ================================== */
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    // Top-left is (0,0), so we normalize to (-1 to +1)
    mouseX = (event.clientX - windowHalfX) / windowHalfX;
    mouseY = (event.clientY - windowHalfY) / windowHalfY;
});


/* ==================================
   5. Animation Loop
   ================================== */
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // 1. Base lazy rotation for the Torus Knot
    torusGroup.rotation.y = elapsedTime * 0.2;
    torusGroup.rotation.x = Math.sin(elapsedTime * 0.3) * 0.2;
    
    // 2. Slow particle sway
    particlesMesh.rotation.y = elapsedTime * -0.05;

    // 3. Mouse Parallax interpolation
    // Target moves a small amount based on mouse cursor
    targetX = mouseX * 0.5;
    targetY = mouseY * 0.5;
    
    // Lerp torus group position towards cursor for a 3D parallax feel
    torusGroup.position.x += (targetX * 2 - torusGroup.position.x) * 0.05;
    torusGroup.position.y += (-targetY * 2 - torusGroup.position.y) * 0.05;
    
    // Extra little tilt based on mouse
    torusGroup.rotation.z += (-targetX * 0.5 - torusGroup.rotation.z) * 0.05;

    renderer.render(scene, camera);
}
animate();

/* ==================================
   6. GSAP Scroll Animations
   ================================== */
// Make sure GSAP and ScrollTrigger are available from index.html (loaded via CDN)
if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // Initial State in Hero (Center, somewhat pushed back)
    torusGroup.position.z = 0;
    torusGroup.scale.set(1, 1, 1);

    // Create a matchMedia instance
    let mm = gsap.matchMedia();

    // =============== DESKTOP GSAP ===============
    mm.add("(min-width: 769px)", () => {
        // Scroll to section 2: "About" (Move right)
        gsap.to(torusGroup.position, {
            x: 4, z: -2,
            scrollTrigger: { trigger: ".about", start: "top bottom", end: "top center", scrub: 1 }
        });

        // Scroll to section 3: "Projects" (Move left, spin faster)
        gsap.to(torusGroup.position, {
            x: -4, z: -1,
            scrollTrigger: { trigger: ".projects", start: "top bottom", end: "top center", scrub: 1 }
        });
        
        gsap.to(torusGroup.rotation, {
            z: Math.PI,
            scrollTrigger: { trigger: ".projects", start: "top bottom", end: "top center", scrub: 1 }
        });

        // Scroll to section 4: "Contact" (Move back to center, zoom into it)
        gsap.to(torusGroup.position, {
            x: 0, y: 0, z: 4, 
            scrollTrigger: { trigger: ".contact", start: "top bottom", end: "top center", scrub: 1 }
        });
    });

    // =============== MOBILE GSAP ===============
    mm.add("(max-width: 768px)", () => {
        // On mobile, keep the model centered but push it up/down to stay visible alongside UI cards
        gsap.to(torusGroup.position, {
            y: 3, z: -3, 
            scrollTrigger: { trigger: ".about", start: "top bottom", end: "top center", scrub: 1 }
        });

        gsap.to(torusGroup.position, {
            y: -3, z: -2, 
            scrollTrigger: { trigger: ".projects", start: "top bottom", end: "top center", scrub: 1 }
        });

        gsap.to(torusGroup.rotation, {
            z: Math.PI,
            scrollTrigger: { trigger: ".projects", start: "top bottom", end: "top center", scrub: 1 }
        });

        gsap.to(torusGroup.position, {
            y: 0, z: 2, 
            scrollTrigger: { trigger: ".contact", start: "top bottom", end: "top center", scrub: 1 }
        });
    });
}

/* ==================================
   7. Responsive Window Handling
   ================================== */
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
