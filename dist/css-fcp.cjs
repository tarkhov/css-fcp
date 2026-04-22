/*! 
 * CSS FCP v0.1.0
 * Homepage (https://github.com/tarkhov/css-fcp)
 * Copyright 2026 Tarkhov
 * License: MIT
 */
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
//#region src/extractCritical.js
async function extractCritical_default(base, pages, options = null) {
	if (!base) throw new Error("Base url not found.");
	if (!pages?.length) throw new Error("Pages not found.");
	const { generate } = await import("critical");
	for (const page of pages) try {
		if (!page?.url) throw new Error("Page url not found.");
		const url = new URL(page.url, base);
		const res = await fetch(url);
		if (!res.ok) throw new Error(`Error fetching page: ${url}`);
		const settings = { html: await res.text() };
		if (options) Object.assign(settings, typeof options === "function" ? options(page) : options);
		if (page?.options) Object.assign(settings, page.options);
		await generate(settings);
		console.log("Done:", page.name);
	} catch (e) {
		console.error("Error:", e.message);
	}
}
//#endregion
//#region src/removeUnused.js
async function removeUnused_default(base, pages, options = null) {
	if (!base) throw new Error("Base url not found.");
	if (!pages?.length) throw new Error("Pages not found.");
	const { extname } = await import("node:path");
	const { writeFile } = await import("node:fs/promises");
	const { PurgeCSS } = await import("purgecss");
	for (const page of pages) try {
		if (!page?.url) throw new Error("Page url not found.");
		const url = new URL(page.url, base);
		const res = await fetch(url);
		if (!res.ok) throw new Error(`Error fetching page: ${url}`);
		const settings = { content: [{
			raw: await res.text(),
			extension: "html"
		}] };
		if (options) Object.assign(settings, typeof options === "function" ? options(page) : options);
		if (page?.options) Object.assign(settings, page.options);
		const results = await new PurgeCSS().purge(settings);
		if (results?.length && settings?.output && extname(settings.output)) {
			const css = results.map((item) => item.css).join("");
			await writeFile(settings.output, css, { flag: "w" });
		}
		console.log("Done:", page.name);
	} catch (e) {
		console.error("Error:", e.message);
	}
}
//#endregion
exports.extractCritical = extractCritical_default;
exports.removeUnused = removeUnused_default;
