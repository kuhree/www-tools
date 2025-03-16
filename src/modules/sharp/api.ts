import type { AppEnv } from "@/types"
import { sendError } from "@/utils/response"
import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import sharp from "sharp"
import { z } from "zod"

export const sharpApi = new Hono<AppEnv>()

sharpApi.get(
	"/image",
	zValidator(
		"query",
		z.object({
			height: z.coerce.number().min(1).max(4096),
			width: z.coerce.number().min(1).max(4096),
			quality: z.coerce.number().min(1).max(100),
			fit: z.enum(["contain", "cover", "fill", "inside", "outside"]),
			format: z.enum([
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
			]),
		}),
	),
	async (c) => {
		const { height, width, quality, format, fit } = c.req.valid("query")
		const body = await c.req.parseBody()
		const file = body.file
		if (!file) {
			return c.text("Empty file", 400)
		}

		if (typeof file === "string") {
			return c.text(
				"Invalid file format. Please upload a valid file format and try again.",
				400,
			)
		}

		try {
			const buffer = await file.arrayBuffer()
			if (buffer.byteLength <= 0) {
				return c.text(
					"Image is empty. Please upload a valid image and try again.",
					400,
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
		} catch (error) {
			return sendError(c, error)
		}
	},
)
