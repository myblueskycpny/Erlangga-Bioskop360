"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function Home() {
  const [showScene, setShowScene] = useState(false);

  // Ganti dengan URL manifest dan license Anda
  const manifestUrl =
    "https://manifest.prod.boltdns.net/manifest/v1/dash/live-baseurl/bccenc/6281094274001/d6cd4781-571f-4526-bbb6-01a4fb9cef1a/6s/manifest.mpd?fastly_token=Njg0MjllMWFfODgxNWQ4NWJhZDU5MGYwZDhmYmZlNWYyMTUyOTQwMjkyOGM0YmMyYmE0MmUwMThiNWM2ZDYxYTcwYTM4ZThmMQ%3D%3D";
  const licenseUrl =
    "https://manifest.prod.boltdns.net/license/v1/cenc/widevine/6281094274001/d6cd4781-571f-4526-bbb6-01a4fb9cef1a/ceb8b02b-84ae-4ac6-a497-e5f592aaff22?fastly_token=Njg0MjllMWFfZDg3NzEwN2QxZGQ4YmQ3MWEwODUyN2ZlMjQzMzIyM2M2ZmFiZTZmMmEzMzhiMmRmZTQ5MTA0YWQ5NTYwZGZkYQ%3D%3D";

  // Cek apakah A-Frame atau komponen sudah termuat
  const isAFrameLoaded = () => {
    return typeof AFRAME !== "undefined" && AFRAME.registerComponent;
  };

  // Fungsi untuk memuat script Shaka Player
  const loadShakaPlayer = () => {
    return new Promise((resolve, reject) => {
      const shakaScript = document.createElement("script");
      shakaScript.src = "https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.7.11/shaka-player.compiled.min.js";
      shakaScript.async = true;
      shakaScript.onload = () => {
        if (typeof shaka !== "undefined") {
          console.log("Shaka Player loaded");
          resolve();
        } else {
          reject(new Error("Shaka Player failed to load"));
        }
      };
      shakaScript.onerror = () => reject(new Error("Failed to load Shaka Player script"));
      document.body.appendChild(shakaScript);
    });
  };

  useEffect(() => {
    const loadAFrameAndExtras = async () => {
      if (!isAFrameLoaded()) {
        try {
          // Load A-Frame
          await import("aframe");

          // Load Shaka Player
          await loadShakaPlayer();

          // Load aframe-extras
          const extrasScript = document.createElement("script");
          extrasScript.src = "https://unpkg.com/aframe-extras@6.1.1/dist/aframe-extras.min.js";
          extrasScript.async = true;

          extrasScript.onload = () => {
            if (isAFrameLoaded()) {
              console.log("aframe-extras loaded");

              // Registrasi komponen untuk menangani video DRM
              if (!AFRAME.components["drm-video"]) {
                AFRAME.registerComponent("drm-video", {
                  schema: {
                    manifest: { type: "string" },
                    license: { type: "string" },
                  },
                  init: function () {
                    if (typeof shaka === "undefined") {
                      console.error("Shaka Player not loaded");
                      return;
                    }

                    const videoEl = document.createElement("video");
                    videoEl.id = "video";
                    videoEl.setAttribute("crossorigin", "anonymous");
                    videoEl.setAttribute("playsinline", "");
                    videoEl.setAttribute("webkit-playsinline", "true");
                    videoEl.style.position = "absolute";
                    videoEl.style.top = "10px";
                    videoEl.style.left = "10px";
                    videoEl.style.width = "320px";
                    videoEl.style.zIndex = "1000";
                    videoEl.loop = true;
                    document.body.appendChild(videoEl);

                    // Inisialisasi Shaka Player
                    shaka.polyfill.installAll();
                    if (shaka.Player.isBrowserSupported()) {
                      const player = new shaka.Player(videoEl);
                      player.configure({
                        drm: {
                          servers: {
                            "com.widevine.alpha": this.data.license,
                          },
                        },
                      });

                      // Load manifest
                      player
                        .load(this.data.manifest)
                        .then(() => {
                          console.log("DRM video loaded");
                          // Tunggu hingga metadata video dimuat
                          videoEl.addEventListener("loadedmetadata", () => {
                            console.log("Video metadata loaded, updating texture");
                            this.el.setAttribute("material", "src: #video");
                            this.el.setAttribute("color", "white");
                          });
                        })
                        .catch((error) => {
                          console.error("Error loading DRM video:", error);
                        });
                    } else {
                      console.error("Shaka Player not supported in this browser");
                    }

                    // Event listener untuk interaksi
                    this.el.addEventListener("mouseenter", () => {
                      if (videoEl) {
                        videoEl
                          .play()
                          .then(() => {
                            console.log("Video started");
                            // Pastikan tekstur diperbarui
                            this.el.setAttribute("material", "src: #video");
                            this.el.setAttribute("color", "white");
                            const guideText = document.querySelector("#guide-text");
                            if (guideText) guideText.setAttribute("visible", "false");
                          })
                          .catch((error) => console.error("Error playing video:", error));
                      }
                    });
                  },
                  tick: function () {
                    // Perbarui tekstur secara berkala untuk memastikan rendering
                    if (this.el.getObject3D("mesh")?.material?.map) {
                      this.el.getObject3D("mesh").material.map.needsUpdate = true;
                    }
                  },
                });
              }

              // Komponen reticle-fuse-animation (sama seperti sebelumnya)
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
          extrasScript.onerror = () => console.error("Failed to load aframe-extras");
          document.body.appendChild(extrasScript);
        } catch (error) {
          console.error("Failed to load A-Frame, Shaka Player, or extras:", error);
        }
      } else {
        try {
          await loadShakaPlayer();
          setShowScene(true);
        } catch (error) {
          console.error("Failed to load Shaka Player:", error);
        }
      }
    };

    loadAFrameAndExtras();
  }, []);

  return (
    <>
      <div id="loading">Loading VR Cinema...</div>

      {showScene && (
        <a-scene xr-mode-ui="enabled: true" background="color: black">
          <a-assets>{/* Video element akan dibuat secara dinamis oleh komponen drm-video */}</a-assets>

          {/* Kamera & Reticle */}
          <a-entity position="-2 -1.2 -14">
            <a-camera wasd-controls-enabled="true" look-controls-enabled="true" cursor="fuse: true; fuseTimeout: 2000" raycaster="objects: .interactable-object" reticle-fuse-animation>
              <a-entity id="reticle-progress" geometry="primitive: ring; radiusInner: 0.035; radiusOuter: 0.045" material="color: red; shader: flat; opacity: 0.5" position="0 0 -1" visible="false"></a-entity>
              <a-entity geometry="primitive: ring; radiusInner: 0.015; radiusOuter: 0.025" material="color: red; shader: flat" position="0 0 -1"></a-entity>
            </a-camera>
          </a-entity>

          {/* Layar Video dengan komponen DRM */}
          <a-plane
            width="1.78"
            height="1"
            position="3.626 2.82 -44.648"
            scale="16.31 16.31 16.31"
            class="interactable-object"
            material="color: grey; shader: standard"
            drm-video={`manifest: ${manifestUrl}; license: ${licenseUrl}`}
          ></a-plane>

          {/* Lighting */}
          <a-entity light="type: ambient; intensity: 1"></a-entity>
          {/* <a-entity light="type: directional; intensity: 0.5" position="1 1 0.5"></a-entity> */}

          {/* Lingkungan */}
          <a-entity id="model1" gltf-model="https://myblueskycpny.github.io/360Assets/Cinema%20(100k%20verts)/Cinema(100kVerts).gltf" position="3.626 -5.464 -24.580" rotation="0 180 0" scale="0.05 0.05 0.05"></a-entity>
        </a-scene>
      )}
    </>
  );
}
