import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, Crosshair, MapPin } from 'lucide-react';

const TILE_SIZE = 256;
const SUBDOMAINS = ['a', 'b', 'c', 'd'];

function clampLat(lat) {
	return Math.max(-85.05112878, Math.min(85.05112878, lat));
}

function latLonToWorldPx(lat, lon, zoom) {
	const n = Math.pow(2, zoom);
	const x = ((lon + 180) / 360) * n * TILE_SIZE;
	const latRad = (clampLat(lat) * Math.PI) / 180;
	const y =
		((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
		n *
		TILE_SIZE;
	return { x, y };
}

function TileImage({ zoom, tx, wrappedTx, ty, left, top, onTileLoaded, onTileFailed }) {
	const [fallbackStep, setFallbackStep] = useState(0);
	const sub = SUBDOMAINS[Math.abs(wrappedTx + ty) % SUBDOMAINS.length];

	const src =
		fallbackStep === 0
			? `https://${sub}.basemaps.cartocdn.com/rastertiles/voyager/${zoom}/${wrappedTx}/${ty}@2x.png`
			: fallbackStep === 1
			? `https://tile.openstreetmap.org/${zoom}/${wrappedTx}/${ty}.png`
			: null;

	if (!src) return null;

	return (
		<img
			src={src}
			alt=""
			draggable={false}
			onLoad={onTileLoaded}
			onError={() => {
				if (fallbackStep === 0) {
					setFallbackStep(1);
				} else {
					setFallbackStep(2);
					onTileFailed();
				}
			}}
			style={{
				position: 'absolute',
				left: `${left}px`,
				top: `${top}px`,
				width: `${TILE_SIZE}px`,
				height: `${TILE_SIZE}px`,
				userSelect: 'none',
				pointerEvents: 'none',
				maxWidth: 'none',
			}}
		/>
	);
}

export default function DeviceLocationMap({ latitude, longitude, label, accuracyMeters, isGps }) {
	const lat = Number(latitude);
	const lon = Number(longitude);
	const valid = Number.isFinite(lat) && Number.isFinite(lon);

	const containerRef = useRef(null);
	const [size, setSize] = useState({ width: 520, height: 224 });
	const [zoom, setZoom] = useState(isGps ? 15 : 13);
	const [pan, setPan] = useState({ x: 0, y: 0 });
	const [dragStart, setDragStart] = useState(null);
	const [loadedTiles, setLoadedTiles] = useState(0);
	const [failedTiles, setFailedTiles] = useState(0);

	// Reset view when inspecting a different device or updated coordinates
	useEffect(() => {
		setZoom(isGps ? 15 : 13);
		setPan({ x: 0, y: 0 });
		setLoadedTiles(0);
		setFailedTiles(0);
	}, [lat, lon, isGps]);

	// Track actual rendered box dimensions so tiles align pixel-perfectly
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const update = () => {
			const rect = el.getBoundingClientRect();
			if (rect.width > 0 && rect.height > 0) {
				setSize({ width: rect.width, height: rect.height });
			}
		};
		update();
		if (typeof ResizeObserver !== 'undefined') {
			const ro = new ResizeObserver(update);
			ro.observe(el);
			return () => ro.disconnect();
		}
		window.addEventListener('resize', update);
		return () => window.removeEventListener('resize', update);
	}, []);

	if (!valid) {
		return (
			<div className="w-full h-full flex items-center justify-center bg-slate-100 text-xs text-muted-foreground">
				Invalid coordinates
			</div>
		);
	}

	const n = Math.pow(2, zoom);
	const center = latLonToWorldPx(lat, lon, zoom);
	const viewLeft = center.x - pan.x - size.width / 2;
	const viewTop = center.y - pan.y - size.height / 2;

	const minTx = Math.floor(viewLeft / TILE_SIZE);
	const maxTx = Math.floor((viewLeft + size.width) / TILE_SIZE);
	const minTy = Math.floor(viewTop / TILE_SIZE);
	const maxTy = Math.floor((viewTop + size.height) / TILE_SIZE);

	const tiles = [];
	for (let ty = minTy; ty <= maxTy; ty++) {
		if (ty < 0 || ty >= n) continue;
		for (let tx = minTx; tx <= maxTx; tx++) {
			const wrappedTx = ((tx % n) + n) % n;
			tiles.push({
				key: `${zoom}-${tx}-${ty}`,
				tx,
				wrappedTx,
				ty,
				left: tx * TILE_SIZE - viewLeft,
				top: ty * TILE_SIZE - viewTop,
			});
		}
	}

	const pinX = center.x - viewLeft;
	const pinY = center.y - viewTop;

	const handlePointerDown = (e) => {
		if (e.button !== 0) return;
		e.currentTarget.setPointerCapture?.(e.pointerId);
		setDragStart({
			clientX: e.clientX,
			clientY: e.clientY,
			origX: pan.x,
			origY: pan.y,
		});
	};

	const handlePointerMove = (e) => {
		if (!dragStart) return;
		setPan({
			x: dragStart.origX + (e.clientX - dragStart.clientX),
			y: dragStart.origY + (e.clientY - dragStart.clientY),
		});
	};

	const handlePointerUp = (e) => {
		if (dragStart) {
			e.currentTarget.releasePointerCapture?.(e.pointerId);
			setDragStart(null);
		}
	};

	const zoomBy = (delta) => {
		setZoom((z) => {
			const next = Math.max(3, Math.min(18, z + delta));
			if (next !== z) {
				const factor = Math.pow(2, next - z);
				setPan((p) => ({ x: p.x * factor, y: p.y * factor }));
			}
			return next;
		});
	};

	return (
		<div
			ref={containerRef}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={handlePointerUp}
			onPointerCancel={handlePointerUp}
			className={`relative w-full h-full overflow-hidden select-none bg-[#e8eef3] ${
				dragStart ? 'cursor-grabbing' : 'cursor-grab'
			}`}
			style={{
				backgroundImage:
					'radial-gradient(rgba(15, 23, 42, 0.08) 1px, transparent 1px)',
				backgroundSize: '20px 20px',
			}}
		>
			{/* Raster map tiles */}
			{tiles.map((t) => (
				<TileImage
					key={t.key}
					zoom={zoom}
					tx={t.tx}
					wrappedTx={t.wrappedTx}
					ty={t.ty}
					left={t.left}
					top={t.top}
					onTileLoaded={() => setLoadedTiles((c) => c + 1)}
					onTileFailed={() => setFailedTiles((c) => c + 1)}
				/>
			))}

			{/* Device Marker Pin */}
			<div
				style={{
					position: 'absolute',
					left: `${pinX}px`,
					top: `${pinY}px`,
					transform: 'translate(-50%, -50%)',
					pointerEvents: 'none',
				}}
				className="z-10 flex flex-col items-center"
			>
				<span
					className={`absolute w-10 h-10 rounded-full animate-ping opacity-30 ${
						isGps ? 'bg-emerald-500' : 'bg-blue-600'
					}`}
				/>
				<span
					className={`relative w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white ${
						isGps ? 'bg-emerald-600 text-white' : 'bg-primary text-white'
					}`}
				>
					<MapPin size={15} />
				</span>
				{label && (
					<span className="mt-1 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-xs text-[10px] font-bold text-slate-800 shadow-sm border border-slate-200 whitespace-nowrap">
						{label}
						{isGps && accuracyMeters ? ` (±${Math.round(accuracyMeters)}m)` : ''}
					</span>
				)}
			</div>

			{/* Zoom & Recenter Controls */}
			<div
				className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-1"
				onPointerDown={(e) => e.stopPropagation()}
			>
				<button
					type="button"
					onClick={() => zoomBy(1)}
					className="w-7 h-7 bg-white/95 hover:bg-white text-slate-700 rounded-lg shadow-sm border border-slate-200 flex items-center justify-center cursor-pointer"
					title="Zoom in"
				>
					<Plus size={14} />
				</button>
				<button
					type="button"
					onClick={() => zoomBy(-1)}
					className="w-7 h-7 bg-white/95 hover:bg-white text-slate-700 rounded-lg shadow-sm border border-slate-200 flex items-center justify-center cursor-pointer"
					title="Zoom out"
				>
					<Minus size={14} />
				</button>
				{(pan.x !== 0 || pan.y !== 0) && (
					<button
						type="button"
						onClick={() => setPan({ x: 0, y: 0 })}
						className="w-7 h-7 bg-white/95 hover:bg-white text-primary rounded-lg shadow-sm border border-slate-200 flex items-center justify-center cursor-pointer"
						title="Recenter on device"
					>
						<Crosshair size={14} />
					</button>
				)}
			</div>

			{/* Offline tile fallback badge only if every tile failed */}
			{loadedTiles === 0 && failedTiles > 0 && (
				<div className="absolute top-2.5 left-2.5 z-20 px-2.5 py-1 rounded-lg bg-white/90 text-[10px] font-semibold text-slate-600 border border-slate-200 shadow-xs">
					Map tiles blocked on network · showing coordinates
				</div>
			)}

			{/* Subtle Attribution */}
			<div className="absolute bottom-1.5 right-2 z-20 px-1.5 py-0.5 rounded bg-white/80 text-[9px] text-slate-600 pointer-events-none">
				© OpenStreetMap · © CARTO
			</div>
		</div>
	);
}
