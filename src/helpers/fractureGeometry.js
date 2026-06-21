import * as THREE from "three";

/**
 * Splits a BufferGeometry into N convex-ish "fragments" by clustering its
 * triangles around random seed points (a quick Lloyd-relaxed k-means on
 * triangle centroids). Each fragment is returned as its own BufferGeometry,
 * re-centered to its own local origin, plus the world-space center it was
 * cut from — so the caller can scatter the fragment outward from `center`
 * for the "broken" pose and tween it back to `center` (=> position [0,0,0]
 * relative to a group placed at `center`... in practice we just store the
 * absolute center and animate position directly) to reassemble the gate.
 *
 * Pure THREE.js + plain JS, no extra dependencies.
 *
 * @param {THREE.BufferGeometry} geometry - non-indexed-friendly source geometry
 *   (already expected to be in the final/world space you want fragments cut in)
 * @param {number} fragmentCount - how many pieces to cut the mesh into
 * @param {number} [seed] - optional integer seed for deterministic results
 * @returns {Array<{ geometry: THREE.BufferGeometry, center: THREE.Vector3 }>}
 */
export function fractureGeometry(geometry, fragmentCount = 10, seed = 1) {
  // Deterministic tiny PRNG (mulberry32) so the "broken" layout is stable
  // across reloads instead of re-randomizing every refresh.
  let s = seed >>> 0 || 1;
  const rand = () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const nonIndexed = geometry.index ? geometry.toNonIndexed() : geometry.clone();
  const posAttr = nonIndexed.getAttribute("position");
  const normAttr = nonIndexed.getAttribute("normal");
  const uvAttr = nonIndexed.getAttribute("uv");

  const triCount = posAttr.count / 3;
  if (triCount === 0) {
    return [{ geometry: nonIndexed, center: new THREE.Vector3() }];
  }

  const k = Math.max(1, Math.min(fragmentCount, triCount));

  // --- per-triangle centroid ---
  const centroids = new Float32Array(triCount * 3);
  const va = new THREE.Vector3();
  const vb = new THREE.Vector3();
  const vc = new THREE.Vector3();
  for (let i = 0; i < triCount; i++) {
    const base = i * 3;
    va.fromBufferAttribute(posAttr, base);
    vb.fromBufferAttribute(posAttr, base + 1);
    vc.fromBufferAttribute(posAttr, base + 2);
    centroids[i * 3] = (va.x + vb.x + vc.x) / 3;
    centroids[i * 3 + 1] = (va.y + vb.y + vc.y) / 3;
    centroids[i * 3 + 2] = (va.z + vb.z + vc.z) / 3;
  }

  // --- pick k random distinct seed triangles ---
  const seedIdx = [];
  const used = new Set();
  while (seedIdx.length < k) {
    const idx = Math.floor(rand() * triCount);
    if (!used.has(idx)) {
      used.add(idx);
      seedIdx.push(idx);
    }
  }
  const seeds = seedIdx.map(
    (i) => new THREE.Vector3(centroids[i * 3], centroids[i * 3 + 1], centroids[i * 3 + 2])
  );

  // --- assign + relax (2 Lloyd iterations) ---
  const assignment = new Int32Array(triCount);
  const ITERATIONS = 2;
  for (let iter = 0; iter <= ITERATIONS; iter++) {
    for (let i = 0; i < triCount; i++) {
      const cx = centroids[i * 3];
      const cy = centroids[i * 3 + 1];
      const cz = centroids[i * 3 + 2];
      let best = 0;
      let bestDist = Infinity;
      for (let j = 0; j < k; j++) {
        const dx = cx - seeds[j].x;
        const dy = cy - seeds[j].y;
        const dz = cz - seeds[j].z;
        const d = dx * dx + dy * dy + dz * dz;
        if (d < bestDist) {
          bestDist = d;
          best = j;
        }
      }
      assignment[i] = best;
    }

    if (iter < ITERATIONS) {
      const sums = Array.from({ length: k }, () => [0, 0, 0, 0]);
      for (let i = 0; i < triCount; i++) {
        const c = assignment[i];
        sums[c][0] += centroids[i * 3];
        sums[c][1] += centroids[i * 3 + 1];
        sums[c][2] += centroids[i * 3 + 2];
        sums[c][3] += 1;
      }
      for (let j = 0; j < k; j++) {
        if (sums[j][3] > 0) {
          seeds[j].set(
            sums[j][0] / sums[j][3],
            sums[j][1] / sums[j][3],
            sums[j][2] / sums[j][3]
          );
        }
      }
    }
  }

  // --- bucket triangle indices per cluster ---
  const buckets = Array.from({ length: k }, () => []);
  for (let i = 0; i < triCount; i++) buckets[assignment[i]].push(i);

  const fragments = [];
  for (let j = 0; j < k; j++) {
    const triIdxs = buckets[j];
    if (triIdxs.length === 0) continue;

    const vertCount = triIdxs.length * 3;
    const positions = new Float32Array(vertCount * 3);
    const normals = normAttr ? new Float32Array(vertCount * 3) : null;
    const uvs = uvAttr ? new Float32Array(vertCount * 2) : null;

    let w = 0;
    for (const triIdx of triIdxs) {
      const base = triIdx * 3;
      for (let v = 0; v < 3; v++) {
        const srcIdx = base + v;
        positions[w * 3] = posAttr.getX(srcIdx);
        positions[w * 3 + 1] = posAttr.getY(srcIdx);
        positions[w * 3 + 2] = posAttr.getZ(srcIdx);
        if (normals) {
          normals[w * 3] = normAttr.getX(srcIdx);
          normals[w * 3 + 1] = normAttr.getY(srcIdx);
          normals[w * 3 + 2] = normAttr.getZ(srcIdx);
        }
        if (uvs) {
          uvs[w * 2] = uvAttr.getX(srcIdx);
          uvs[w * 2 + 1] = uvAttr.getY(srcIdx);
        }
        w++;
      }
    }

    const fragGeo = new THREE.BufferGeometry();
    fragGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    if (normals) fragGeo.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
    if (uvs) fragGeo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    if (!normals) fragGeo.computeVertexNormals();

    fragGeo.computeBoundingBox();
    const center = new THREE.Vector3();
    fragGeo.boundingBox.getCenter(center);

    // Re-center fragment to its own local origin so we can freely set
    // `position` on the mesh/group that holds it.
    const posArr = fragGeo.getAttribute("position");
    for (let i = 0; i < posArr.count; i++) {
      posArr.setXYZ(i, posArr.getX(i) - center.x, posArr.getY(i) - center.y, posArr.getZ(i) - center.z);
    }
    posArr.needsUpdate = true;
    fragGeo.computeBoundingSphere();

    fragments.push({ geometry: fragGeo, center });
  }

  return fragments;
}
