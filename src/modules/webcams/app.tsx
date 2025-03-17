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
		<form onSubmit={handleFormSubmit}>
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
												checked={idx === 0}
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
		<div class="my-0">
			<h2>Clips ({type.split("/")[0]?.toUpperCase()})</h2>

			<div class="grid">
				{recorder?.state === "inactive" ? (
					<button type="button" onClick={handleRecorderStart}>
						Start Recording
					</button>
				) : null}

				{recorder?.state === "recording" ? (
					<button type="button" onClick={handleRecorderStop}>
						Pause
					</button>
				) : null}

				{recorder?.state === "paused" ? (
					<>
						<button type="button" onClick={handleRecorderStart}>
							Resume
						</button>
						<button type="button" onClick={handleRecorderStop}>
							Save
						</button>
					</>
				) : null}
			</div>

			<ul>
				{clips
					?.toSorted((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
					.map(({ url }) => (
						<li key={url}>
							<h3>{url.split("/").at(-1)}</h3>

							{type.toLowerCase().startsWith("audio") ? (
								<div>
									<audio controls>
										<source src={url} type="audio/mpeg" />
										<source src={url} type="audio/ogg; codecs=opus" />
										<source src={url} type="audio/ogg; codecs=vorbis" />
										<source src={url} type={type} />
									</audio>

									<p>
										Download{" "}
										<a href={url} download={`${url.split("/").at(-1)}.mp3`}>
											MP3
										</a>{" "}
										or{" "}
										<a href={url} download={`${url.split("/").at(-1)}.ogg`}>
											OGG
										</a>
									</p>
								</div>
							) : (
								<div>
									<video controls>
										<source src={url} type="video/mp4" />
										<source src={url} type="video/ogg; codecs=opus" />
										<source src={url} type="video/ogg; codecs=vorbis" />
										<source src={url} type={type} />
									</video>

									<p>
										Download{" "}
										<a href={url} download={`${url.split("/").at(-1)}.mp4`}>
											MP4
										</a>{" "}
										or{" "}
										<a href={url} download={`${url.split("/").at(-1)}.ogg`}>
											OGG
										</a>
									</p>
								</div>
							)}
						</li>
					)) ?? <li>No Clips. Try recording a clip.</li>}
			</ul>
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
					: new Error("Unknown error occured while getting user's permission.")
			console.error(`[ERROR] :: ${prefix}`, newError)
			setError(newError)
		},
		[error, setError],
	)

	const handleDeviceSelection = useCallback(
		async (devices: SelectedDevices) => {
			const contstraints: MediaStreamConstraints = {
				audio: devices.audioinput ? { deviceId: [devices.audioinput] } : true,
				video: devices.videoinput ? { deviceId: [devices.videoinput] } : true,
			}

			try {
				const stream = await navigator.mediaDevices.getUserMedia(contstraints)
				if (videoRef.current) {
					videoRef.current.srcObject = stream
					videoRef.current.play()
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
			{error ? (
				<div>
					<p>Error {error?.message}</p>
				</div>
			) : null}

			{!stream ? (
				<DevicesForm onDevices={handleDeviceSelection} onError={handleError} />
			) : null}

			<figure>
				<video ref={videoRef} id="live-preview" autoplay />

				<figcaption>
					<ul>
						<li>
							Video Tracks
							<ul>
								{stream?.getVideoTracks().map((track) => (
									<li
										key={`video_${track.id}`}
										data-track-id={track.id}
										data-track-kind={track.kind}
									>
										{track.label}
									</li>
								)) ?? <li>No Video Tracks found.</li>}
							</ul>
						</li>

						<li>
							Audio Tracks
							<ul>
								{stream?.getAudioTracks().map((track) => (
									<li
										key={`audio_${track.id}`}
										data-track-id={track.id}
										data-track-kind={track.kind}
									>
										{track.label}
									</li>
								)) ?? <li>No Audio Tracks found.</li>}
							</ul>
						</li>
					</ul>
				</figcaption>
			</figure>

			{stream ? (
				<div class="grid">
					<Recorder
						stream={stream}
						type="video/ogg; codecs=opus"
						onError={handleError}
					/>
					<Recorder
						stream={stream}
						type="audio/ogg; codecs=opus"
						onError={handleError}
					/>
				</div>
			) : null}
		</>
	)
}
