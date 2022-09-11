import { FileLoader } from '../../utils/fileLoader';
import { Generator } from '../generator';
import { GeneratorConfiguration } from '../../config/generatorConfiguration';

export class ListGenerator extends Generator {

	private _items : string[];

	/**
	 * @param {object} config the generator configuration
	 * @param {string} config.id the generator id
	 * @param {string} config.type the generator type
	 * @param {string} config.name the generator name
	 * @param {string} config.source the generator source
	 */
	constructor(config : GeneratorConfiguration) {
		super(config);
		this._items = FileLoader.loadListFile(this.getSource());
	}

	/**
	 * @returns {string} return a random item for the list
	 */
	getRandomItem(): string|null {
		if(!this._items || this._items.length==0)
			return null;
		return this._items[Math.floor(this._items.length*Math.random())];
	}

	/**
	 * Generate elements
	 * @param {string[]} args the arguments forthe generation
	 * @returns {string[]} generated elements
	 */
	generate(args: string[]): string[] {
		let generated : string[] = [];
		let count = (args.length>0) ? parseInt(args[0]) : 1;
		for(let i=0; i<count; i++) {
			let item = this.getRandomItem();
			if(item)
				generated.push(item);
		}
		return generated;
	}
}
