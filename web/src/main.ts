import { mount } from "svelte";
import App from "./App.svelte";
import "./app.css";

const destino = document.getElementById("app");
if (!destino) throw new Error("Falta #app en index.html");

export default mount(App, { target: destino });
