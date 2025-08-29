/**
 * Use weakmap to allow for the memoized response/request access to be garbage collected
 */
const contentTypeMap = new WeakMap<object, Is>();

/**
 * Type check logic on "content-type" header
 */
const checkers = new Map<string, (contentType: string) => boolean>([
	["html", (contentType) => /^text\/html/i.test(contentType)],
	["json", (contentType) => /^application\/(json|ld\+json)/i.test(contentType)],
	["plain", (contentType) => /^text\/plain/i.test(contentType)],
	["image", (contentType) => /^image\//i.test(contentType)],
	[
		"xml",
		(contentType) => /^(application|text)\/(?:\w+\+)?xml/i.test(contentType),
	],
	[
		"javascript",
		(contentType) =>
			/^(application|text)\/(javascript|ecmascript)/i.test(contentType),
	],
	["css", (contentType) => /^text\/css/i.test(contentType)],
	[
		"stream",
		(contentType) =>
			/^(text\/event-stream|application\/octet-stream)/i.test(contentType),
	],
	["pdf", (contentType) => /^application\/pdf/i.test(contentType)],
	["video", (contentType) => /^video\//i.test(contentType)],
	["audio", (contentType) => /^audio\//i.test(contentType)],
	["binary", (contentType) => /^application\/octet-stream/i.test(contentType)],
	[
		"form",
		(contentType) => /^application\/x-www-form-urlencoded/i.test(contentType),
	],
	["multipart", (contentType) => /^multipart\//i.test(contentType)],
]);

export interface Is {
	get html(): boolean;
	get json(): boolean;
	get plain(): boolean;
	get image(): boolean;
	get xml(): boolean;
	get javascript(): boolean;
	get css(): boolean;
	get stream(): boolean;
	get pdf(): boolean;
	get video(): boolean;
	get audio(): boolean;
	get binary(): boolean;
	get form(): boolean;
	get multipart(): boolean;
	readonly not: Is;
}

/**
 * Returns an Is object that can be used to determine what type of content this is
 */
function memoizedContentTypeChecker(obj: Request | Response): Is {
	const contentType = obj.headers.get("content-type")?.toLowerCase() || "";
	const types = new Map<string, boolean>();

	const handler: ProxyHandler<Is> = {
		get(target, prop: string | symbol, receiver: Is): Boolean | Is {
			if (prop === "not") {
				return new Proxy(target, {
					get(_t, p: string | symbol) {
						return p === "not" ? receiver : !receiver[p];
					},
				});
			}
			if (typeof prop !== "string") return false;
			const existing = types.get(prop);
			if (typeof existing === "boolean") return existing;
			const checker = checkers.get(prop);
			if (!checker)
				throw new RangeError(`contentTypeIs does not support ${prop}`);
			const result = checker(contentType);
			types.set(prop, result);
			return result;
		},
	};

	return new Proxy({} as Is, handler);
}

/**
 * Memoisation logic wrapper for the responses/requests and their respective ContentType API
 */
export function contentTypeIs(obj: Request | Response): Is {
	let contentTypeInterface = contentTypeMap.get(obj);

	if (!contentTypeInterface) {
		contentTypeInterface = memoizedContentTypeChecker(obj);
		contentTypeMap.set(obj, contentTypeInterface);
	}

	return contentTypeInterface;
}
