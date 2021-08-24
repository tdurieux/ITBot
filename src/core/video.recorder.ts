import * as fs from "fs";
import ItBrowser from "./ItBrowser";

export default class VideoRecorder {
  interval: any;

  itBrowser: ItBrowser;
  constructor(itBrowser: ItBrowser) {
    this.itBrowser = itBrowser;
  }

  async screenshot(sessionName: string) {
    console.debug(new Date(), "[Video] take screenshot");
    const data = await this.itBrowser.listener.register({
      method: "Page.captureScreenshot",
      params: {
        format: "jpeg",
        quality: 55,
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
    this.screenshot(sessionName);
    this.interval = setInterval(() => {
      try {
        this.screenshot(sessionName);
      } catch (error) {}
    }, interval);
  }

  async stop() {
    clearInterval(this.interval);
  }
}
