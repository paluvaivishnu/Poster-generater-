// ============================================
// BrandForge AI — PosterCanvas Component
// ============================================
// The core rendering component. Uses react-konva to compose posters
// programmatically from template configurations + brand kit data.
//
// Features:
// - AI background image layer (Pollinations.ai)
// - Brand overlay (logo, headline, subtext, CTA, contacts)
// - Draggable text elements (headline, subtext, CTA button)
// - Visual hover hints for draggable nodes

import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { Stage, Layer, Rect, Circle, Text, Line, Image as KonvaImage, Arc, RegularPolygon } from 'react-konva';
import Konva from 'konva';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PosterConfig, TemplateId, getCanvasDimensions } from '../../types';
import { renderDynamicAI } from './templates/DynamicAI';

interface PosterCanvasProps {
  config: PosterConfig;
  scale?: number;
  onPositionChange?: (role: 'headline' | 'subtext' | 'cta', pos: { x: number; y: number }) => void;
}

export interface PosterCanvasRef {
  getStage: () => Konva.Stage | null;
}

// Map of component types to react-konva components
const componentMap: Record<string, React.ComponentType<any>> = {
  Rect,
  Circle,
  Text,
  Line,
  Arc,
  RegularPolygon,
};

// Select the template renderer based on templateId
function getTemplateNodes(config: PosterConfig): any[] {
  // We now use a single dynamic AI layout engine
  return renderDynamicAI(config);
}

type DragRole = 'headline' | 'subtext' | 'cta';

const PosterCanvas = forwardRef<PosterCanvasRef, PosterCanvasProps>(
  ({ config, scale = 0.5, onPositionChange }, ref) => {
    const stageRef = useRef<Konva.Stage>(null);
    const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);
    const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
    const [hoveredRole, setHoveredRole] = useState<DragRole | null>(null);

    // Dynamic canvas size from config aspectRatio
    const { width: CW, height: CH } = getCanvasDimensions(config.aspectRatio ?? '4:5');

    useImperativeHandle(ref, () => ({
      getStage: () => stageRef.current,
    }));

    // Load logo image
    useEffect(() => {
      if (config.brandKit.logo_url) {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => setLogoImage(img);
        img.onerror = () => setLogoImage(null);
        img.src = config.brandKit.logo_url;
      } else {
        setLogoImage(null);
      }
    }, [config.brandKit.logo_url]);

    // Load AI background image
    useEffect(() => {
      if (config.bgImageUrl) {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => setBgImage(img);
        img.onerror = () => setBgImage(null);
        img.src = config.bgImageUrl;
      } else {
        setBgImage(null);
      }
    }, [config.bgImageUrl]);

    // Fade-in animation on template/theme change
    const [opacity, setOpacity] = useState(0);
    useEffect(() => {
      setOpacity(0);
      const t = setTimeout(() => setOpacity(1), 50);
      return () => clearTimeout(t);
    }, [config.templateId, config.theme]);

    // Get template nodes
    const templateNodes = getTemplateNodes(config);

    // Helper: change cursor on the stage container
    const setCursor = (cursor: string) => {
      const container = stageRef.current?.container();
      if (container) container.style.cursor = cursor;
    };

    // Logo dimensions + position
    const getLogoDimensions = () => {
      if (!logoImage) return null;
      const baseSize = 120 * config.logoScale;
      const ar = logoImage.width / logoImage.height;
      let width: number, height: number;
      if (ar > 1) { width = baseSize; height = baseSize / ar; }
      else { height = baseSize; width = baseSize * ar; }

      let x: number, y: number;
      if (config.templateId === 'elegant-festive') {
        x = (CW - width) / 2;
        y = CH * 0.22 - height / 2;
      } else if (config.templateId === 'minimal-corporate') {
        x = CW - width - 90;
        y = 90;
      } else {
        x = 70; y = 60;
      }
      if (config.logoX !== undefined) x = config.logoX;
      if (config.logoY !== undefined) y = config.logoY;
      return { x, y, width, height };
    };

    const logoDims = getLogoDimensions();

    return (
      <div
        style={{
          width: CW * scale,
          height: CH * scale,
          overflow: 'hidden',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          opacity,
          transform: `scale(${opacity === 1 ? 1 : 0.98})`,
          transition: 'opacity 0.4s ease-out, transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
      >
        <Stage
          ref={stageRef}
          width={CW * scale}
          height={CH * scale}
          scaleX={scale}
          scaleY={scale}
        >
          <Layer>
            {/* AI background image */}
            {bgImage && (
              <KonvaImage image={bgImage} x={0} y={0} width={CW} height={CH} />
            )}

            {/* Template nodes — with drag support for headline / subtext / cta */}
            {/* Note: each design style's first node is its own style-aware overlay */}
            {templateNodes.map((node, index) => {

              const Component = componentMap[node.type];
              if (!Component) return null;

              const role = node.role as DragRole | undefined;

              // --- CTA background rect: apply same offset as CTA text ---
              if (node.role === 'ctaBg') {
                const ctaOffset = config.dragOffsets?.cta;
                const props = ctaOffset
                  ? { ...node.props, x: ctaOffset.x, y: ctaOffset.y }
                  : node.props;
                return <Component key={`node-${index}`} {...props} />;
              }

              // --- Draggable node ---
              // Everything with a role (except ctaBg) can be dragged
              if (role && role !== 'ctaBg') {
                const offset = config.dragOffsets?.[role];
                const isHovered = hoveredRole === role;

                const baseX = node.props.x as number;
                const baseY = node.props.y as number;
                const finalX = offset ? offset.x : baseX;
                const finalY = offset ? offset.y : baseY;

                return (
                  <React.Fragment key={`node-${index}`}>
                    {/* Hover / selection glow border */}
                    {isHovered && (
                      <Rect
                        x={finalX - 8}
                        y={finalY - 8}
                        width={(node.props.width as number ?? 400) + 16}
                        height={(node.props.fontSize as number ?? 40) * 1.4 + 16}
                        stroke={role === 'cta' ? '#22c55e' : '#8b5cf6'}
                        strokeWidth={2}
                        dash={[8, 4]}
                        cornerRadius={6}
                        fill={role === 'cta' ? 'rgba(34,197,94,0.06)' : 'rgba(139,92,246,0.06)'}
                        listening={false}
                      />
                    )}
                    <Component
                      {...node.props}
                      x={finalX}
                      y={finalY}
                      draggable
                      onMouseEnter={() => {
                        setHoveredRole(role);
                        setCursor('grab');
                      }}
                      onMouseLeave={() => {
                        setHoveredRole(null);
                        setCursor('default');
                      }}
                      onDragStart={() => setCursor('grabbing')}
                      onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
                        setCursor('grab');
                        onPositionChange?.(role, {
                          x: e.target.x(),
                          y: e.target.y(),
                        });
                      }}
                    />
                  </React.Fragment>
                );
              }

              // --- Static node ---
              return <Component key={`node-${index}`} {...node.props} />;
            })}

            {/* Logo image */}
            {logoImage && logoDims && (
              <KonvaImage
                image={logoImage}
                x={logoDims.x}
                y={logoDims.y}
                width={logoDims.width}
                height={logoDims.height}
              />
            )}
          </Layer>
        </Stage>
      </div>
    );
  }
);

PosterCanvas.displayName = 'PosterCanvas';

export default PosterCanvas;
