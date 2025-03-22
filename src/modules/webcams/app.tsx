import { useCallback, useEffect, useRef, useState } from "hono/jsx/dom"

type DevicesByKind = Record<MediaDeviceKind, MediaDeviceInfo[]>
type SelectedDevices = Record<
	MediaDeviceKind,
	MediaDeviceInfo["deviceId"] | undefined
>
type DevicesFormProps = {
	onDevices: (devices: SelectedDevices) => void
	onError: (error: Error) => void
}

function DevicesForm({ onDevices, onError }: DevicesFormProps) {
	const [devices, setDevices] = useState<Array<MediaDeviceInfo> | undefined>()
	const [isSubmitted, setIsSubmitted] = useState(false)

	const devicesByKind = devices?.reduce<DevicesByKind>(
		(prev, curr) => {
			if (prev[curr.kind]) prev[curr.kind].push(curr)
			else prev[curr.kind] = [curr]
			return prev
		},
		{
			audioinput: [],
			audiooutput: [],
			videoinput: [],
		},
	)

	const handleFormSubmit = useCallback(
		async (e: Event) => {
			e.preventDefault()
			setIsSubmitted(true)

			const formData = new FormData(e.currentTarget as HTMLFormElement)
			const selectedDevices: SelectedDevices = {
				audiooutput: formData.get("audiooutput")?.toString(),
				audioinput: formData.get("audioinput")?.toString(),
				videoinput: formData.get("videoinput")?.toString(),
			}

			onDevices(selectedDevices)
		},
		[onDevices],
	)

	useEffect(() => {
		async function getDevices() {
			if (!devices) {
				try {
					const devices = await navigator.mediaDevices.enumerateDevices()
					setDevices(devices)
				} catch (error) {
					onError(
						error instanceof Error
							? error
							: new Error("Could not get devices", { cause: error }),
					)
				}
			}
		}

		getDevices()
	}, [])

	return (
		<form onSubmit={handleFormSubmit} class="device-form">
			<fieldset>
				<legend>Select your devices</legend>

				{devicesByKind ? (
					Object.entries(devicesByKind)
						.filter(([kind]) => kind !== "audiooutput")
						.map(([kind, devices]) => (
							<div key={kind}>
								<h3>{kind}</h3>

								{devices.map((device, idx) =>
									device.deviceId ? (
										<label
											for={`${kind}_${device.deviceId}`}
											key={device.deviceId}
										>
											<input
												required
												id={`${kind}_${device.deviceId}`}
												name={kind}
												type="radio"
												style="margin-right: 0.5rem"
												value={device.deviceId}
												checked={idx === 0 || isSubmitted}
											/>

											{device.label}
										</label>
									) : (
										<p key={`${kind}_default`}>
											Options not found. Using default device.
										</p>
									),
								)}
							</div>
						))
				) : (
					<p>No devices found. Try submitting to start with the defaults.</p>
				)}
			</fieldset>

			<div class="form-actions">
				<button type="submit">Open Camera</button>
			</div>
		</form>
	)
}

type RecorderProps = {
	stream: MediaStream
	type: Blob["type"]
	onError: (e: Error) => void
}

