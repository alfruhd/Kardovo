import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function InteractiveMonster3D({ className = "" }) {
    const containerRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);
    const monsterGroupRef = useRef(null);
    const headGroupRef = useRef(null);
    const eyesRef = useRef([]);
    const pupilsRef = useRef([]);
    const eyelidsRef = useRef([]);
    const leftArmRef = useRef(null);
    const rightArmRef = useRef(null);
    const tailRef = useRef(null);
    const bodyRef = useRef(null);

    const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
    const isBlinking = useRef(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const width = container.clientWidth || 450;
        const height = container.clientHeight || 450;

        // 1. Scene & Camera Setup
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
        camera.position.set(0, 0.55, 6.2);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.18;
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // 2. Lighting Rig (Studio Quality)
        const ambientLight = new THREE.AmbientLight(0xdff0ff, 1.4);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
        keyLight.position.set(4, 6, 5);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 1024;
        keyLight.shadow.mapSize.height = 1024;
        keyLight.shadow.bias = -0.001;
        scene.add(keyLight);

        const rimLight = new THREE.DirectionalLight(0x7ed6fc, 2.0);
        rimLight.position.set(-4, 3, -4);
        scene.add(rimLight);

        const fillLight = new THREE.DirectionalLight(0xffe2d6, 0.9);
        fillLight.position.set(0, -3, 4);
        scene.add(fillLight);

        // 3. Materials Palette
        const furColor = 0x22aee5;       // Vibrant cyan-blue
        const bellyColor = 0x76dcfb;     // Soft light cyan belly
        const spotColor = 0x7c4dff;      // Purple spot tone
        const hornColor = 0xf2b2a6;      // Peach-coral horn
        const clawColor = 0xfff0ea;      // Clean white-ivory claws
        const eyeColor = 0x0277bd;       // Deep oceanic blue iris
        const snoutColor = 0x1b8cb8;     // Slightly deeper cyan snout

        const furMaterial = new THREE.MeshStandardMaterial({
            color: furColor,
            roughness: 0.85,
            metalness: 0.05,
            flatShading: false,
        });

        const bellyMaterial = new THREE.MeshStandardMaterial({
            color: bellyColor,
            roughness: 0.9,
            metalness: 0.0,
        });

        const spotMaterial = new THREE.MeshStandardMaterial({
            color: spotColor,
            roughness: 0.85,
            metalness: 0.05,
        });

        const hornMaterial = new THREE.MeshStandardMaterial({
            color: hornColor,
            roughness: 0.45,
            metalness: 0.1,
        });

        const clawMaterial = new THREE.MeshStandardMaterial({
            color: clawColor,
            roughness: 0.3,
            metalness: 0.1,
        });

        const eyeWhiteMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.1,
            metalness: 0.05,
        });

        const irisMaterial = new THREE.MeshStandardMaterial({
            color: eyeColor,
            roughness: 0.2,
            metalness: 0.1,
        });

        const pupilMaterial = new THREE.MeshBasicMaterial({
            color: 0x0a101d,
        });

        // 4. Constructing The Monster Hierarchy
        const monsterGroup = new THREE.Group();
        monsterGroup.position.set(0, -0.4, 0);
        scene.add(monsterGroup);
        monsterGroupRef.current = monsterGroup;

        // --- Ground Shadow Disc ---
        const shadowGeo = new THREE.PlaneGeometry(3.4, 1.8);
        const shadowMat = new THREE.MeshBasicMaterial({
            color: 0x184460,
            transparent: true,
            opacity: 0.28,
            depthWrite: false,
        });
        const groundShadow = new THREE.Mesh(shadowGeo, shadowMat);
        groundShadow.rotation.x = -Math.PI / 2;
        groundShadow.position.set(0, -1.55, 0);
        scene.add(groundShadow);

        // --- Main Torso (Pear Shape) ---
        const bodyGroup = new THREE.Group();
        monsterGroup.add(bodyGroup);
        bodyRef.current = bodyGroup;

        const bodyGeo = new THREE.SphereGeometry(1.18, 36, 36);
        bodyGeo.scale(1.0, 1.22, 0.92);
        const bodyMesh = new THREE.Mesh(bodyGeo, furMaterial);
        bodyMesh.position.set(0, 0, 0);
        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;
        bodyGroup.add(bodyMesh);

        // --- Belly Patch ---
        const bellyGeo = new THREE.SphereGeometry(0.88, 32, 32);
        bellyGeo.scale(0.88, 1.05, 0.45);
        const bellyMesh = new THREE.Mesh(bellyGeo, bellyMaterial);
        bellyMesh.position.set(0, -0.12, 0.72);
        bodyGroup.add(bellyMesh);

        // --- Purple Body Spots ---
        const addSpot = (parent, x, y, z, rx, ry, rz, sx, sy, sz) => {
            const spotGeo = new THREE.SphereGeometry(0.24, 24, 24);
            spotGeo.scale(sx, sy, sz);
            const spotMesh = new THREE.Mesh(spotGeo, spotMaterial);
            spotMesh.position.set(x, y, z);
            spotMesh.rotation.set(rx, ry, rz);
            parent.add(spotMesh);
            return spotMesh;
        };

        // Torso & shoulder spots
        addSpot(bodyGroup, -0.75, 0.35, 0.55, 0.2, 0.4, -0.3, 1.2, 1.4, 0.4);
        addSpot(bodyGroup, 0.82, 0.15, 0.45, -0.1, -0.5, 0.4, 1.3, 1.1, 0.4);
        addSpot(bodyGroup, -0.85, -0.4, 0.4, 0.1, 0.6, -0.2, 1.1, 1.5, 0.4);
        addSpot(bodyGroup, 0.78, -0.55, 0.4, -0.2, -0.6, 0.3, 1.3, 1.2, 0.4);
        addSpot(bodyGroup, 0.45, 0.75, 0.5, -0.3, -0.2, 0.2, 1.0, 1.0, 0.4);

        // --- Head Group ---
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.15, 0.15);
        monsterGroup.add(headGroup);
        headGroupRef.current = headGroup;

        // Head Base
        const headGeo = new THREE.SphereGeometry(0.85, 36, 36);
        headGeo.scale(1.08, 0.98, 0.95);
        const headMesh = new THREE.Mesh(headGeo, furMaterial);
        headMesh.castShadow = true;
        headGroup.add(headMesh);

        // Snout
        const snoutGeo = new THREE.SphereGeometry(0.48, 28, 28);
        snoutGeo.scale(1.15, 0.72, 0.75);
        const snoutMesh = new THREE.Mesh(snoutGeo, new THREE.MeshStandardMaterial({ color: snoutColor, roughness: 0.85 }));
        snoutMesh.position.set(0, -0.15, 0.62);
        headGroup.add(snoutMesh);

        // Nostrils
        const nostrilGeo = new THREE.SphereGeometry(0.045, 12, 12);
        const nostrilMat = new THREE.MeshBasicMaterial({ color: 0x0d3c52 });
        const leftNostril = new THREE.Mesh(nostrilGeo, nostrilMat);
        leftNostril.position.set(-0.12, -0.06, 0.96);
        headGroup.add(leftNostril);
        const rightNostril = new THREE.Mesh(nostrilGeo, nostrilMat);
        rightNostril.position.set(0.12, -0.06, 0.96);
        headGroup.add(rightNostril);

        // Mouth & Cute Teeth
        const mouthGeo = new THREE.TorusGeometry(0.24, 0.035, 12, 24, Math.PI * 0.8);
        const mouthMat = new THREE.MeshBasicMaterial({ color: 0x082635 });
        const mouthMesh = new THREE.Mesh(mouthGeo, mouthMat);
        mouthMesh.rotation.set(Math.PI, 0, -Math.PI * 0.1);
        mouthMesh.position.set(0, -0.28, 0.84);
        headGroup.add(mouthMesh);

        // Little white teeth
        const toothGeo = new THREE.ConeGeometry(0.04, 0.08, 12);
        toothGeo.rotateX(Math.PI);
        const toothMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
        const tooth1 = new THREE.Mesh(toothGeo, toothMat);
        tooth1.position.set(-0.09, -0.26, 0.86);
        headGroup.add(tooth1);
        const tooth2 = new THREE.Mesh(toothGeo, toothMat);
        tooth2.position.set(0.09, -0.26, 0.86);
        headGroup.add(tooth2);

        // --- Horns (Curved Monster Horns) ---
        const createHorn = (isLeft) => {
            const hornCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(isLeft ? -0.25 : 0.25, 0.28, -0.05),
                new THREE.Vector3(isLeft ? -0.55 : 0.55, 0.45, -0.08),
                new THREE.Vector3(isLeft ? -0.72 : 0.72, 0.72, 0.05),
            ]);
            const hornGeo = new THREE.TubeGeometry(hornCurve, 24, 0.16, 16, false);
            const hornMesh = new THREE.Mesh(hornGeo, hornMaterial);
            hornMesh.position.set(isLeft ? -0.45 : 0.45, 0.48, 0.05);
            hornMesh.rotation.set(0.1, 0, isLeft ? 0.3 : -0.3);
            hornMesh.castShadow = true;
            return hornMesh;
        };
        headGroup.add(createHorn(true));
        headGroup.add(createHorn(false));

        // --- Eyes with dynamic pupil gaze ---
        eyesRef.current = [];
        pupilsRef.current = [];
        eyelidsRef.current = [];

        const createEye = (isLeft) => {
            const eyeGroup = new THREE.Group();
            eyeGroup.position.set(isLeft ? -0.28 : 0.28, 0.22, 0.68);

            // Eyeball
            const eyeball = new THREE.Mesh(new THREE.SphereGeometry(0.22, 28, 28), eyeWhiteMaterial);
            eyeball.castShadow = true;
            eyeGroup.add(eyeball);

            // Iris + Pupil Subgroup
            const pupilGroup = new THREE.Group();
            pupilGroup.position.set(0, 0, 0.17);

            const iris = new THREE.Mesh(new THREE.CircleGeometry(0.12, 24), irisMaterial);
            pupilGroup.add(iris);

            const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.065, 24), pupilMaterial);
            pupil.position.set(0, 0, 0.01);
            pupilGroup.add(pupil);

            // Specular glint
            const glint = new THREE.Mesh(
                new THREE.CircleGeometry(0.025, 16),
                new THREE.MeshBasicMaterial({ color: 0xffffff })
            );
            glint.position.set(0.035, 0.035, 0.02);
            pupilGroup.add(glint);

            eyeGroup.add(pupilGroup);
            pupilsRef.current.push(pupilGroup);
            eyesRef.current.push(eyeGroup);

            // Upper Eyelid for Blinking
            const eyelidGeo = new THREE.SphereGeometry(0.23, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
            const eyelid = new THREE.Mesh(eyelidGeo, furMaterial);
            eyelid.rotation.x = -Math.PI * 0.5;
            eyelid.position.set(0, 0, 0);
            eyeGroup.add(eyelid);
            eyelidsRef.current.push(eyelid);

            return eyeGroup;
        };

        headGroup.add(createEye(true));
        headGroup.add(createEye(false));

        // --- Arms & Claws ---
        const createArm = (isLeft) => {
            const armPivot = new THREE.Group();
            armPivot.position.set(isLeft ? -0.95 : 0.95, 0.55, 0.1);

            // Upper Arm
            const armCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(isLeft ? -0.35 : 0.35, -0.45, 0.15),
                new THREE.Vector3(isLeft ? -0.42 : 0.42, -1.05, 0.25),
            ]);
            const armGeo = new THREE.TubeGeometry(armCurve, 20, 0.26, 16, false);
            const armMesh = new THREE.Mesh(armGeo, furMaterial);
            armMesh.castShadow = true;
            armPivot.add(armMesh);

            // Arm Spots
            addSpot(armPivot, isLeft ? -0.38 : 0.38, -0.35, 0.25, 0, 0, isLeft ? 0.3 : -0.3, 0.9, 1.2, 0.4);
            addSpot(armPivot, isLeft ? -0.42 : 0.42, -0.75, 0.35, 0, 0, isLeft ? -0.2 : 0.2, 0.8, 1.0, 0.4);

            // Paw / Hand
            const handGeo = new THREE.SphereGeometry(0.24, 20, 20);
            handGeo.scale(1.1, 0.85, 1.15);
            const handMesh = new THREE.Mesh(handGeo, furMaterial);
            handMesh.position.set(isLeft ? -0.42 : 0.42, -1.15, 0.3);
            armPivot.add(handMesh);

            // Claws
            for (let i = -1; i <= 1; i++) {
                const claw = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.14, 12), clawMaterial);
                claw.rotation.set(Math.PI * 0.4, 0, isLeft ? -0.2 + i * 0.2 : 0.2 + i * 0.2);
                claw.position.set(
                    (isLeft ? -0.42 : 0.42) + i * 0.08,
                    -1.24,
                    0.46
                );
                armPivot.add(claw);
            }

            monsterGroup.add(armPivot);
            return armPivot;
        };

        leftArmRef.current = createArm(true);
        rightArmRef.current = createArm(false);

        // --- Legs & Feet ---
        const createLeg = (isLeft) => {
            const legGroup = new THREE.Group();
            legGroup.position.set(isLeft ? -0.55 : 0.55, -0.85, 0.1);

            // Leg Thigh
            const thighGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.65, 24);
            const thighMesh = new THREE.Mesh(thighGeo, furMaterial);
            thighMesh.castShadow = true;
            legGroup.add(thighMesh);

            // Leg Spot
            addSpot(legGroup, isLeft ? -0.25 : 0.25, 0.05, 0.32, 0, 0, 0, 1.0, 1.1, 0.4);

            // Big Paw Foot
            const footGeo = new THREE.SphereGeometry(0.36, 24, 24);
            footGeo.scale(1.15, 0.65, 1.55);
            const footMesh = new THREE.Mesh(footGeo, furMaterial);
            footMesh.position.set(0, -0.42, 0.22);
            footMesh.castShadow = true;
            legGroup.add(footMesh);

            // Toenails
            for (let i = -1; i <= 1; i++) {
                const nail = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.15, 12), clawMaterial);
                nail.rotation.set(Math.PI * 0.45, 0, i * 0.25);
                nail.position.set(i * 0.13, -0.5, 0.68);
                legGroup.add(nail);
            }

            monsterGroup.add(legGroup);
            return legGroup;
        };

        createLeg(true);
        createLeg(false);

        // --- Tail with Purple Stripes / Spots ---
        const tailCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, -0.6, -0.6),
            new THREE.Vector3(0.5, -0.8, -0.9),
            new THREE.Vector3(1.1, -0.7, -0.6),
            new THREE.Vector3(1.6, -0.3, -0.2),
            new THREE.Vector3(1.8, 0.2, 0.3),
        ]);
        const tailGeo = new THREE.TubeGeometry(tailCurve, 28, 0.22, 16, false);
        const tailMesh = new THREE.Mesh(tailGeo, furMaterial);
        tailMesh.castShadow = true;
        monsterGroup.add(tailMesh);
        tailRef.current = tailMesh;

        // Tail Spot Rings
        addSpot(monsterGroup, 0.8, -0.75, -0.75, 0.4, 0.2, 0.5, 1.1, 1.1, 0.5);
        addSpot(monsterGroup, 1.4, -0.45, -0.35, 0.2, 0.4, 0.3, 1.0, 1.0, 0.5);
        addSpot(monsterGroup, 1.75, 0.05, 0.15, 0.1, 0.2, 0.2, 0.9, 0.9, 0.5);

        // 5. Blinking Animation Engine
        const triggerBlink = () => {
            if (isBlinking.current) return;
            isBlinking.current = true;
            let progress = 0;
            const blinkInterval = setInterval(() => {
                progress += 0.2;
                if (progress <= 1) {
                    eyelidsRef.current.forEach(lid => {
                        lid.rotation.x = -Math.PI * 0.5 + Math.sin(progress * Math.PI) * (Math.PI * 0.55);
                    });
                } else {
                    clearInterval(blinkInterval);
                    eyelidsRef.current.forEach(lid => {
                        lid.rotation.x = -Math.PI * 0.5;
                    });
                    isBlinking.current = false;
                }
            }, 30);
        };

        const blinkTimer = setInterval(() => {
            if (Math.random() > 0.3) triggerBlink();
        }, 3200);

        // 6. Animation Loop (Breathing + 3D Gaze + Cursor Tracking)
        let animationFrameId;
        let clock = new THREE.Clock();

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            // Smooth mouse interpolation
            mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.07;
            mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.07;

            const mx = mousePos.current.x;
            const my = mousePos.current.y;

            // Breathing oscillation
            const breath = Math.sin(elapsedTime * 2.2) * 0.03;
            if (bodyRef.current) {
                bodyRef.current.scale.set(1 + breath * 0.5, 1 + breath, 1 + breath * 0.5);
            }

            // Whole monster subtle tilt toward mouse
            if (monsterGroupRef.current) {
                monsterGroupRef.current.rotation.y = mx * 0.45;
                monsterGroupRef.current.rotation.x = -my * 0.25;
                monsterGroupRef.current.position.y = -0.4 + Math.sin(elapsedTime * 1.8) * 0.04;
            }

            // Head independently rotates to track cursor with high precision
            if (headGroupRef.current) {
                headGroupRef.current.rotation.y = mx * 0.65;
                headGroupRef.current.rotation.x = -my * 0.45;
                headGroupRef.current.rotation.z = -mx * 0.15;
            }

            // Pupils lock onto screen coordinate
            pupilsRef.current.forEach((pupil) => {
                pupil.position.x = Math.max(-0.06, Math.min(0.06, mx * 0.12));
                pupil.position.y = Math.max(-0.06, Math.min(0.06, my * 0.12));
            });

            // Arms natural sway + reaching towards mouse
            if (leftArmRef.current) {
                leftArmRef.current.rotation.z = Math.sin(elapsedTime * 1.8) * 0.08 - mx * 0.2;
                leftArmRef.current.rotation.x = Math.cos(elapsedTime * 1.8) * 0.05 + my * 0.15;
            }
            if (rightArmRef.current) {
                rightArmRef.current.rotation.z = -Math.sin(elapsedTime * 1.8) * 0.08 - mx * 0.2;
                rightArmRef.current.rotation.x = Math.cos(elapsedTime * 1.8) * 0.05 + my * 0.15;
            }

            // Tail sway
            if (tailRef.current) {
                tailRef.current.rotation.y = Math.sin(elapsedTime * 2.4) * 0.15 + mx * 0.2;
            }

            renderer.render(scene, camera);
        };

        animate();

        // 7. Mouse and Touch Move Listeners
        const handleMouseMove = (e) => {
            const rect = container.getBoundingClientRect();
            const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
            const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;

            const x = ((clientX - rect.left) / rect.width) * 2 - 1;
            const y = -(((clientY - rect.top) / rect.height) * 2 - 1);

            mousePos.current.targetX = Math.max(-1.5, Math.min(1.5, x));
            mousePos.current.targetY = Math.max(-1.5, Math.min(1.5, y));
        };

        const handleWindowMouseMove = (e) => {
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = -(e.clientY / window.innerHeight) * 2 + 1;
            mousePos.current.targetX = x;
            mousePos.current.targetY = y;
        };

        window.addEventListener("mousemove", handleWindowMouseMove);
        container.addEventListener("touchmove", handleMouseMove, { passive: true });

        // Resize handler
        const handleResize = () => {
            if (!container || !renderer || !camera) return;
            const newW = container.clientWidth || 450;
            const newH = container.clientHeight || 450;
            camera.aspect = newW / newH;
            camera.updateProjectionMatrix();
            renderer.setSize(newW, newH);
        };
        window.addEventListener("resize", handleResize);

        // Click / Poke interaction (Makes creature jump & blink)
        const handleClick = () => {
            triggerBlink();
            if (monsterGroupRef.current) {
                let jumpProgress = 0;
                const jumpInterval = setInterval(() => {
                    jumpProgress += 0.15;
                    if (jumpProgress <= Math.PI) {
                        monsterGroupRef.current.position.y = -0.4 + Math.sin(jumpProgress) * 0.35;
                        monsterGroupRef.current.scale.set(
                            1 - Math.sin(jumpProgress) * 0.08,
                            1 + Math.sin(jumpProgress) * 0.15,
                            1 - Math.sin(jumpProgress) * 0.08
                        );
                    } else {
                        clearInterval(jumpInterval);
                        monsterGroupRef.current.position.y = -0.4;
                        monsterGroupRef.current.scale.set(1, 1, 1);
                    }
                }, 20);
            }
        };
        container.addEventListener("click", handleClick);

        return () => {
            clearInterval(blinkTimer);
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("mousemove", handleWindowMouseMove);
            window.removeEventListener("resize", handleResize);
            container.removeEventListener("touchmove", handleMouseMove);
            container.removeEventListener("click", handleClick);
            if (renderer.domElement && container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    return (
        <div 
            ref={containerRef} 
            className={`w-full max-w-[480px] aspect-square relative cursor-grab active:cursor-grabbing select-none ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            title="Interactive 3D Kardovo Monster — Move cursor to look around & click to poke!"
        />
    );
}
