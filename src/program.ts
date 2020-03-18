import "reflect-metadata";

import * as fs from 'fs'
import * as path from 'path';
import Container from './core/container';
import * as WebSocket from 'ws';
import * as req from 'request';
import Listener from './core/listener';
import Api from './core/api';
import { injectable } from 'inversify';
import * as util from 'util';
import * as fkill from 'fkill';

// To open chrome as child process
import {  spawn, execFile, exec, fork, ChildProcess } from 'child_process';
import Main from "./main";
import Stepper from "./core/stepper";
import VideoRecorder from "./core/video.recorder";
import ProfileRecorder from "./core/profile.recorder";
import NetworkRecorder from "./core/network.recorder";
import SnapshotRecorder from "./core/snapshot.recorder";

const main = Container.get<Main>(Main)
const listener = Container.get<Listener>(Listener);
const api = Container.get<Api>(Api);
const stepper = Container.get<Stepper>(Stepper);
const recorder = Container.get<VideoRecorder>(VideoRecorder);
const profileRecorder = Container.get<ProfileRecorder>(ProfileRecorder);
const snapshotRecorder = Container.get<SnapshotRecorder>(SnapshotRecorder);
const networkRecorder = Container.get<NetworkRecorder>(NetworkRecorder);


 
if(process.argv.length < 3)
    throw new Error("Session name is required")


const session = process.argv[2]
const script = process.argv[3]


main.run(300, session, 4000, (tab) => {

    const url = tab.webSocketDebuggerUrl;
        
    const ws = new WebSocket(url);

    listener.setup(ws, () => {
        console.log("Websocket channel opened. Enabling runtime namespace")

        recorder.start(session, 100)
        snapshotRecorder.start(session, 500);
        networkRecorder.start(session)

        listener.sendAndRegister({method: "Runtime.enable"})
        listener.sendAndRegister({method: "Page.enable"})


        profileRecorder.start()

        let content = ''

        if(script)
            content = fs.readFileSync(script).toString("utf-8")
        else
            content = process.stdin.read().toString();

        console.log(content)

        stepper.execute(content, session, 5000)
    })
})
  
