import { expect } from "chai";

import Container from "../src/core/container";
import * as WebSocket from "ws";
import Listener from "../src/core/listener";
import Api from "../src/core/api";
import Main from "../src/main";
import Stepper from "../src/core/stepper";
import VideoRecorder from "../src/core/video.recorder";
import ProfileRecorder from "../src/core/profile.recorder";
import SnapshotRecorder from "../src/core/snapshot.recorder";
import NetworkRecorder from "../src/core/network.recorder";
import * as schedule from "node-schedule";

const main = Container.get<Main>(Main);
const listener = Container.get<Listener>(Listener);
const api = Container.get<Api>(Api);
const stepper = Container.get<Stepper>(Stepper);
const recorder = Container.get<VideoRecorder>(VideoRecorder);
const profileRecorder = Container.get<ProfileRecorder>(ProfileRecorder);
const snapshotRecorder = Container.get<SnapshotRecorder>(SnapshotRecorder);
const networkRecorder = Container.get<NetworkRecorder>(NetworkRecorder);

describe("Api test", function () {
  it("Api commands", async function () {
    const tab = await main.run("test");
    const url = tab.webSocketDebuggerUrl;

    const ws = new WebSocket(url);

    await listener.setup(ws);
    console.log("Websocket channel opened. Enabling runtime namespace");

    await recorder.start("test", 100);
    await snapshotRecorder.start("test", 100);
    await networkRecorder.start("test");

    await listener.register({ method: "Runtime.enable" });
    await listener.register({ method: "Profile.enable" });
    await listener.register({ method: "Page.enable" });

    await profileRecorder.start();

    await stepper.execute(
      `
            goto https://www.funkykarts.rocks/demo.html
            

            key Enter
            
            sleep 1500
          `,
      "test",
      5000
    );
  });

  it("parser", function () {
    const listener = Container.get<Listener>(Listener);
    const api = Container.get<Api>(Api);
    const stepper = Container.get<Stepper>(Stepper);

    let tokens = stepper.tokenize("goto https://www.google.com");
    expect(tokens.length).equal(
      2,
      "No correct parsing 'goto https://www.google.com'"
    );

    tokens = stepper.tokenize("sleep 500");
    expect(tokens.length).equal(2, "No correct parsing 'sleep 500'");

    tokens = stepper.tokenize("key 1");
    expect(tokens.length).equal(2, "No correct parsing 'key 1'");

    tokens = stepper.tokenize('focus "[name=q]"');
    console.log(tokens);
    expect(tokens.length).equal(2, "No correct parsing 'focus [name=q]'");

    tokens = stepper.tokenize('keys "Javier Cabrera Arteaga" 200');
    console.log(tokens);
    expect(tokens.length).equal(
      3,
      "No correct parsisng 'keys 'Javier Cabrera Arteaga' 200'"
    );

    tokens = stepper.tokenize('keys "Javier Cabrera Arteaga" 200 500');
    console.log(tokens);
    expect(tokens.length).equal(
      4,
      "No correct parsisng 'keys 'Javier Cabrera Arteaga' 200 500'"
    );
  });

  it("parser2", function () {
    const listener = Container.get<Listener>(Listener);
    const api = Container.get<Api>(Api);
    const stepper = Container.get<Stepper>(Stepper);

    let tokens = stepper.expand([
      {
        opcode: "text",
        params: ["Javier Cabrera Arteaga", "400", "800"],
      },
    ]);
    console.log(tokens);
  });

  it("Run", function () {
    schedule.scheduleJob("*/5 * * * *", async () => {
      console.log("Running...");
      const tab = await main.run(`test${Date.now()}`);
      const url = tab.webSocketDebuggerUrl;

      const ws = new WebSocket(url);

      await listener.setup(ws);

      console.log("Websocket channel opened. Enabling runtime namespace");

      await recorder.start("test", 100);
      await snapshotRecorder.start("test", 100);
      await networkRecorder.start("test");

      await listener.register({ method: "Runtime.enable" });
      await listener.register({ method: "Page.enable" });

      await profileRecorder.start();

      await stepper.execute(
        `
              goto https://www.google.com
              focus [name=q]
              sleep 2000
              
              text 'KTH' 200 400
  
              sleep 500
  
              key Enter
  
              sleep 500
            `,
        "test",
        5000
      );
    });
  });
});
