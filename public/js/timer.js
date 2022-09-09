document.addEventListener("DOMContentLoaded", function (event) {
	console.log(`Initializing Timer`);
	const timer_cd        = $("#countdown");
	const timer_header    = document.getElementById("countdown-header");
	const timer_body      = document.getElementById("countdown-body");
	const deadline_actual = moment.tz("2022-11-16 17:30", "Asia/Singapore");
	const deadline_rsvp   = moment.tz("2022-10-31 23:59", "Asia/Singapore");

	timer_cd.countdown(deadline_actual.toDate(), { elapse : true });
	timer_cd.on("update.countdown", function (event) {
		const content = event.strftime('%D %H %M %S');
		
		timer_header.innerHTML = (event.elapsed)?  "Happily Married For" :  "Our big day coming in";
		timer_body.innerHTML   = content.split(" ").map(function (v) { return `<div class="col"><h2>${v}</h2></div>`;}).join("");
	});

	return false;
});