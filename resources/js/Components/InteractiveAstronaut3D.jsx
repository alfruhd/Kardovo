import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function InteractiveAstronaut3D() {
    const containerRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);
    const astronautGroupRef = useRef(null);
    const helmetGroupRef = useRef(null);
    const faceGroupRef = useRef(null);
    const eyesRef = useRef([]);
    const pupilsRef = useRef([]);
    const leftArmRef = useRef(null);
    const rightArmRef = useRef(null);
    const leftLegRef = useRef(null);
    const rightLegRef = useRef(null);
    const thrusterParticlesRef = useRef([]);

    // Physics & Whole-Page Flying Velocity
    const flightState = useRef({
        targetX: 0,
        targetY: 0,
        posX: 0,
        posY: 0,
        posZ: 0,
        rotX: 0,
        rotY: 0,
        rotZ: 0,
        speed: 0,
    });

    const isSpinning = useRef(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let width = window.innerWidth;
        let height = window.innerHeight;

        // 1. Scene & Camera Setup (Full Page Viewport)
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
        camera.position.set(0, 0, 9.2);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true, 
            powerPreference: "high-performance" 
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.35;
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // 2. Procedural Canvas Textures
        const createFabricBump = () => {
            const canvas = document.createElement("canvas");
            canvas.width = 256;
            canvas.height = 256;
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "#808080";
            ctx.fillRect(0, 0, 256, 256);
            for (let x = 0; x < 256; x += 4) {
                for (let y = 0; y < 256; y += 4) {
                    const noise = Math.random() * 30;
                    ctx.fillStyle = `rgb(${128 + noise},${128 + noise},${128 + noise})`;
                    ctx.fillRect(x, y, 2, 2);
                }
            }
            const texture = new THREE.CanvasTexture(canvas);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(6, 6);
            return texture;
        };

        const createMissionPatchTexture = () => {
            const canvas = document.createElement("canvas");
            canvas.width = 128;
            canvas.height = 128;
            const ctx = canvas.getContext("2d");
            ctx.beginPath();
            ctx.arc(64, 64, 60, 0, Math.PI * 2);
            ctx.fillStyle = "#1e3a8a";
            ctx.fill();
            ctx.lineWidth = 6;
            ctx.strokeStyle = "#eab308";
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(30, 80);
            ctx.lineTo(64, 35);
            ctx.lineTo(98, 80);
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 8;
            ctx.stroke();
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(64, 45, 5, 0, Math.PI * 2);
            ctx.fill();
            return new THREE.CanvasTexture(canvas);
        };

        const fabricBump = createFabricBump();
        const missionPatchTex = createMissionPatchTexture();

        // 3. Realistic Cinematic Lighting
        const ambientLight = new THREE.AmbientLight(0xdbeafe, 1.8);
        scene.add(ambientLight);

        // Key Sun Light (Warm White)
        const sunLight = new THREE.DirectionalLight(0xfffaed, 3.2);
        sunLight.position.set(7, 9, 8);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.bias = -0.0008;
        scene.add(sunLight);

        // Blue Nebula Rim Light
        const rimLight = new THREE.DirectionalLight(0x38bdf8, 3.8);
        rimLight.position.set(-8, 4, -5);
        scene.add(rimLight);

        // Fill Soft Light
        const fillLight = new THREE.DirectionalLight(0x93c5fd, 1.3);
        fillLight.position.set(0, -6, 6);
        scene.add(fillLight);

        // Direct Helmet Interior Bright Light (Ensures Face is Crystal Clear & Sharp)
        const helmetFaceLight = new THREE.PointLight(0xffedd5, 2.5, 5);
        helmetFaceLight.position.set(0, 1.25, 0.9);
        scene.add(helmetFaceLight);

        // 4. Physical Materials (PBR Realistic)
        const suitWhiteMat = new THREE.MeshStandardMaterial({
            color: 0xf8fafc,
            roughness: 0.8,
            metalness: 0.08,
            bumpMap: fabricBump,
            bumpScale: 0.015,
        });

        const suitTrimGreyMat = new THREE.MeshStandardMaterial({
            color: 0x94a3b8,
            roughness: 0.45,
            metalness: 0.35,
        });

        const suitRedTrimMat = new THREE.MeshStandardMaterial({
            color: 0xef4444,
            roughness: 0.45,
            metalness: 0.2,
        });

        const skinMat = new THREE.MeshStandardMaterial({
            color: 0xfed7aa,
            roughness: 0.65,
            metalness: 0.0,
        });

        const hairMat = new THREE.MeshStandardMaterial({
            color: 0x451a03,
            roughness: 0.9,
            metalness: 0.05,
        });

        const eyeWhiteMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.05,
            metalness: 0.0,
        });

        const irisHazelMat = new THREE.MeshStandardMaterial({
            color: 0x3f2212,
            roughness: 0.15,
            metalness: 0.1,
        });

        const pupilBlackMat = new THREE.MeshBasicMaterial({
            color: 0x050508,
        });

        // Crystal Clear Visor: Super transparent glass to show face with beautiful subtle reflections
        const visorGlassMat = new THREE.MeshPhysicalMaterial({
            color: 0xe0f2fe,
            transmission: 0.97,
            opacity: 0.25,
            transparent: true,
            roughness: 0.02,
            metalness: 0.1,
            ior: 1.4,
            reflectivity: 0.9,
            clearcoat: 1.0,
            clearcoatRoughness: 0.02,
        });

        // 5. Constructing the Scaled-Down (Compact & Detailed) Astronaut Model
        const astronautGroup = new THREE.Group();
        astronautGroup.scale.set(0.68, 0.68, 0.68); // Perfectly sized to fly freely across the whole screen
        scene.add(astronautGroup);
        astronautGroupRef.current = astronautGroup;

        // Ground Soft Ambient Zero-G Shadow Disc
        const shadowGeo = new THREE.PlaneGeometry(3.0, 1.5);
        const shadowMat = new THREE.MeshBasicMaterial({
            color: 0x030712,
            transparent: true,
            opacity: 0.25,
            depthWrite: false,
        });
        const groundShadow = new THREE.Mesh(shadowGeo, shadowMat);
        groundShadow.rotation.x = -Math.PI / 2;
        groundShadow.position.set(0, -1.85, 0);
        scene.add(groundShadow);

        // --- TORSO (Puffy Realistic Space Suit Body) ---
        const torsoGroup = new THREE.Group();
        astronautGroup.add(torsoGroup);

        const torsoGeo = new THREE.CylinderGeometry(0.72, 0.76, 1.4, 36);
        const torsoMesh = new THREE.Mesh(torsoGeo, suitWhiteMat);
        torsoMesh.castShadow = true;
        torsoMesh.receiveShadow = true;
        torsoGroup.add(torsoMesh);

        // Collar Ring below Helmet
        const collarGeo = new THREE.CylinderGeometry(0.82, 0.78, 0.18, 36);
        const collarMesh = new THREE.Mesh(collarGeo, suitWhiteMat);
        collarMesh.position.set(0, 0.72, 0);
        collarMesh.castShadow = true;
        torsoGroup.add(collarMesh);

        // Waist Band Rings
        const waistRingGeo = new THREE.TorusGeometry(0.75, 0.045, 16, 36);
        const waistRing = new THREE.Mesh(waistRingGeo, suitTrimGreyMat);
        waistRing.rotation.x = Math.PI / 2;
        waistRing.position.set(0, -0.58, 0);
        torsoGroup.add(waistRing);

        const redWaistGeo = new THREE.TorusGeometry(0.76, 0.025, 16, 36);
        const redWaist = new THREE.Mesh(redWaistGeo, suitRedTrimMat);
        redWaist.rotation.x = Math.PI / 2;
        redWaist.position.set(0, -0.54, 0);
        torsoGroup.add(redWaist);

        // --- CHEST CONTROL MODULE (Telemetry Screen, Buttons, Switches) ---
        const chestBoxGeo = new THREE.BoxGeometry(0.66, 0.54, 0.24);
        const chestBoxMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35, metalness: 0.3 });
        const chestBox = new THREE.Mesh(chestBoxGeo, chestBoxMat);
        chestBox.position.set(0, 0.16, 0.68);
        chestBox.castShadow = true;
        torsoGroup.add(chestBox);

        // Screen (Cyan Glowing Glass Display)
        const screenGeo = new THREE.PlaneGeometry(0.26, 0.24);
        const screenMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, emissive: 0x0369a1 });
        const screen = new THREE.Mesh(screenGeo, screenMat);
        screen.position.set(-0.13, 0.24, 0.81);
        torsoGroup.add(screen);

        // Emergency Red Switch Button
        const redBtnGeo = new THREE.BoxGeometry(0.11, 0.11, 0.06);
        const redBtn = new THREE.Mesh(redBtnGeo, suitRedTrimMat);
        redBtn.position.set(0.15, 0.15, 0.81);
        torsoGroup.add(redBtn);

        // Rotary Dials
        const dialGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.06, 16);
        dialGeo.rotateX(Math.PI / 2);
        const dial1 = new THREE.Mesh(dialGeo, suitTrimGreyMat);
        dial1.position.set(0.15, 0.28, 0.81);
        torsoGroup.add(dial1);

        // Corrugated Oxygen Hoses (Detailed Ribbed Tubes)
        const createHose = (isLeft) => {
            const hoseCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(isLeft ? -0.24 : 0.24, 0.08, 0.74),
                new THREE.Vector3(isLeft ? -0.48 : 0.48, -0.06, 0.58),
                new THREE.Vector3(isLeft ? -0.62 : 0.62, -0.18, 0.32),
            ]);
            const hoseGeo = new THREE.TubeGeometry(hoseCurve, 28, 0.06, 16, false);
            const hoseMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5, metalness: 0.25 });
            const hoseMesh = new THREE.Mesh(hoseGeo, hoseMat);
            hoseMesh.castShadow = true;
            return hoseMesh;
        };
        torsoGroup.add(createHose(true));
        torsoGroup.add(createHose(false));

        // --- LIFE SUPPORT BACKPACK (PLSS with Thruster Nozzles) ---
        const backpackGeo = new THREE.BoxGeometry(1.05, 1.45, 0.6);
        const backpackMesh = new THREE.Mesh(backpackGeo, suitWhiteMat);
        backpackMesh.position.set(0, 0.12, -0.65);
        backpackMesh.castShadow = true;
        torsoGroup.add(backpackMesh);

        // Dual Backpack Top Thrusters
        const thrusterGeo = new THREE.CylinderGeometry(0.09, 0.14, 0.28, 16);
        const thruster1 = new THREE.Mesh(thrusterGeo, suitTrimGreyMat);
        thruster1.position.set(-0.44, 0.7, -0.65);
        torsoGroup.add(thruster1);
        const thruster2 = new THREE.Mesh(thrusterGeo, suitTrimGreyMat);
        thruster2.position.set(0.44, 0.7, -0.65);
        torsoGroup.add(thruster2);

        // Thruster Particle Emitters
        const particleGroup = new THREE.Group();
        scene.add(particleGroup);
        const pCount = 28;
        const pGeo = new THREE.SphereGeometry(0.04, 8, 8);
        const pMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8 });
        for (let i = 0; i < pCount; i++) {
            const p = new THREE.Mesh(pGeo, pMat.clone());
            p.visible = false;
            particleGroup.add(p);
            thrusterParticlesRef.current.push({
                mesh: p,
                life: Math.random(),
                vx: (Math.random() - 0.5) * 0.04,
                vy: -0.06 - Math.random() * 0.06,
                vz: (Math.random() - 0.5) * 0.04,
            });
        }

        // --- HELMET & HEAD (Crystal Clear Visor Showing Cute Child Face) ---
        const helmetGroup = new THREE.Group();
        helmetGroup.position.set(0, 1.25, 0.05);
        astronautGroup.add(helmetGroup);
        helmetGroupRef.current = helmetGroup;

        // Outer Helmet Shell
        const helmetGeo = new THREE.SphereGeometry(1.08, 40, 40);
        const helmetMesh = new THREE.Mesh(helmetGeo, suitWhiteMat);
        helmetMesh.castShadow = true;
        helmetGroup.add(helmetMesh);

        // Side Ear Dials
        const earGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.16, 24);
        earGeo.rotateZ(Math.PI / 2);
        const leftEar = new THREE.Mesh(earGeo, suitWhiteMat);
        leftEar.position.set(-1.08, 0, 0);
        helmetGroup.add(leftEar);
        const rightEar = new THREE.Mesh(earGeo, suitWhiteMat);
        rightEar.position.set(1.08, 0, 0);
        helmetGroup.add(rightEar);

        // Visor Bezel Frame
        const visorBezelGeo = new THREE.TorusGeometry(0.8, 0.09, 20, 40);
        const visorBezel = new THREE.Mesh(visorBezelGeo, suitWhiteMat);
        visorBezel.position.set(0, 0.02, 0.72);
        helmetGroup.add(visorBezel);

        // Crystal Clear Visor Dome (Shows Face High-Def)
        const visorGeo = new THREE.SphereGeometry(0.84, 40, 40);
        visorGeo.scale(1.0, 0.95, 0.85);
        const visorMesh = new THREE.Mesh(visorGeo, visorGlassMat);
        visorMesh.position.set(0, 0.02, 0.35);
        helmetGroup.add(visorMesh);

        // --- FACE INSIDE HELMET (Vivid, Bright & Fully Visible) ---
        const faceGroup = new THREE.Group();
        faceGroup.position.set(0, 0, 0.24);
        helmetGroup.add(faceGroup);
        faceGroupRef.current = faceGroup;

        // Head Base
        const headGeo = new THREE.SphereGeometry(0.74, 36, 36);
        headGeo.scale(0.96, 1.06, 0.96);
        const headMesh = new THREE.Mesh(headGeo, skinMat);
        faceGroup.add(headMesh);

        // Brown Hair Layer
        const hairBaseGeo = new THREE.SphereGeometry(0.77, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6);
        const hairBase = new THREE.Mesh(hairBaseGeo, hairMat);
        hairBase.position.set(0, 0.14, -0.05);
        faceGroup.add(hairBase);

        // Hair Fringe Tufts
        const fringeGeo = new THREE.SphereGeometry(0.32, 16, 16);
        fringeGeo.scale(1.7, 0.75, 0.85);
        const fringe = new THREE.Mesh(fringeGeo, hairMat);
        fringe.position.set(-0.06, 0.5, 0.48);
        fringe.rotation.set(-0.2, 0.1, -0.15);
        faceGroup.add(fringe);

        // Rosy Cheeks
        const cheekMat = new THREE.MeshBasicMaterial({ color: 0xfb7185, transparent: true, opacity: 0.6 });
        const leftCheek = new THREE.Mesh(new THREE.CircleGeometry(0.12, 16), cheekMat);
        leftCheek.position.set(-0.38, -0.1, 0.64);
        leftCheek.rotation.y = -0.3;
        faceGroup.add(leftCheek);
        const rightCheek = new THREE.Mesh(new THREE.CircleGeometry(0.12, 16), cheekMat);
        rightCheek.position.set(0.38, -0.1, 0.64);
        rightCheek.rotation.y = 0.3;
        faceGroup.add(rightCheek);

        // Cute Small Nose
        const noseGeo = new THREE.SphereGeometry(0.075, 16, 16);
        const nose = new THREE.Mesh(noseGeo, skinMat);
        nose.position.set(0, 0.02, 0.74);
        faceGroup.add(nose);

        // Parted Mouth
        const mouthGeo = new THREE.SphereGeometry(0.095, 16, 16);
        mouthGeo.scale(1.2, 0.8, 0.4);
        const mouthMat = new THREE.MeshBasicMaterial({ color: 0x450a0a });
        const mouth = new THREE.Mesh(mouthGeo, mouthMat);
        mouth.position.set(0, -0.2, 0.7);
        faceGroup.add(mouth);

        // --- Big Expressive Eyes Tracking Cursor ---
        eyesRef.current = [];
        pupilsRef.current = [];

        const createAstronautEye = (isLeft) => {
            const eyeGroup = new THREE.Group();
            eyeGroup.position.set(isLeft ? -0.25 : 0.25, 0.16, 0.6);

            // Sclera
            const eyeGeo = new THREE.SphereGeometry(0.19, 28, 28);
            const eyeMesh = new THREE.Mesh(eyeGeo, eyeWhiteMat);
            eyeGroup.add(eyeMesh);

            // Iris + Pupil Subgroup
            const pupilGroup = new THREE.Group();
            pupilGroup.position.set(0, 0, 0.15);

            const iris = new THREE.Mesh(new THREE.CircleGeometry(0.12, 24), irisHazelMat);
            pupilGroup.add(iris);

            const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.07, 24), pupilBlackMat);
            pupil.position.set(0, 0, 0.01);
            pupilGroup.add(pupil);

            // Double Specular Glints
            const glint1 = new THREE.Mesh(new THREE.CircleGeometry(0.038, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
            glint1.position.set(0.045, 0.045, 0.02);
            pupilGroup.add(glint1);

            const glint2 = new THREE.Mesh(new THREE.CircleGeometry(0.02, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
            glint2.position.set(-0.038, -0.038, 0.02);
            pupilGroup.add(glint2);

            eyeGroup.add(pupilGroup);
            pupilsRef.current.push(pupilGroup);
            eyesRef.current.push(eyeGroup);

            // Inquisitive Eyebrows
            const browGeo = new THREE.BoxGeometry(0.2, 0.045, 0.02);
            const brow = new THREE.Mesh(browGeo, hairMat);
            brow.position.set(0, 0.24, 0.1);
            brow.rotation.z = isLeft ? 0.28 : -0.28;
            eyeGroup.add(brow);

            faceGroup.add(eyeGroup);
            return eyeGroup;
        };

        createAstronautEye(true);
        createAstronautEye(false);

        // --- ARMS & GLOVES (With Mission Patch & Red Bands) ---
        const createArm = (isLeft) => {
            const armPivot = new THREE.Group();
            armPivot.position.set(isLeft ? -0.86 : 0.86, 0.48, 0.05);

            // Puffy Sleeve
            const sleeveCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(isLeft ? -0.28 : 0.28, -0.45, 0.08),
                new THREE.Vector3(isLeft ? -0.34 : 0.34, -1.0, 0.2),
            ]);
            const sleeveGeo = new THREE.TubeGeometry(sleeveCurve, 24, 0.24, 16, false);
            const sleeveMesh = new THREE.Mesh(sleeveGeo, suitWhiteMat);
            sleeveMesh.castShadow = true;
            armPivot.add(sleeveMesh);

            // Red Trim Band
            const redBandGeo = new THREE.TorusGeometry(0.25, 0.03, 16, 24);
            const redBand = new THREE.Mesh(redBandGeo, suitRedTrimMat);
            redBand.position.set(isLeft ? -0.28 : 0.28, -0.45, 0.08);
            redBand.rotation.x = Math.PI / 2;
            armPivot.add(redBand);

            // Mission Patch Badge on Left Arm
            if (isLeft) {
                const patchGeo = new THREE.CircleGeometry(0.13, 24);
                const patchMat = new THREE.MeshStandardMaterial({ map: missionPatchTex, roughness: 0.4 });
                const patch = new THREE.Mesh(patchGeo, patchMat);
                patch.position.set(-0.28, -0.26, 0.2);
                patch.rotation.y = -Math.PI / 2.6;
                armPivot.add(patch);
            }

            // Astronaut Glove
            const gloveGeo = new THREE.SphereGeometry(0.23, 20, 20);
            gloveGeo.scale(1.0, 1.3, 0.95);
            const gloveMesh = new THREE.Mesh(gloveGeo, suitTrimGreyMat);
            gloveMesh.position.set(isLeft ? -0.34 : 0.34, -1.1, 0.22);
            armPivot.add(gloveMesh);

            astronautGroup.add(armPivot);
            return armPivot;
        };

        leftArmRef.current = createArm(true);
        rightArmRef.current = createArm(false);

        // --- LEGS & MOON BOOTS ---
        const createLeg = (isLeft) => {
            const legPivot = new THREE.Group();
            legPivot.position.set(isLeft ? -0.44 : 0.44, -0.78, 0.0);

            const legGeo = new THREE.CylinderGeometry(0.33, 0.36, 0.9, 24);
            const legMesh = new THREE.Mesh(legGeo, suitWhiteMat);
            legMesh.position.set(0, -0.28, 0);
            legMesh.castShadow = true;
            legPivot.add(legMesh);

            const kneePatchGeo = new THREE.BoxGeometry(0.3, 0.24, 0.08);
            const kneePatch = new THREE.Mesh(kneePatchGeo, suitWhiteMat);
            kneePatch.position.set(0, -0.24, 0.34);
            legPivot.add(kneePatch);

            const kneeRedGeo = new THREE.BoxGeometry(0.24, 0.035, 0.09);
            const kneeRed = new THREE.Mesh(kneeRedGeo, suitRedTrimMat);
            kneeRed.position.set(0, -0.16, 0.34);
            legPivot.add(kneeRed);

            // Left Thigh Utility Pocket
            if (isLeft) {
                const pocketGeo = new THREE.BoxGeometry(0.28, 0.34, 0.1);
                const pocket = new THREE.Mesh(pocketGeo, suitWhiteMat);
                pocket.position.set(-0.35, -0.22, 0.12);
                pocket.rotation.y = -Math.PI / 2.8;
                legPivot.add(pocket);
            }

            const bootGeo = new THREE.BoxGeometry(0.5, 0.44, 0.82);
            const bootMesh = new THREE.Mesh(bootGeo, suitWhiteMat);
            bootMesh.position.set(0, -0.76, 0.14);
            bootMesh.castShadow = true;
            legPivot.add(bootMesh);

            const soleGeo = new THREE.BoxGeometry(0.54, 0.15, 0.88);
            const soleMesh = new THREE.Mesh(soleGeo, suitTrimGreyMat);
            soleMesh.position.set(0, -0.96, 0.14);
            legPivot.add(soleMesh);

            astronautGroup.add(legPivot);
            return legPivot;
        };

        leftLegRef.current = createLeg(true);
        rightLegRef.current = createLeg(false);

        // 6. Whole-Page Flight Physics Loop
        let animationFrameId;
        let clock = new THREE.Clock();

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            const st = flightState.current;

            // Smooth Interpolation across the whole page
            st.posX += (st.targetX - st.posX) * 0.055;
            st.posY += (st.targetY - st.posY) * 0.055;

            // Calculate flight delta and speed
            const dx = (st.targetX - st.posX);
            const dy = (st.targetY - st.posY);
            st.speed = Math.sqrt(dx * dx + dy * dy);

            // Organic Zero-G Hovering Bob
            const hoverBob = Math.sin(elapsedTime * 1.8) * 0.12;
            const hoverRoll = Math.sin(elapsedTime * 1.3) * 0.04;

            if (astronautGroupRef.current) {
                // WHOLE-PAGE 3D FLIGHT COORDINATES
                // Smoothly traverses across the entire screen
                astronautGroupRef.current.position.x = st.posX;
                astronautGroupRef.current.position.y = st.posY + hoverBob;
                astronautGroupRef.current.position.z = -Math.min(1.5, st.speed * 0.6);

                // DYNAMIC 3D FLIGHT BANKING & PITCHING
                const targetRotY = (st.posX * 0.22);
                const targetRotX = (-st.posY * 0.2) + (st.speed * 0.15);
                const targetRotZ = (-dx * 0.35) + hoverRoll;

                st.rotX += (targetRotX - st.rotX) * 0.08;
                st.rotY += (targetRotY - st.rotY) * 0.08;
                st.rotZ += (targetRotZ - st.rotZ) * 0.08;

                astronautGroupRef.current.rotation.x = st.rotX;
                astronautGroupRef.current.rotation.y = st.rotY;
                astronautGroupRef.current.rotation.z = st.rotZ;
            }

            // Head and Helmet focus
            if (helmetGroupRef.current) {
                helmetGroupRef.current.rotation.y = (st.posX * 0.12);
                helmetGroupRef.current.rotation.x = (-st.posY * 0.12);
            }

            // Eyes gaze
            pupilsRef.current.forEach((pupil) => {
                pupil.position.x = Math.max(-0.065, Math.min(0.065, (st.posX * 0.04)));
                pupil.position.y = Math.max(-0.065, Math.min(0.065, (st.posY * 0.04)));
            });

            // Zero-G Arms Floating Sway
            if (leftArmRef.current) {
                leftArmRef.current.rotation.z = Math.sin(elapsedTime * 1.6) * 0.08 - (st.posX * 0.08) - (st.speed * 0.12);
                leftArmRef.current.rotation.x = Math.cos(elapsedTime * 1.4) * 0.06 + (st.posY * 0.08) - (st.speed * 0.2);
            }
            if (rightArmRef.current) {
                rightArmRef.current.rotation.z = -Math.sin(elapsedTime * 1.6) * 0.08 - (st.posX * 0.08) + (st.speed * 0.12);
                rightArmRef.current.rotation.x = Math.cos(elapsedTime * 1.4) * 0.06 + (st.posY * 0.08) - (st.speed * 0.2);
            }

            // Zero-G Legs Trailing Sway
            if (leftLegRef.current) {
                leftLegRef.current.rotation.x = Math.sin(elapsedTime * 1.4) * 0.05 + (st.speed * 0.15);
                leftLegRef.current.rotation.z = -st.posX * 0.04;
            }
            if (rightLegRef.current) {
                rightLegRef.current.rotation.x = -Math.sin(elapsedTime * 1.4) * 0.05 + (st.speed * 0.15);
                rightLegRef.current.rotation.z = -st.posX * 0.04;
            }

            // Thruster Particle Stream
            if (thrusterParticlesRef.current.length > 0 && astronautGroupRef.current) {
                const basePos = astronautGroupRef.current.position;
                thrusterParticlesRef.current.forEach((p) => {
                    p.life += 0.04 + st.speed * 0.06;
                    if (p.life > 1) {
                        p.life = 0;
                        const isLeft = Math.random() > 0.5;
                        p.mesh.position.set(
                            basePos.x + (isLeft ? -0.3 : 0.3),
                            basePos.y + 0.45,
                            basePos.z - 0.45
                        );
                        p.mesh.visible = true;
                    } else {
                        p.mesh.position.y += p.vy * (1 + st.speed * 2);
                        p.mesh.position.x += p.vx;
                        p.mesh.material.opacity = (1 - p.life) * 0.75;
                        p.mesh.scale.setScalar((1 - p.life * 0.5) * (0.8 + st.speed * 0.7));
                    }
                });
            }

            renderer.render(scene, camera);
        };

        animate();

        // 7. Global Mouse & Touch Listeners (Traverse the Entire Screen)
        const handleWindowMouseMove = (e) => {
            const aspect = window.innerWidth / window.innerHeight;
            const boundX = aspect * 3.4;
            const boundY = 2.4;

            const normX = (e.clientX / window.innerWidth) * 2 - 1;
            const normY = -(e.clientY / window.innerHeight) * 2 + 1;

            flightState.current.targetX = normX * boundX;
            flightState.current.targetY = normY * boundY;
        };

        const handleTouchMove = (e) => {
            if (!e.touches || !e.touches[0]) return;
            const aspect = window.innerWidth / window.innerHeight;
            const boundX = aspect * 3.4;
            const boundY = 2.4;

            const normX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
            const normY = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;

            flightState.current.targetX = normX * boundX;
            flightState.current.targetY = normY * boundY;
        };

        window.addEventListener("mousemove", handleWindowMouseMove);
        window.addEventListener("touchmove", handleTouchMove, { passive: true });

        // Click / Poke interaction (360° Zero-G Boost Loop)
        const handleClick = () => {
            if (isSpinning.current || !astronautGroupRef.current) return;
            isSpinning.current = true;
            let spinProgress = 0;
            const spinInterval = setInterval(() => {
                spinProgress += 0.12;
                if (spinProgress <= Math.PI * 2) {
                    astronautGroupRef.current.rotation.x = flightState.current.rotX + Math.sin(spinProgress) * Math.PI * 2;
                    astronautGroupRef.current.position.y = (flightState.current.posY) + Math.sin(spinProgress * 0.5) * 0.8;
                } else {
                    clearInterval(spinInterval);
                    isSpinning.current = false;
                }
            }, 20);
        };
        window.addEventListener("click", handleClick);

        const handleResize = () => {
            if (!container || !renderer || !camera) return;
            width = window.innerWidth;
            height = window.innerHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };
        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("mousemove", handleWindowMouseMove);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("click", handleClick);
            if (renderer.domElement && container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    return (
        <div 
            ref={containerRef} 
            className="fixed inset-0 w-full h-full pointer-events-none z-10 select-none overflow-hidden"
            title="Interactive 3D Flying Astronaut — Guide him across the entire screen!"
        />
    );
}
