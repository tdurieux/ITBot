import "reflect-metadata";

import * as fs from "fs";
import req from "got";
import { injectable } from "inversify";
import * as fkill from "fkill";

// To open chrome as child process
import { exec, ChildProcess } from "child_process";

const port = process.env.chromePort || 9222;
const chromeAlias = process.env.chrome || "chrome";

@injectable()
export default class Main {
  public chromeSession: ChildProcess;

  async close() {
    try {
      console.log("Killing...", this.chromeSession.pid);
      this.chromeSession.kill("SIGKILL");
      await fkill(this.chromeSession.pid, { force: true });
    } catch (error) {}
  }

  run(
    timeout: number,
    sessionName: string,
    actionsDelay: number,
    onTab: (url) => void
  ) {
    if (!fs.existsSync("out")) fs.mkdirSync("out");

    if (!fs.existsSync(`out/${sessionName}`))
      fs.mkdirSync(`out/${sessionName}`);

    async function call() {
      this.chromeSession = exec(
        `'${chromeAlias}' --remote-debugging-port=${port} --window-size=1920,1080 --user-data-dir=temp`,
        {
          maxBuffer: 1 << 30,
        },
        (err, stdout, stderr) => {
          // if (err) console.error(err);
          if (stderr) console.error(stderr);
        }
      );
    }

    call.bind(this)();

    // Asking for opened tabs
    setTimeout(async () => {
      // Accessing chrome publish websocket address
      const res = await req.get(`http://localhost:${port}/json`);

      const tab = JSON.parse(res.body)[0];

      console.log("Enabled websockets for tab " + tab.id, tab.url);

      onTab(tab);
    }, actionsDelay);
  }
}
