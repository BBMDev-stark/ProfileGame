import { useMemo, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

/**
 * IntroForest
 * ----------------------------------------------------------------------
 * Scatters individual props pulled out of the existing forest.glb
 * (purple fantasy mushrooms, mossy rocks, birch trees) around the portal
 * gate so the clearing reads as a living ancient grove instead of an
 * empty dark plane.
 *
 * forest.glb's own Sketchfab export nests every prop under a single
 * 0.01-scaled FBX root with each prop's translation scattered tens of
 * units apart in every direction - reusing that group wholesale would
 * either bury the gate in overlapping geometry or shrink everything to
 * invisibility. Instead each named mesh is extracted via useGLTF's
 * `nodes` map (the same pattern PortalGate.jsx already uses for its own
 * GLB) and re-instanced at hand-placed positions/scales below, baking
 * out each mesh's own local matrix first so its geometry is centered on
 * its own pivot regardless of where Sketchfab originally translated it.
 *
 * Each prop's source material has a baseColorTexture (bark/leaf/moss
 * detail) but a flat white .color factor and no emissive map. Rather
 * than build a fresh material and lose that texture, each mesh's
 * original material is cloned once per prop *kind* (not per instance -
 * all copies of the same prop share one retinted material, since the
 * tint is identical and this keeps draw calls/materials low) and only
 * .color/.emissive are overridden on top of it: mushroom caps pull from
 * stock violet toward the gate's amber/gold palette and gain a warm
 * emissive glow; rocks/bark get a light warm-neutral tint so the grove
 * doesn't read monochrome.
 */

const NODE_MAP = {
  mushroomA: "PP_Mushroom_Fantasy_Purple_05_PP_Standard_Material_0",
  mushroomB: "PP_Mushroom_Fantasy_Purple_08_PP_Standard_Material_0",
  rockMoss: "PP_Rock_Moss_Grown_11_PP_Standard_Material_0",
  rockPile: "PP_Rock_Pile_Forest_Moss_05_PP_Standard_Material_0",
  birchA: "PP_Birch_Tree_05_PP_Standard_Material_0",
  birchB: "PP_Birch_Tree_06_PP_Standard_Material_0",
};

// Real-world height of each prop once baked (computed from the source
// asset's bounding box) - used to auto-derive a per-prop scale factor
// from a single "target height in scene units" instead of hand-tuning
// six unrelated scale numbers.
const BASE_HEIGHT = {
  mushroomA: 2.4836,
  mushroomB: 2.6319,
  rockMoss: 4.0347,
  rockPile: 7.3582,
  birchA: 26.0703,
  birchB: 31.0228,
};

function tintFor(kind) {
  if (kind === "mushroomA" || kind === "mushroomB") {
    return { color: new THREE.Color("#ffb15e"), emissive: new THREE.Color("#ff9a3c"), emissiveIntensity: 0.55 };
  }
  return { color: new THREE.Color("#e8d2b0"), emissive: null, emissiveIntensity: 0 };
}

function useForestGeometries(path) {
  const { nodes } = useGLTF(path);
  return useMemo(() => {
    const geometries = {};
    const materials = {};
    for (const [key, nodeName] of Object.entries(NODE_MAP)) {
      const mesh = nodes[nodeName];
      if (!mesh?.isMesh) continue;
      mesh.updateWorldMatrix(true, false);
      // bake the node's local transform into the geometry so every prop
      // is centered/oriented on its own pivot, independent of wherever
      // the original Sketchfab scene happened to translate it
      const geo = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);
      geo.computeBoundingBox();
      const box = geo.boundingBox;
      // re-center on X/Z (keep Y so the base still sits at y=0)
      const cx = (box.min.x + box.max.x) / 2;
      const cz = (box.min.z + box.max.z) / 2;
      geo.translate(-cx, -box.min.y, -cz);
      geometries[key] = geo;

      // clone (never mutate) the source material so the existing
      // baseColorTexture (leaf/bark/moss detail) is preserved - only
      // .color/.emissive are overridden on top of it to retint
      const tint = tintFor(key);
      const mat = mesh.material.clone();
      mat.color = tint.color.clone();
      if (tint.emissive) {
        mat.emissive = tint.emissive.clone();
        mat.emissiveIntensity = tint.emissiveIntensity;
      }
      materials[key] = mat;
    }
    return { geometries, materials };
  }, [nodes]);
}

