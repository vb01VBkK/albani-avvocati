/* Eseguito subito, prima del rendering: prepara le classi di stato senza sfarfallii. */
(function () {
  var d = document.documentElement;
  d.classList.add("js");
  var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var seen = false;
  try { seen = sessionStorage.getItem("albani-intro") === "1"; } catch (e) {}
  if (d.hasAttribute("data-home") && !calm && !seen) d.classList.add("intro-on");
})();
