import "reflect-metadata";

import * as fs from "fs";
import req from "got";
import * as fkill from "fkill";
// To open chrome as child process
import * as child_process from "child_process";

import Listener from "./listener";
import Stepper from "./stepper";
import VideoRecorder from "./video.recorder";
import ProfileRecorder from "./profile.recorder";
import SnapshotRecorder from "./snapshot.recorder";
import NetworkRecorder from "./network.recorder";

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
let instances: ItBrowser[] = [];

class CancelablePromise<T> extends Promise<T> {
  cancel(): void {}
}

export default class ItBrowser {
  public chromeSession: child_process.ChildProcess;
  recorder: VideoRecorder;
  stepper: Stepper;
  listener: Listener;
  profileRecorder: ProfileRecorder;
  snapshotRecorder: SnapshotRecorder;
  networkRecorder: NetworkRecorder;
  sessionName: string;

  constructor(sessionName: string) {
    this.sessionName = sessionName;
    this.listener = new Listener();
    this.stepper = new Stepper(this);
    this.recorder = new VideoRecorder(this);
    this.profileRecorder = new ProfileRecorder(this);
    this.snapshotRecorder = new SnapshotRecorder(this);
    this.networkRecorder = new NetworkRecorder(this);
  }

  static async closeAll() {
    for (const instance of [...instances]) {
      await instance.close();
      const index = instances.indexOf(instance);
      instances = instances.splice(index, index);
    }
  }

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
      await ItBrowser.wait(100);
    } while (pidIsRunning(this.chromeSession.pid));
    this.chromeSession = null;
    this.stepper.stop(this.sessionName);
  }

  static async wait(time: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, time);
    });
  }

  async run(): Promise<Frame> {
    if (!fs.existsSync(`out/${this.sessionName}`))
      await fs.promises.mkdir(`out/${this.sessionName}`, { recursive: true });

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

    instances.push(this);

    // wait for the browser to start
    await ItBrowser.wait(550);
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
      console.log("Enabled websockets for tab " + tab.id, tab.url);

      return tab;
    } catch (error) {
      throw error;
    }
  }

  async gotoPage(page: string) {
    this.listener.sendAndRegister({
      method: "Page.navigate",
      params: { url: page },
    });
    return new Promise((resolve, reject) => {
      this.listener.addCallback("Page.loadEventFired", (data) => {
        resolve(data);
      });
    });
  }

  focus(cssSelector: string) {
    this.listener.sendAndRegister({
      method: "Runtime.evaluate",
      params: {
        expression: `document.querySelector("${cssSelector}").focus()`,
      },
    });
  }

  clickOn(cssSelector: string) {
    this.listener.sendAndRegister({
      method: "Runtime.evaluate",
      params: {
        expression: `document.querySelector("${cssSelector}").click()`,
      },
    });
  }

  blur(cssSelector: string) {
    this.listener.sendAndRegister({
      method: "Runtime.evaluate",
      params: {
        expression: `document.querySelector("${cssSelector}").blur()`,
      },
    });
  }

  sendChar(key: string) {
    this.listener.sendAndRegister({
      method: "Input.dispatchKeyEvent",
      params: {
        type: "char",
        text: key,
      },
    });
  }

  sendKey(key: string, number: number, text: string, code: string) {
    this.listener.sendAndRegister({
      method: "Input.dispatchKeyEvent",
      params: {
        type: "keyDown",
        windowsVirtualKeyCode: number,
        text,
      },
    });
    this.listener.sendAndRegister({
      method: "Input.dispatchKeyEvent",
      params: {
        type: "keyUp",
        windowsVirtualKeyCode: number,
        text,
      },
    });
  }
}
