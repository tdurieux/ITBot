import { injectable, inject } from "inversify";
import Listener from "./listener";
import * as fs from "fs";
import req from "got";

@injectable()
export default class ProfileRecorder {
  @inject(Listener)
  listener: Listener;
  cssFiles: {};

  async start() {
    this.cssFiles = {};

    this.listener.addCallback("CSS.styleSheetAdded", (data) => {
      data = JSON.parse(data).params.header;
      this.cssFiles[data.styleSheetId] = data.sourceURL;
    });

    await this.listener.register({ method: "DOM.enable" });
    await this.listener.register({ method: "CSS.enable" });
    await this.listener.register({
      method: "CSS.startRuleUsageTracking",
      params: {
        detailed: true,
        callCount: true,
      },
    });
    console.log("[CSS coverage] Started");
    await this.listener.register({ method: "Profiler.enable" });
    await this.listener.register({ method: "Profiler.start" });
    await this.listener.register({
      method: "Profiler.startPreciseCoverage",
      params: {
        detailed: true,
        callCount: true,
      },
    });
    console.log("[JS coverage] Started");
    console.log("[Profiler] Started");
  }

  async fetchScript(url: string, sessionName: string, id: string) {
    return new Promise<void>((resolve) => {
      req
        .stream(url)
        .on("error", (error) => {
          console.log("[Network] error ", url);
          resolve();
        })
        .pipe(fs.createWriteStream(`out/${sessionName}/profiling/${id}.js`))
        .on("error", (error) => {
          console.log("[Network] error ", url);
          resolve();
        })
        .on("finish", () => {
          console.log("finished ", url);
          resolve();
        });
    });
  }

  async stop(sessionName: string) {
    let data = await this.listener.register({
      method: "Profiler.takePreciseCoverage",
    });
    fs.writeFileSync(
      `out/${sessionName}/coverage.json`,
      JSON.stringify(data.result.result, null, 2)
    );

    data = await this.listener.register({
      method: "CSS.stopRuleUsageTracking",
    });
    for (let css of data.result.ruleUsage) {
      if (this.cssFiles[css.styleSheetId]) {
        css.source = this.cssFiles[css.styleSheetId];
      }
    }
    await fs.promises.writeFile(
      `out/${sessionName}/css_coverage.json`,
      JSON.stringify(data.result.ruleUsage, null, 2)
    );

    data = await this.listener.register({ method: "Profiler.stop" });
    if (!fs.existsSync(`out/${sessionName}/profiling`))
      fs.mkdirSync(`out/${sessionName}/profiling`);

    fs.promises.writeFile(
      `out/${sessionName}/profile.json`,
      JSON.stringify(data.result.profile, null, 2)
    );

    // Saving function script file
    const downloadPromise: Promise<void>[] = [];
    const uniqueScripts = new Set();
    for (let node of data.result.profile.nodes) {
      if (
        "callFrame" in node &&
        "url" in node.callFrame &&
        "functionName" in node.callFrame &&
        !!node.callFrame.url &&
        node.callFrame.url.startsWith("http") &&
        !!node.callFrame.functionName
      ) {
        if (uniqueScripts.has(node.callFrame.url)) {
          continue;
        }
        console.log("Will download ", node.callFrame.url);
        uniqueScripts.add(node.callFrame.url);
        downloadPromise.push(
          this.fetchScript(
            node.callFrame.url,
            sessionName,
            node.callFrame.scriptId
          )
        );
      }
    }
    try {
      await Promise.all(downloadPromise);
    } catch (error) {
      console.log(error);
    }

    // Write samples as STRAC input
    const fd = fs.openSync(`out/${sessionName}/profile.STRAC.samples`, "w");

    for (let sample of data.result.profile.samples)
      fs.writeSync(fd, `${sample}\n`);
    fs.closeSync(fd);
  }
}
