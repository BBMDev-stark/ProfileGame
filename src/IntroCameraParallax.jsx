import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";

/**
 * IntroCameraParallax
 * ----------------------------------------------------------------------
 * Subtle mouse-driven camera drift for the intro scene - the camera
 * orbits a few centimeters around its resting [0, 3.2, 11] position based
 * on pointer position, smoothed with a lerp so it never feels twitchy.
 * Purely additive: it stores the camera's resting position AND rotation
 * on mount and always offsets *from* those, so it composes cleanly with
 * whatever framing IntroWorld's <PerspectiveCamera> already set up -
 * critically, it never calls camera.lookAt() at a fixed target, which
 * would silently snap the camera to a different pitch than the
 * hand-tuned default the moment this component starts running.
 *
 * Deliberately disabled once `locked` is true (the moment the visitor
 * clicks the gate) so it never fights TransitionCameraPunch's GSAP tween
 * of camera.position.z/fov during the enter cinematic - this component
 * simply stops writing to the camera and leaves the rest of the timeline
 * untouched.
 */
export default function IntroCameraParallax({ locked = false, strength = 0.5, tiltStrength = 0.035, lerp = 0.04 }) {
  const { camera } = useThree();
  const restRef = useRef(null);
  const currentRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // capture resting position + rotation once, on first mount - so the
    // very first frame this component touches the camera, the offset
    // is still (0,0) and nothing visibly jumps
    if (!restRef.current) {
      restRef.current = {
        pos: camera.position.clone(),
        quat: camera.quaternion.clone(),
      };
    }
  }, [camera]);

  useFrame(({ pointer }) => {
    if (locked || !restRef.current) return;

    const targetX = pointer.x * strength;
    const targetY = pointer.y * strength * 0.5;

    currentRef.current.x += (targetX - currentRef.current.x) * lerp;
    currentRef.current.y += (targetY - currentRef.current.y) * lerp;

    const { pos, quat } = restRef.current;
    camera.position.x = pos.x + currentRef.current.x;
    camera.position.y = pos.y + currentRef.current.y;

    // restore the original orientation, then apply a tiny additional
    // yaw/pitch on top of it - never replaces it with a lookAt target
    camera.quaternion.copy(quat);
    camera.rotateY(-currentRef.current.x * tiltStrength);
    camera.rotateX(currentRef.current.y * tiltStrength);
  });

  return null;
}
