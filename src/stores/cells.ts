import { writable } from 'svelte/store';
import type { Cell } from '$compiler/interpreter/tools/evaluate';


export default writable<Cell[]>([
	{ name: "A1", type: "text", formula: "item" },
	{ name: "A2", type: "text", formula: "apples" },
	{ name: "A3", type: "text", formula: "bananas" },
	{ name: "A4", type: "text", formula: "pear" },
	{ name: "A5", type: "text", formula: "" },
	{ name: "B1", type: "text", formula: "price" },
	{ name: "B2", type: "text", formula: "=0.69" },
	{ name: "B3", type: "text", formula: "=0.49" },
	{ name: "B4", type: "text", formula: "=2.49" },
	{ name: "B5", type: "text", formula: "" },
	{ name: "C1", type: "text", formula: "quantity" },
	{ name: "C2", type: "text", formula: "=4" },
	{ name: "C3", type: "text", formula: "=6" },
	{ name: "C4", type: "text", formula: "=1" },
	{ name: "C5", type: "text", formula: "" },
	{ name: "D1", type: "text", formula: "total" },
	{ name: "D2", type: "text", formula: "=B2*C2" },
	{ name: "D3", type: "text", formula: "=B3*C3" },
	{ name: "D4", type: "text", formula: "=B4*C4" },
	{ name: "D5", type: "text", formula: "=SUM(D2:D4)" }
]);
