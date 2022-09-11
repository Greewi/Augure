import fs from 'fs';
import { GeneratorCollectionConfiguration } from '../config/generatorCollectionConfiguration';

export class FileLoader {

	/**
	 * Load the configuration of the generators
	 * @param {string} path the path of the file to read
	 * @returns {object} the configuration of the générators
	 */
	static loadGeneratorJson(path: string) : GeneratorCollectionConfiguration {
		let content = fs.readFileSync(path).toString();
		let config = JSON.parse(content);
		return config;
	}

	/**
	 * Read a file with a item on each line an format it into an array
	 * @param {string} path the path of the file to read
	 * @returns {string[]} a array containing the items of the list
	 */
	static loadListFile(path: string) {
		let content = fs.readFileSync(path).toString().split("\n");
		let list : string[] = [];
		for(let line of content) {
			line = line.trim();
			if(line.startsWith("#")) // Ignore comments
				continue;
			if(line.length > 0)
				list.push(line);
		}
		return list;
	}
}