const dates = {};
const lines = [];
let index = 0;
let vue = "screenshot";
vue = "callgraph";
let activeSites = [];
let sites = [];
let isRunning = true;
let isActive = false;
const interval = 1000;

function formatDate(t) {
  const d = new Date(parseInt(t));
  // d.getDate()  + "-" + (d.getMonth()+1) + "-" + d.getFullYear() + " " +
  return (
    ("0" + d.getDate()).slice(-2) +
    "/" +
    ("0" + d.getMonth()).slice(-2) +
    " " +
    ("0" + d.getHours()).slice(-2) +
    "h"
  );
}

function displayScreenshot(site, time) {
  const url = `/api/site/${site}/${time}/screenshot`;
  const screenshot = document.querySelector(
    "#content ." + site + " .screenshot"
  );
  if (screenshot) {
    screenshot.src = url;
    return;
  }
  document.querySelector(
    "#content ." + site
  ).innerHTML = `<img class="screenshot" src="${url}">`;
}

let profile = null;
async function displayCallgraph(site, time) {
  if (profile) {
    try {
      if (profile.killForceAtlas2) {
        profile.killForceAtlas2();
      }
    } catch (_) {}
  }
  const url = `/api/site/${site}/${time}/profile`;
  const res = await $.get(url);
  const element = document.createElement("div");
  element.className = "callgraph";
  const children = document.querySelector("#content ." + site).children;
  document.querySelector("#content ." + site).appendChild(element);
  profile = generateProfile(res.nodes, element);
  if (children.length > 1) {
    setTimeout(() => {
      children[0].remove();
    }, 100);
  }
}

const render = async function (index) {
  for (let site of activeSites) {
    if (vue == "screenshot") {
      await displayScreenshot(site, dates[site][index]);
    } else if (vue == "callgraph") {
      await displayCallgraph(site, dates[site][index]);
    }
  }
};
let displayTimeout = null;
let display = function (force) {
  if (force) {
    isActive = false;
    clearTimeout(displayTimeout);
  }
  if (isActive) {
    return;
  }
  const site = Object.keys(dates)[0];
  if (index >= dates[site].length) {
    index = 0;
  }
  if (index < 0) {
    index = dates[site].length - 1;
  }
  isActive = true;

  const previous = document.querySelector(".time.active");
  if (previous) {
    previous.className = "time";
  }

  document.getElementById("currentDate").innerHTML = formatDate(
    dates[site][index]
  );

  document.getElementById("time-" + dates[site][index]).className =
    "time active";

  render(index);

  if (isRunning) {
    displayTimeout = setTimeout(
      () => {
        isActive = false;
        display();
      },
      interval,
      ++index
    );
  }
};

// document.body.onmousedown = document.body.ontouchstart = function (e) {
//   if (e.target.className.indexOf("time") > -1) {
//     return;
//   }
//   pause();
// };
// document.body.onmouseup = document.body.ontouchend = function (e) {
//   if (e.target.className.indexOf("time") > -1) {
//     return;
//   }
//   resume();
// };
document.body.onkeydown = function (e) {
  // space
  if (e.keyCode == 32) {
    if (isRunning) {
      pause();
    } else {
      resume();
    }
    // down & right
  } else if (e.keyCode == 39 || e.keyCode == 40) {
    pause();
    index++;
    display(true);
    // up & left
  } else if (e.keyCode == 37 || e.keyCode == 38) {
    pause();
    index--;
    display(true);
  }
};

let onClickTimeout = null;
let pause = function (e) {
  clearTimeout(displayTimeout);
  onClickTimeout = setTimeout(() => {
    document.body.className = "pause";
    isRunning = false;
  }, 150);
};

let resume = function () {
  clearTimeout(onClickTimeout);
  document.body.className = "";
  isRunning = true;
  display(true);
};

function activate(e) {
  const site = Object.keys(dates)[0];
  index = dates[site].indexOf(e.getAttribute("data-value")) - 1;
  display(true);
}

function initTimeline() {
  let content = "";
  const site = Object.keys(dates)[0];
  for (let t of dates[site]) {
    const dateString = formatDate(t);

    content +=
      '<div id="time-' +
      t +
      '" class="time" onclick="activate(this)" data-value="' +
      t +
      '"><span>' +
      dateString +
      "</span></div>";
  }
  time_travel.innerHTML = content;
}

async function downloadTime(site) {
  if (!dates[site]) {
    dates[site] = await $.get(`/api/site/${site}/visits`);
  }
}

function computeViewGrid() {
  const len = activeSites.length;

  let nbLines = 1;
  let nbColumns = 1;
  if (len == 1) {
    nbLines = 1;
    nbColumns = 1;
  } else if (len == 2) {
    nbLines = 2;
  } else {
    nbColumns = 2;
    nbLines = Math.ceil(len / 2);
  }
  document.getElementById("content").className =
    "line-" + nbLines + " column-" + nbColumns;
}

async function activateSite(s) {
  if (activeSites.indexOf(s) > -1) {
    activeSites.splice(activeSites.indexOf(s), 1);
    const previous = document.querySelector(".site." + s);
    previous.className = previous.className.replace("active", "");
    document.querySelector("#content ." + s).remove();
    computeViewGrid();
    return;
  }
  activeSites.push(s);
  computeViewGrid();

  document.querySelector(".site." + s).className =
    document.querySelector(".site." + s).className + " active";

  const element = document.createElement("div");
  element.className = s + " view";
  document.getElementById("content").appendChild(element);

  await downloadTime(s);
  initTimeline();
  display(true);
}

async function activateMode(m) {
  const previous = document.querySelector("#modes > .active");
  if (previous) {
    previous.className = previous.className.replace("active", "");
  }
  vue = m;
  document.querySelector("#modes > ." + m).className =
    document.querySelector("#modes > ." + m).className + " active";
  display(true);
}
async function downloadSites() {
  sites = await $.get(`/api/sites`);
  let content = "";
  for (let site of sites.sort()) {
    content += `<div class="site ${site}" onclick="activateSite('${site}'); return false;">${site}</div>`;
  }
  document.getElementById("sites").innerHTML = content;
  site = "yahoo";
}

(async () => {
  await downloadSites();
  activateMode(vue);
  activateSite(site);
})();
