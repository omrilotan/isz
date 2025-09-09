const MAX_DECODE_ROUNDS = 4; // %25-nesting and split-nibble tricks

type Options = {
	/**
	 * Maximum number of decode iterations to perform.
	 * Default: 4
	 */
	maxIterations?: number;
};

/**
 * Check for path traversal attempts in the given pathname.
 */
export function containsPathTraversal(
	pathname: string,
	{ maxIterations }: Options = {
		maxIterations: MAX_DECODE_ROUNDS,
	},
): boolean {
	return recursiveDecode(pathname, 0, maxIterations).split("/").includes("..");
}

/**
 * decode a URI component multiple (limited) times until it no longer changes
 */
function recursiveDecode(
	string: string,
	iteration: number,
	maxIterations: number,
): string {
	if (iteration >= maxIterations) return string;
	try {
		const decoded = decodeURIComponent(string);
		if (decoded === string) return string;
		return recursiveDecode(decoded, iteration + 1, maxIterations);
	} catch {
		return string;
	}
}
