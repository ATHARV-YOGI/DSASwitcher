document.addEventListener('DOMContentLoaded', async () => {
  const enableToggle = document.getElementById('enableToggle');
  const sheetSelect = document.getElementById('sheetSelect');
  const goalInput = document.getElementById('goalInput');

  const settings = await chrome.storage.local.get(['enabled', 'sheet', 'dailyGoal']);
  enableToggle.checked = settings.enabled;
  sheetSelect.value = settings.sheet;
  goalInput.value = settings.dailyGoal;

  document.getElementById('saveBtn').addEventListener('click', () => {
    chrome.storage.local.set({
      enabled: enableToggle.checked,
      sheet: sheetSelect.value,
      dailyGoal: parseInt(goalInput.value)
    }, () => alert('Settings Saved!'));
  });
});
