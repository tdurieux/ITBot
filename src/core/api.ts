import "reflect-metadata";

import { injectable, inject } from "inversify";
import Listener from "./listener";

@injectable()
export default class Api {
  @inject(Listener)
  listener: Listener;

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
        text
      },
    });
    this.listener.sendAndRegister({
      method: "Input.dispatchKeyEvent",
      params: {
        type: "keyUp",
        windowsVirtualKeyCode: number,
        text
      },
    });
  }
}
