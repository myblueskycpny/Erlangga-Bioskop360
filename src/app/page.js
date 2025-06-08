"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function Home() {
  const [videoUrl, setVideoUrl] = useState(null);
  const [showScene, setShowScene] = useState(false);
  const [showGuideText, setShowGuideText] = useState(true);
  const [showVideoSelection, setShowVideoSelection] = useState(true);
  const [videoOptions, setVideoOptions] = useState([]);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(null);

  // Check if A-Frame is loaded
  const isAFrameLoaded = () => {
    return typeof AFRAME !== "undefined" && AFRAME.registerComponent;
  };

  const loadAFrameAndExtras = async () => {
    if (!isAFrameLoaded()) {
      try {
        await import("aframe");
        const extrasScript = document.createElement("script");
        extrasScript.src = "https://unpkg.com/aframe-extras@6.1.1/dist/aframe-extras.min.js";
        extrasScript.onload = () => {
          if (isAFrameLoaded()) {
            console.log("aframe-extras loaded");

            // Register video texture update component
            AFRAME.registerComponent("video-texture-update", {
              init: function () {
                this.el.addEventListener("click", () => {
                  const videoEl = document.querySelector("#video");
                  if (videoEl && videoEl.paused) {
                    videoEl
                      .play()
                      .then(() => {
                        this.el.setAttribute("material", "src", "#video");
                        setShowGuideText(false); // Hide guide text
                      })
                      .catch(console.error);
                  }
                });
              },
            });

            // Register fuse animation component
            AFRAME.registerComponent("reticle-fuse-animation", {
              init: function () {
                const reticle = document.querySelector("#reticle-progress");

                const startFuse = () => {
                  console.log("Fusing started on", this.el); // Debug log
                  reticle?.setAttribute("visible", "true");
                  reticle?.setAttribute("animation", {
                    property: "rotation",
                    to: "0 0 360",
                    loop: true,
                    dur: 2000,
                    easing: "linear",
                  });
                };

                const stopFuse = () => {
                  console.log("Fusing stopped on", this.el); // Debug log
                  reticle?.removeAttribute("animation");
                  reticle?.setAttribute("visible", "false");
                  reticle?.setAttribute("rotation", "0 0 0");
                };

                // Listen for gaze-based events
                this.el.addEventListener("mouseenter", startFuse);
                this.el.addEventListener("mouseleave", stopFuse);
                this.el.addEventListener("click", () => {
                  console.log("Plane clicked"); // Debug log
                  stopFuse();
                });

                // Ensure cursor is working
                this.el.classList.add("interactable-object");
              },
            });

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

  // Fetch video options and load A-Frame
  useEffect(() => {
    loadAFrameAndExtras();
    fetch("/api/video")
      .then((res) => res.json())
      .then((data) => {
        const sources = data.sources || [];
        setVideoOptions(sources);
        if (sources.length > 0) {
          setSelectedVideoIndex(9);
        }
      })
      .catch((err) => {
        console.error("Error fetching video sources:", err);
      });
  }, []);

  const handleVideoSelect = (index) => {
    setSelectedVideoIndex(index);
  };

  const confirmVideoSelection = () => {
    if (selectedVideoIndex !== null && videoOptions[selectedVideoIndex]) {
      setVideoUrl(videoOptions[selectedVideoIndex].src);
      setShowVideoSelection(false);
    }
  };

  // Handle loading of assets
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
      {showVideoSelection ? (
        <div className="video-selection-container">
          <h1>Pilih Video/Film yang Ingin Ditonton</h1>
          <div className="video-grid">
            {videoOptions.map((video, index) => (
              <div key={index} className={`video-poster ${selectedVideoIndex === index ? "selected" : ""}`} onClick={() => handleVideoSelect(index)}>
                <img src="https://cdn.fliki.ai/image/page/660ba680adaa44a37532fd97/666310fc647d79dc96fd21a3.jpg" alt={video.title} />
                <div className="video-title">{video.title}</div>
              </div>
            ))}
          </div>
          <button className="confirm-button" onClick={confirmVideoSelection} disabled={selectedVideoIndex === null}>
            Mulai Menonton
          </button>
        </div>
      ) : (
        <>
          {showScene && (
            <a-scene
              xr-mode-ui="enabled: true"
              background="color: black"
              raycaster="objects: .interactable-object" // Ensure global raycaster config
            >
              <a-assets>{videoUrl && <video id="video" crossOrigin="anonymous" playsInline webkit-playsinline="true" loop src={videoUrl} />}</a-assets>

              {/* Camera & Cursor */}
              <a-entity position="-2 -1.5 -13.511">
                <a-camera wasd-controls-enabled="true" look-controls-enabled="true">
                  <a-entity
                    id="cursor"
                    cursor="fuse: true; fuseTimeout: 2000"
                    raycaster="objects: .interactable-object; far: 50" // Increase raycaster range
                    geometry="primitive: ring; radiusInner: 0.015; radiusOuter: 0.025"
                    material="color: black; shader: flat"
                    position="0 0 -1"
                  />
                  <a-entity id="reticle-progress" geometry="primitive: ring; radiusInner: 0.035; radiusOuter: 0.045" material="color: red; shader: flat; opacity: 0.5" position="0 0 -1" visible="false" />
                  {showGuideText && <a-text id="guide-text" value="Arahkan pandangan ke layar untuk mulai menonton" align="center" position="0 0.25 -1.2" width="1.0" wrap-count="20" color="#FFF" shader="msdf" negate="true" />}
                </a-camera>
              </a-entity>

              {/* Video Screen */}
              <a-plane
                class="interactable-object"
                width="1.78"
                height="1"
                material="color: white; src: #video"
                position="3.626 2.82 -44.648"
                scale="16.31 16.31 16.31"
                video-texture-update
                reticle-fuse-animation
                rotation="0 0 0" // Ensure no rotation issues
              />

              {/* Lighting */}
              <a-entity light="type: spot; angle: 25; intensity: 30" position="3.626 15.869 -0.131" rotation="-6.110 0 0" />
              <a-entity light="type: hemisphere; intensity: 0.080" />

              {/* Environment */}
              <a-entity id="model1" gltf-model="https://myblueskycpny.github.io/360Assets/Cinema%20(100k%20verts)/Cinema(100kVerts).gltf" position="3.626 -5.464 -24.580" rotation="0 180 0" scale="0.05 0.05 0.05" />
              <a-entity id="model2" gltf-model="https://myblueskycpny.github.io/360Assets/NPC/Model%201/NPC.gltf" animation-mixer position="0 -2.098 -17.042" rotation="0 180 0" scale="1 1 1" />
              <a-entity id="model3" gltf-model="https://myblueskycpny.github.io/360Assets/NPC/Model%202/NPC1.gltf" animation-mixer position="6.128 -2.889 -20.488" rotation="0 180 0" scale="1 1 1" />
              <a-entity id="model4" gltf-model="https://myblueskycpny.github.io/360Assets/NPC/Model%203/NPC2.gltf" animation-mixer position="6.128 -1.044 -11.582" rotation="0 180 0" scale="1 1 1" />
              <a-entity id="model5" gltf-model="https://myblueskycpny.github.io/360Assets/NPC/Model%201/NPC.gltf" animation-mixer position="-4.665 -1.413 -13.887" rotation="0 169.340 0" scale="1 1 1" />
            </a-scene>
          )}
        </>
      )}

      <style jsx>{`
        .video-selection-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #000;
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 1000;
        }
        .video-selection-container h1 {
          margin-bottom: 30px;
          font-size: 2rem;
        }
        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
          max-width: 1000px;
          width: 100%;
          margin-bottom: 30px;
        }
        .video-poster {
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          text-align: center;
        }
        .video-poster:hover {
          transform: scale(1.05);
        }
        .video-poster.selected {
          box-shadow: 0 0 15px rgba(255, 0, 0, 0.7);
        }
        .video-poster img {
          width: 100%;
          height: auto;
          border-radius: 5px;
        }
        .video-title {
          margin-top: 10px;
          font-size: 1rem;
        }
        .confirm-button {
          padding: 12px 30px;
          background: #e50914;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1.2rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .confirm-button:hover {
          background: #f6121d;
        }
        .confirm-button:disabled {
          background: #555;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
}
