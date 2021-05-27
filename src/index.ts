import "reflect-metadata";

import * as fs from "fs";
import Container from "./core/container";
import * as WebSocket from "ws";
import Listener from "./core/listener";

// To open chrome as child process
import ItBrowser from "./core/ItBrowser";
import Stepper from "./core/stepper";
import VideoRecorder from "./core/video.recorder";
import ProfileRecorder from "./core/profile.recorder";
import NetworkRecorder from "./core/network.recorder";
import SnapshotRecorder from "./core/snapshot.recorder";

const main = Container.get<ItBrowser>(ItBrowser);
const listener = Container.get<Listener>(Listener);
const stepper = Container.get<Stepper>(Stepper);
const recorder = Container.get<VideoRecorder>(VideoRecorder);
const profileRecorder = Container.get<ProfileRecorder>(ProfileRecorder);
const snapshotRecorder = Container.get<SnapshotRecorder>(SnapshotRecorder);
const networkRecorder = Container.get<NetworkRecorder>(NetworkRecorder);

interface BrowserBotOption {
  outputPath: string;
  step?: string;
  stepPath?: string;
  snapshotInterval?: number;
  screenshotInterval?: number;
}

export default class BrowserBot {
  async runStep(opt: BrowserBotOption) {
    // remove the session
    if (fs.existsSync("temp")) {
      await fs.promises.rm("temp", { recursive: true, force: true });
    }

    const tab = await main.run(opt.outputPath);
    const url = tab.webSocketDebuggerUrl;

    const ws = new WebSocket(url);

    await listener.setup(ws);

    await listener.register({ method: "Runtime.enable" });
    await listener.register({ method: "Page.enable" });

    if (opt.screenshotInterval) {
      await recorder.start(opt.outputPath, opt.screenshotInterval);
    }
    if (opt.snapshotInterval) {
      await snapshotRecorder.start(opt.outputPath, opt.snapshotInterval);
    }
    await networkRecorder.start(opt.outputPath);
    await profileRecorder.start();

    if (opt.stepPath) {
      const stepInstructions = await fs.promises.readFile(opt.stepPath);
      await stepper.execute(
        stepInstructions.toString("utf-8"),
        opt.outputPath,
        5000
      );
    } else if (opt.step) {
      await stepper.execute(opt.step, opt.outputPath, 5000);
    } else {
      throw new Error("step or stepPath has to be provided");
    }
  }
}
