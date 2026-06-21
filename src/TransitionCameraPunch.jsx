import { forwardRef, useImperativeHandle, useRef } from "react";
import { useThree } from "@react-three/fiber";
import gsap from "gsap";

/**
 * TransitionCameraPunch
 * ----------------------------------------------------------------------
 * A render-nothing helper that grabs whatever camera is currently active
 * in the R3F scene (via useThree, same shared state IntroWorld's
 * <PerspectiveCamera makeDefault> registers into) and gives App.jsx an
 * imperative `.punch()` it can drop into the gate-enter GSAP timeline.
 *
 * Deliberately kept as its own sibling component instead of editing
 * IntroWorld.jsx/PortalGate.jsx directly — those stay byte-for-byte the
 * intro that was already built. Mount this alongside <IntroWorld /> and
 * <Effects /> inside the same <Canvas>.
 */
const TransitionCameraPunch = forwardRef(function TransitionCameraPunch(_, ref) {
  const { camera } = useThree();
  const original = useRef(null);

  useImperativeHandle(ref, () => ({
    punch(duration = 1.1) {
      if (!camera) return;
      original.current = {
        fov: camera.fov,
        z: camera.position.z,
      };
      if (camera.isPerspectiveCamera) {
        gsap.to(camera, {
          fov: Math.max(16, camera.fov * 0.6),
          duration,
          ease: "power2.in",
          onUpdate: () => camera.updateProjectionMatrix(),
        });
      }
      gsap.to(camera.position, {
        z: camera.position.z - 2.2,
        duration,
        ease: "power2.in",
      });
    },
    // Not currently called (the intro Canvas unmounts right after the cut),
    // kept available in case a future "back through the gate" flow needs
    // to restore the pre-punch framing instead of relying on remount.
    reset(duration = 0.6) {
      if (!camera || !original.current) return;
      if (camera.isPerspectiveCamera) {
        gsap.to(camera, {
          fov: original.current.fov,
          duration,
          ease: "power2.out",
          onUpdate: () => camera.updateProjectionMatrix(),
        });
      }
      gsap.to(camera.position, {
        z: original.current.z,
        duration,
        ease: "power2.out",
      });
    },
  }));

  return null;
});

export default TransitionCameraPunch;
