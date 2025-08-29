import { describe, test } from "node:test";
import { equal, throws } from "node:assert/strict";
import { wants } from "./index.ts";

const cases: [string, string, boolean][] = [
	["any", "*/*", true],
	["css", "text/css,*/*;q=0.1", true],
	[
		"html",
		"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
		true,
	],
	["html", "application/xhtml+xml", true],
	[
		"xml",
		"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
		true,
	],
	["xml", "application/xml;q=0.9", true],
	["xml", "application/xhtml+xml", true],
	["json", "application/json", true],
	["json", "application/json;q=0.9,text/plain", true],
	[
		"image",
		"image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
		true,
	],
	["grpc", "application/grpc-web-text", true],
	["html", "*/*", false],
	["json", "application/js", false],
	["html", "multipart/mixed;deferSpec=20220824", false],
	["stream", "application/octet-stream", true],
];

describe("wants", (): void => {
	cases.forEach(([getter, accept, matches]) =>
		test(`${getter} request`, (): void => {
			const request = new Request("https://website.net", {
				headers: new Headers([["accept", accept]]),
			});
			const whatItWants = wants(request);
			equal(whatItWants[getter], matches);
			equal(whatItWants.not[getter], !matches);
			equal(whatItWants.not.not[getter], matches);
			request.headers.set("accept", "something/else");
			equal(whatItWants[getter], matches);
		}),
	);
	test("property is not supported", () => {
		const request = new Request("https://website.net", {
			headers: new Headers([["accept", "*/*"]]),
		});
		const whatItWants = wants(request);
		throws(() => whatItWants["unsupported" as any], {
			name: "RangeError",
			message: "Wants does not support unsupported",
		});
		throws(() => whatItWants.not["unsupported" as any], {
			name: "RangeError",
			message: "Wants does not support unsupported",
		});
	});
});
