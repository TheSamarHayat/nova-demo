import { Suspense, useRef, useEffect, useRef as useReactRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useInView } from "framer-motion";
import { novaAssets } from "@/lib/nova-assets";

type ShowcaseModelProps = {
  url: string;
  position: [number, number, number];
  scale: number;
  active: boolean;
  clip?: string | undefined;
  kind: "helmet" | "fox" | "astronaut";
  visible?: boolean;
};

function ShowcaseModel({
  url,
  position,
  scale,
  active,
  clip,
  kind,
  visible = true,
}: ShowcaseModelProps) {
  const ref = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(url);
  const { actions } = useAnimations(animations, ref);

  useEffect(() => {
    if (!clip || !actions || !actions[clip]) return;
    const action = actions[clip];
    action.reset().fadeIn(0.25).play();
    return () => {
      action.fadeOut(0.2);
    };
  }, [actions, clip]);

  useFrame((state) => {
    if (!ref.current || !visible) return;
    const rotationSpeed =
      kind === "helmet" ? (active ? 0.85 : 0.22) : kind === "astronaut" ? 0.16 : 0.06;
    ref.current.rotation.y =
      (kind === "fox" ? Math.PI / 2 : 0) + state.clock.elapsedTime * rotationSpeed;
    ref.current.position.y =
      position[1] + (kind === "astronaut" ? Math.sin(state.clock.elapsedTime * 1.5) * 0.12 : 0);
  });

  return (
    <group ref={ref} position={position} scale={scale} visible={visible}>
      <Center>
        <primitive object={scene} dispose={null} />
      </Center>
    </group>
  );
}

export function ShowcaseScene({
  activeModel,
  mobile = false,
}: {
  activeModel: number;
  mobile?: boolean;
}) {
  const host = useReactRef<HTMLDivElement>(null);
  const inView = useInView(host, { margin: "400px" });

  const models = [
    {
      url: novaAssets.helmet,
      position: (mobile ? [0, -0.08, 0] : [-2.35, 0, 0]) as [number, number, number],
      scale: 2.4,
      kind: "helmet" as const,
      visible: mobile ? activeModel === 0 : true,
      active: activeModel === 0,
      clip: undefined,
    },
    {
      url: novaAssets.fox,
      position: (mobile ? [0, -0.08, 0] : [0, 0, 0]) as [number, number, number],
      scale: 0.012,
      kind: "fox" as const,
      visible: mobile ? activeModel === 1 : true,
      active: activeModel === 1,
      clip: activeModel === 1 ? "Walk" : "Survey",
    },
    {
      url: novaAssets.astronaut,
      position: (mobile ? [0, -0.08, 0] : [2.3, -0.2, 0]) as [number, number, number],
      scale: mobile ? 0.035 : 0.02,
      kind: "astronaut" as const,
      visible: mobile ? activeModel === 2 : true,
      active: activeModel === 2,
      clip: undefined,
    },
  ];

  return (
    <div ref={host} className="showcase-canvas" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 1.1, 7.8], fov: 40 }}
        dpr={[1, 1.5]}
        frameloop={inView ? "always" : "never"}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={1.8} />
        <directionalLight position={[3, 5, 4]} intensity={3.2} color="#e5e3ff" />
        <pointLight position={[0, 1, 3]} intensity={12} color="#54e2dc" />
        <Suspense fallback={null}>
          {models.map((model) => (
            <ShowcaseModel key={model.kind} {...model} />
          ))}
        </Suspense>
      </Canvas>
    </div>
  );
}

// Preload models immediately so they are cached in memory from the start
useGLTF.preload(novaAssets.helmet);
useGLTF.preload(novaAssets.fox);
useGLTF.preload(novaAssets.astronaut);
