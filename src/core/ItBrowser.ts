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

function pidIsRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return false;
  }
}

@injectable()
export default class ItBrowser {
  public chromeSession: child_process.ChildProcess;

  async close() {
    if (!this.chromeSession) return;
    do {
      try {
        console.log("Killing...", this.chromeSession.pid);
        await fkill(this.chromeSession.pid, { force: true });
        this.chromeSession.kill("SIGKILL");
      } catch (error) {
        console.log(error);
      }
      await this.wait(100);
    } while (pidIsRunning(this.chromeSession.pid));
  }

  async wait(time: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, time);
    });
  }

  async run(sessionName: string): Promise<Frame> {
    if (!fs.existsSync(`out/${sessionName}`))
      await fs.promises.mkdir(`out/${sessionName}`, { recursive: true });

    console.debug("[main] Start chrome");
    this.chromeSession = child_process.spawn(
      chromeAlias,
      [
        "--no-first-run",
        "--disable-popup-blocking",
        "--disable-extensions",
        "--disable-infobars",
        "--disable-notifications",
        "--disable-popup-blocking",
        "--noerrdialogs",
        "--incognito",
        "--window-size=1920,1080",
        "--user-data-dir=temp",
        `--remote-debugging-port=${port}`,
      ],
      { detached: true, stdio: "ignore" }
    );

    // wait for the browser to start
    await this.wait(550);
    try {
      const res = await req
        .get(`http://localhost:${port}/json`)
        .json<Frame[]>();
      const pages = res.filter((p) => p.type == "page");
      if (pages.length == 0) {
        await this.close();
        throw "chrome not started";
      }
      const tab = pages[pages.length - 1];
      if (!tab.id) {
        await this.close();
        throw "chrome not started";
      }
      console.log(tab);
      console.log("Enabled websockets for tab " + tab.id, tab.url);

      return tab;
    } catch (error) {
      throw error;
    }
  }
}
