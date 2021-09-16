import type { AST } from '../ast';
import type { Cells } from './tools/evaluate';

import { pprint } from './tools/pprint';
import { evaluate } from './tools/evaluate';

export default class Interpreter {
	print(program: AST): string {
		return pprint(program.body);
	}

	run(cells: Cells, program: AST, wrapped = false): string | number {
		const result = evaluate(program.body, cells);
		if (wrapped) {
			return typeof result === 'number' ? result : `"${result}"`;
		}
		return result;
	}
}
