/*! 
 * CSS FCP v0.1.0
 * Homepage (https://github.com/tarkhov/css-fcp)
 * Copyright 2026 Tarkhov
 * License: MIT
 */
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
//#endregion
let node_http = require("node:http");
node_http = __toESM(node_http, 1);
let node_https = require("node:https");
node_https = __toESM(node_https, 1);
let critical = require("critical");
let purgecss = require("purgecss");
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
			await (0, critical.generate)(settings);
			console.log(`Done - ${page.name}.`);
		});
	}
	pages.forEach((page) => {
		if (!page?.options) throw new Error("Page options not found.");
		try {
			const url = new URL(`${options.siteUrl}${page.url}`);
			if (url.protocol === "https:") node_https.default.get(url, (url) => {
				parseUrl(url, page);
			}).on("error", console.error);
			else if (url.protocol === "http:") node_http.default.get(url, (url) => {
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
				await new purgecss.PurgeCSS().purge(settings);
				console.log(`Done - ${page.name}.`);
			} catch (e) {
				console.error("Failed to purge page css.", e.message);
			}
		});
	}
	pages.forEach((page) => {
		try {
			const url = new URL(`${options.siteUrl}${page.url}`);
			if (url.protocol === "https:") node_https.default.get(url, (url) => {
				parseUrl(url, page);
			}).on("error", console.error);
			else if (url.protocol === "http:") node_http.default.get(url, (url) => {
				parseUrl(url, page);
			}).on("error", console.error);
			else console.error("URL protocol not supported.");
		} catch (e) {
			console.error("Failed to parse url.", e.message);
		}
	});
}
//#endregion
exports.extractCritical = extractCritical_default;
exports.removeUnused = removeUnused_default;
