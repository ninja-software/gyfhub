import { Button } from "@material-ui/core"
import * as React from "react"
import { useQuery } from "react-fetching-library"
import { Switch, useHistory } from "react-router-dom"
import { PrivateRoute } from "../../components/security"
import { fetching } from "../../fetching"
import { Hub } from "../../types/types"
import { ChatRoom } from "./room"

export const ChatPanel = () => {
	const history = useHistory()
	const { payload, loading, error } = useQuery<Hub[]>(fetching.queries.getHubs())
	const [hubs, setHubs] = React.useState<Hub[]>([])
	React.useEffect(() => {
		if (loading || !payload) return
		setHubs(payload)
	}, [payload])
	return <div>{hubs.length > 0 && hubs.map((h, i) => <Button key={i} onClick={() => history.push(`/chat/${h.id}`)}>{`HUB: ${h.name}`}</Button>)}</div>
}

export const ChatRoot = () => {
	return (
		<Switch>
			<PrivateRoute exact path="/chat/:id" component={ChatRoom} />
			<PrivateRoute exact path="/chat" component={ChatPanel} />
		</Switch>
	)
}
