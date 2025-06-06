import React, { useCallback } from "react";
import Particles from "@tsparticles/react";
import { loadAll } from "@tsparticles/all";

function BackgroundParticles() {
  const particlesInit = useCallback(async (engine) => {
    await loadAll(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 0,
        width: "100%",
        height: "100%",
      }}
      options={{
        fullScreen: { enable: false },
        particles: {
          number: {
            value: 20,
            density: { enable: true, area: 800 },
          },
          shape: {
            type: "image",
            image: {
              src: "/particles/medical-particle.png", // Make sure the image is in public/particles/
              width: 32,
              height: 32,
            },
          },
          size: {
            value: { min: 20, max: 40 },
            animation: {
              enable: true,
              speed: 2,
              minimumValue: 20,
              sync: false,
            },
          },
          move: {
            enable: true,
            speed: 1,
            direction: "none",
            outModes: { default: "out" },
          },
          opacity: {
            value: 0.7,
            animation: {
              enable: true,
              speed: 0.5,
              minimumValue: 0.3,
              sync: false,
            },
          },
        },
        detectRetina: true,
      }}
    />
  );
}

export default BackgroundParticles;
