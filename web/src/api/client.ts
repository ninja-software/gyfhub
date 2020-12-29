import { createClient } from "react-fetching-library"

import { requestHostInterceptor } from "./requestInterceptors/requestHostInterceptor"

const loc = window.location

export const Client = createClient({
	requestInterceptors: [requestHostInterceptor(`${loc.protocol}//${loc.hostname}:${loc.port}/api`)],
})
