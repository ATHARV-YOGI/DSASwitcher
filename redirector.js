chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    enabled: true,
    sheet: 'striver',
    dailyGoal: 3,
    usedQuestions: [],
    questionsToday: 0,
    lastReset: new Date().toDateString()
  });
});

chrome.webNavigation.onCompleted.addListener(async (details) => {
  const settings = await chrome.storage.local.get([
    'enabled', 'sheet', 'dailyGoal', 'usedQuestions', 'questionsToday', 'lastReset'
  ]);

  const today = new Date().toDateString();
  if (settings.lastReset !== today) {
    settings.questionsToday = 0;
    settings.lastReset = today;
    chrome.storage.local.set({ questionsToday: 0, lastReset: today });
  }

  if (!settings.enabled || settings.questionsToday >= settings.dailyGoal) return;

  const sheet = await fetch(chrome.runtime.getURL(`sheets/${settings.sheet}.json`)).then(res => res.json());
  const unused = sheet.filter(q => !settings.usedQuestions.includes(q.link));
  if (unused.length === 0) return;

  const question = unused[Math.floor(Math.random() * unused.length)];
  chrome.storage.local.set({
    usedQuestions: [...settings.usedQuestions, question.link],
    questionsToday: settings.questionsToday + 1
  });

  chrome.tabs.update(details.tabId, { url: question.link });
}, { url: [{ schemes: ['http', 'https'] }] });
