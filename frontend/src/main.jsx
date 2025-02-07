import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import Titlebar from './titlebar/Titlebar'

const root = createRoot(document.getElementById('root'));
const customTitlebar = createRoot(document.getElementById('titlebar'))
customTitlebar.render(
    <Titlebar />
)

root.render(
    <>
        <App />
    </>

)


