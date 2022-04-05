/* eslint-disable react/react-in-jsx-scope */
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { toArrayBuffer } from "all-art-core/lib/utils/buffer";

export default function GLBRenderer(data, width, height) {
  const container = useRef < HTMLDivElement > null;

  useEffect(() => {
    const gtf = new GLTFLoader();
    const scene = new THREE.Scene();
    const light = new THREE.AmbientLight(0x404040, 10);
    const camera = new THREE.PerspectiveCamera();
    const glbRenderer = new THREE.WebGLRenderer();
    glbRenderer.setSize(width, height);

    const controls = new OrbitControls(camera, glbRenderer.domElement);
    controls.autoRotate = true;
    controls.enablePan = false;
    // controls.enableZoom = false;
    // controls.enableRotate = false;
    controls.rotateSpeed = 2;

    if (container && container.current)
      container.current.appendChild(glbRenderer.domElement);

    gtf.parse(toArrayBuffer(data), "", gltf => {
      scene.add(gltf.scene);
      scene.add(camera);
      scene.add(light);

      const box = getCompoundBoundingBox(gltf.scene);
      if (box) {
        const center = box.getCenter(new THREE.Vector3());
        camera.position.z =
          box.getSize(new THREE.Vector3()).y /
            2 /
            Math.tan((Math.PI * camera.fov) / 360) +
          0.5;
        controls.target.set(0, Math.abs(center.y), 0);
      }

      const animate = function() {
        glbRenderer.render(scene, camera);
        controls.update();
        requestAnimationFrame(animate);
      };
      animate();
    });

    return () => {
      if (container && container.current)
        container.current.removeChild(glbRenderer.domElement);
    };
  }, [data]);

  return (
    <div
      style={{ width: `${width}px`, height: `${height}px` }}
      ref={container}
    ></div>
  );
}

function getCompoundBoundingBox(scene) {
  let box = null;
  scene.traverse(obj3D => {
    if (obj3D.type === "Mesh") {
      const boundingBox = new THREE.Box3();
      boundingBox.copy(obj3D.geometry.boundingBox);
      obj3D.updateMatrixWorld(true);
      boundingBox.applyMatrix4(obj3D.matrixWorld);
      if (box === null) box = boundingBox;
      else box.union(boundingBox);
    }
  });
  return box;
}
