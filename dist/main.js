/*! 
 * CSS FCP v0.1.0
 * Homepage (https://github.com/tarkhov/css-fcp)
 * Copyright 2026 Tarkhov
 * License: MIT
 */
import http from "node:http";
import https from "node:https";
import { generate } from "critical";
import { PurgeCSS } from "purgecss";
//#region src/extractCritical.js
function extractCritical_default(pages, options = {
	siteUrl: null,
	baseDir: null,
	targetDir: "critical",
	uncritical: false,
	assetsUrl: null,
	width: 2e3,
	height: 1080
}) {
	if (!pages?.length) throw new Error("Pages not found.");
	if (!options?.siteUrl) throw new Error("Site url not found.");
	function parseUrl(url, page) {
		let html = "";
		url.on("data", (chunk) => {
			html += chunk.toString().trim();
		}).on("end", async () => {
			const settings = { html };
			if (!page.options?.base && options?.baseDir) settings.base = options.baseDir;
			if (!page.options?.target) {
				settings.target = {};
				if (options?.targetDir) settings.target.css = `${options.targetDir}/${page.name}.css`;
				if (options?.uncritical) settings.target.uncritical = `${page.name}.css`;
			}
			if (!page.options?.width && options?.width) settings.width = options.width;
			if (!page.options?.height && options?.height) settings.height = options.height;
			if (!page.options?.rebase && options?.assetsUrl) settings.rebase = (asset) => `${options.assetsUrl}${asset.absolutePath}`;
			Object.assign(settings, page.options);
			await generate(settings);
			console.log(`Done - ${page.name}.`);
		});
	}
	pages.forEach((page) => {
		if (!page?.options) throw new Error("Page options not found.");
		try {
			const url = new URL(`${options.siteUrl}${page.url}`);
			if (url.protocol === "https:") https.get(url, (url) => {
				parseUrl(url, page);
			}).on("error", console.error);
			else if (url.protocol === "http:") http.get(url, (url) => {
				parseUrl(url, page);
			}).on("error", console.error);
			else console.error("URL protocol not supported.");
		} catch (e) {
			console.error("Failed to parse url.", e.message);
		}
	});
}
//#endregion
//#region src/removeUnused.js
function removeUnused_default(pages, options = {
	siteUrl: null,
	cssPath: null,
	outputDir: null
}) {
	if (!pages?.length) throw new Error("Pages not found.");
	if (!options?.siteUrl) throw new Error("Site url not found.");
	function parseUrl(url, page) {
		let html = "";
		url.on("data", (chunk) => {
			html += chunk.toString().trim();
		}).on("end", async () => {
			const settings = { content: [{
				raw: html,
				extension: "html"
			}] };
			if (!page.options?.css && options?.cssPath) settings.css = [`${options.cssPath}${page.name}.css`];
			if (!page.options?.output && options?.outputDir) settings.output = options.outputDir;
			if (page?.options) Object.assign(settings, page.options);
			try {
				await new PurgeCSS().purge(settings);
				console.log(`Done - ${page.name}.`);
			} catch (e) {
				console.error("Failed to purge page css.", e.message);
			}
		});
	}
	pages.forEach((page) => {
		try {
			const url = new URL(`${options.siteUrl}${page.url}`);
			if (url.protocol === "https:") https.get(url, (url) => {
				parseUrl(url, page);
			}).on("error", console.error);
			else if (url.protocol === "http:") http.get(url, (url) => {
				parseUrl(url, page);
			}).on("error", console.error);
			else console.error("URL protocol not supported.");
		} catch (e) {
			console.error("Failed to parse url.", e.message);
		}
	});
}
//#endregion
export { extractCritical_default as extractCritical, removeUnused_default as removeUnused };
