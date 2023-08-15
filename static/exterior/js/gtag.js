window.dataLayer = window.dataLayer || [];
function gtag() {
	dataLayer.push(arguments);
}
gtag("js", new Date());

gtag(
	"config",
	document.getElementById("gtag_script").src.split("id")[1].replace("=", "")
);
