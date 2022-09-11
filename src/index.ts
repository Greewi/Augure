import process from "process";
import { GeneratorCollection } from "./generator/generatorCollection";

const generators = new GeneratorCollection("data/generators.json");
let generatorId = process.argv[2];
let args = process.argv.length>3 ? process.argv.slice(3) : [];

console.log(generators.getGenerator(generatorId)?.generate(args));
