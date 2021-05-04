import "reflect-metadata";

import * as fs from "fs";
import Container from "./core/container";
import * as WebSocket from "ws";
import Listener from "./core/listener";

// To open chrome as child process
import Main from "./main";
import Stepper from "./core/stepper";
import VideoRecorder from "./core/video.recorder";
import ProfileRecorder from "./core/profile.recorder";
import NetworkRecorder from "./core/network.recorder";
import SnapshotRecorder from "./core/snapshot.recorder";

const main = Container.get<Main>(Main);
const listener = Container.get<Listener>(Listener);
const stepper = Container.get<Stepper>(Stepper);
const recorder = Container.get<VideoRecorder>(VideoRecorder);
const profileRecorder = Container.get<ProfileRecorder>(ProfileRecorder);
const snapshotRecorder = Container.get<SnapshotRecorder>(SnapshotRecorder);
const networkRecorder = Container.get<NetworkRecorder>(NetworkRecorder);

if (process.argv.length < 3) throw new Error("Session name is required");

const session = process.argv[2];
const script = process.argv[3];

(async () => {
  const tab = await main.run(session);
  const url = tab.webSocketDebuggerUrl;

  const ws = new WebSocket(url);

  await listener.setup(ws);

  console.log("Websocket channel opened. Enabling runtime namespace");

  // await recorder.start(session, 100);
  await networkRecorder.start(session);

  await listener.register({ method: "Runtime.enable" });
  await listener.register({ method: "Page.enable" });

  // await snapshotRecorder.start(session, 500);

  await profileRecorder.start();

  let content = "";

  if (script) content = fs.readFileSync(script).toString("utf-8");
  else content = process.stdin.read().toString();

  await stepper.execute(content, session, 5000);
  process.exit(0);
})();
