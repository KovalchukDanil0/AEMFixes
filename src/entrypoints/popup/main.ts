import { mount } from "svelte";
import App from "./App.svelte";
import "./style.scss";

export default mount(App, {
  target: document.getElementById("app")!,
});
