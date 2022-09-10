document.addEventListener("DOMContentLoaded", function (event) {
	console.log("HTML loaded");
	const form        = document.getElementById("form-rsvp");
	const btnActive   = document.getElementById("activate-rsvp");
	const btnGuestAdd = document.getElementById("btn-add-guest");
	const selAddGuest = document.getElementById("input-member-extra");

	btnActive  .addEventListener("click",  show_form.bind(this), false);
	btnGuestAdd.addEventListener("click",  form_guest_add.bind(this), false);
	selAddGuest.addEventListener("change", form_has_extra.bind(this), false);
	form.addEventListener("submit", form_submitted, false);

});

document.addEventListener("load", function (event) {
	console.log("Media loaded");
	
});

/**
 * 
 * @param {InputEvent} event 
 */
function show_form(event) {
	const form = document.getElementById("form-rsvp");

	form.className     = "form";
	event.target.style = "display: none;";
}

/**
 * 
 * @param {InputEvent} event 
 */
function form_has_extra(event) {
	console.log("Additional Guest State Changed" , event);
	const container = document.getElementById("form-guest-extra");
	const section   = document.getElementById("input-section-extra-guest");
	/** @type {HTMLSelectElement} */
	const input = event.target;
	console.log(input.options[input.selectedIndex].value);

	if (input.options[input.selectedIndex].value == 1) {
		section.style = "";
		document.getElementById("btn-add-guest").click();
	}
	else {
		section.style = "display: none;";
		
		container.setAttribute("index", "0");
		container.innerHTML = "";
	}
	
}

/**
 * 
 * @param {string} uuid 
 */
function form_guest_del(uuid) {
	console.log(`Removed guest ${uuid}`);
	const guest     = document.getElementById(`guest-${uuid}`);
	const container = document.getElementById("form-guest-extra");
	const counter   = document.getElementById("guest-remaining");
	const idx       = parseInt(container.getAttribute("index") || "0");

	guest.parentElement.removeChild(guest);

	container.setAttribute("index", Math.max(0, (idx - 1)));
	counter.innerHTML = 5 - (idx - 1);

	if (idx - 1 == 0) {
		/** @type {HTMLSelectElement} */
		const selAddGuest = document.getElementById("input-member-extra");

		selAddGuest.value = selAddGuest.options[0].value;
		selAddGuest.dispatchEvent(new Event("change"));
	}
}

/**
 * 
 * @param {InputEvent} event 
 */
function form_guest_add(event) {
	const counter   = document.getElementById("guest-remaining");
	const container = document.getElementById("form-guest-extra");
	const idx       = parseInt(container.getAttribute("index") || "0");
	const element   = document.createElement("div");
	const id        = uuidv4();

	if (idx >= 5) 
		alert("Too many guests. Maybe ask them to sign up themselves?");
	else {
		counter.innerHTML = 5 - (idx + 1);
		element.className = "row";
		element.id        = `guest-${id}`;
		element.innerHTML = `
	<div class="col">
		<div class="form-floating">
			<input class="form-control" id="input-name-first" name="GuestNameFirst" type="text" pattern="[a-zA-Z]{2,}" required>
			<label class="form-label"   for="input-name-first">First Name</label>
			<div class="invalid-feedback"></div>
		</div>
	</div>
	<div class="col">
		<div class="form-floating mb-3">
			<input class="form-control" id="input-name-last" name="GuestNameLast" type="text" pattern="[a-zA-Z]{2,}"   required>
			<label class="form-label"   for="input-name-last">Last Name (Surname)</label>
			<div class="invalid-feedback"></div>
		</div>
	</div>
	<div class="col-1">
		<div class="align-content-center mb-3">
			<button class="btn" type="button" onclick="form_guest_del('${id}')">
				<i class="fa-solid fa-trash-can" tooltip="Remove"></i>
			</button>
		</div>
	</div>`;

		container.setAttribute("index", idx + 1);
		container.appendChild(element);
	}
}

/**
 * 
 * @param {InputEvent} event 
 */
async function form_submitted (event) {
	console.log("Form submitted", event);
	/** @type {HTMLFormElement} */
	const form = event.target;
	event.preventDefault();
	event.stopPropagation();

	const group = document.getElementById("input-group");
	
	group.value = uuidv4();

	const buttons = Array.from(document.querySelectorAll("section#rsvp form button"));
	const loader  = document.getElementById("rsvp-loader");
	buttons.forEach(btn => btn.disabled = true);
	loader.style = "";

	try {
		const payload = {};

		for (const pair of new FormData(form)) {
			const key   = pair[0];
			const value = pair[1];

			if(!Reflect.has(payload, key)){
				payload[key] = value;
				continue;
			}
			if(!Array.isArray(payload[key])){
				payload[key] = [payload[key]];
			}
			payload[key].push(value);
		}
		if (payload["Group"] == "1") {
			if (!Array.isArray(payload["GuestNameFirst"])) {
				payload["GuestNameFirst"] = [payload["GuestNameFirst"]];
				payload["GuestNameLast"]  = [payload["GuestNameLast"]];
			}

		}

		console.log("Sending", JSON.stringify(payload));
		const res = await fetch(form.action, {
			method  : "POST",
			redirect: "follow",
			headers : {
				"Content-Type": form.enctype,
			},
			body: JSON.stringify(payload)
		});

		if (res.status == 200) {
			const form     = document.getElementById("form-rsvp");
			const finished = document.getElementById("form-rsvp-finished");
			const dialog   = new bootstrap.Modal(document.getElementById('dialog-rsvp-confirmed'), {
				keyboard: false
			});
			form.reset();
			dialog.toggle();

			form.className = "form disabled";
			finished.style = "display: inline;";
		}
		else {
			console.log(res.status);
			console.log(await res.json());
			const dialog   = new bootstrap.Modal(document.getElementById('dialog-rsvp-fail'), {
				keyboard: false
			});
			dialog.toggle();
			alert("Failed to submit form");
		}
	}
	catch (error) {
		console.error("Error occurred", error);
	}
	buttons.forEach(btn => btn.disabled = false);
	loader.style = "display: none;";
	return false;
}