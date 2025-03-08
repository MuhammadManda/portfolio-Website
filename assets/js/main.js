// Three.js Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#canvas'),
    antialias: true,
    alpha: true
});

// Comprehensive scroll control
document.addEventListener('DOMContentLoaded', function() {
    // Force scroll to top
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
});

window.addEventListener('load', function() {
    // Force scroll to top again after all resources are loaded
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    
    // Add a slight delay to ensure it works
    setTimeout(() => {
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }, 100);
});

// Prevent scroll restoration
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}

// Handle reload and navigation
window.onbeforeunload = function() {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
};

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

function createParticleSystem() {
    const group = new THREE.Group();

    // Core geometry (pentagon-based)
    const coreGeometry = new THREE.DodecahedronGeometry(8, 0);
    const coreMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x9370DB,
        transmission: 0.6,
        opacity: 0.9,
        metalness: 0.3,
        roughness: 0.2,
        ior: 1.5,
        thickness: 2.0,
        transparent: true,
        side: THREE.DoubleSide,
        flatShading: true
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    
    // Add wireframe overlay for pentagon edges
    const wireframeGeometry = new THREE.DodecahedronGeometry(8.1, 0);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0x9370DB,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    core.add(wireframe);
    
    group.add(core);

    // Inner glow with pentagon shape
    const glowGeometry = new THREE.DodecahedronGeometry(7.8, 0);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x9370DB,
        transparent: true,
        opacity: 0.5,
        side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    group.add(glow);

    // Particle system - concentrated around vertices
    const particleCount = 800; // Increased for more density
    const particles = new THREE.Group();
    
    // Get vertices for particle clustering
    const vertices = coreGeometry.vertices || coreGeometry.attributes.position;
    
    for (let i = 0; i < particleCount; i++) {
        const size = Math.random() * 0.4 + 0.2;
        const particleGeometry = new THREE.SphereGeometry(size, 8, 8);
        const particleMaterial = new THREE.MeshPhongMaterial({
            color: 0x9370DB,
            emissive: 0x9370DB,
            emissiveIntensity: 0.7,
            transparent: true,
            opacity: Math.random() * 0.7 + 0.3
        });
        
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        
        // Position particles with pentagon-focused distribution
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 2;
        const radius = 8 + Math.random() * 4;
        
        // Cluster particles more around pentagon vertices
        if (Math.random() > 0.5) {
            particle.position.x = radius * Math.sin(theta) * Math.cos(phi * 5) * 1.2;
            particle.position.y = radius * Math.sin(theta) * Math.sin(phi * 5) * 1.2;
            particle.position.z = radius * Math.cos(theta) * 1.2;
        } else {
            particle.position.x = radius * Math.sin(theta) * Math.cos(phi);
            particle.position.y = radius * Math.sin(theta) * Math.sin(phi);
            particle.position.z = radius * Math.cos(theta);
        }
        
        particle.userData.originalPosition = particle.position.clone();
        particle.userData.randomOffset = Math.random() * Math.PI * 2;
        
        particles.add(particle);
    }
    
    group.add(particles);
    group.position.set(0, 2, -35);
    return { group, particles };
}

const { group: particleSystem, particles } = createParticleSystem();
scene.add(particleSystem);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x9370DB, 2, 100);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

camera.position.z = 30;

// Mouse movement effect
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Scroll effect
let scrollPercent = 0;
window.addEventListener('scroll', () => {
    scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
});

// Project interaction handling
const canvas = document.querySelector('#canvas');
const projectElements = document.querySelectorAll('.project');

projectElements.forEach(project => {
    // Mouse enter (hover) event
    project.addEventListener('mouseenter', () => {
        canvas.style.transition = 'opacity 0.3s ease';
        canvas.style.opacity = '0.15';
        project.classList.add('project-active');
    });

    // Mouse leave event
    project.addEventListener('mouseleave', () => {
        canvas.style.opacity = '1';
        project.classList.remove('project-active');
    });
});

// Animation
function animate() {
    requestAnimationFrame(animate);

    // Rotate the entire system
    particleSystem.rotation.y += 0.001 * (1 + scrollPercent * 2);
    particleSystem.rotation.x = scrollPercent * Math.PI / 4;

    // Animate particles with more movement
    particles.children.forEach((particle, i) => {
        const time = Date.now() * 0.001;
        const originalPos = particle.userData.originalPosition;
        const offset = particle.userData.randomOffset;
        
        // Enhanced floating effect
        particle.position.x = originalPos.x + Math.sin(time + offset) * 0.5;
        particle.position.y = originalPos.y + Math.cos(time + offset) * 0.5;
        particle.position.z = originalPos.z + Math.sin(time + offset) * 0.5;
        
        // Enhanced pulse opacity
        particle.material.opacity = 0.3 + Math.sin(time * 2 + offset) * 0.4;
    });

    // Mouse interaction
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;
    particleSystem.rotation.y += targetX * 0.01;
    particleSystem.rotation.x += targetY * 0.01;

    // Enhanced scale effect on scroll
    const baseScale = 1.0; // Reduced from 1.2
    const maxScale = 1.5;  // Added maximum scale limit
    const scaleIncrease = scrollPercent * 0.5; // Reduced from 2
    const scale = Math.min(baseScale + scaleIncrease, maxScale);
    particleSystem.scale.set(scale, scale, scale);

    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Smooth scrolling
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        document.querySelector(targetId).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

document.querySelectorAll('.project, #about p, .skill-item').forEach(el => {
    el.classList.add('fade-out');
    observer.observe(el);
});

// Form handling
const form = document.getElementById('contact-form');
if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const button = this.querySelector('button');
        button.innerHTML = 'Sending...';
        
        setTimeout(() => {
            button.innerHTML = 'Message Sent!';
            this.reset();
            setTimeout(() => {
                button.innerHTML = 'Send Message';
            }, 2000);
        }, 1500);
    });
}