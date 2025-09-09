# @isz/wants [![](https://img.shields.io/npm/v/@isz/wants)](https://www.npmjs.com/package/@isz/wants)

Check what a request wants in a simple way.

```ts
import { wants } from "@isz/wants";
// …
const itWants = wants(response);

if (itWants.html) {
	// Handle HTML request
} else if (itWants.json) {
	// Handle JSON request
} else {
	// Handle other requests
}
```

## Supported getters

- any
- css
- html
- image
- json
- grpc
- stream
- xml

<center>

![](https://github.com/user-attachments/assets/17f6915a-8acc-4771-bcd8-25e6a44f44ce)

</center>
