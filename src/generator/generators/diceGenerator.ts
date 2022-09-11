import { Generator } from "../generator";

/**
 * Generator that roll dices
 */
export class DiceGenerator extends Generator {
	/**
	 * Generate elements
	 * @param args the arguments for the generation
	 * @returns generated elements
	 */
	generate(args: string[]): string[] {
		if(args.length==0)
			throw new Error("No formula given");
		const formula = args.join('');
		const evaluationNode = DiceParser.parse(formula);
		return [formula, evaluationNode.toString(), evaluationNode.stringVal()];
	}
}

// ------------------------------------------------------------------------------------
// Parsing regexp
// ------------------------------------------------------------------------------------
const whitespacePattern = / \t\n\r/ig;
const dicePattern = /([0-9]+)?d([0-9]+)(((x|kh|kl|gt|lt|eq|ge|le|ne)[0-9]*)*)/i;
const modifierPattern = /(x|kh|kl|gt|lt|eq|ge|le)([0-9]*)/gi
const numberPattern = /[0-9]+/i;
const multOperatorPattern = /[*/]/i;
const addOperatorPattern = /[-+]/i;
const startFactorPattern = /[(]/i;
const endFactorPattern = /[)]/i;

// ------------------------------------------------------------------------------------
// Evaluation tree
// ------------------------------------------------------------------------------------

type Dice = {
	value: number,
	kept: boolean
};

/**
 * The evaluation node is used to evaluate the formula.
 */
interface EvaluationNode {
	val : () => number;
	stringVal : () => string;
	toString : () => string;
}

class NumberNode implements EvaluationNode {
	private value : number;
	constructor(value: string) {
		this.value = parseInt(value);
	}

	val() { return this.value; }

	stringVal() { return `${this.value}`; }

	toString() { return `${this.value}`; }
}

class DiceNode implements EvaluationNode {
	private diceNumber : number;
	private diceType : number;
	private dices : Dice[];
	private modifiers : {
		explodes : number | null,
		comparator : string | null,
		compareTo : number,
		toKeep : number | null
		keepHighest : boolean};
	private value : number;

	constructor(formula: string) {
		formula = formula.toLowerCase();

		let globalMatches = formula.match(dicePattern);
		if(!globalMatches)
			throw new Error(`Invalid dice formula format : parse error (${formula})`);

		// Parsing dice type
		this.diceNumber = globalMatches[1] ? parseInt(globalMatches[1]) : 1;
		this.diceType = parseInt(globalMatches[2]);

		//Parsing modifiers
		this.modifiers = {
			explodes: null,
			comparator : null,
			compareTo : 0,
			toKeep : null,
			keepHighest : false
		};
		let rawModifiers = globalMatches[3];
		if(rawModifiers) {
			let matches = rawModifiers.matchAll(modifierPattern);
			for(let match of matches) {
				//x|kh|kl|gt|lt|eq|ge|le
				switch(match[1]) {
					case "x" :
						if(this.modifiers.explodes !== null)
							throw new Error(`Invalid dice formula format : only one "x" modifier permitted (${formula})`);
						this.modifiers.explodes = match[2] ? parseInt(match[2]) : 0;
						break;
					case "kh" :
					case "kl" :
						if(this.modifiers.toKeep !== null || this.modifiers.comparator !== null)
							throw new Error(`Invalid dice formula format : only one "gt|lt|eq|ge|le|ne|kh|kl" modifier permitted (${formula})`);
						if(!match[2] === undefined)
							throw new Error(`Invalid dice formula format : missing number of dice to keep (${formula})`);
						this.modifiers.toKeep = parseInt(match[2]);
						this.modifiers.keepHighest = match[1] == "kh";
						break;
					case "gt" :
					case "lt" :
					case "eq" :
					case "ge" :
					case "le" :
					case "ne" :
						if(this.modifiers.comparator !== null || this.modifiers.toKeep !== null)
							throw new Error(`Invalid dice formula format : only one "gt|lt|eq|ge|le|ne|kh|kl" modifier permitted (${formula})`);
						if(match[2] === undefined)
							throw new Error(`Invalid dice formula format : missing number to compare (${formula})`);
						this.modifiers.compareTo = parseInt(match[2]);
						this.modifiers.comparator = match[1];
						break;
					default :
						throw new Error(`Invalid dice formula format : unknown modifier ${match[1]} (${formula})`);
				}
			}
		}

		// Roll the dice
		this.dices = [];
		for(let i=0; i<this.diceNumber; i++) {
			let diceValue = Math.floor(Math.random()*this.diceType) + 1;
			if(this.modifiers.explodes !== null) {
				let lastDiceRolled = diceValue;
				let reroll = 0;
				while(lastDiceRolled == this.diceType && reroll<100 && (this.modifiers.explodes==0 || reroll<this.modifiers.explodes)) {
					lastDiceRolled = Math.floor(Math.random()*this.diceType) + 1;
					diceValue += lastDiceRolled;
				}
			}
			this.dices.push({
				value : diceValue,
				kept : true
			});
		}

		// Handle roll and keep
		if(this.modifiers.toKeep !== null) {
			let sortedDices = new Array(...this.dices);
			if(this.modifiers.keepHighest)
				sortedDices.sort((a, b) => a.value - b.value);
			else
				sortedDices.sort((a, b) => b.value - a.value);
			for(let i=0; i<sortedDices.length; i++) {
				sortedDices[i].kept = i<this.modifiers.toKeep;
			}
		}

		// Handle comparison
		if(this.modifiers.comparator !== null) {
			for(let dice of this.dices) {
				dice.kept = false;
				if(dice.value > this.modifiers.compareTo && this.modifiers.comparator == "gt")
					dice.kept = true;
				if(dice.value < this.modifiers.compareTo && this.modifiers.comparator == "lt")
					dice.kept = true;
				if(dice.value >= this.modifiers.compareTo && this.modifiers.comparator == "ge")
					dice.kept = true;
				if(dice.value <= this.modifiers.compareTo && this.modifiers.comparator == "le")
					dice.kept = true;
				if(dice.value == this.modifiers.compareTo && this.modifiers.comparator == "eq")
					dice.kept = true;
				if(dice.value != this.modifiers.compareTo && this.modifiers.comparator == "ne")
					dice.kept = true;
			}
		}

		// Compute roll score
		this.value = 0;
		for(let dice of this.dices) {
			if(this.modifiers.comparator) {
				this.value += dice.kept ? 1 : 0;
			} else {
				this.value += dice.value;
			}
		}
	}

