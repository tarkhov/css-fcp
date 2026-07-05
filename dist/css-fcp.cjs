/*! 
 * CSS FCP v0.1.0
 * Homepage (https://github.com/tarkhov/css-fcp)
 * Copyright 2026 Tarkhov
 * License: MIT
 */
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
let critical = require("critical");
let node_path = require("node:path");
let node_fs_promises = require("node:fs/promises");
let purgecss = require("purgecss");
//#region src/extractCritical.js
async function extractCritical_default(base, page, options = null) {
	if (!base) throw new Error("Base url not found.");
	if (!page?.url) throw new Error("Page url not found.");
	try {
		const url = new URL(page.url, base);
		const res = await fetch(url);
		if (!res.ok) throw new Error(`Error fetching page: ${url}`);
		const settings = { html: await res.text() };
		if (options !== null) Object.assign(settings, options);
		if (page?.options) Object.assign(settings, page.options);
		await (0, critical.generate)(settings);
	} catch (e) {
		console.error("Error:", e.message);
	}
}
//#endregion
//#region src/removeUnused.js
async function removeUnused_default(base, page, options = null) {
	if (!base) throw new Error("Base url not found.");
	if (!page?.url) throw new Error("Page url not found.");
	try {
		const url = new URL(page.url, base);
		const res = await fetch(url);
		if (!res.ok) throw new Error(`Error fetching page: ${url}`);
		const settings = { content: [{
			raw: await res.text(),
			extension: "html"
		}] };
		if (options !== null) Object.assign(settings, options);
		if (page?.options) Object.assign(settings, page.options);
		const results = await new purgecss.PurgeCSS().purge(settings);
		if (results?.length && settings?.output && (0, node_path.extname)(settings.output)) {
			const css = results.map((item) => item.css).join("");
			await (0, node_fs_promises.writeFile)(settings.output, css, { flag: "w" });
		}
	} catch (e) {
		console.error("Error:", e.message);
	}
}
//#endregion
exports.extractCritical = extractCritical_default;
exports.removeUnused = removeUnused_default;
