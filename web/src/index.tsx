import React from "react"
import ReactDOM from "react-dom"
import { App } from "./App"
import { ClientContextProvider } from "react-fetching-library"
import { Client } from "./api/client"
import { AuthContainer } from "./controllers/auth"
import Themes from "./controllers/theme"

ReactDOM.render(
	<React.StrictMode>
		<ClientContextProvider client={Client}>
			<AuthContainer.Provider>
				<Themes.Provider initialState={1}>
					<App />
				</Themes.Provider>
			</AuthContainer.Provider>
		</ClientContextProvider>
	</React.StrictMode>,
	document.getElementById("app"),
)
