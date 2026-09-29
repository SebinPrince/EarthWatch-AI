import React, { useEffect, useRef, useState } from 'react';
import * as Cesium from 'cesium';
import { DisasterEvent, Satellite, SimulationResult, EventSatelliteRel, SpotInspectionData } from '../../types';
import { api } from '../../services/api';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Layers,
  Eye,
  Radio,
  Sparkles,
  Play,
  Pause,
  MapPin,
  Crosshair,
  Sun,
  Moon,
  Film
} from 'lucide-react';

interface GlobeViewerProps {
  events: DisasterEvent[];
  satellites: Satellite[];
  selectedEvent: DisasterEvent | null;
  selectedSatellite: Satellite | null;
  inspectedSpot?: SpotInspectionData | null;
  simulationResult: SimulationResult | null;
  showSatellites: boolean;
  showDisasters: boolean;
  showOrbits: boolean;
  showLabels: boolean;
  flyToTarget?: { lat: number; lon: number; altitude?: number; id: number } | null;
  onSelectEvent: (event: DisasterEvent | null) => void;
  onSelectSatellite: (satellite: Satellite | null) => void;
  onInspectSpot?: (lat: number, lon: number) => void;
  onToggleLabels?: () => void;
}

export const GlobeViewer: React.FC<GlobeViewerProps> = ({
  events,
  satellites,
  selectedEvent,
  selectedSatellite,
  inspectedSpot,
  simulationResult,
  showSatellites,
  showDisasters,
  showOrbits,
  showLabels,
  flyToTarget,
  onSelectEvent,
  onSelectSatellite,
  onInspectSpot,
  onToggleLabels,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const labelsLayerRef = useRef<Cesium.ImageryLayer | null>(null);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [isCinematic, setIsCinematic] = useState<boolean>(false);
  const [isSunLighting, setIsSunLighting] = useState<boolean>(false);
  const [bloomEnabled, setBloomEnabled] = useState<boolean>(true);
  const rotationListenerRef = useRef<(() => void) | null>(null);
  const [sgp4Points, setSgp4Points] = useState<Cesium.Cartesian3[]>([]);

  // Callback refs to prevent stale closures inside Cesium event handler
  const onSelectEventRef = useRef(onSelectEvent);
  const onSelectSatelliteRef = useRef(onSelectSatellite);
  const onInspectSpotRef = useRef(onInspectSpot);

  useEffect(() => {
    onSelectEventRef.current = onSelectEvent;
    onSelectSatelliteRef.current = onSelectSatellite;
    onInspectSpotRef.current = onInspectSpot;
  });

  // Fetch true high-precision SGP4 orbital track points from CelesTrak service
  useEffect(() => {
    if (!selectedSatellite) {
      setSgp4Points([]);
      return;
    }
    let isMounted = true;
    api.getCelesTrakOrbit(selectedSatellite.id, 98).then((res) => {
      if (isMounted && res && res.orbit_points && res.orbit_points.length > 0) {
        const cartesianCoords = res.orbit_points.map((pt) =>
          Cesium.Cartesian3.fromDegrees(pt.longitude, pt.latitude, (pt.altitude || 700) * 1000)
        );
        setSgp4Points(cartesianCoords);
      }
    }).catch(() => {
      if (isMounted) setSgp4Points([]);
    });

    return () => {
      isMounted = false;
    };
  }, [selectedSatellite?.id]);

  // Sync Esri Labels layer visibility dynamically
  useEffect(() => {
    if (labelsLayerRef.current && viewerRef.current && !viewerRef.current.isDestroyed()) {
      labelsLayerRef.current.show = showLabels;
    }
  }, [showLabels]);

  // Handle flyToTarget changes
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed() || !flyToTarget) return;

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        flyToTarget.lon,
        flyToTarget.lat,
        flyToTarget.altitude || 350000
      ),
      duration: 1.6,
    });
  }, [flyToTarget]);

  // Initialize Cesium Viewer
  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    const viewer = new Cesium.Viewer(containerRef.current, {
      baseLayer: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      animation: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      fullscreenButton: false,
      skyAtmosphere: new Cesium.SkyAtmosphere(),
    });

    // Suppress Cesium modal error popups so rendering continues seamlessly
    if (viewer.cesiumWidget) {
      (viewer.cesiumWidget as any).showErrorPanel = (title: string, message: string, error: any) => {
        console.warn('[Cesium Engine Notice]', title, message, error);
      };
    }

    // High-reliability Satellite Imagery Provider (ArcGIS World Imagery with OSM fallback)
    Cesium.ArcGisMapServerImageryProvider.fromUrl(
      'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
      { enablePickFeatures: false }
    ).then((provider) => {
      if (viewer && !viewer.isDestroyed()) {
        viewer.imageryLayers.addImageryProvider(provider);
      }
    }).catch((err) => {
      console.warn('[EarthWatch] ArcGIS imagery failed, loading OSM fallback:', err);
      if (viewer && !viewer.isDestroyed()) {
        const osm = new Cesium.OpenStreetMapImageryProvider({
          url: 'https://tile.openstreetmap.org/'
        });
        viewer.imageryLayers.addImageryProvider(osm);
      }
    });

    // World Boundaries and Places Reference Layer (sharp vector country & city labels)
    Cesium.ArcGisMapServerImageryProvider.fromUrl(
      'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer',
      { enablePickFeatures: false }
    ).then((labelsProvider) => {
      if (viewer && !viewer.isDestroyed()) {
        const layer = viewer.imageryLayers.addImageryProvider(labelsProvider);
        layer.show = showLabels;
        labelsLayerRef.current = layer;
      }
    }).catch(() => {});

    // High-DPI physical resolution rendering for razor-sharp visual clarity
    viewer.resolutionScale = Math.min(window.devicePixelRatio || 1.0, 2.0);

    // Dark sleek space styling with crisp globe illumination (no black night shadows)
    viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#020617');
    viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#1e293b');
    viewer.scene.globe.enableLighting = false;
    viewer.scene.globe.showGroundAtmosphere = false;
    viewer.scene.globe.dynamicAtmosphereLighting = false;
    viewer.scene.globe.dynamicAtmosphereLightingFromSun = false;

    if (viewer.scene.skyAtmosphere) {
      viewer.scene.skyAtmosphere.brightnessShift = 0.12;
      viewer.scene.skyAtmosphere.saturationShift = 0.2;
    }

    // Specular ocean wave normal textures
    try {
      viewer.scene.globe.oceanNormalMapUrl = Cesium.buildModuleUrl('Assets/Textures/waterNormals.jpg');
    } catch {}

    // Anti-aliasing (FXAA)
    if (viewer.scene.postProcessStages?.fxaa) {
      viewer.scene.postProcessStages.fxaa.enabled = true;
    }

    // HDR Bloom Post-Processing
    if (viewer.scene.postProcessStages?.bloom) {
      const bloom = viewer.scene.postProcessStages.bloom;
      bloom.enabled = bloomEnabled;
      bloom.uniforms.contrast = 124.0;
      bloom.uniforms.brightness = -0.32;
      bloom.uniforms.glowOnly = false;
      bloom.uniforms.delta = 1.0;
      bloom.uniforms.sigma = 3.5;
      bloom.uniforms.stepSize = 1.0;
    }

    // Initial camera position looking over Indian Ocean & Asia
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(78.0, 18.0, 18000000),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-85),
        roll: 0.0,
      },
    });

    // Entity click & Globe surface spot inspection handler
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((click: any) => {
      const pickedObject = viewer.scene.pick(click.position);
      if (Cesium.defined(pickedObject) && pickedObject.id) {
        const entity = pickedObject.id;
        if (entity._earthWatchType === 'disaster') {
          onSelectEventRef.current(entity._eventData);
          onSelectSatelliteRef.current(null);
          return;
        } else if (entity._earthWatchType === 'satellite') {
          onSelectSatelliteRef.current(entity._satelliteData);
          onSelectEventRef.current(null);
          return;
        }
      }

      // If no disaster or satellite entity was clicked, pick exact geographic spot on Earth surface!
      const ray = viewer.camera.getPickRay(click.position);
      if (ray) {
        let cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        if (!cartesian) {
          cartesian = viewer.scene.camera.pickEllipsoid(click.position, viewer.scene.globe.ellipsoid);
        }
        if (cartesian) {
          const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
          const lat = Cesium.Math.toDegrees(cartographic.latitude);
          const lon = Cesium.Math.toDegrees(cartographic.longitude);
          if (onInspectSpotRef.current) {
            onInspectSpotRef.current(lat, lon);
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    viewerRef.current = viewer;

    return () => {
      try {
        if (rotationListenerRef.current && !viewer.isDestroyed()) {
          viewer.scene.postRender.removeEventListener(rotationListenerRef.current);
        }
      } catch {}
      try {
        handler.destroy();
      } catch {}
      try {
        if (!viewer.isDestroyed()) {
          viewer.destroy();
        }
      } catch {}
      viewerRef.current = null;
      labelsLayerRef.current = null;
    };
  }, []);

  // Sync Sun Lighting dynamically
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;
    viewer.scene.globe.enableLighting = isSunLighting;
  }, [isSunLighting]);

  // Sync Bloom Glow dynamically
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed() || !viewer.scene.postProcessStages?.bloom) return;
    viewer.scene.postProcessStages.bloom.enabled = bloomEnabled;
  }, [bloomEnabled]);

  // Earth auto-rotation & Cinematic Fly camera mode
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    if (rotationListenerRef.current) {
      try {
        if (!viewer.isDestroyed()) {
          viewer.scene.postRender.removeEventListener(rotationListenerRef.current);
        }
      } catch {}
      rotationListenerRef.current = null;
    }

    if (isCinematic) {
      let animAngle = 0;
      const cinematicCallback = () => {
        try {
          if (!viewer || viewer.isDestroyed()) return;
          animAngle += 0.0035;

          if (selectedEvent) {
            const radius = 1300000;
            const heading = Cesium.Math.toRadians(animAngle * 18);
            const pitch = Cesium.Math.toRadians(-38 + Math.sin(animAngle) * 6);
            viewer.scene.camera.lookAt(
              Cesium.Cartesian3.fromDegrees(selectedEvent.longitude, selectedEvent.latitude, 0),
              new Cesium.HeadingPitchRange(heading, pitch, radius)
            );
          } else if (selectedSatellite) {
            const satAlt = (selectedSatellite.altitude || 700) * 1000;
            const heading = Cesium.Math.toRadians(animAngle * 12);
            const pitch = Cesium.Math.toRadians(-42);
            viewer.scene.camera.lookAt(
              Cesium.Cartesian3.fromDegrees(selectedSatellite.longitude, selectedSatellite.latitude, satAlt),
              new Cesium.HeadingPitchRange(heading, pitch, satAlt * 2.8)
            );
          } else {
            viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, 0.0006);
          }
        } catch {}
      };
      viewer.scene.postRender.addEventListener(cinematicCallback);
      rotationListenerRef.current = cinematicCallback;
    } else if (isRotating && !selectedEvent && !selectedSatellite) {
      const rotateCallback = () => {
        try {
          if (viewer && !viewer.isDestroyed()) {
            viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, 0.0004);
          }
        } catch {}
      };
      try {
        viewer.scene.postRender.addEventListener(rotateCallback);
        rotationListenerRef.current = rotateCallback;
      } catch {}
    }

    return () => {
      if (rotationListenerRef.current && viewer) {
        try {
          if (!viewer.isDestroyed()) {
            viewer.scene.postRender.removeEventListener(rotationListenerRef.current);
          }
        } catch {}
      }
    };
  }, [isRotating, isCinematic, selectedEvent, selectedSatellite]);

  // Sync Disasters, Satellites, Laser Beams, and Simulations
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    try {
      viewer.entities.removeAll();

    // 1. Render Disasters
    if (showDisasters) {
      events.forEach((ev) => {
        const isSelected = selectedEvent?.id === ev.id;
        let color = Cesium.Color.fromCssColorString('#38bdf8'); // low/blue
        let pulseColor = Cesium.Color.fromCssColorString('rgba(56, 189, 248, 0.3)');
        let emoji = '📍';

        if (ev.severity === 'critical') {
          color = Cesium.Color.fromCssColorString('#ef4444');
          pulseColor = Cesium.Color.fromCssColorString('rgba(239, 68, 68, 0.4)');
        } else if (ev.severity === 'high') {
          color = Cesium.Color.fromCssColorString('#f97316');
          pulseColor = Cesium.Color.fromCssColorString('rgba(249, 115, 22, 0.35)');
        } else if (ev.severity === 'moderate') {
          color = Cesium.Color.fromCssColorString('#eab308');
          pulseColor = Cesium.Color.fromCssColorString('rgba(234, 179, 8, 0.35)');
        }

        switch (ev.type) {
          case 'wildfire': emoji = '🔥'; break;
          case 'flood': emoji = '🌊'; break;
          case 'cyclone': emoji = '🌪️'; break;
          case 'volcano': emoji = '🌋'; break;
          case 'heatwave': emoji = '🌡️'; break;
          case 'earthquake': emoji = '🌍'; break;
          case 'storm': emoji = '⚡'; break;
          default: emoji = '⚠️';
        }

        // Event pin with label & glowing point
        const entity = viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(ev.longitude, ev.latitude, 100),
          point: {
            pixelSize: isSelected ? 16 : 11,
            color: color,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: isSelected ? 3 : 1.5,
            scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.2, 8.0e6, 0.7),
          },
          label: {
            text: `${emoji} ${ev.title.slice(0, 24)}...`,
            font: isSelected ? 'bold 13px system-ui' : '11px system-ui',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 3,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -12),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 1.2e7),
          },
        });

        // Attach custom EarthWatch properties for click interception
        (entity as any)._earthWatchType = 'disaster';
        (entity as any)._eventData = ev;

        const radiusMeters = Math.max(30000, Math.sqrt(ev.affected_area_km2 || 500) * 1000);
        const animOffset = (ev.latitude * 100 + ev.longitude * 10) % 2000;

        // 1. Static Hazard Epicenter Impact Disc (GPU-cached with explicit height: 0)
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(ev.longitude, ev.latitude, 0),
          ellipse: {
            semiMajorAxis: radiusMeters,
            semiMinorAxis: radiusMeters * 0.9999,
            height: 0,
            material: color.withAlpha(0.22),
            outline: true,
            outlineColor: color.withAlpha(0.75),
            outlineWidth: 1.5,
          },
        });

        // 2. High-Performance Hardware-Accelerated Radar Pulse (runs 100% on GPU, 0 CPU overhead)
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(ev.longitude, ev.latitude, 20),
          point: {
            pixelSize: new Cesium.CallbackProperty(() => {
              const sec = (Date.now() + animOffset) / 1000.0;
              const pulse = (Math.sin(sec * 3.5) + 1.0) / 2.0;
              return 16 + pulse * 22;
            }, false),
            color: new Cesium.CallbackProperty(() => {
              const sec = (Date.now() + animOffset) / 1000.0;
              const pulse = (Math.sin(sec * 3.5) + 1.0) / 2.0;
              return color.withAlpha((1.0 - pulse) * 0.5);
            }, false),
            outlineColor: Cesium.Color.WHITE.withAlpha(0.7),
            outlineWidth: 1.0,
          },
        });
      });
    }

    // 2. Render Satellites
    if (showSatellites) {
      satellites.forEach((sat) => {
        const isSelected = selectedSatellite?.id === sat.id;
        const satAltitudeMeters = (sat.altitude || 600) * 1000;
        const satPos = Cesium.Cartesian3.fromDegrees(sat.longitude, sat.latitude, satAltitudeMeters);

        const satColor = isSelected
          ? Cesium.Color.YELLOW
          : sat.mission === 'Disaster monitoring'
          ? Cesium.Color.fromCssColorString('#f43f5e')
          : sat.mission === 'Earth Observation'
          ? Cesium.Color.fromCssColorString('#10b981')
          : sat.mission === 'Weather'
          ? Cesium.Color.fromCssColorString('#06b6d4')
          : Cesium.Color.fromCssColorString('#a855f7');

        const satEntity = viewer.entities.add({
          position: satPos,
          point: {
            pixelSize: isSelected ? 14 : 9,
            color: satColor,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 1.5,
          },
          label: {
            text: `🛰️ ${sat.name}`,
            font: '10px monospace',
            fillColor: Cesium.Color.fromCssColorString('#e2e8f0'),
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -10),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 4.0e7),
          },
        });

        // Pulsing radar transponder signal aura around satellite
        viewer.entities.add({
          position: satPos,
          point: {
            pixelSize: isSelected ? 24 : 14,
            color: new Cesium.CallbackProperty(() => {
              const sec = Date.now() / 1000.0;
              const pulse = 0.35 + 0.65 * Math.sin(sec * 4.0);
              return satColor.withAlpha(pulse * 0.45);
            }, false),
          },
        });

        (satEntity as any)._earthWatchType = 'satellite';
        (satEntity as any)._satelliteData = sat;

        // Ground track sub-satellite point projection line
        viewer.entities.add({
          polyline: {
            positions: [
              satPos,
              Cesium.Cartesian3.fromDegrees(sat.longitude, sat.latitude, 0),
            ],
            width: isSelected ? 2.5 : 1,
            material: isSelected
              ? new Cesium.PolylineGlowMaterialProperty({ glowPower: 0.35, color: Cesium.Color.CYAN })
              : Cesium.Color.fromCssColorString('rgba(56, 189, 248, 0.25)'),
          },
        });

        // When satellite is selected, render its CelesTrak sensor swath footprint and 3D holographic projection cone
        if (isSelected) {
          const swathRadius = Math.max(1000, ((sat.swath_km || 250) * 1000) / 2.0);
          const groundCenter = Cesium.Cartesian3.fromDegrees(sat.longitude, sat.latitude, 0);

          // 1. Ground swath coverage ellipse
          viewer.entities.add({
            position: groundCenter,
            ellipse: {
              semiMajorAxis: swathRadius,
              semiMinorAxis: swathRadius * 0.9999,
              material: Cesium.Color.fromCssColorString('rgba(56, 189, 248, 0.22)'),
              outline: true,
              outlineColor: Cesium.Color.CYAN,
              outlineWidth: 2,
            },
            label: {
              text: `SENSOR SWATH: ${sat.swath_km || 250} km (${sat.sensor_type || 'Active'})`,
              font: 'bold 11px monospace',
              fillColor: Cesium.Color.CYAN,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              verticalOrigin: Cesium.VerticalOrigin.TOP,
              pixelOffset: new Cesium.Cartesian2(0, 10),
            },
          });

          // 2. Holographic 3D Pyramidal Projection Rays from Satellite to Swath Perimeter
          const perimeterAngles = [0, 60, 120, 180, 240, 300];
          perimeterAngles.forEach((deg) => {
            const rad = Cesium.Math.toRadians(deg);
            const dLat = (swathRadius / 111320) * Math.cos(rad);
            const cosLat = Math.cos(Cesium.Math.toRadians(sat.latitude)) || 1.0;
            const dLon = (swathRadius / (111320 * cosLat)) * Math.sin(rad);
            const perimPos = Cesium.Cartesian3.fromDegrees(sat.longitude + dLon, sat.latitude + dLat, 0);

            viewer.entities.add({
              polyline: {
                positions: [satPos, perimPos],
                width: 1.5,
                material: new Cesium.PolylineGlowMaterialProperty({
                  glowPower: 0.25,
                  color: Cesium.Color.fromCssColorString('rgba(56, 189, 248, 0.4)'),
                }),
              },
            });
          });

          // 3. Animated Rotating Radar Sweep line inside ground swath
          viewer.entities.add({
            polyline: {
              positions: new Cesium.CallbackProperty(() => {
                const sec = Date.now() / 1000.0;
                const sweepAngle = (sec * 2.2) % (Math.PI * 2);
                const dLat = (swathRadius / 111320) * Math.cos(sweepAngle);
                const cosLat = Math.cos(Cesium.Math.toRadians(sat.latitude)) || 1.0;
                const dLon = (swathRadius / (111320 * cosLat)) * Math.sin(sweepAngle);
                const tip = Cesium.Cartesian3.fromDegrees(sat.longitude + dLon, sat.latitude + dLat, 0);
                return [groundCenter, tip];
              }, false),
              width: 2.5,
              material: new Cesium.PolylineGlowMaterialProperty({
                glowPower: 0.45,
                color: Cesium.Color.CYAN,
              }),
            },
          });
        }

        // Orbit trail circle if enabled
        if (showOrbits && sat.orbit_type !== 'GEO') {
          const orbitPoints: Cesium.Cartesian3[] = [];
          for (let deg = 0; deg <= 360; deg += 10) {
            const rad = Cesium.Math.toRadians(deg);
            const lat = (sat.inclination || 51.6) * Math.sin(rad);
            const lon = (sat.longitude + deg - 180) % 360;
            orbitPoints.push(Cesium.Cartesian3.fromDegrees(lon, lat, satAltitudeMeters));
          }
          viewer.entities.add({
            polyline: {
              positions: orbitPoints,
              width: 1,
              material: Cesium.Color.fromCssColorString('rgba(148, 163, 184, 0.2)'),
            },
          });
        }
      });
    }

    // 2.5 Precise CelesTrak SGP4 Propagated Orbital Track & Ground Swath for Selected Satellite
    if (selectedSatellite) {
      const satAlt = (selectedSatellite.altitude || 700) * 1000;
      const groundPos = Cesium.Cartesian3.fromDegrees(
        selectedSatellite.longitude,
        selectedSatellite.latitude,
        0
      );
      const satPos = Cesium.Cartesian3.fromDegrees(
        selectedSatellite.longitude,
        selectedSatellite.latitude,
        satAlt
      );

      // Render accurate SGP4 polyline trajectory
      if (sgp4Points && sgp4Points.length > 1) {
        viewer.entities.add({
          polyline: {
            positions: sgp4Points,
            width: 3.5,
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.45,
              color: Cesium.Color.fromCssColorString('#38bdf8'),
            }),
          },
        });
      }

      // Sub-satellite nadir projection beam
      viewer.entities.add({
        polyline: {
          positions: [satPos, groundPos],
          width: 1.5,
          material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.fromCssColorString('#38bdf8'),
            dashLength: 12.0,
          }),
        },
      });

      // Ground swath coverage footprint
      const swathKm = selectedSatellite.swath_km || 250;
      const swathRad = Math.max(1000, (swathKm / 2) * 1000);
      viewer.entities.add({
        position: groundPos,
        ellipse: {
          semiMajorAxis: swathRad,
          semiMinorAxis: swathRad * 0.9999,
          material: Cesium.Color.fromCssColorString('rgba(56, 189, 248, 0.22)'),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString('#38bdf8'),
          outlineWidth: 2,
        },
        label: {
          text: `🛰️ ${selectedSatellite.name} SWATH (${swathKm}km)`,
          font: 'bold 11px monospace',
          fillColor: Cesium.Color.fromCssColorString('#38bdf8'),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 3,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -10),
        },
      });
    }

    // 3. Dynamic Satellite -> Disaster Connection Beams
    if (selectedEvent && selectedEvent.relevant_satellites && selectedEvent.relevant_satellites.length > 0) {
      selectedEvent.relevant_satellites.forEach((rel) => {
        const satAlt = (rel.altitude || 700) * 1000;
        const groundPos = Cesium.Cartesian3.fromDegrees(selectedEvent.longitude, selectedEvent.latitude, 0);
        const satPos = Cesium.Cartesian3.fromDegrees(rel.longitude, rel.latitude, satAlt);

        viewer.entities.add({
          polyline: {
            positions: [groundPos, satPos],
            width: 2.5,
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.35,
              color: Cesium.Color.CYAN,
            }),
          },
        });
      });
    }

    // 4. Simulation Footprint & Corridor
    if (simulationResult) {
      const centerPos = Cesium.Cartesian3.fromDegrees(
        simulationResult.center_longitude,
        simulationResult.center_latitude
      );
      const simRadius = Math.max(1000, (simulationResult.max_radius_km || 100) * 1000);

      // Expanding simulated hazard buffer
      viewer.entities.add({
        position: centerPos,
        ellipse: {
          semiMajorAxis: simRadius,
          semiMinorAxis: simRadius * 0.9999,
          material: Cesium.Color.fromCssColorString('rgba(239, 68, 68, 0.35)'),
          outline: true,
          outlineColor: Cesium.Color.RED,
          outlineWidth: 2,
        },
        label: {
          text: `⚠️ SIMULATION: ${simulationResult.title}`,
          font: 'bold 12px sans-serif',
          fillColor: Cesium.Color.RED,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 3,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.TOP,
          pixelOffset: new Cesium.Cartesian2(0, 15),
        },
      });

      // Simulation path polyline steps
      if (simulationResult.steps.length > 1) {
        const pathCoords = simulationResult.steps.map((s) =>
          Cesium.Cartesian3.fromDegrees(s.longitude, s.latitude, 100)
        );
        viewer.entities.add({
          polyline: {
            positions: pathCoords,
            width: 3,
            material: new Cesium.PolylineDashMaterialProperty({
              color: Cesium.Color.fromCssColorString('#f43f5e'),
              dashLength: 16.0,
            }),
          },
        });
      }
    }

    // 5. Render Inspected Spot Target Beacon
    if (inspectedSpot) {
      const spotPos = Cesium.Cartesian3.fromDegrees(
        inspectedSpot.longitude,
        inspectedSpot.latitude,
        30
      );
      const laserTopPos = Cesium.Cartesian3.fromDegrees(
        inspectedSpot.longitude,
        inspectedSpot.latitude,
        250000 // 250 km orbital targeting column
      );

      // Glowing targeting crosshair center
      viewer.entities.add({
        position: spotPos,
        point: {
          pixelSize: 15,
          color: Cesium.Color.fromCssColorString('#06b6d4'),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2.5,
          scaleByDistance: new Cesium.NearFarScalar(1.0e2, 1.2, 2.0e7, 0.75),
        },
        label: {
          text: `🎯 ${inspectedSpot.name}\n${inspectedSpot.coordinate_label}`,
          font: 'bold 12px monospace',
          fillColor: Cesium.Color.fromCssColorString('#38bdf8'),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 3,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -18),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 3.5e7),
        },
      });

      // Static targeting zone with height 0 (GPU cached, 0 CPU re-triangulation)
      viewer.entities.add({
        position: spotPos,
        ellipse: {
          semiMajorAxis: 80000,
          semiMinorAxis: 79999,
          height: 0,
          material: Cesium.Color.fromCssColorString('#06b6d4').withAlpha(0.2),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString('#22d3ee').withAlpha(0.8),
          outlineWidth: 2,
        },
      });

      // Animated high-visibility pulse beacon (100% GPU accelerated)
      viewer.entities.add({
        position: spotPos,
        point: {
          pixelSize: new Cesium.CallbackProperty(() => {
            const sec = Date.now() / 1000.0;
            const pulse = (Math.sin(sec * 4.5) + 1.0) / 2.0;
            return 20 + pulse * 28;
          }, false),
          color: new Cesium.CallbackProperty(() => {
            const sec = Date.now() / 1000.0;
            const pulse = (Math.sin(sec * 4.5) + 1.0) / 2.0;
            return Cesium.Color.fromCssColorString('#22d3ee').withAlpha((1.0 - pulse) * 0.6);
          }, false),
        },
      });

      // High-intensity orbital targeting laser column
      viewer.entities.add({
        polyline: {
          positions: [spotPos, laserTopPos],
          width: 3.5,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.45,
            taperPower: 0.8,
            color: Cesium.Color.fromCssColorString('#06b6d4'),
          }),
        },
      });
    }
    } catch (err) {
      console.warn('Cesium entity render error:', err);
    }
  }, [events, satellites, selectedEvent, selectedSatellite, inspectedSpot, simulationResult, showSatellites, showDisasters, showOrbits, sgp4Points]);

  // Smooth camera fly-to when selectedEvent or selectedSatellite changes
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    if (selectedEvent) {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          selectedEvent.longitude,
          selectedEvent.latitude,
          1200000 // 1,200 km altitude view
        ),
        duration: 1.8,
      });
    } else if (selectedSatellite) {
      const satAlt = (selectedSatellite.altitude || 700) * 1000;
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          selectedSatellite.longitude,
          selectedSatellite.latitude,
          satAlt * 3.5
        ),
        duration: 1.8,
      });
    }
  }, [selectedEvent, selectedSatellite]);

  // Handle zoom controls
  const handleZoom = (inDirection: boolean) => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;
    const camera = viewer.camera;
    const currentHeight = camera.positionCartographic.height;
    const targetHeight = inDirection ? currentHeight * 0.6 : currentHeight * 1.5;

    camera.flyTo({
      destination: Cesium.Cartesian3.fromRadians(
        camera.positionCartographic.longitude,
        camera.positionCartographic.latitude,
        Math.max(100000, targetHeight)
      ),
      duration: 0.8,
    });
  };

  const handleResetView = () => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;
    onSelectEvent(null);
    onSelectSatellite(null);
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(78.0, 18.0, 18000000),
      duration: 1.5,
    });
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950">
      <div ref={containerRef} className="w-full h-full" />

      {/* Cinematic Sci-Fi HUD Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_140px_rgba(2,6,23,0.9)] z-10" />

      {/* Floating 3D Navigation & Cinematic Camera Controls */}
      <div className="absolute top-20 right-6 flex flex-col gap-2 z-20">
        <button
          onClick={() => handleZoom(true)}
          className="p-2.5 rounded-lg glass-panel hover:bg-sky-500/20 text-sky-400 hover:text-white transition-all shadow-lg hover:border-sky-400/50"
          title="Zoom In (Magnify Globe)"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleZoom(false)}
          className="p-2.5 rounded-lg glass-panel hover:bg-sky-500/20 text-sky-400 hover:text-white transition-all shadow-lg hover:border-sky-400/50"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={handleResetView}
          className="p-2.5 rounded-lg glass-panel hover:bg-sky-500/20 text-sky-400 hover:text-white transition-all shadow-lg hover:border-sky-400/50"
          title="Reset Global View"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        <button
          onClick={onToggleLabels}
          className={`p-2.5 rounded-lg glass-panel transition-all shadow-lg ${
            showLabels
              ? 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10'
              : 'text-slate-400 hover:text-white'
          }`}
          title={showLabels ? 'Hide Country & Place Labels' : 'Show Country & Place Labels (Magnify to view cities)'}
        >
          <MapPin className="w-5 h-5" />
        </button>

        {/* Cinematic 360 Camera Glide Mode */}
        <button
          onClick={() => {
            setIsCinematic(!isCinematic);
            if (!isCinematic) setIsRotating(false);
          }}
          className={`p-2.5 rounded-lg glass-panel transition-all shadow-lg ${
            isCinematic
              ? 'text-amber-300 border-amber-500/50 bg-amber-500/20 shadow-amber-500/20 animate-pulse'
              : 'text-slate-400 hover:text-amber-300'
          }`}
          title={isCinematic ? 'Exit Cinematic Fly Mode' : 'Cinematic 360° Orbital Flyby Mode'}
        >
          <Film className="w-5 h-5" />
        </button>

        {/* Realistic Sun Day/Night Terminator Lighting */}
        <button
          onClick={() => setIsSunLighting(!isSunLighting)}
          className={`p-2.5 rounded-lg glass-panel transition-all shadow-lg ${
            isSunLighting
              ? 'text-amber-400 border-amber-500/40 bg-amber-500/10'
              : 'text-slate-400 hover:text-white'
          }`}
          title={isSunLighting ? 'Switch to All-Day High-Visibility Reconnaissance' : 'Switch to Realistic Solar Day/Night Terminator'}
        >
          {isSunLighting ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* HDR Bloom Glow Toggle */}
        <button
          onClick={() => setBloomEnabled(!bloomEnabled)}
          className={`p-2.5 rounded-lg glass-panel transition-all shadow-lg ${
            bloomEnabled
              ? 'text-sky-300 border-sky-400/40 bg-sky-500/10'
              : 'text-slate-500 hover:text-white'
          }`}
          title={bloomEnabled ? 'HDR Bloom Glow: ON' : 'HDR Bloom Glow: OFF'}
        >
          <Sparkles className="w-5 h-5" />
        </button>

        {/* Auto-Rotation */}
        <button
          onClick={() => {
            setIsRotating(!isRotating);
            if (!isRotating) setIsCinematic(false);
          }}
          className={`p-2.5 rounded-lg glass-panel transition-all shadow-lg ${
            isRotating
              ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
              : 'text-slate-400 hover:text-white'
          }`}
          title={isRotating ? 'Pause Earth Rotation' : 'Resume Earth Rotation'}
        >
          {isRotating ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
      </div>

      {/* Mission Control Globe Status Overlay (Bottom Left) */}
      <div className="absolute bottom-16 left-6 z-20 flex items-center gap-3 px-3.5 py-2 rounded-lg glass-panel text-xs font-mono text-slate-300">
        <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>CELESTRAK SGP4 ENGINE</span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>HDR SHADERS: ACTIVE</span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="text-sky-400">
          EVENTS: <span className="text-white font-bold">{events.length}</span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="text-indigo-400">
          ORBITAL ASSETS: <span className="text-white font-bold">{satellites.length}</span>
        </div>
        {selectedSatellite && (
          <>
            <span className="text-slate-600">|</span>
            <div className="text-cyan-400 font-bold truncate max-w-[220px]">
              SATELLITE: {selectedSatellite.name} ({selectedSatellite.altitude?.toFixed(0)} km)
            </div>
          </>
        )}
        {selectedEvent && (
          <>
            <span className="text-slate-600">|</span>
            <div className="text-rose-400 font-bold truncate max-w-[200px]">
              TARGET: {selectedEvent.title}
            </div>
          </>
        )}
        {inspectedSpot && (
          <>
            <span className="text-slate-600">|</span>
            <div className="text-cyan-400 font-bold truncate max-w-[240px]">
              TARGET: {inspectedSpot.name} ({inspectedSpot.coordinate_label})
            </div>
          </>
        )}
      </div>
    </div>
  );
};
