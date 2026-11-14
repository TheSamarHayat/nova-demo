import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { novaAssets } from "@/lib/nova-assets";
import { novaScrollValues, useNovaScroll } from "@/lib/nova-scroll";

export function RobotScene() {
  const group = useRef<THREE.Group>(null);
  const root = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(novaAssets.robot);
  const { actions } = useAnimations(animations, group);
  const section = useNovaScroll((state) => state.section);
  const sectionProgress = useNovaScroll((state) => state.sectionProgress);
  const playing = useRef<string | null>(null);

  useEffect(() => {
    const action = actions["Idle"];
    if (!action) return undefined;
    action.reset().fadeIn(0.4).play();
    const wave = actions["Wave"];
    if (wave) {
      action.fadeOut(0.3);
      wave.reset().setLoop(THREE.LoopOnce, 1).fadeIn(0.3).play();
      wave.clampWhenFinished = true;
      playing.current = "Wave";
      const timer = window.setTimeout(() => {
        wave.fadeOut(0.3);
        actions["Idle"]?.reset().fadeIn(0.3).play();
        playing.current = "Idle";
      }, 2300);
      return () => window.clearTimeout(timer);
    }
    playing.current = "Idle";
    return undefined;
  }, [actions]);

  useEffect(() => {
    let target = "Idle";
    if (section === 2) target = sectionProgress > 0.58 ? "Running" : "Walking";
    if (section === 1 && sectionProgress > 0.78) target = "ThumbsUp";
    if (section === 4) target = "Wave";
    if (section === 0 && playing.current === "Wave") return;
    if (target === playing.current) return;
    const previous = playing.current ? actions[playing.current] : undefined;
    const next = actions[target];
    if (!next) return;
    previous?.fadeOut(0.35);
    next.reset().fadeIn(0.35).play();
    const repeatWave = target === "Wave" && section === 4;
    const oneShot = !repeatWave && (target === "Wave" || target === "ThumbsUp");
    next.setLoop(oneShot ? THREE.LoopOnce : THREE.LoopRepeat, oneShot ? 1 : Infinity);
    next.clampWhenFinished = oneShot;
    playing.current = target;
  }, [actions, section, sectionProgress]);

  useFrame((state, delta) => {
    if (!root.current) return;
    const { section, sectionProgress } = novaScrollValues;
    const hero = section === 0;
    const features = section === 1;
    const how = section === 2;
    const contact = section === 4;
    const targetX = hero
      ? state.size.width < 768
        ? 0.52
        : 1.55
      : features
        ? -1.15
        : how
          ? Math.sin(sectionProgress * Math.PI * 2) * 1.2
          : contact
            ? 1.45
            : 0;
    const targetY = hero ? -0.35 : features ? -0.45 : how ? -0.45 : contact ? -0.5 : -0.55;
    const targetScale =
      state.size.width < 768 ? 0.43 : section === 1 ? 0.48 : section === 0 ? 0.48 : 0.46;
    root.current.position.x = THREE.MathUtils.damp(root.current.position.x, targetX, 2.4, delta);
    root.current.position.y = THREE.MathUtils.damp(
      root.current.position.y,
      targetY + Math.sin(state.clock.elapsedTime * 1.4) * 0.035,
      2.4,
      delta,
    );
    const show = section === 3 ? 0 : 1;
    root.current.visible = show > 0;
    root.current.scale.setScalar(
      THREE.MathUtils.damp(root.current.scale.x, targetScale * show, 2.8, delta),
    );
    const targetRotation = how
      ? Math.PI + sectionProgress * Math.PI * 2
      : hero
        ? -0.35
        : features
          ? Math.PI / 2
          : -0.3;
    root.current.rotation.y = THREE.MathUtils.damp(
      root.current.rotation.y,
      targetRotation,
      2.4,
      delta,
    );
    const cameraTarget = new THREE.Vector3(
      features ? -0.5 : 0,
      0.25,
      features ? 6.4 : how ? 7.4 : 7,
    );
    state.camera.position.lerp(cameraTarget, 1 - Math.exp(-delta * 2.2));
    state.camera.lookAt(features ? -0.5 : 0, 0.45, 0);
  });

  return (
    <>
      <ambientLight intensity={1.7} />
      <directionalLight position={[3, 5, 5]} intensity={3.3} color="#d7d2ff" />
      <pointLight position={[-3, 1, 2]} intensity={18} color="#52e6e0" />
      <pointLight position={[3, 2, -3]} intensity={10} color="#ff73a9" />
      <group ref={root}>
        <group ref={group} scale={1}>
          <primitive object={scene} dispose={null} />
        </group>
      </group>
    </>
  );
}

useGLTF.preload(novaAssets.robot);
