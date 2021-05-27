import { injectable, inject } from "inversify";
import Listener from "./listener";
import * as fs from "fs";
import { Parser } from "fast-mhtml";
import { join } from "path";

@injectable()
export default class SnapshotRecorder {
  @inject(Listener)
  listener: Listener;

  interval: any;

  async snapshot(sessionName: string) {
    try {
      const data = await this.listener.register({
        method: "Page.captureSnapshot",
      });
      if (!data.result) return;

      const output = `out/${sessionName}/snapshots/${new Date().getTime()}`;
      if (!fs.existsSync(output))
        await fs.promises.mkdir(output, { recursive: true });

      const parser = new Parser({});
      const result = parser.parse(data.result.data).rewrite().spit();
      for (let file of result) {
        if (!fs.existsSync(join(output, file.filename)))
          await fs.promises.writeFile(
            join(output, file.filename),
            file.content
          );
      }
      await fs.promises.writeFile(output + ".mhtml", data.result.data);
    } catch (error) {
      console.log(error);
    }
  }

  async start(sessionName: string, interval: number) {
    this.interval = setInterval(() => {
      try {
        this.snapshot(sessionName);
      } catch (error) {}
    }, interval);
  }

  async stop() {
    clearInterval(this.interval);
  }
}
