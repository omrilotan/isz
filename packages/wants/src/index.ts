/**
 * Use weakmap to allow for the memoized request access to be garbage collected
 */
const requestMap = new WeakMap<Request, Wants>();

/**
 * Type check logic on request "accept" header
 */
const checkers = new Map<string, (values: string[]) => boolean>([
	["any", (values) => values.includes("*/*")],
	["css", (values) => values.includes("text/css")],
	[
		"html",
		(values) =>
			values.some((value) => /(?:application|text)\/x?html/.test(value)),
	],
	["image", (values) => values.some((value) => /^image\//.test(value))],
	[
		"json",
		(values) => values.some((value) => /^application\/json/.test(value)),
	],
	[
		"grpc",
		(values) => values.some((value) => /^application\/grpc/.test(value)),
	],
	[
		"stream",
		(values) =>
			values.some((value) =>
				/^(text\/event-stream|application\/octet-stream)/.test(value),
			),
	],
	[
		"xml",
		(values) =>
			values.some((value) => /application\/(?:\w+\+)?xml/.test(value)),
	],
]);

export interface Wants {
	get any(): boolean;
	get css(): boolean;
	get html(): boolean;
	get image(): boolean;
	get json(): boolean;
	get grpc(): boolean;
	get stream(): boolean;
	get xml(): boolean;
	readonly not: Wants;
}

/**
 * Returns a Wants object that can be used to determine what type of response is wanted
 */
function memoizedRequestAccess(request: Request): Wants {
	const values =
		request.headers
			?.get("accept")
			?.split(",")
			.map((string: string): string => string.trim()) || [];
	const types = new Map<string, boolean>();
	const handler: ProxyHandler<Wants> = {
		get(target, prop: string | symbol, receiver: Wants): boolean | Wants {
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
			if (!checker) throw new RangeError(`Wants does not support ${prop}`);
			const result = checker(values);

			types.set("prop", result);
			return result;
		},
	};
	return new Proxy<Wants>({} as Wants, handler);
}

/**
 * Memoisation logic wrapper for the requests and their respective Wants API
 */
export function wants(request: Request): Wants {
	let wantsInterface = requestMap.get(request);

	if (!wantsInterface) {
		wantsInterface = memoizedRequestAccess(request);
		requestMap.set(request, wantsInterface);
	}
	return wantsInterface;
}
