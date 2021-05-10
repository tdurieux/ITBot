let dates = [];
const lines = [];
let index = 0;
let vue = "screenshot";
vue = "callgraph";
let site = null;
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

function displayScreenshot(time) {
  const url = `/api/site/${site}/${time}/screenshot`;
  const screenshot = document.querySelector("#content .screenshot");
  if (screenshot) {
    screenshot.src = url;
    return;
  }
  document.getElementById(
    "content"
  ).innerHTML = `<img class="screenshot" src="${url}">`;
}

let profile = null;
async function displayCallgraph(time) {
  if (profile && profile.killForceAtlas2) {
    try {
      profile.killForceAtlas2();
    } catch (_) {}
  }
  const url = `/api/site/${site}/${time}/profile`;
  const res = await $.get(url);
  document.getElementById("content").innerHTML = "";
  profile = generateProfile(res.nodes, document.getElementById("content"));
}

const render = async function (time) {
  if (vue == "screenshot") {
    await displayScreenshot(time);
  } else if (vue == "callgraph") {
    await displayCallgraph(time);
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
  if (index >= dates.length) {
    index = 0;
  }
  if (index < 0) {
    index = dates.length - 1;
  }
  isActive = true;

  const previous = document.querySelector(".time.active");
  if (previous) {
    previous.className = "time";
  }

  document.getElementById("currentDate").innerHTML = formatDate(dates[index]);

  document.getElementById("time-" + dates[index]).className = "time active";

  render(dates[index]);

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
  index = dates.indexOf(e.getAttribute("data-value")) - 1;
  display(true);
}

function initTimeline() {
  let content = "";
  for (let t of dates) {
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
  dates = await $.get(`/api/site/${site}/visits`);
}

async function activateSite(s) {
  const previous = document.querySelector(".site.active");
  if (previous) {
    previous.className = previous.className.replace("active", "");
  }

  site = s;

  document.querySelector(".site." + s).className =
    document.querySelector(".site." + s).className + " active";

  await downloadTime(site);
  initTimeline();
  index = 0;
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
