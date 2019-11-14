import { Container } from "inversify";
import Listener from "./listener";
import Api from "./api";
import Stepper from "./stepper";
import VideoRecorder from "./video.recorder";
import Main from "../main";
import ProfileRecorder from "./profile.recorder";

// import OneByOneGenerator from './population_generator/one-by-one.generator';
// import AllGenerator from './population_generator/all.generator';

// Initialize dependency injector
// Register all services here

const myContainer = new Container();

myContainer.bind<Listener>(Listener).to(Listener).inSingletonScope();
myContainer.bind<Api>(Api).to(Api).inSingletonScope();
myContainer.bind<Stepper>(Stepper).to(Stepper).inSingletonScope();
myContainer.bind<VideoRecorder>(VideoRecorder).to(VideoRecorder);
myContainer.bind<ProfileRecorder>(ProfileRecorder).to(ProfileRecorder).inRequestScope();
myContainer.bind<Main>(Main).to(Main).inSingletonScope();

//WebT tools
// myContainer.bind<WebTTools>(WebTTools).toSelf().inSingletonScope();


// Emisor
// myContainer.bind<BaseEmisor>("Emisor").to(FileEmisor).inSingletonScope();


// Populator
//myContainer.bind<PopulationGenerator>("Populator").to(AllGenerator).inSingletonScope();


// Walkers

export default myContainer;