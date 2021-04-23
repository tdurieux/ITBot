import "reflect-metadata";

import * as fs from "fs";
import req from "got";
import { injectable } from "inversify";
import * as fkill from "fkill";

// To open chrome as child process
import * as child_process from "child_process";

const port = process.env.chromePort || 9222;
const chromeAlias = process.env.chrome || "chrome";

interface Frame {
  description: string;
  devtoolsFrontendUrl: string;
  id: string;
  parentId: string;
  type: string;
  url: string;
  webSocketDebuggerUrl: string;
}

@injectable()
export default class Main {
  public chromeSession: child_process.ChildProcess;

  async close() {
    try {
      console.log("Killing...", this.chromeSession.pid);
      await fkill(this.chromeSession.pid, { force: true });
      this.chromeSession.kill("SIGKILL");
    } catch (error) {
      console.log(error);
    }
  }

  async run(sessionName: string) {
    if (!fs.existsSync(`out/${sessionName}`))
      await fs.promises.mkdir(`out/${sessionName}`, { recursive: true });

    async function wait(time) {
      return new Promise((resolve) => {
        setTimeout(resolve, time);
      });
    }
    console.debug("[main] Start chrome");
    this.chromeSession = child_process.spawn(
      chromeAlias,
      [
        "--app",
        "--window-size=1920,1080",
        "--user-data-dir=temp",
        `--remote-debugging-port=${port}`,
      ],
      { detached: true, stdio: "ignore" }
    );

    // wait for the browser to start
    wait(250);
    while (true) {
      try {
        const res = await req
          .get(`http://localhost:${port}/json`)
          .json<Frame[]>();
        const pages = res.filter((p) => p.type == "page");
        const tab = pages[pages.length - 1];
        console.log("Enabled websockets for tab " + tab.id, tab.url);

        return tab;
      } catch (error) {
        console.log(error);
        console.log("Wait for longer");
        await wait(250);
      }
    }
  }
}
