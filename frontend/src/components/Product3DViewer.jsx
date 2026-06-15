import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Loader2, Rotate3d, ZoomIn, Info } from 'lucide-react';

const Product3DViewer = ({ product }) => {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    let width = containerRef.current.clientWidth || 500;
    let height = containerRef.current.clientHeight || 500;

    // 1. Scene setup
    const scene = new THREE.Scene();
    
    // Ambient light for general visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    // Key directional light for reflections and shadows
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    // Fill light for soft details
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-5, 3, -5);
    scene.add(fillLight);

    // Dynamic colored rim light (violet/blue) for premium aesthetic
    const rimLight = new THREE.PointLight(0x6366f1, 1.8, 15);
    rimLight.position.set(-4, 2, 4);
    scene.add(rimLight);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 2, 10);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    containerRef.current.appendChild(renderer.domElement);

    // 4. Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.1; // Limit under-floor camera movement
    controls.minDistance = 3;
    controls.maxDistance = 15;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.2;

    // Interactivity: Stop auto-rotate on user drag
    controls.addEventListener('start', () => {
      controls.autoRotate = false;
    });

    // 5. Build Procedural 3D Mesh
    const group = new THREE.Group();
    scene.add(group);

    // Fetch product category
    const categoryName = product.category?.categoryName || 'Phones';
    const mainImageUrl = product.images && product.images.length > 0 
      ? product.images[0] 
      : 'https://images.unsplash.com/photo-1550009158-9efff6c0e561?auto=format&fit=crop&q=80&w=800';

    // Load texture
    const textureLoader = new THREE.TextureLoader();
    
    // Handle cross-origin texture loading
    textureLoader.setCrossOrigin('anonymous');

    textureLoader.load(
      mainImageUrl,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        
        // Materials list
        const metalMaterial = new THREE.MeshStandardMaterial({
          color: 0x2e3033, // Titanium dark gray
          metalness: 0.9,
          roughness: 0.2,
        });

        const glossyBackMaterial = new THREE.MeshStandardMaterial({
          color: 0x1a1a1a,
          metalness: 0.8,
          roughness: 0.35,
        });

        const screenMaterial = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.1,
          metalness: 0.1,
        });

        const lensMaterial = new THREE.MeshStandardMaterial({
          color: 0x050505,
          roughness: 0.05,
          metalness: 0.9,
        });

        if (categoryName.toLowerCase() === 'phones' || categoryName.toLowerCase() === 'tablets' || categoryName.toLowerCase() === 'smartphones') {
          // --- SMARTPHONE / TABLET ---
          const isTablet = categoryName.toLowerCase() === 'tablets';
          const w = isTablet ? 3.8 : 2.8;
          const h = isTablet ? 5.2 : 5.8;
          const d = 0.18;

          // Main body geometry (Box)
          const bodyGeom = new THREE.BoxGeometry(w, h, d);
          
          // Materials for 6 faces: Right, Left, Top, Bottom, Front (Screen), Back
          const materials = [
            metalMaterial, // Right
            metalMaterial, // Left
            metalMaterial, // Top
            metalMaterial, // Bottom
            screenMaterial, // Front
            glossyBackMaterial // Back
          ];

          const phone = new THREE.Mesh(bodyGeom, materials);
          group.add(phone);

          // Add camera bump on back
          const bumpGeom = new THREE.BoxGeometry(0.8, 0.8, 0.05);
          const bump = new THREE.Mesh(bumpGeom, metalMaterial);
          bump.position.set(-w/2 + 0.6, h/2 - 0.6, -d/2 - 0.025);
          group.add(bump);

          // Add camera lenses
          const lensGeom = new THREE.CylinderGeometry(0.16, 0.16, 0.04, 16);
          lensGeom.rotateX(Math.PI / 2);
          
          const lens1 = new THREE.Mesh(lensGeom, lensMaterial);
          lens1.position.set(-w/2 + 0.6, h/2 - 0.45, -d/2 - 0.06);
          group.add(lens1);

          const lens2 = new THREE.Mesh(lensGeom, lensMaterial);
          lens2.position.set(-w/2 + 0.6, h/2 - 0.75, -d/2 - 0.06);
          group.add(lens2);

        } else if (categoryName.toLowerCase() === 'laptops') {
          // --- LAPTOP ---
          // Keyboard Base
          const baseGeom = new THREE.BoxGeometry(6.0, 0.12, 4.2);
          const base = new THREE.Mesh(baseGeom, metalMaterial);
          base.position.y = -0.06;
          group.add(base);

          // Keyboard recessed area
          const kbAreaGeom = new THREE.BoxGeometry(5.2, 0.01, 2.0);
          const kbAreaMat = new THREE.MeshStandardMaterial({ color: 0x121212, roughness: 0.6 });
          const kbArea = new THREE.Mesh(kbAreaGeom, kbAreaMat);
          kbArea.position.set(0, 0.061, -0.4);
          group.add(kbArea);

          // Trackpad
          const padGeom = new THREE.BoxGeometry(1.6, 0.01, 1.0);
          const padMat = new THREE.MeshStandardMaterial({ color: 0x232528, roughness: 0.4, metalness: 0.3 });
          const pad = new THREE.Mesh(padGeom, padMat);
          pad.position.set(0, 0.061, 1.2);
          group.add(pad);

          // Laptop screen lid Group (to rotate open at hinge)
          const lidGroup = new THREE.Group();
          lidGroup.position.set(0, 0, -2.1); // Hinge position at back edge of base
          group.add(lidGroup);

          // Screen box
          const lidGeom = new THREE.BoxGeometry(6.0, 4.2, 0.08);
          const lidMaterials = [
            metalMaterial, // Right
            metalMaterial, // Left
            metalMaterial, // Top
            metalMaterial, // Bottom
            screenMaterial, // Front (Screen display!)
            metalMaterial // Back outer lid
          ];
          const lid = new THREE.Mesh(lidGeom, lidMaterials);
          lid.position.y = 2.1; // Offset center so hinge is at bottom of lid
          lidGroup.add(lid);

          // Rotate lid open (115 degrees)
          lidGroup.rotateX(Math.PI - (115 * Math.PI / 180));

        } else {
          // --- ACCESSORY / GENERIC (Podium + Floating Hologram) ---
          // Podiums base
          const baseGeom = new THREE.CylinderGeometry(2.5, 2.7, 0.4, 32);
          const base = new THREE.Mesh(baseGeom, metalMaterial);
          base.position.y = -2.0;
          group.add(base);

          // Glowing neon ring around base
          const ringGeom = new THREE.TorusGeometry(2.5, 0.05, 8, 48);
          ringGeom.rotateX(Math.PI / 2);
          const ringMat = new THREE.MeshBasicMaterial({ color: 0xc47a6a }); // Matches theme primary copper
          const ring = new THREE.Mesh(ringGeom, ringMat);
          ring.position.y = -1.8;
          group.add(ring);

          // Floating glass display panel containing the image
          const glassPanelGeom = new THREE.BoxGeometry(3.6, 3.6, 0.1);
          const glassMaterials = [
            metalMaterial, // Right
            metalMaterial, // Left
            metalMaterial, // Top
            metalMaterial, // Bottom
            screenMaterial, // Front (Image!)
            screenMaterial // Back (Image!)
          ];
          const glassPanel = new THREE.Mesh(glassPanelGeom, glassMaterials);
          glassPanel.position.y = 0.5;
          group.add(glassPanel);

          // Floating animations
          const clock = new THREE.Clock();
          const animateFloating = () => {
            const time = clock.getElapsedTime();
            glassPanel.position.y = 0.4 + Math.sin(time * 2.0) * 0.12;
            glassPanel.rotation.y = time * 0.5;
          };
          
          // Inject floating animation hook
          scene.userData.animateFloating = animateFloating;
        }

        setLoading(false);
      },
      undefined,
      (err) => {
        console.error('Three.js texture loading error:', err);
        setError(true);
        setLoading(false);
      }
    );

    // 6. Animation loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Handle custom category animations
      if (scene.userData.animateFloating) {
        scene.userData.animateFloating();
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 7. Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      width = containerRef.current.clientWidth;
      height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 8. Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }

      // Dispose resources
      scene.clear();
      renderer.dispose();
      controls.dispose();
    };
  }, [product]);

  return (
    <div className="relative w-full h-full min-h-[350px] md:min-h-[420px] bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800">
      {/* 3D Canvas Anchor */}
      <div ref={containerRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing z-0" />

      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 z-10 text-white gap-3 transition-opacity">
          <Loader2 size={36} className="animate-spin text-primary-400" style={{ color: '#D4A574' }} />
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Generating 3D model...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-10 text-white p-6 text-center gap-3">
          <Info size={36} className="text-red-400" />
          <h3 className="font-bold text-lg">3D Rendering Unavailable</h3>
          <p className="text-sm text-slate-400 max-w-xs">Failed to load the product image texture for the 3D model.</p>
        </div>
      )}

      {/* User Guides */}
      {!loading && !error && (
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none select-none">
          <span className="flex items-center gap-1 bg-slate-900/80 border border-slate-700/50 backdrop-blur text-[10px] text-slate-300 font-medium px-2.5 py-1 rounded-full shadow-sm">
            <Rotate3d size={12} className="text-primary-400" style={{ color: '#D4A574' }} /> Drag to rotate
          </span>
          <span className="flex items-center gap-1 bg-slate-900/80 border border-slate-700/50 backdrop-blur text-[10px] text-slate-300 font-medium px-2.5 py-1 rounded-full shadow-sm">
            <ZoomIn size={12} className="text-primary-400" style={{ color: '#D4A574' }} /> Scroll to zoom
          </span>
        </div>
      )}
    </div>
  );
};

export default Product3DViewer;
