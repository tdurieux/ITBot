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

  async wait(time) {
    return new Promise((resolve) => {
      setTimeout(resolve, time);
    });
  }

  async run(sessionName: string) {
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
      for (let page of pages) {
        console.log(page);
      }
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
      if (error == "chrome not started") {
        throw error;
      }
      console.log(error);
      console.log("Wait for longer");
      await this.wait(250);
    }
  }
}
