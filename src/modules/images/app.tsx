import { useState } from "hono/jsx/dom"

export function App() {
	const [imageUrl, setImageUrl] = useState<string | null>(null)
	const [quality, setQuality] = useState<number>(80)
	const [processing, setProcessing] = useState(false)
	const [error, setError] = useState<string | null>(null)

	async function handleSubmit(e: Event) {
		e.preventDefault()
		setError(null)
		setProcessing(true)

		const form = e.currentTarget as HTMLFormElement
		const formData = new FormData(form)

		try {
			const response = await fetch(form.action, {
				method: form.method,
				body: formData,
			})

			if (!response.ok) {
				throw new Error(await response.text())
			}

			const blob = await response.blob()
			const url = URL.createObjectURL(blob)
			setImageUrl(url)
			form.reset()
		} catch (err) {
			setError(err instanceof Error ? err.message : "Processing failed")
		} finally {
			setProcessing(false)
		}
	}

	return (
		<div class="container">
			<form
				method="post"
				action="/api/v1/images"
				enctype="multipart/form-data"
				onSubmit={handleSubmit}
			>
				<fieldset>
					<legend>Upload Image</legend>
					<label for="file" class="file-input">
						{imageUrl ? "Replace file" : "Choose a file"}
						<input
							required
							accept="image/*"
							name="file"
							id="file"
							type="file"
							onChange={() => setImageUrl(null)}
						/>
					</label>
				</fieldset>

				<fieldset class="settings-grid">
					<label for="quality">
						Quality
						<input
							required
							name="quality"
							id="quality"
							type="range"
							min="0"
							max="100"
							list="quality-stops"
							value={quality}
							onChange={(e) =>
								setQuality(Number((e.target as HTMLInputElement)?.value))
							}
						/>
						<datalist id="quality-stops">
							<option>25</option>
							<option>50</option>
							<option>75</option>
							<option>100</option>
						</datalist>
						<output for="quality" class="value">
							{quality}
						</output>
					</label>
				</fieldset>

				<fieldset>
					<legend>Adjust Size</legend>
					<div class="settings-grid">
						<label for="width">
							Width (px)
							<input
								required
								name="width"
								id="width"
								type="number"
								min="0"
								max="1200"
								value="640"
							/>
						</label>

						<label for="height">
							Height (px)
							<input
								required
								name="height"
								id="height"
								type="number"
								min="0"
								max="1200"
								value="480"
							/>
						</label>
					</div>
				</fieldset>

				<fieldset class="settings-grid">
					<label>
						Aspect Ratio
						<select name="fit">
							<option value="cover">Cover</option>
							<option value="contain">Contain</option>
							<option value="fill">Fill</option>
							<option value="inside">Inside</option>
							<option value="outside">Outside</option>
						</select>
					</label>
				</fieldset>

				<div class="actions">
					<button type="reset" disabled={processing}>
						Reset
					</button>
					<button type="submit" disabled={processing}>
						{processing ? "Processing..." : "Optimize"}
					</button>
				</div>
			</form>

			{error && <div class="error">{error}</div>}

			{imageUrl && (
				<div class="preview">
					<img
						src={imageUrl}
						alt="Optimized preview"
						style={{ maxWidth: "100%", aspectRatio: "auto" }}
					/>
					<a
						href={imageUrl}
						download="optimized-image.jpg"
						class="download-btn"
					>
						Download
					</a>
				</div>
			)}
		</div>
	)
}
