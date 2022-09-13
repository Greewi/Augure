import { GeneratorCollectionConfiguration } from "../config/generatorCollectionConfiguration";
import { GeneratorCollection } from "./generatorCollection";
import { ResultNode, RecursiveResultNode, TextResultNode, MainGeneratorResult } from "./generatorResult"

export class MainGenerator {
	private _generators : GeneratorCollection;
	private static subGenerationPattern = /\{([a-z_]+)( [^{]+)?\}/i;

	constructor(config : GeneratorCollectionConfiguration) {
		this._generators = new GeneratorCollection(config);
	}

	generate(generatorId: string, args: string[]): MainGeneratorResult {
		// Generating the root node
		let generator = this._generators.getGenerator(generatorId);
		if(!generator)
			throw new Error(`Generator not found ${generatorId}`);
		let result = generator.generate(args);

		// Extracting subnodes
		let subNodes : MainGeneratorResult[] = [];
		let text = result.text;
		while(text.length>0) {
			let match = MainGenerator.subGenerationPattern.exec(text);
			if(!match) {
				subNodes.push(new TextResultNode(text));
				text = text.substring(text.length);
			} else if(match.index > 0) {
				subNodes.push(new TextResultNode(text.substring(0, match.index)));
				text = text.substring(match.index);
			} else {
				let generatorId = match[1];
				let parameters = match[2] ? match[2].trim().split(' ') : [];
				subNodes.push(this.generate(generatorId, parameters));
				text = text.substring(match[0].length);
			}
		}

		// Building current node
		return new RecursiveResultNode(result, subNodes);
	}
}

