import Container from "./src/core/container";
import * as WebSocket from "ws";
import Listener from "./src/core/listener";
import Main from "./src/main";
import Stepper from "./src/core/stepper";
import VideoRecorder from "./src/core/video.recorder";
import ProfileRecorder from "./src/core/profile.recorder";
import SnapshotRecorder from "./src/core/snapshot.recorder";
import NetworkRecorder from "./src/core/network.recorder";
import * as schedule from "node-schedule";
import * as fs from "fs";
import { join } from "path";

const main = Container.get<Main>(Main);
const listener = Container.get<Listener>(Listener);
const stepper = Container.get<Stepper>(Stepper);
const recorder = Container.get<VideoRecorder>(VideoRecorder);
const profileRecorder = Container.get<ProfileRecorder>(ProfileRecorder);
const snapshotRecorder = Container.get<SnapshotRecorder>(SnapshotRecorder);
const networkRecorder = Container.get<NetworkRecorder>(NetworkRecorder);

const steps = [
  "spotify",
  "qwant",
  "bing",
  "google",
  "duckduckgo",
  "kiddle",
  "yahoo",
  "wikipedia",
];
schedule.scheduleJob("* */24 * * *", async () => {
// (async () => {
  for (let step of steps) {
    try {
      const session = `${step}/${Date.now()}`;
      const tab = await main.run(session);
      const url = tab.webSocketDebuggerUrl;

      const ws = new WebSocket(url);

      await listener.setup(ws);
      console.log("Websocket channel opened. Enabling runtime namespace");

      await recorder.start(session, 250);
      await networkRecorder.start(session);

      await listener.register({ method: "Runtime.enable" });
      await listener.register({ method: "Page.enable" });

      await snapshotRecorder.start(session, 1000);

      await profileRecorder.start();

      let content = fs
        .readFileSync(join("steps", `${step}.steps`))
        .toString("utf-8");

      await stepper.execute(content, session, 5000);
    } catch (error) {
      console.log(error)
    }
  }
});
