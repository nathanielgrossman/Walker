console.log(Date.now())

let start = Date.now();
let end = start + 10000
console.log('starting now');
let timer = setInterval(() => {
	let now = Date.now();
	if (now >= end) {
		console.log('ending now', now - start)
		clearInterval(timer);
	};
}, 333)


let start2 = Date.now();
let end2 = start2 + 60000
console.log('starting now');
let timer2 = setInterval(() => {
	let now2 = Date.now();
	if (now2 >= end2) {
		console.log('ending now', now2 - start2)
		clearInterval(timer2);
	};
}, 333)