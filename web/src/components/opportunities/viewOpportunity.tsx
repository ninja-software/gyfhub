import { CircularProgress } from "@material-ui/core"
import * as React from "react"
import { useQuery } from "react-fetching-library"
import { useHistory } from "react-router-dom"
import { fetching } from "../../fetching"
import { Opportunity, User } from "../../types/types"
import { OpportunityView } from "./summaryTemplate"

export const ViewOpportunity = () => {
	const history = useHistory()
	const searchArgs = new URLSearchParams(history.location.search)
	const id = searchArgs.get("id")
	const { payload: currentUser, loading: meLoading } = useQuery<User>(fetching.queries.getMe())
	const { payload: data, loading } = useQuery<Opportunity>(fetching.queries.getOpportunity(id || ""))

	if (loading || meLoading) return <CircularProgress />
	if (!data || !currentUser) return <div>Opportunity data doesn't exist</div>

	return <OpportunityView user={currentUser} data={data} />
}