	val() { return this.value; }

	stringVal() {
		let dicesValues : string[] = [];
		for(let dice of this.dices) {
			if(dice.kept)
				dicesValues.push(`[${dice.value}]`);
			else
				dicesValues.push(`{${dice.value}}`);
		}
		return `${this.value} (d${this.diceType} ${dicesValues.join(" ")})`;
	}

	toString() {
		return `${this.value}`;
	}
}

class OperatorNode implements EvaluationNode {
	private left: EvaluationNode
	private operator: string
	private right: EvaluationNode
	private value : number;

	constructor(left: EvaluationNode, operator: string, right: EvaluationNode) {
		this.left = left;
		this.operator = operator;
		this.right = right;
		this.value = this.evaluate();
	}

	evaluate() : number {
		switch(this.operator) {
			case '+' : return this.left.val() + this.right.val();
			case '-' : return this.left.val() - this.right.val();
			case '*' : return this.left.val() * this.right.val();
			case '/' : return this.left.val() / this.right.val();
			default:
				return 0;
		}
	}

	val() { return this.value; }

	stringVal() { return `(${this.left.stringVal()} ${this.operator} ${this.right.stringVal()})`; }

	toString() { return `${this.value}`; }
}

// ------------------------------------------------------------------------------------
// Parser
// ------------------------------------------------------------------------------------

class DiceParser {
	/**
	 * Parse a formula and create an evaluation node
	 * @param formula the formula to parse
	 * @returns the evaluation node parsed
	 */
	static parse(formula: string) : EvaluationNode {
		//Remove whitespaces
		formula = formula.replace(whitespacePattern, '');
		let input = {formula: formula, remaining: formula};
		// Parse the expression and return the evaluation node
		let evaluationNode = this._parseExpression(input);
		if(input.remaining.length!=0)
			throw new Error(`Invalid dice formula format (parse error) : ${input.formula} (remaining ${input.remaining})`);
		return evaluationNode;
	}

	private static _parseExpression(input : {formula: string, remaining: string}) : EvaluationNode {
		let leftNode = this._parseTerm(input);
		while(true) {
			let match = addOperatorPattern.exec(input.remaining);
			if(match && match.index == 0) {
				input.remaining = input.remaining.substring(match[0].length)
				let operator = match[0];
				let rightNode = this._parseTerm(input);
				leftNode = new OperatorNode(leftNode, operator, rightNode);
			} else {
				break;
			}
		}
		return leftNode;
	}

	private static _parseTerm(input : {formula: string, remaining: string}) : EvaluationNode {
		let leftNode = this._parseFactor(input);
		while(true) {
			let match = multOperatorPattern.exec(input.remaining);
			if(match && match.index == 0) {
				input.remaining = input.remaining.substring(match[0].length)
				let operator = match[0];
				let rightNode = this._parseTerm(input);
				leftNode = new OperatorNode(leftNode, operator, rightNode);
			} else {
				break;
			}
		}
		return leftNode;
	}

	private static _parseFactor(input : {formula: string, remaining: string}) : EvaluationNode {
		let match = startFactorPattern.exec(input.remaining);
		if(match && match.index == 0) {
			input.remaining = input.remaining.substring(match[0].length)
			let expressionNode = this._parseExpression(input);
			match = endFactorPattern.exec(input.remaining);
			if(!match)
				throw new Error(`Invalid dice formula format (parse error) : ${input.formula} (remaining ${input.remaining})`);
			input.remaining = input.remaining.substring(match[0].length)
			return expressionNode;
		}

		match = dicePattern.exec(input.remaining);
		if(match && match.index == 0) {
			input.remaining = input.remaining.substring(match[0].length)
			return new DiceNode(match[0]);
		}

		match = numberPattern.exec(input.remaining);
		if(match && match.index == 0) {
			input.remaining = input.remaining.substring(match[0].length)
			return new NumberNode(match[0]);
		}

		throw new Error(`Invalid dice formula format (parse error) : ${input.formula} (remaining ${input.remaining})`);
	}
}