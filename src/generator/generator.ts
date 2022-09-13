import { GeneratorConfiguration } from "../config/generatorConfiguration";
import { GeneratorResult } from "./generatorResult";

export class Generator {
	private _id : string;
	private _type : string;
	private _name : string;
	private _source : string;

	/**
	 * @param config the generator configuration
	 */
	constructor(config : GeneratorConfiguration) {
		this._id = config.id;
		this._type = config.type;
		this._name = config.name;
		this._source = config.source;
	}

	/**
	 * @returns the id of the generator
	 */
	getId(): string {
		return this._id;
	}

	/**
	 * @returns the type of the generator
	 */
	getType(): string {
		return this._type;
	}

	/**
	 * @returns the name of the generator
	 */
	getName(): string {
		return this._name;
	}

	/**
	 * @returns the source path of the generator
	 */
	getSource(): string {
		return this._source;
	}

	/**
	 * Generate an element
	 * @param args the arguments for the generation
	 * @returns generated element
	 */
	generate(args: string[]): GeneratorResult {
		return new GeneratorResult("Hello world !", []);
	}
}