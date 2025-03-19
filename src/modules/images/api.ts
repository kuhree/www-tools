import type { AppEnv } from "@/types"
import { AppError } from "@/utils/error"
import { sendError } from "@/utils/response"
import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import sharp from "sharp"
import { z } from "zod"

export const imagesApi = new Hono<AppEnv>().post(
	"/",
	zValidator(
		"form",
		z.object({
			height: z.coerce
				.number({ required_error: "Height is required" })
				.min(1, "Height must be >= 1")
				.max(4096, "Height must be <= 4096")
				.default(64),
			width: z.coerce
				.number({ required_error: "Width is required" })
				.min(1, "Width must be >= 1")
				.max(4096, "Width must be <= 4096")
				.default(64),
			quality: z.coerce
				.number({ required_error: "Quality is required" })
				.min(1, "Quality must be >= 1")
				.max(100, "Quality must be <= 100")
				.default(64),
			fit: z
				.enum(["contain", "cover", "fill", "inside", "outside"], {
					required_error: "Fit is required",
				})
				.default("contain"),
			format: z
				.enum(
					[
						"avif",
						"dz",
						"fits",
						"gif",
						"heif",
						"input",
						"jpeg",
						"jpg",
						"jp2",
						"jxl",
						"magick",
						"openslide",
						"pdf",
						"png",
						"ppm",
						"raw",
						"svg",
						"tiff",
						"tif",
						"v",
						"webp",
					],
					{ required_error: "Format is required" },
				)
				.default("png"),
		}),
		(result, c) => {
			if (result.success) return
			return sendError(c, result.error)
		},
	),
	async (c) => {
		const { height, width, quality, format, fit } = c.req.valid("form")
		const body = await c.req.parseBody()
		const file = body.file
		if (!file) {
			throw new AppError(
				"VALIDATION_ERROR",
				"File was not found. Please upload a file and try again.",
			)
		}

		if (typeof file === "string") {
			throw new AppError(
				"VALIDATION_ERROR",
				"Invalid file format. Please upload a valid file format and try again.",
			)
		}

		const buffer = await file.arrayBuffer()
		if (buffer.byteLength <= 0) {
			throw new AppError(
				"VALIDATION_ERROR",
				"File is empty. Please upload a non-empty file and try again.",
			)
		}

		const image = await sharp(buffer)
			.resize(width, height, { fit, withoutEnlargement: true })
			.toFormat(format, { quality })
			.toBuffer()

		return c.body(image, 200, {
			"Content-Type": `image/${format}`,
			"Cache-Control": "public, max-age=31536000, immutable",
		})
	},
)