function Recorder({ stream, type, onError }: RecorderProps) {
	const [clips, setClips] = useState<Array<{ timestamp: number; url: string }>>(
		[],
	)
	const [recorder, setRecorder] = useState<MediaRecorder | undefined>()
	// this is only to sync the recorder state to React's render
	const [recorderState, syncRecorderState] = useState<
		RecordingState | undefined
	>(undefined)

	const chunksRef = useRef<Array<Blob>>([])

	const handleRecorderStart = useCallback(() => {
		if (!recorder) return null
		if (recorder.state === "recording") return null
		if (recorder.state === "paused") return recorder.resume()
		recorder.start(1000)
	}, [recorder, syncRecorderState])

	const handleRecorderStop = useCallback(() => {
		if (!recorder) return null
		if (recorder.state === "inactive") return null
		if (recorder.state === "recording") return recorder.pause()
		if (recorder.state === "paused") return recorder.stop()
	}, [recorder])

	useEffect(() => {
		function createRecorder(stream: MediaStream) {
			const clone = stream.clone()
			if (type.startsWith("audio")) {
				for (const track of clone.getVideoTracks()) {
					clone.removeTrack(track)
				}
			}

			const recorder = new MediaRecorder(clone)

			recorder.ondataavailable = (e) => {
				chunksRef.current?.push(e.data)
			}

			recorder.onstart = (e) => {
				syncRecorderState((e.currentTarget as MediaRecorder).state)
			}

			recorder.onpause = (e) => {
				syncRecorderState((e.currentTarget as MediaRecorder).state)
			}

			recorder.onresume = (e) => {
				syncRecorderState((e.currentTarget as MediaRecorder).state)
			}

			recorder.onerror = (e) => {
				onError(e.error)
				syncRecorderState((e.currentTarget as MediaRecorder).state)
			}

			recorder.onstop = (e) => {
				if (!chunksRef.current) {
					alert("Chunks could not be found")
					return
				}

				const blob = new Blob(chunksRef.current, { type })
				const url = URL.createObjectURL(blob)
				chunksRef.current = []

				setClips((prev) => prev.concat({ timestamp: Date.now(), url }))
				syncRecorderState((e.currentTarget as MediaRecorder).state)
			}

			setRecorder(recorder)
			syncRecorderState(recorder.state)
		}

		if (!recorder && stream) {
			createRecorder(stream)
		}
	}, [stream, recorder, recorderState])

	return (
		<div class="recorder-container">
			<h2>Recorder ({type.split("/")[0]?.toUpperCase()})</h2>
			<div class="control-row">
				{recorder?.state === "inactive" && (
					<button
						type="button"
						class="control-btn"
						onClick={handleRecorderStart}
					>
						<span>Start Recording</span>
					</button>
				)}

				{recorder?.state === "recording" && (
					<button
						type="button"
						class="control-btn"
						onClick={handleRecorderStop}
					>
						<span>Pause</span>
					</button>
				)}

				{recorder?.state === "paused" && (
					<div>
						<button
							type="button"
							class="control-btn"
							onClick={handleRecorderStart}
						>
							<span>Resume</span>
						</button>
						<button
							type="button"
							class="control-btn"
							onClick={handleRecorderStop}
						>
							<span>Save</span>
						</button>
					</div>
				)}
			</div>

			<div class="clip-list">
				<h3>Recordings</h3>
				<ul>
					{clips
						?.toSorted((a, b) => b.timestamp - a.timestamp)
						.map(({ timestamp, url }) => (
							<li key={url}>
								<div class="clip-item">
									<div class="clip-preview">
										{type.startsWith("video") ? (
											<video controls>
												<source src={url} type={type} />
											</video>
										) : (
											<audio controls>
												<source src={url} type={type} />
											</audio>
										)}
									</div>
									<div class="clip-actions">
										<a
											href={url}
											download={`recording-${timestamp}.${type.split("/")[0]}`}
										>
											<button type="button" class="download-btn">
												Download
											</button>
										</a>
										<button
											type="button"
											class="delete-btn"
											onClick={() =>
												setClips(clips.filter((c) => c.url !== url))
											}
										>
											Delete
										</button>
									</div>
								</div>
							</li>
						)) ?? <li>No Clips. Try recording a clip.</li>}
				</ul>
			</div>
		</div>
	)
}

export function App() {
	const videoRef = useRef<HTMLVideoElement>(null)
	const [stream, setStream] = useState<MediaStream | null>(null)
	const [error, setError] = useState<Error | null>(null)

	const handleError = useCallback(
		(e: unknown, prefix = "Unknown Error") => {
			const newError =
				e instanceof Error
					? e
					: new Error("Unknown error occurred while getting user's permission.")
			console.error(`[ERROR] :: ${prefix}`, newError)
			setError(newError)
		},
		[error, setError],
	)

	const handleDeviceSelection = useCallback(
		async (devices: SelectedDevices) => {
			const constraints: MediaStreamConstraints = {
				audio: devices.audioinput
					? { deviceId: { exact: devices.audioinput } }
					: true,
				video: devices.videoinput
					? {
							deviceId: { exact: devices.videoinput },
							width: 1280,
							height: 720,
						}
					: { width: 1280, height: 720 },
			}

			try {
				const stream = await navigator.mediaDevices.getUserMedia(constraints)
				if (videoRef.current) {
					videoRef.current.srcObject = stream
					await videoRef.current.play()
				}

				setStream(stream)
			} catch (e) {
				handleError(e)
			}
		},
		[stream, setStream],
	)

	return (
		<>
			{error && (
				<div class="error-banner">
					<p>Error: {error.message}</p>
					<button type="button" onClick={() => setError(null)}>
						Dismiss
					</button>
				</div>
			)}

			<div class="webcam-container">
				{!stream && (
					<DevicesForm
						onDevices={handleDeviceSelection}
						onError={handleError}
					/>
				)}

				<div class="preview-section">
					<figure>
						<video
							ref={videoRef}
							id="live-preview"
							autoPlay
							playsInline
							style={{ width: "100%", aspectRatio: "16/9" }}
						/>
						<figcaption>
							<div class="track-info">
								<div>
									<strong>Video Track:</strong>{" "}
									{stream?.getVideoTracks()[0]?.label || "Default"}
								</div>
								<div>
									<strong>Audio Track:</strong>{" "}
									{stream?.getAudioTracks()[0]?.label || "Default"}
								</div>
							</div>
						</figcaption>
					</figure>
				</div>

				{stream && (
					<div class="recorder-section">
						<Recorder stream={stream} type="video/webm" onError={handleError} />
						<Recorder stream={stream} type="audio/webm" onError={handleError} />
					</div>
				)}
			</div>
		</>
	)
}
