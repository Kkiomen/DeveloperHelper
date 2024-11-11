// import {useEffect, useState} from "react";
// // import reactLogo from "./assets/react.svg";
// import {invoke} from "@tauri-apps/api/core";
import "./App.css";
import AppRoutes from "./routes/Routes.tsx";
// import Pusher from 'pusher-js';
// import {usePusher} from "./core/Pusher.tsx";

function App() {
    // const [greetMsg, setGreetMsg] = useState("");
    // const [name, setName] = useState("");


    // async function greet() {
    //     // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    //     setGreetMsg(await invoke("greet", {name}));
    // }

    return (
        <main className="h-full">
            <AppRoutes />

            {/*<form*/}
            {/*    className="row"*/}
            {/*    onSubmit={(e) => {*/}
            {/*        e.preventDefault();*/}
            {/*        greet();*/}
            {/*    }}*/}
            {/*>*/}
            {/*    <input*/}
            {/*        id="greet-input"*/}
            {/*        onChange={(e) => setName(e.currentTarget.value)}*/}
            {/*        placeholder="Enter a name..."*/}
            {/*    />*/}
            {/*    <button type="submit">Greet</button>*/}
            {/*</form>*/}
            {/*<p>{greetMsg}</p>*/}
        </main>
    );
}

export default App;
