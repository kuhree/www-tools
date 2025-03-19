import { useState } from "hono/jsx/dom"

export function App() {
	const [imageUrl, setImageUrl] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)

	async function handleSubmit(e: Event) {
		e.preventDefault()
		setError(null)

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
			setError(err instanceof Error ? err.message : "Failed to process image")
		}
	}

	async function clearImage() {
		if (!imageUrl) return
		URL.revokeObjectURL(imageUrl)
		setImageUrl(null)
	}

	return (
		<>
			<form
				method="post"
				action="/api/v1/images"
				enctype="multipart/form-data"
				onSubmit={handleSubmit}
			>
				<label for="file">
					Upload file
					<input required accept="image/*" name="file" id="file" type="file" />
				</label>

				<fieldset>
					<legend>Select Transformation Options:</legend>

					<div class="grid">
						<label for="quality">
							Quality
							<input
								required
								name="quality"
								id="quality"
								type="number"
								min="0"
								max="100"
								value="80"
							/>
						</label>

						<label for="height">
							Height
							<input
								required
								name="height"
								id="height"
								type="number"
								min="0"
								max="1200"
								value="64"
							/>
						</label>

						<label for="width">
							Width
							<input
								required
								name="width"
								id="width"
								type="number"
								min="0"
								max="1200"
								value="64"
							/>
						</label>
					</div>
				</fieldset>

				<fieldset>
					<legend>Select a fit:</legend>

					<div>
						{["cover", "contain", "fit", "inside", "outside"].map(
							(opt, idx) => (
								<label key={opt} for={`fit_${opt}`}>
									<input
										required
										type="radio"
										name="fit"
										id={`fit_${opt}`}
										key={opt}
										value={opt}
										checked={idx === 0}
									/>
									{opt}
								</label>
							),
						)}
					</div>
				</fieldset>

				<div class="actions">
					<button type="reset">Reset Form</button>
					<button type="submit">Optimize Image</button>
				</div>
			</form>

			{error && <p class="error-message">Error: {error}</p>}

			{imageUrl && (
				<>
					<hr />
					<div class="image-preview">
						<h3>Converted Image:</h3>
						<img
							src={imageUrl}
							alt="Converted result"
							style={{ maxWidth: "100%", height: "auto" }}
						/>
						<div class="actions">
							<button type="button" onClick={clearImage}>
								Clear Image
							</button>

							<a class="hidden" id="image-download" href={imageUrl} download>
								Download Image
							</a>
						</div>
					</div>
				</>
			)}
		</>
	)
}