function ForestProp({ geometry, material, position, rotationY = 0, scale = 1 }) {
  if (!geometry || !material) return null;

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={position}
      rotation={[0, rotationY, 0]}
      scale={scale}
      frustumCulled
    />
  );
}

/**
 * Hand-placed instances framing the gate clearing - close enough to
 * read as a grove the visitor is standing inside, far enough back (and
 * outside the gate's own ~3-unit hit-sphere) to never block the click
 * target. Loosely mirrored left/right with scale/rotation variance so
 * it doesn't look stamped. `height` is the desired final height in
 * scene units; scale is derived from it automatically.
 */
const PROPS = [
  // left tree line
  { kind: "birchA", position: [-6.6, -1.2, -2.4], rotationY: 0.5, height: 6.6 },
  { kind: "birchB", position: [-8.6, -1.2, -5.8], rotationY: 2.1, height: 7.2 },
  { kind: "birchA", position: [-5.4, -1.2, -8.4], rotationY: -0.8, height: 5.8 },
  // right tree line
  { kind: "birchB", position: [6.8, -1.2, -2.2], rotationY: -0.6, height: 6.8 },
  { kind: "birchA", position: [8.8, -1.2, -5.6], rotationY: 1.4, height: 7.0 },
  { kind: "birchB", position: [5.6, -1.2, -8.6], rotationY: 0.3, height: 6.0 },
  // back tree line, framing the ruins
  { kind: "birchA", position: [-2.6, -1.2, -11.5], rotationY: 1.0, height: 6.4 },
  { kind: "birchB", position: [3.0, -1.2, -11.8], rotationY: -1.6, height: 6.7 },

  // mossy rocks near the path, low to the ground - kept outside the
  // gate's own invisible hover/click hit-sphere (radius ≈ 3.35 units)
  { kind: "rockMoss", position: [-4.2, -1.2, -0.6], rotationY: 0.7, height: 0.7 },
  { kind: "rockPile", position: [4.4, -1.2, -0.8], rotationY: -1.1, height: 0.9 },
  { kind: "rockMoss", position: [-6.0, -1.2, -4.6], rotationY: 2.3, height: 0.6 },
  { kind: "rockPile", position: [6.4, -1.2, -4.4], rotationY: 0.9, height: 0.85 },

  // glowing mushroom clusters - the grove's own light source, kept
  // closest to the gate (but still outside its hit-sphere) so their
  // warm glow reads against the path
  { kind: "mushroomA", position: [-3.6, -1.2, 1.8], rotationY: 0.2, height: 0.55 },
  { kind: "mushroomB", position: [-3.2, -1.2, 2.1], rotationY: 1.8, height: 0.4 },
  { kind: "mushroomA", position: [3.7, -1.2, 1.7], rotationY: -0.4, height: 0.5 },
  { kind: "mushroomB", position: [3.3, -1.2, 2.1], rotationY: 2.6, height: 0.38 },
  { kind: "mushroomA", position: [-7.2, -1.2, -1.2], rotationY: 1.1, height: 0.62 },
  { kind: "mushroomB", position: [7.4, -1.2, -1.0], rotationY: -1.9, height: 0.58 },
  { kind: "mushroomA", position: [-4.2, -1.2, -9.6], rotationY: 0.6, height: 0.48 },
  { kind: "mushroomB", position: [4.6, -1.2, -9.8], rotationY: -0.9, height: 0.52 },
];

export default function IntroForest() {
  const { geometries, materials } = useForestGeometries("./models/intro/forest.glb");

  // dispose cloned geometries/materials on unmount to avoid leaking GPU
  // memory across intro remounts (the intro Canvas mounts/unmounts as
  // the visitor enters/leaves the gate)
  useEffect(() => {
    return () => {
      Object.values(geometries).forEach((g) => g.dispose());
      Object.values(materials).forEach((m) => m.dispose());
    };
  }, [geometries, materials]);

  return (
    <group>
      {PROPS.map((p, i) => {
        const geometry = geometries[p.kind];
        const material = materials[p.kind];
        const scale = geometry ? p.height / BASE_HEIGHT[p.kind] : 1;
        return (
          <ForestProp
            key={i}
            geometry={geometry}
            material={material}
            position={p.position}
            rotationY={p.rotationY}
            scale={scale}
          />
        );
      })}
    </group>
  );
}
