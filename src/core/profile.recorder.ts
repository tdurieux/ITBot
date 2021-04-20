import { injectable, inject } from "inversify";
import Listener from "./listener";
import * as fs from "fs";
import { spawn, exec } from "child_process";

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

  fetchScript(url, sessionName, id) {
    try {
      const curl = spawn("curl", [url]);
      let buffer = "";

      curl.stdout.on("data", (data) => {
        buffer += data;
      });

      curl.on("close", (code) => {
        fs.readFileSync(`out/${sessionName}/profiling/${id}.js`);
      });
    } catch (e) {
      console.error("Error", e, url);
    }
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
    for (let node of data.result.profile.nodes) {
      if (
        "callFrame" in node &&
        "url" in node.callFrame &&
        "functionName" in node.callFrame &&
        !!node.callFrame.url &&
        node.callFrame.url.startsWith("http") &&
        !!node.callFrame.functionName
      ) {
        try {
          exec(
            `curl ${node.callFrame.url} > out/${sessionName}/profiling/${node.callFrame.scriptId}.js`
          );
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Write samples as STRAC input
    const fd = fs.openSync(`out/${sessionName}/profile.STRAC.samples`, "w");

    for (let sample of data.result.profile.samples)
      fs.writeSync(fd, `${sample}\n`);
    fs.closeSync(fd);
  }
}
