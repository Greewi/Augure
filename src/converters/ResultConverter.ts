import {MainGeneratorResult, RecursiveResultNode} from "../generator/generatorResult";

export interface ResultConverter<T> {
	/**
	 * Convert a generator result to the output format
	 * @param result the generator result to convert
	 */
	convert(result : MainGeneratorResult) : T;
}
