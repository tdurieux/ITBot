import { injectable, inject } from "inversify";
import Listener from "./listener";
import * as fs from "fs";

function clean(obj: any) {
  if (typeof obj != "object") {
    return obj;
  }
  for (let key in obj) {
    if (
      key == "headers" ||
      key == "requestHeaders" ||
      key == "securityDetails" ||
      key == "associatedCookies" ||
      key == "securityState"
    ) {
      delete obj[key];
      continue;
    }
    obj[key] = clean(obj[key]);
  }
  return obj;
}

@injectable()
export default class NetworkRecorder {
  @inject(Listener)
  listener: Listener;

  sessionName: string;
  fd: number;
  network: {
    requestUrls: {
      [key: string]: string;
    };
    history: any[];
  };

  async start(sessionName: string) {
    this.sessionName = sessionName;
    this.network = { requestUrls: {}, history: [] };

    await this.listener.register({ method: "Network.enable" });

    this.listener.addCallback("Network", async (data) => {
      const d = clean(JSON.parse(data));

      let requestId = d.params.requestId;
      if (requestId.indexOf(".") != -1) {
        requestId = requestId.split(".")[1];
      }
      if (d.method == "Network.responseReceived") {
        this.network.requestUrls[requestId] = d.params.response.url;
      } else if (d.method == "Network.loadingFinished") {
        try {
          const res = await this.listener.register({
            method: "Network.getResponseBody",
            params: { requestId: d.params.requestId },
          });

          if (!fs.existsSync(`out/${sessionName}/requests`))
            fs.mkdirSync(`out/${sessionName}/requests`);

          fs.writeFileSync(
            `out/${sessionName}/requests/${requestId}`,
            res.result.body,
            {
              encoding: res.result.base64Encoded ? "base64" : "utf-8",
            }
          );
        } catch (error) {}
      }
      d.params.requestId = requestId;
      this.network.history.push(d);
    });
  }

  async stop() {
    console.log("[Network] Writing Network data on disk");
    await fs.promises.writeFile(
      `out/${this.sessionName}/network.raw.json`,
      JSON.stringify(this.network, null, 2)
    );
  }
}
