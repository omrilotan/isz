# @isz/content-type-is [![](https://img.shields.io/npm/v/@isz/content-type-is)](https://www.npmjs.com/package/@isz/content-type-is)

Check the content type of a request or response in a simple way.

```ts
import { contentTypeIs } from "@isz/content-type-is";
// …
const its = contentTypeIs(response);

if (its.html) {
	// Handle HTML response
} else if (its.json) {
	// Handle JSON response
} else {
	// Handle other response types
}
```

## Supported getters

- html
- json
- plain
- image
- xml
- javascript
- css
- stream
- pdf
- video
- audio
- binary
- form
- multipart

<center>

![](https://github.com/user-attachments/assets/32fb4611-072a-4bdd-a075-f56ed7f60937)

</center>
