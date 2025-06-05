"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function Home() {
  const [videoUrl, setVideoUrl] = useState(null);
  const [showScene, setShowScene] = useState(false);

  // Cek apakah A-Frame atau komponen sudah termuat
  const isAFrameLoaded = () => {
    return typeof AFRAME !== "undefined" && AFRAME.registerComponent;
  };

  useEffect(() => {
    const loadAFrameAndExtras = async () => {
      if (!isAFrameLoaded()) {
        try {
          await import("aframe");

          const extrasScript = document.createElement("script");
          extrasScript.src = "https://unpkg.com/aframe-extras@6.1.1/dist/aframe-extras.min.js";
          extrasScript.onload = () => {
            if (isAFrameLoaded()) {
              console.log("aframe-extras loaded");

              // Hanya registrasi jika belum pernah dilakukan
              if (!AFRAME.components["video-texture-update"]) {
                AFRAME.registerComponent("video-texture-update", {
                  init: function () {
                    this.el.addEventListener("mouseenter", () => {
                      const videoEl = document.querySelector("#video");
                      if (videoEl) {
                        videoEl.play().catch(console.error);
                        this.el.setAttribute("material", "src", "#video");
                        console.log("Video started and texture updated");
                      }
                    });
                  },
                });
              }

              if (!AFRAME.components["reticle-fuse-animation"]) {
                AFRAME.registerComponent("reticle-fuse-animation", {
                  init: function () {
                    const reticle = document.querySelector("#reticle-progress");
                    const cursor = this.el;

                    cursor.addEventListener("fusing", () => {
                      reticle?.setAttribute("visible", "true");
                      reticle?.setAttribute("animation", {
                        property: "rotation",
                        to: "0 0 360",
                        loop: true,
                        dur: 2000,
                        easing: "linear",
                      });
                    });

                    const stopFuse = () => {
                      reticle?.removeAttribute("animation");
                      reticle?.setAttribute("visible", "false");
                      reticle?.setAttribute("rotation", "0 0 0");
                    };

                    cursor.addEventListener("click", stopFuse);
                    cursor.addEventListener("mouseleave", stopFuse);
                  },
                });
              }

              setShowScene(true);
            }
          };
          document.body.appendChild(extrasScript);
        } catch (error) {
          console.error("Failed to load A-Frame or extras:", error);
        }
      } else {
        setShowScene(true);
      }
    };

    loadAFrameAndExtras();

    // Fetch video URL dari API lokal
    fetch("/api/video")
      .then((res) => res.json())
      .then((data) => {
        const sources = data.sources || [];
        if (sources.length > 0) {
          setVideoUrl(sources[9]?.src); // fallback ke sumber pertama
        }
      })
      .catch((err) => {
        console.error("Error fetching video source:", err);
      });
  }, []);

  useEffect(() => {
    if (!showScene) return;

    const loadingEl = document.getElementById("loading");
    const video = document.querySelector("#video");
    const model1 = document.querySelector("#model1");
    const model2 = document.querySelector("#model2");
    const model3 = document.querySelector("#model3");
    const model4 = document.querySelector("#model4");
    const model5 = document.querySelector("#model5");

    if (!loadingEl || !video || !model1 || !model2 || !model3 || !model4 || !model5) {
      console.warn("Some elements not found for loading check");
      return;
    }

    let model1Loaded = false;
    let model2Loaded = false;
    let model3Loaded = false;
    let model4Loaded = false;
    let model5Loaded = false;
    let videoLoaded = false;

    const checkAllLoaded = () => {
      if (model1Loaded && model2Loaded && model3Loaded && model4Loaded && model5Loaded && videoLoaded) {
        loadingEl.style.opacity = "0";
        setTimeout(() => (loadingEl.style.display = "none"), 1000);
      }
    };

    model1.addEventListener("model-loaded", () => {
      model1Loaded = true;
      checkAllLoaded();
    });

    model2.addEventListener("model-loaded", () => {
      model2Loaded = true;
      checkAllLoaded();
    });

    model3.addEventListener("model-loaded", () => {
      model3Loaded = true;
      checkAllLoaded();
    });

    model4.addEventListener("model-loaded", () => {
      model4Loaded = true;
      checkAllLoaded();
    });

    model5.addEventListener("model-loaded", () => {
      model5Loaded = true;
      checkAllLoaded();
    });

    video.addEventListener("loadeddata", () => {
      videoLoaded = true;
      checkAllLoaded();
    });

    // Cleanup function
    return () => {
      model1.removeEventListener("model-loaded", () => {});
      model2.removeEventListener("model-loaded", () => {});
      model3.removeEventListener("model-loaded", () => {});
      model4.removeEventListener("model-loaded", () => {});
      model5.removeEventListener("model-loaded", () => {});
      video.removeEventListener("loadeddata", () => {});
    };
  }, [showScene]);

  return (
    <>
      <div id="loading">Loading VR Cinema...</div>

      {showScene && (
        <a-scene xr-mode-ui="enabled: true" background="color: black">
          <a-assets>{videoUrl && <video id="video" crossOrigin="anonymous" playsInline webkit-playsinline="true" loop src={videoUrl} />}</a-assets>

          {/* Kamera & Reticle */}
          <a-entity position="-2 -1.2 -14">
            <a-camera wasd-controls-enabled="true" look-controls-enabled="true" cursor="fuse: true; fuseTimeout: 2000" raycaster="objects: .interactable-object" reticle-fuse-animation>
              <a-entity id="reticle-progress" geometry="primitive: ring; radiusInner: 0.035; radiusOuter: 0.045" material="color: red; shader: flat; opacity: 0.5" position="0 0 -1" visible="false"></a-entity>
              <a-entity geometry="primitive: ring; radiusInner: 0.015; radiusOuter: 0.025" material="color: red; shader: flat" position="0 0 -1"></a-entity>
            </a-camera>
          </a-entity>

          {/* Layar Video */}
          <a-plane width="1.78" height="1" material="src: #video" position="3.626 2.82 -44.648" scale="16.31 16.31 16.31" class="interactable-object" video-texture-update></a-plane>

          {/* Lighting */}
          <a-entity light="type: ambient; intensity: 1"></a-entity>
          <a-entity light="type: directional; intensity: 0.5" position="1 1 0.5"></a-entity>

          {/* Lingkungan */}
          <a-entity id="model1" gltf-model="https://myblueskycpny.github.io/360Assets/Cinema%20(100k%20verts)/scene.gltf" position="3.626 -5.464 -24.580" rotation="0 180 0" scale="0.05 0.05 0.05"></a-entity>

          {/* NPC dengan animasi */}
          <a-entity id="model2" gltf-model="https://myblueskycpny.github.io/360Assets/NPC/Model%201/NPC.gltf" animation-mixer position="0 -2.098 -17.042" rotation="0 180 0" scale="1 1 1"></a-entity>
          <a-entity id="model3" gltf-model="https://myblueskycpny.github.io/360Assets/NPC/Model%202/NPC1.gltf" animation-mixer position="6.128 -2.889 -20.488" rotation="0 180 0" scale="1 1 1"></a-entity>
          <a-entity id="model4" gltf-model="https://myblueskycpny.github.io/360Assets/NPC/Model%203/NPC2.gltf" animation-mixer position="6.128 -1.044 -11.582" rotation="0 180 0" scale="1 1 1"></a-entity>
          <a-entity id="model5" gltf-model="https://myblueskycpny.github.io/360Assets/NPC/Model%201/NPC.gltf" animation-mixer position="-4.665 -1.413 -13.887" rotation="0 169.340 0" scale="1 1 1"></a-entity>
        </a-scene>
      )}
    </>
  );
}
