import { describe, test } from "node:test";
import { equal, throws } from "node:assert/strict";
import { containsPathTraversal } from "./index.ts";

const test_cases: {
	[key: string]: string[];
} = {
	simple_traversal: ["/foo/../bar", "../bar", "/.."],
	encoded_traversal: ["/foo/%2e%2e/bar", "/%2e%2e", "/%2e%2e/%2e%2e"],
	double_encoded_traversal: ["/%252e%252e", "/foo/%252e%252e/bar"],
	real_world_traversals: [
		"/pe/..%252f..%252f..%252factuator%252fenv%23",
		"/pe/..%252F..%252f..%252factuator%252fenv%23",
		"/pe/..%252%66..%252%66..%252%66actuator%252fenv%23",
		"/sellers/programs/.%252e%252f.%252e%252f.%252e%252finternal%252fapi%252fv1%252fcsm%23",
		"/something/else/..%252fapi%252f..%252f..%252fv1%252fhealth",
	],
	safe_paths: ["/foo/bar", "/foo/hello/world", "/foo/%2e/bar"],
	real_world_paths: [
		"/download/attachment/messaging_message/6828cb7b190678003f60c71d_d033cf0f-e119-1634-7f7f-7f7f7f7f7f7f_cb892250-732d-11f0-8b9b-2136f7c068a0/6894012d8bedc6bf61d66fb5/I%20bagged%20my%20crush%209%20years%20later.mp4",
		"/sim%20MJ%20to%20Redeem",
		"/Michal%20$%20400",
		"/marrwanelhussei%20$30",
		"/data%3Aimage/x-icon%3Bbase64%2CAAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAABMLAAATCwAAAAAAAAAAAAAAAAAAAAAAAHO/HQBzvx0Hc78dSXO/Hahzvx3kc78d%2B3O/Hftzvx3kc78dqHO/HUhzvx0Hc78dAAAAAAAAAAAAc78fAHO/HQBzvx0Yc78dknO/He9zvx3/c78d/3O/Hf9zvx3/c78d/3O/Hf9zvx3uc78dknO/HRhzvx0Ac78cAHO/HQBzvx0Yc78dsXO/Hf9zvx3/cr4b/3G%2BGf9yvxv/c78d/3K%2BG/9xvhn/cr4b/3O/Hf9zvx2xc78dGHO/HQBzvx0Gc78dknO/Hf9zvx3/c78e/43LR/%2Bc0l/hMc5/3K/G/%2BJyUH/nNJf/4jJP/9zvxz/c78d/3O/HZJzvx0Gc78dSXO/He1zvx3/c78d/3TAH/O6K/67afP9wvRf/v%2BKY/%2B74JL/cb4a/3O/Hf9zvx3tc78dSXO/Hahzvx3/c78d/3O/Hf90wB/0Omz/%2Bv237/b70X/8Hjm/veGV/3G%2BGv9zvx3/c78d/3O/Hadzvx3jc78d/3O/Hf9zvx3/dMAf/9Dps/r9t%2B/2%2B9F/B45v/73hlf9xvhr/c78d/3O/Hf9zvx3jc78d%2B3O/Hf9zvx3/c78d/3S/Hv/Q6bP/6/afv9vvRb/weOb/%2B94ZX/cb4a/3O/Hf9zvx3/c78d%2B3O/Hftzvx3/c78c/3nCJv%2B23on/7Pbh/e8Mn/w%2BSe/%2BXz1f/veGV/3G%2BGv9zvx3/c78d/3O/Hftzvx3jc78d/3K/HP98wyz/4PHN/v/%2B/35/n89f/4/PP/%2Bfz1/7nfjv9xvhv/c78d/3O/Hf9zvx3jc78dp3O/Hf9zvx3/dcAg/4vKQ/Z7sL/8fmpf%2BSzVD/kc1N/5DMS/%2BCxjX/c78c/3O/Hf9zvx3/c78dqHO/HUpzvx3tc78d/3O/Hf9xvhn/uN%2BN/x%2Ben/2%2B/F/5/TZP9vvRf/cr8b/3O/Hf9zvx3/c78d7XO/HUlzvx0Gc78dknO/Hf9zvx3/cr8c/4DFMv/E5J/5/TZ/%2B334v%2Bo13P/cb4a/3O/Hf9zvx3/c78d/3O/HZJzvx0Gc78dAHO/HRhzvx2xc78d/3O/Hf9yvxz/dMAf/37ELv%2BAxTL/ecIm/3O/Hf9zvx3/c78d/3O/HbFzvx0Yc78dAHS/GgBzvx0Ac78dGHO/HZJzvx3uc78d/3O/Hf9yvxz/cr8c/3O/HP9zvx3/c78d73O/HZJzvx0Yc78dAHS/GgAAAAAAAAAAAHO/HQBzvx0Hc78dSXO/Hahzvx3kc78d%2B3O/Hftzvx3kc78dqHO/HUlzvx0Hc78dAAAAAAAAAAAA4AcAAMADAACAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIABAADAAwAA4AcAAA%3D%3D",
	],
	malformed_encodings: ["/%2G%2H"],
};

describe("contains-path-traversal", () => {
	Object.entries(test_cases)
		.map(([name, pathnames]) =>
			pathnames.map((pathname): [string, boolean, string] => [
				name.replace(/_/g, " "),
				name.includes("traversal"),
				pathname,
			]),
		)
		.flat()
		.forEach(([name, expected, pathname]) => {
			test(`${name} - ${pathname}`, () => {
				equal(containsPathTraversal(pathname), expected);
			});
		});
	(
		[
			["/%252e%252e", { maxIterations: 1 }, { expected: false }],
			["/%252e%252e", { maxIterations: 2 }, { expected: true }],
			["/%25252e%25252e", { maxIterations: 2 }, { expected: false }],
			["/%25252e%25252e", { maxIterations: 3 }, { expected: true }],
		] as const
	).forEach(([pathname, options, { expected }]) => {
		test(`Accepts maxIterations option - ${pathname} with max iterations ${options.maxIterations}`, () => {
			equal(
				containsPathTraversal(
					pathname as string,
					options as { maxIterations: number },
				),
				expected,
			);
		});
	});
});
