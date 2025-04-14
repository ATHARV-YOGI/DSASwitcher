chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    enabled: true,
    sheet: 'striver',
    dailyGoal: 3,
    questionsToday: 0,
    lastReset: new Date().toDateString(),
    usedQuestionsBySheet: {}
  });
});

const allowedDomains = ['leetcode.com', 'geeksforgeeks.org'];

function isDSASite(url) {
  return allowedDomains.some(domain => url.includes(domain));
}

async function handleTab(tabId, url) {
  const settings = await chrome.storage.local.get([
    'enabled', 'sheet', 'dailyGoal', 'questionsToday', 'lastReset', 'usedQuestionsBySheet'
  ]);

  const today = new Date().toDateString();

  if (settings.lastReset !== today) {
    settings.questionsToday = 0;
    settings.usedQuestionsBySheet = {};
    settings.lastReset = today;
    await chrome.storage.local.set({
      questionsToday: 0,
      usedQuestionsBySheet: {},
      lastReset: today
    });
  }

  if (!settings.enabled || settings.questionsToday >= settings.dailyGoal) return;

  if (!isDSASite(url)) {
    const sheet = await fetch(chrome.runtime.getURL(`sheets/${settings.sheet}.json`)).then(res => res.json());

    const used = settings.usedQuestionsBySheet?.[settings.sheet] || [];
    const unused = sheet.filter(q => !used.includes(q.link));
    if (unused.length === 0) return;

    const question = unused[Math.floor(Math.random() * unused.length)];
    const updatedUsed = [...used, question.link];

    await chrome.storage.local.set({
      questionsToday: settings.questionsToday + 1,
      usedQuestionsBySheet: {
        ...settings.usedQuestionsBySheet,
        [settings.sheet]: updatedUsed
      }
    });

    chrome.tabs.update(tabId, { url: question.link });
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    handleTab(tabId, tab.url);
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url) {
    handleTab(activeInfo.tabId, tab.url);
  }
});
