import { describe, test } from "node:test";
import { equal, throws } from "node:assert/strict";

import { contentTypeIs } from "./index.ts";

const cases: [string, [string, boolean][]][] = [
	[
		"html",
		[
			["text/html", true],
			["text/html; charset=utf-8", true],
			["TEXT/HTML", true],
			["application/json", false],
			["text/plain", false],
		],
	],
	[
		"json",
		[
			["application/json", true],
			["application/ld+json", true],
			["Application/Json", true],
			["application/json; charset=utf-8", true],
			["text/plain", false],
			["text/html", false],
		],
	],
	[
		"plain",
		[
			["text/plain", true],
			["text/plain; charset=utf-8", true],
			["TEXT/PLAIN", true],
			["application/json", false],
			["text/html", false],
		],
	],
	[
		"image",
		[
			["image/png", true],
			["image/jpeg", true],
			["image/svg+xml", true],
			["image/webp", true],
			["IMAGE/PNG", true],
			["text/plain", false],
			["application/json", false],
		],
	],
	[
		"xml",
		[
			["application/xml", true],
			["text/xml", true],
			["application/rss+xml", true],
			["application/atom+xml", true],
			["APPLICATION/XML", true],
			["application/json", false],
			["text/html", false],
		],
	],
	[
		"javascript",
		[
			["application/javascript", true],
			["text/javascript", true],
			["application/ecmascript", true],
			["text/ecmascript", true],
			["APPLICATION/JAVASCRIPT", true],
			["text/css", false],
			["application/json", false],
		],
	],
	[
		"css",
		[
			["text/css", true],
			["TEXT/CSS", true],
			["text/css; charset=utf-8", true],
			["text/javascript", false],
			["application/json", false],
		],
	],
	[
		"stream",
		[
			["text/event-stream", true],
			["application/octet-stream", true],
			["TEXT/EVENT-STREAM", true],
			["APPLICATION/OCTET-STREAM", true],
			["text/plain", false],
			["application/json", false],
		],
	],
	[
		"pdf",
		[
			["application/pdf", true],
			["APPLICATION/PDF", true],
			["application/pdf; charset=utf-8", true],
			["application/json", false],
			["text/plain", false],
		],
	],
	[
		"video",
		[
			["video/mp4", true],
			["video/webm", true],
			["video/avi", true],
			["VIDEO/MP4", true],
			["audio/mp3", false],
			["application/json", false],
		],
	],
	[
		"audio",
		[
			["audio/mp3", true],
			["audio/wav", true],
			["audio/ogg", true],
			["AUDIO/MP3", true],
			["video/mp4", false],
			["application/json", false],
		],
	],
	[
		"binary",
		[
			["application/octet-stream", true],
			["APPLICATION/OCTET-STREAM", true],
			["text/plain", false],
			["application/json", false],
		],
	],
	[
		"form",
		[
			["application/x-www-form-urlencoded", true],
			["APPLICATION/X-WWW-FORM-URLENCODED", true],
			["application/json", false],
			["text/plain", false],
		],
	],
	[
		"multipart",
		[
			["multipart/form-data", true],
			["multipart/mixed", true],
			["multipart/alternative", true],
			["MULTIPART/FORM-DATA", true],
			["application/json", false],
			["text/plain", false],
		],
	],
];

describe("contentTypeIs", () => {
	cases.forEach(([type, testCases]) =>
		describe(`${type} content type detection`, () =>
			testCases.forEach(([contentTypeString, expected]) => {
				test(`should ${expected ? "" : "not "}return "${type}" for content type "${contentTypeString}"`, () => {
					const response = new Response("", {
						headers: new Headers([["content-type", contentTypeString]]),
					});
					equal(
						contentTypeIs(response)[type],
						expected,
						`Failed for content-type: ${contentTypeString}`,
					);
					equal(
						contentTypeIs(response).not[type],
						!expected,
						`Failed for content-type: ${contentTypeString} (.not)`,
					);
					equal(
						contentTypeIs(response).not.not[type],
						expected,
						`Failed for content-type: ${contentTypeString} (.not.not)`,
					);
				});
			})),
	);
	test("Request", () => {
		const request = new Request("https://example.com", {
			method: "POST",
			headers: new Headers([["content-type", "application/json"]]),
			body: JSON.stringify({ test: true }),
		});
		const requestChecker = contentTypeIs(request);
		equal(requestChecker.json, true);
	});

	describe("memoization", () => {
		test("should memoize results for the same response", () => {
			const response = new Response("", {
				headers: new Headers([["content-type", "application/json"]]),
			});
			const responseChecker = contentTypeIs(response);
			equal(responseChecker.json, true);
			response.headers.set("content-type", "text/html");
			equal(responseChecker.json, true);
		});

		test("should return the same contentType object for the same response", () => {
			const response = new Response("", {
				headers: new Headers([["content-type", "application/json"]]),
			});
			const checker1 = contentTypeIs(response);
			const checker2 = contentTypeIs(response);
			equal(checker1, checker2);
		});
	});
	describe("edge cases", () => {
		test("should handle responses without content-type header", () => {
			const response = new Response("");
			response.headers.delete("content-type"); // defaults to plain in some environments

			equal(contentTypeIs(response).html, false);
			equal(contentTypeIs(response).json, false);
			equal(contentTypeIs(response).plain, false);
		});

		test("should throw RangeError for unsupported property access", () => {
			const response = new Response("", {
				headers: new Headers([["content-type", "application/json"]]),
			});

			throws(() => {
				(contentTypeIs(response) as any).unsupportedType;
			}, RangeError);

			throws(() => {
				(contentTypeIs(response) as any).unsupportedType;
			}, /contentTypeIs does not support unsupportedType/);

			throws(() => {
				(contentTypeIs(response) as any).not.unsupportedType;
			}, /contentTypeIs does not support unsupportedType/);
		});
	});
});
