import { useEffect, useState } from "hono/jsx"

interface ScreenInfo {
	width: number
	height: number
	pixelRatio: number
	zoom: number
	orientation: string
	colorDepth: number
	availWidth: number
	availHeight: number
}

const Breakpoints = {
	XS: { max: 575 },
	SM: { min: 576, max: 767 },
	MD: { min: 768, max: 991 },
	LG: { min: 992, max: 1199 },
	XL: { min: 1200, max: 1399 },
	XXL: { min: 1400 },
}

export function App() {
	const [screenInfo, setScreenInfo] = useState<ScreenInfo>({
		width: window.innerWidth,
		height: window.innerHeight,
		pixelRatio: window.devicePixelRatio,
		zoom: Math.round(window.devicePixelRatio * 100),
		orientation: window.screen.orientation?.type || "unknown",
		colorDepth: window.screen.colorDepth,
		availWidth: window.screen.availWidth,
		availHeight: window.screen.availHeight,
	})

	useEffect(() => {
		const updateScreenInfo = () => {
			setScreenInfo({
				width: window.innerWidth,
				height: window.innerHeight,
				pixelRatio: window.devicePixelRatio,
				zoom: Math.round(window.devicePixelRatio * 100),
				orientation: window.screen.orientation?.type || "unknown",
				colorDepth: window.screen.colorDepth,
				availWidth: window.screen.availWidth,
				availHeight: window.screen.availHeight,
			})
		}

		window.addEventListener("resize", updateScreenInfo)
		window.addEventListener("orientationchange", updateScreenInfo)

		return () => {
			window.removeEventListener("resize", updateScreenInfo)
			window.removeEventListener("orientationchange", updateScreenInfo)
		}
	}, [])

	return (
		<div className="resolution-tester">
			<div className="resolution-display">
				<div className="current-resolution">
					<h2>Current Window Size</h2>
					<div className="resolution-value">
						{screenInfo.width} × {screenInfo.height}
					</div>
				</div>
			</div>

			<div className="viewport-visualizer">
				<h2>Viewport Visualizer</h2>
				<div
					className="viewport-box"
					style={{
						aspectRatio: `${screenInfo.width} / ${screenInfo.height}`,
					}}
				>
					{screenInfo.width} × {screenInfo.height}
				</div>
			</div>

			<div className="resize-instructions">
				<p>Resize your browser window to see values update in real-time.</p>
			</div>

			<div className="info-grid">
				<div className="info-card">
					<h3>Device Pixel Ratio</h3>
					<div className="info-value">{screenInfo.pixelRatio.toFixed(2)}</div>
					<div className="info-description">Physical pixels per CSS pixel</div>
				</div>

				<div className="info-card">
					<h3>Zoom Level</h3>
					<div className="info-value">{screenInfo.zoom}%</div>
					<div className="info-description">Browser zoom percentage</div>
				</div>

				<div className="info-card">
					<h3>Screen Orientation</h3>
					<div className="info-value">{screenInfo.orientation}</div>
					<div className="info-description">Current device orientation</div>
				</div>

				<div className="info-card">
					<h3>Color Depth</h3>
					<div className="info-value">{screenInfo.colorDepth} bits</div>
					<div className="info-description">Color bits per pixel</div>
				</div>

				<div className="info-card">
					<h3>Available Screen</h3>
					<div className="info-value">
						{screenInfo.availWidth} × {screenInfo.availHeight}
					</div>
					<div className="info-description">
						Available screen space (excluding taskbars)
					</div>
				</div>
			</div>

			<div className="responsive-breakpoints">
				<h2>Common Breakpoints</h2>
				<table>
					<thead>
						<tr>
							<th>Device Category</th>
							<th>Width Range</th>
							<th>Status</th>
						</tr>
					</thead>
					<tbody>
						<tr
							className={
								screenInfo.width <= Breakpoints.XS.max
									? "active-breakpoint"
									: ""
							}
						>
							<td>Extra Small (Mobile)</td>
							<td>&lt; {Breakpoints.XS.max + 1}px</td>
							<td>
								{screenInfo.width <= Breakpoints.XS.max ? "✓ Current" : ""}
							</td>
						</tr>

						<tr
							className={
								screenInfo.width >= Breakpoints.SM.min &&
								screenInfo.width <= Breakpoints.SM.max
									? "active-breakpoint"
									: ""
							}
						>
							<td>Small (Mobile Landscape)</td>
							<td>
								{Breakpoints.SM.min}px - {Breakpoints.SM.max}px
							</td>
							<td>
								{screenInfo.width >= Breakpoints.SM.min &&
								screenInfo.width <= Breakpoints.SM.max
									? "✓ Current"
									: ""}
							</td>
						</tr>

						<tr
							className={
								screenInfo.width >= Breakpoints.MD.min &&
								screenInfo.width <= Breakpoints.MD.max
									? "active-breakpoint"
									: ""
							}
						>
							<td>Medium (Tablet)</td>
							<td>
								{Breakpoints.MD.min}px - {Breakpoints.MD.max}px
							</td>
							<td>
								{screenInfo.width >= Breakpoints.MD.min &&
								screenInfo.width <= Breakpoints.MD.max
									? "✓ Current"
									: ""}
							</td>
						</tr>

						<tr
							className={
								screenInfo.width >= Breakpoints.LG.min &&
								screenInfo.width <= Breakpoints.LG.max
									? "active-breakpoint"
									: ""
							}
						>
							<td>Large (Desktop)</td>
							<td>
								{Breakpoints.LG.min}px - {Breakpoints.LG.max}px
							</td>
							<td>
								{screenInfo.width >= Breakpoints.LG.min &&
								screenInfo.width <= Breakpoints.LG.max
									? "✓ Current"
									: ""}
							</td>
						</tr>

						<tr
							className={
								screenInfo.width >= Breakpoints.XL.min &&
								screenInfo.width <= Breakpoints.XL.max
									? "active-breakpoint"
									: ""
							}
						>
							<td>Extra Large (Desktop)</td>
							<td>
								{Breakpoints.XL.min}px - {Breakpoints.XL.max}px
							</td>
							<td>
								{screenInfo.width >= Breakpoints.XL.min &&
								screenInfo.width <= Breakpoints.XL.max
									? "✓ Current"
									: ""}
							</td>
						</tr>

						<tr
							className={
								screenInfo.width >= Breakpoints.XXL.min
									? "active-breakpoint"
									: ""
							}
						>
							<td>XXL (Large Desktop)</td>
							<td>≥ {Breakpoints.XXL.min}px</td>
							<td>
								{screenInfo.width >= Breakpoints.XXL.min ? "✓ Current" : ""}
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	)
}
