import type { Cell } from './interpreter/tools/evaluate';

import Lexer from './lexer';
import Parser from './parser';
import Interpreter from './interpreter';
import { parse_range } from './interpreter/tools/evaluate';

const validate = (f: string) => (f.startsWith('=') ? f : '');

const dependencies = (formula: string) => {
	const matches = formula.match(/([A-Z]+[0-9]+:[A-Z]+[0-9]+)+|([A-Z]+[0-9]+)/g);

	const parse = (range: string) => {
		const [left, right] = range.split(':');
		return parse_range(left, right);
	};

	return (matches ?? []).map((m) => (m.includes(':') ? parse(m) : m)).flat();
};

class Queue<T> {
	private queue: T[] = [];

	enqueue(item: T): void {
		if (!this.queue.includes(item)) {
			this.queue.push(item);
		}
	}

	dequeue(): T {
		return this.queue.shift();
	}

	forEach(callback: (item: T) => void): void {
		while (this.size() > 0) {
			callback(this.dequeue());
		}
	}

	size(): number {
		return this.queue.length;
	}

	list(): T[] {
		return [...this.queue];
	}
}

const make_program = (source: string) => {
	const tokens = new Lexer(source).lex();
	return new Parser(tokens).parse();
};

export default class Spreadsheet {
	private cells: Cell[] = [];
	private list: { [name: string]: Set<string> };
	private interpreter: Interpreter = new Interpreter();
	private queue = new Queue<string>();

	constructor(cells: Cell[] = []) {
		this.cells = cells;
		this.updateList();
	}

	compute(): void {
		this.cells.forEach((cell) => this.evaluate(cell.name));
		this.updateDependencies();
	}

	private updateList() {
		this.list = this.cells.reduce((list, { name, formula }) => {
			const inputs = dependencies(validate(formula));

			inputs.forEach((key) => {
				const s = list[key] ?? (list[key] = new Set<string>());
				s.add(name);
			});
			return list;
		}, {});
	}

	add(cell: Cell): void {
		this.cells.push(cell);
		this.updateList();
	}

	get(cell: string): Cell {
		return this.cells.find((c) => c.name === cell);
	}

	update(name: string, formula: string): void {
		const cell = this.get(name);
		cell.formula = formula;
	}

	run(formula: string): unknown {
		const tokens = new Lexer(formula).lex();
		const program = new Parser(tokens).parse();
		return this.interpreter.run(this, program);
	}

	evaluate(name: string): void {
		this.updateList();

		const cell = this.get(name);
		const dependents = this.list[name];

		cell.program = make_program(cell.formula);
		cell.value = this.run(cell.formula) as number | string;
		dependents && dependents.forEach((d) => this.queue.enqueue(d));
	}

	updateDependencies(callback?: (cell: Cell) => void): string[] {
		const dependencies = this.queue.list();
		this.queue.forEach((d) => {
			const cell = this.get(d);
			this.evaluate(d);
			callback && callback(cell);
		});
		return dependencies;
	}

	outputs(cell: string): string[] {
		return [...(this.list[cell] ?? new Set())];
	}

	inputs(cell: string): string[] {
		const node = this.get(cell);
		return dependencies(validate(node.formula));
	}

	getType(cell: string): string {
		if (this.get(cell).formula.startsWith('=')) {
			return 'number';
		}
		return 'text';
	}

	getValue(cell: string): string | number {
		return this.get(cell).value ?? '';
	}
}
