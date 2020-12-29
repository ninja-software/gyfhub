export interface APIError {
	error: string
	shortMessage: string
	longMessage: string
	variables: Object
	tags: Object
}

export function isAPIError(arg: any): arg is APIError {
	return arg !== undefined
}
