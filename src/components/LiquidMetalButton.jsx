import React, { useEffect, useRef, useState } from "react";

export function LiquidMetalButton({ label, onClick, disabled, isActive = true, type = "button", style = {} }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const shaderRef = useRef(null);
  const shaderMount = useRef(null);

  useEffect(() => {
    const styleId = "shader-canvas-style-exploded";
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement("style");
      styleEl.id = styleId;
      styleEl.textContent = `
        .shader-container-exploded canvas {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          border-radius: 8px !important;
        }
      `;
      document.head.appendChild(styleEl);
    }

    const loadShader = async () => {
      try {
        const { liquidMetalFragmentShader, ShaderMount } = await import("@paper-design/shaders");
        if (shaderRef.current && isActive && !disabled) {
          if (shaderMount.current?.destroy) {
            shaderMount.current.destroy();
          }
          shaderMount.current = new ShaderMount(
            shaderRef.current,
            liquidMetalFragmentShader,
            {
              u_repetition: 4,
              u_softness: 0.4,
              u_shiftRed: 0.15, 
              u_shiftBlue: 0.15, 
              u_distortion: 0.1, 
              u_contour: 0,
              u_angle: 45,
              u_scale: 8,
              u_shape: 1,
              u_offsetX: 0.1,
              u_offsetY: -0.1,
            },
            undefined,
            0.6
          );
        }
      } catch (error) {
        console.error("Failed to load shader:", error);
      }
    };
    loadShader();

    return () => {
      if (shaderMount.current?.destroy) {
        shaderMount.current.destroy();
        shaderMount.current = null;
      }
    };
  }, [isActive, disabled]);

  const handleMouseEnter = () => {
    if (!disabled) {
      setIsHovered(true);
      if (isActive) shaderMount.current?.setSpeed?.(1.2);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setIsHovered(false);
      setIsPressed(false);
      if (isActive) shaderMount.current?.setSpeed?.(0.6);
    }
  };

  const handleClick = (e) => {
    if (!disabled) {
      if (isActive && shaderMount.current?.setSpeed) {
        shaderMount.current.setSpeed(2.4);
        setTimeout(() => {
          if (isHovered) shaderMount.current?.setSpeed?.(1.2);
          else shaderMount.current?.setSpeed?.(0.6);
        }, 300);
      }
      if (onClick) onClick(e);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", ...style }}>
      {/* Hidden span to give the container natural width based on content */}
      <span style={{ opacity: 0, padding: '0 16px', fontSize: '13px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'Manrope', sans-serif", display: 'inline-flex', visibility: 'hidden', whiteSpace: 'nowrap', height: '100%', alignItems: 'center' }}>
        {label}
      </span>
      <div style={{ position: "absolute", inset: 0, perspective: "1000px", perspectiveOrigin: "50% 50%" }}>
        <div style={{
          position: "relative", width: "100%", height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}>
          
          {/* Label */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            transformStyle: "preserve-3d",
            transform: "translateZ(20px)",
            zIndex: 30, pointerEvents: "none"
          }}>
            <span style={{
              fontSize: "13px",
              color: disabled ? "#4B5563" : isActive ? "#ffffff" : (isHovered ? "#E5E7EB" : "#9CA3AF"),
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontFamily: "'Manrope', sans-serif",
              transition: "all 0.4s ease",
            }}>
              {label}
            </span>
          </div>

          {/* Inner Background (Solid Black) */}
          <div style={{
            position: "absolute", inset: 0,
            transformStyle: "preserve-3d",
            transform: `translateZ(10px) ${isPressed ? "translateY(1px) scale(0.98)" : "translateY(0) scale(1)"}`,
            zIndex: 20,
            transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
          }}>
            <div style={{
              position: "absolute",
              top: isActive ? "1.5px" : "0px", 
              left: isActive ? "1.5px" : "0px", 
              right: isActive ? "1.5px" : "0px", 
              bottom: isActive ? "1.5px" : "0px",
              borderRadius: "7px",
              background: isActive 
                ? "#000000" 
                : (isHovered ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)"),
              border: isActive ? "none" : "1px solid rgba(255,255,255,0.06)",
              transition: "all 0.4s ease",
            }} />
          </div>

          {/* Shader Border / Outer Ring */}
          <div style={{
            position: "absolute", inset: 0,
            transformStyle: "preserve-3d",
            transform: `translateZ(0px) ${isPressed ? "translateY(1px) scale(0.98)" : "translateY(0) scale(1)"}`,
            zIndex: 10,
            transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
          }}>
            <div style={{
              width: "100%", height: "100%",
              borderRadius: "8px",
              background: isActive ? "transparent" : "transparent",
              transition: "all 0.4s ease",
              overflow: "hidden",
            }}>
              {isActive && !disabled && (
                <div
                  ref={shaderRef}
                  className="shader-container-exploded"
                  style={{
                    position: "absolute", inset: 0,
                    width: "100%", height: "100%",
                    opacity: isHovered ? 1.0 : 0.7, // Slightly thicker/more present
                    transition: "opacity 0.4s ease",
                  }}
                />
              )}
            </div>
          </div>

          {/* Clickable Overlay */}
          <button
            type={type}
            disabled={disabled}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={() => { if(!disabled) setIsPressed(true); }}
            onMouseUp={() => setIsPressed(false)}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              background: "transparent", border: "none", cursor: disabled ? "not-allowed" : "pointer",
              outline: "none", zIndex: 40,
              transformStyle: "preserve-3d", transform: "translateZ(30px)",
              borderRadius: "8px"
            }}
            aria-label={label}
          />
        </div>
      </div>
    </div>
  );
}
