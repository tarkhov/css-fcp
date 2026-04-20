/*! 
 * CSS FCP v0.1.0
 * Homepage (https://github.com/tarkhov/css-fcp)
 * Copyright 2026 Tarkhov
 * License: MIT
 */
//#region src/extractCritical.js
async function extractCritical_default(pages, options = {
	siteUrl: null,
	basePath: null,
	targetPath: "./critical",
	uncritPath: null,
	cssPath: null,
	assetsUrl: null,
	width: 2e3,
	height: 1080
}) {
	if (!pages?.length) throw new Error("Pages not found.");
	if (!options?.siteUrl) throw new Error("Site url not found.");
	const { join } = await import("node:path");
	const { generate } = await import("critical");
	for (const page of pages) try {
		const url = new URL(page.url, options.siteUrl);
		const res = await fetch(url);
		if (!res.ok) throw new Error(`Error fetching page: ${url}`);
		const settings = { html: await res.text() };
		if (options?.basePath) settings.base = options.basePath;
		settings.target = {};
		if (options?.targetPath) settings.target.css = join(options.targetPath, `${page.name}.css`);
		if (options?.uncritPath) settings.target.uncritical = join(options.uncritPath, `${page.name}.css`);
		if (options?.cssPath) settings.css = [join(options.cssPath, `${page.name}.css`)];
		if (options?.width) settings.width = options.width;
		if (options?.height) settings.height = options.height;
		if (options?.assetsUrl) settings.rebase = (asset) => `${options.assetsUrl}${asset.absolutePath}`;
		if (page?.options) Object.assign(settings, page.options);
		await generate(settings);
		console.log("Done:", page.name);
	} catch (e) {
		console.error("Error:", e.message);
	}
}
//#endregion
//#region src/removeUnused.js
async function removeUnused_default(pages, options = {
	siteUrl: null,
	cssPath: null,
	outputPath: null,
	targetPath: null
}) {
	if (!pages?.length) throw new Error("Pages not found.");
	if (!options?.siteUrl) throw new Error("Site url not found.");
	const { join } = await import("node:path");
	const { writeFile } = await import("node:fs/promises");
	const { PurgeCSS } = await import("purgecss");
	for (const page of pages) try {
		const url = new URL(page.url, options.siteUrl);
		const res = await fetch(url);
		if (!res.ok) throw new Error(`Error fetching page: ${url}`);
		const settings = { content: [{
			raw: await res.text(),
			extension: "html"
		}] };
		if (options?.cssPath) settings.css = [join(options.cssPath, `${page.name}.css`)];
		if (options?.outputPath) settings.output = options.outputPath;
		if (page?.options) Object.assign(settings, page.options);
		const result = await new PurgeCSS().purge(settings);
		if (result?.length && options?.targetPath) {
			const css = result.map((item) => item.css).join("");
			await writeFile(join(options.targetPath, `${page.name}.css`), css, { flag: "w" });
		}
		console.log("Done:", page.name);
	} catch (e) {
		console.error("Error:", e.message);
	}
}
//#endregion
export { extractCritical_default as extractCritical, removeUnused_default as removeUnused };
