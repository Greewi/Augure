import { Generator } from "./generator";
import { GeneratorConfiguration } from "../config/generatorConfiguration.js";
import { DiceGenerator } from "./generators/diceGenerator";
import { ListGenerator } from "./generators/listGenerator";

interface GeneratorContructor {
	new (config : GeneratorConfiguration) : Generator
}

const registeredGenerator : Map<string, GeneratorContructor> = new Map();

export class GeneratorRegister {
	/**
	 * Register a generator class
	 * @param {string} type the type name of the generator
	 * @param {GeneratorContructor} generator the class of the generator
	 */
	static registerGenerator(type: string, generator: GeneratorContructor) {
		registeredGenerator.set(type, generator);
	}

	/**
	 * Get the class of a generator
	 * @param {string} type the type name of the generator
	 * @returns {GeneratorContructor} the corresponding generator of undefined if no generator has been found
	 */
	static getGenerator(type: string): GeneratorContructor | undefined {
		return registeredGenerator.get(type);
	}
}

GeneratorRegister.registerGenerator('list', ListGenerator);
GeneratorRegister.registerGenerator('r', DiceGenerator);
GeneratorRegister.registerGenerator('roll', DiceGenerator);
