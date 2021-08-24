import "reflect-metadata";

import * as fs from "fs";
import * as WebSocket from "ws";

// To open chrome as child process
import ItBrowser from "./core/ItBrowser";

interface BrowserBotOption {
  outputPath: string;
  step?: string;
  stepPath?: string;
  snapshotInterval?: number;
  screenshotInterval?: number;
  collectNetwork?: boolean;
  collectProfile?: boolean;
}

export default class ITBOT {
  async runStep(opt: BrowserBotOption) {
    const main = new ItBrowser(opt.outputPath);
    await ItBrowser.closeAll();
    if (opt.collectNetwork === undefined) {
      opt.collectNetwork = true;
    }
    if (opt.collectProfile === undefined) {
      opt.collectProfile = true;
    }
    // remove the session
    if (fs.existsSync("temp")) {
      await fs.promises.rm("temp", { recursive: true, force: true });
    }

    const tab = await main.run();
    const url = tab.webSocketDebuggerUrl;

    const ws = new WebSocket(url);

    await main.listener.setup(ws);

    await main.listener.register({ method: "Runtime.enable" });
    await main.listener.register({ method: "Page.enable" });
    await main.listener.register({ method: "Network.enable" });

    if (opt.screenshotInterval) {
      await main.recorder.start(opt.outputPath, opt.screenshotInterval);
    }
    if (opt.snapshotInterval) {
      await main.snapshotRecorder.start(opt.outputPath, opt.snapshotInterval);
    }
    if (opt.collectNetwork) {
      await main.networkRecorder.start(opt.outputPath);
    }
    if (opt.collectProfile) {
      await main.profileRecorder.start();
    }

    if (opt.stepPath) {
      const stepInstructions = await fs.promises.readFile(opt.stepPath);
      await main.stepper.execute(
        stepInstructions.toString("utf-8"),
        opt.outputPath,
        5000
      );
    } else if (opt.step) {
      await main.stepper.execute(opt.step, opt.outputPath, 5000);
    } else {
      throw new Error("step or stepPath has to be provided");
    }
  }
}
