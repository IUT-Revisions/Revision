// GabouLearn — préparation d'une page de cours : remplit les cases « chapitres » à partir de window.BANK.THEMES.
// À charger après donnees.js et avant trainer.js / redac.js.
(() => {
  const themes = (window.BANK && window.BANK.THEMES) || {};
  document.querySelectorAll('[data-theme-pills]').forEach((box) => {
    const name = box.dataset.themePills;
    for (const [value, label] of Object.entries(themes)) {
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = name;
      input.value = value;
      input.checked = true;
      const lab = document.createElement('label');
      lab.append(input, ' ', label);
      box.append(lab);
    }
  });
})();
