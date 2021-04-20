import { injectable, inject } from "inversify";
import Listener from "./listener";
import * as fs from "fs";

@injectable()
export default class VideoRecorder {
  @inject(Listener)
  listener: Listener;

  interval: any;

  async snapshot(sessionName) {
    console.debug(new Date(), "[Video] take screenshot");
    const data = await this.listener.register({
      method: "Page.captureScreenshot",
      params: {
        format: "jpeg",
        quality: 25,
      },
    });
    if (!fs.existsSync(`out/${sessionName}/screenshots`))
      fs.mkdirSync(`out/${sessionName}/screenshots`);

    if (data.result && data.result.data) {
      try {
        await fs.promises.writeFile(
          `out/${sessionName}/screenshots/${new Date().getTime()}.jpg`,
          data.result.data,
          { encoding: "base64" }
        );
      } catch (error) {
        console.error(error);
      }
    }
  }
  async start(sessionName: string, interval: number) {
    this.snapshot(sessionName);
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
