#!/usr/bin/env bun

import { cp, exists, mkdir, readdir, stat } from "node:fs/promises"
import { join } from "node:path"

const SRC_DIR = "src"
const DIST_DIR = "dist"
const PUBLIC_DIR = "public"
const TOOLS_DIR = join(DIST_DIR, "public", "tools")

async function getModules() {
	const modulesDir = join(SRC_DIR, "modules")
	const items = await readdir(modulesDir)
	const modules = []

	for (const item of items) {
		const dirPath = join(modulesDir, item)
		const stats = await stat(dirPath)
		if (stats.isDirectory()) {
			const entryPath = join(dirPath, "entry.tsx")
			if (await exists(entryPath)) {
				modules.push({
					name: item,
					entry: entryPath,
				})
			}
		}
	}
	return modules
}

async function main() {
	console.log("🏗️ Building application...")

	await mkdir(DIST_DIR, { recursive: true })
	await mkdir(TOOLS_DIR, { recursive: true })

	console.log("📦 Building server...")
	await Bun.build({
		entrypoints: [join(SRC_DIR, "index.ts")],
		outdir: DIST_DIR,
		target: "bun",
		minify: true,
		sourcemap: "external",
	})

	console.log("📂 Copying public assets...")
	await cp(PUBLIC_DIR, `${DIST_DIR}/public`, { recursive: true })

	console.log("🧩 Building client modules...")
	const modules = await getModules()
	for (const module of modules) {
		console.log(`  ↪ Building ${module.name}...`)
		await Bun.build({
			entrypoints: [module.entry],
			outdir: join(TOOLS_DIR, module.name),
			target: "browser",
			minify: true,
		})
	}

	console.log("✅ Build complete!")
}

main().catch((error) => {
	console.error("❌ Build failed:", error)
	process.exit(1)
})
