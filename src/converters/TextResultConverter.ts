import { MainGeneratorResult, RecursiveResultNode, TextResultNode } from "../generator/generatorResult";
import { ResultConverter } from "./ResultConverter";

export class TextResultConverter implements ResultConverter<string> {
	private _showRolls : boolean;

	constructor(showRolls : boolean) {
		this._showRolls = showRolls;
	}

	convert(result: MainGeneratorResult): string {
		return this._convertNode(result);
	}

	private _convertNode(node : MainGeneratorResult) : string {
		if(node.type == "text")
			return this._convertTextNode(node);
		else
			return this._convertRecursiveNode(node);
	}

	private _convertTextNode(node: TextResultNode) : string {
		return node.text;
	}

	private _convertRecursiveNode(node: RecursiveResultNode) : string {
		const result : string[] = [];

		if(this._showRolls) {
			for(const die of node.roll) {
				result.push(die.kept ? `[${die.type}:${die.value}] ` : `{${die.type}:${die.value}} `);
			}
		}

		for(let child of node.nodes) {
			result.push(this._convertNode(child));
		}
		return result.join('');
	}
}