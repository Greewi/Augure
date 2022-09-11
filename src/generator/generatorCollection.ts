import { FileLoader } from "../utils/fileLoader.js";
import { Generator } from "./generator.js";
import { GeneratorCollectionConfiguration } from "../config/generatorCollectionConfiguration.js";
import { GeneratorRegister } from "./generatorRegister.js";

export class GeneratorCollection {
	private _config : GeneratorCollectionConfiguration;
	private _generators : Map<string, Generator>;

	/**
	 * @param {string} source the configuration json file for the generator collection
	 */
	constructor(source: string) {
		this._config = FileLoader.loadGeneratorJson(source);
		this._generators = new Map();
		for(const generatorConfig of this._config.generators) {
			const generatorConstructor = GeneratorRegister.getGenerator(generatorConfig.type);
			if(generatorConstructor)
				this._generators.set(generatorConfig.id, new generatorConstructor(generatorConfig));
		}
	}

	/**
	 * Get a generator
	 * @param {string} id the id of the generator
	 * @returns {Generator} the generator
	 */
	getGenerator(id: string): Generator | undefined {
		return this._generators.get(id);
	}
}
