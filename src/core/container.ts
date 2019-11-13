import { Container } from "inversify";

// import OneByOneGenerator from './population_generator/one-by-one.generator';
// import AllGenerator from './population_generator/all.generator';

// Initialize dependency injector
// Register all services here

const myContainer = new Container();

// myContainer.bind<ILogger>("ILogger").to(Logger).inSingletonScope();

//WebT tools
// myContainer.bind<WebTTools>(WebTTools).toSelf().inSingletonScope();


// Emisor
// myContainer.bind<BaseEmisor>("Emisor").to(FileEmisor).inSingletonScope();


// Populator
//myContainer.bind<PopulationGenerator>("Populator").to(AllGenerator).inSingletonScope();


// Walkers

export default myContainer;