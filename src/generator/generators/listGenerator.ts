import { FileLoader } from '../../utils/fileLoader';
import { Generator } from '../generator';
import { GeneratorConfiguration } from '../../config/generatorConfiguration';
import { GeneratorResult } from '../generatorResult';

export class ListGenerator extends Generator {

	private _items : string[];

	/**
	 * @param config the generator configuration
	 */
	constructor(config : GeneratorConfiguration) {
		super(config);
		this._items = FileLoader.loadListFile(this.getSource());
	}

	/**
	 * Generate an element
	 * @param args the arguments for the generation
	 * @returns generated element
	 */
	generate(args: string[]): GeneratorResult {
		let roll = Math.floor(this._items.length*Math.random());
		let text = this._items[roll];

		return new GeneratorResult(text, [{
			type : `d${this._items.length}`,
			value : roll+1,
			kept : true
		}]);
	}
}
