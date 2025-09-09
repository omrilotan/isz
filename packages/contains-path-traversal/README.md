# contains-path-traversal [![](https://img.shields.io/npm/v/contains-path-traversal)](https://www.npmjs.com/package/contains-path-traversal)

Check if a string contains path traversal string, including urlEncoded substrings.

```ts
import { containsPathTraversal } from "contains-path-traversal";

if (containsPathTraversal(request.url)) {
	return new Response("Blocked", { status: 403 });
}
```

## Supported Encodings

```ts
import { containsPathTraversal } from "contains-path-traversal";
containsPathTraversal("/foo/%25252e%25252e/bar"); // true
```
