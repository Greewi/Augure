import process from "process";
import { TextResultConverter } from "./converters/TextResultConverter";
import { GeneratorCollection } from "./generator/generatorCollection";
import { MainGenerator } from "./generator/mainGenerator";
import { FileLoader } from "./utils/fileLoader";

const config = FileLoader.loadGeneratorJson("data/generators.json")

const mainGenerator = new MainGenerator(config);

let generatorId = process.argv[2];
let args = process.argv.length>3 ? process.argv.slice(3) : [];

let result = mainGenerator.generate(generatorId, args);

console.log(new TextResultConverter(true).convert(result));
console.log(new TextResultConverter(false).convert(result));
