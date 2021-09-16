<script lang="ts">
	import cells from '../stores/cells';
	import Spreadsheet from '$compiler/spreadsheet';

	const spreadsheet = new Spreadsheet($cells);
	spreadsheet.compute();

	const getCells = function () {
		const keys = $cells.map((cell) => cell.name);

		const columns = new Set();
		const rows = new Set();

		const replace = (r: RegExp, value: string) => {
			return value.replace(r, '');
		};

		keys.forEach((key) => {
			columns.add(replace(/[0-9]+/, key));
			rows.add(+replace(/[A-Z]+/, key));
		});

		return [columns, rows];
	};

	let [columns, rows] = getCells();

	const enhance = (node: HTMLElement) => {
		const cell = spreadsheet.get(node.dataset.cell);

		const getCellNode = (name: string): HTMLElement => {
			return document.querySelector(`[data-cell="${name}"]`);
		};

		const flash = (node: HTMLElement) => {
			node.classList.add('flash');
			setTimeout(() => node.classList.remove('flash'), 600);
		};

		const handleDoubleClick = () => {
			node.setAttribute('contenteditable', '');
			if (cell.formula.startsWith('=')) {
				node.textContent = cell.formula;
			}
			node.focus();
		};

		const handleBlur = () => {
			const formula = node.textContent.trim();
			const previousFormula = cell.formula;

			if (formula.startsWith('=')) {
				try {
					cell.formula = formula;
					spreadsheet.evaluate(node.dataset.cell);
					flash(node);
				} catch (error) {
					node.textContent = cell.formula = previousFormula;
					node.removeAttribute('contenteditable');
					alert(error.message);
				}
			} else {
				cell.formula = cell.value = formula;
			}

			spreadsheet.updateDependencies(({ name, value }) => {
				const cell = getCellNode(name);

				if (cell && flash(cell) == undefined) {
					cell.textContent = `${value}`;
				}
			});

			[columns, rows] = getCells();

			node.removeAttribute('contenteditable');
			node.textContent = `${cell.value}`;
		};

		node.addEventListener('dblclick', handleDoubleClick);
		node.addEventListener('blur', handleBlur);

		return {
			destroy() {
				node.removeEventListener('dblclick', handleDoubleClick);
				node.removeEventListener('blur', handleBlur);
			}
		};
	};
</script>

<div class="spreadsheet">
	{#each [...rows] as r, i (i)}
		<div class="row">
			{#each [...columns] as c, i (i)}
				<div
					class="cell"
					data-type={spreadsheet.getType(`${c}${r}`)}
					data-cell={`${c}${r}`}
					use:enhance
				>
					{spreadsheet.getValue(`${c}${r}`)}
				</div>
			{/each}
		</div>
	{/each}
</div>

<style lang="scss">
	.spreadsheet {
		--cell-width: 6.25rem;

		display: flex;
		flex-direction: column;
		background-color: white;
		box-shadow: 0px 0px 1em #0008;
		border-radius: 3px;

		counter-reset: column;
		counter-reset: row;
	}

	.row {
		display: flex;
		position: relative;
		counter-increment: row;

		&:not(:last-child) {
			border-bottom: 1px solid black;
		}

		&:first-child {
			font-weight: bold;
		}

		&:first-child .cell::after {
			top: -1.75em;
			content: counters(column, '', upper-alpha);
		}
	}

	.cell {
		padding: 0.25rem;
		min-height: 1.8rem;
		width: var(--cell-width);

		counter-increment: column;

		&::before,
		&::after {
			display: block;
			position: absolute;
			font-weight: normal;
			color: white;
		}

		&:first-child::before {
			top: 50%;
			left: -1.5em;
			transform: translateY(-50%);
			content: counter(row);
		}

		&:not(:last-child) {
			border-right: 1px solid black;
		}

		&[data-type='number']:not([contenteditable]) {
			text-align: right;
		}
	}
</style>
