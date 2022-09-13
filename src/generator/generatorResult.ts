/**
 * Represents a die roll
 */
export interface Dice {
		type: string,
		value: number,
		kept: boolean
}

/**
 * Represents the result of a single generator
 */
export class GeneratorResult {
	public text : string;
	public roll: Dice[];

	/**
	 * @param text the generated text
	 * @param roll the corresponding dice roll
	 */
	constructor(text: string, roll: Dice[]) {
		this.text = text;
		this.roll = roll;
	}
}

/**
 * The nodes below represents the final result of the main generator
 */

export interface ResultNode {
	readonly type : "text" | "recursive";
}

export class TextResultNode implements ResultNode {
	readonly type = "text";
	readonly text : string;

	constructor(text: string) {
		this.text = text;
	}
}

export class RecursiveResultNode implements ResultNode {
	readonly type = "recursive";
	readonly result : GeneratorResult;
	readonly roll : Dice[];
	readonly nodes : MainGeneratorResult[];

	constructor(result : GeneratorResult, nodes: MainGeneratorResult[]){
		this.result = result;
		this.roll = result.roll;
		this.nodes = nodes;
	}
}

export type MainGeneratorResult = TextResultNode | RecursiveResultNode;