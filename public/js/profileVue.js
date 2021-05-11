const knownPosition = {};

function hashCode(str) {
  // java String#hashCode
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

function intToRGB(i) {
  var c = (i & 0x00ffffff).toString(16).toUpperCase();

  return "00000".substring(0, 6 - c.length) + c;
}

function getColor(stringInput) {
  return "#" + intToRGB(hashCode(stringInput));
}

function generateProfile(profile, container) {
  const s = new sigma({
    container,
    settings: {
      maxNodeSize: 4,
      minNodeSize: 3,
      zoomingRatio: 1,
      enableCamera: false,
      labelThreshold: 1000,
    },
  });
  const callTree = {};
  const nodeIdToUId = {};
  function position(index, n) {
    if (knownPosition[n.uId]) {
      return knownPosition[n.uId];
    }
    const lineLength = profile.length / 10;
    const size = container.clientWidth / lineLength;
    const p = index * size;
    return {
      x: Math.floor(p % lineLength),
      y: Math.floor(p / lineLength),
    };
  }

  let index = 0;
  for (let n of profile) {
    index++;
    n.uId =
      n.callFrame.url +
      "@" +
      n.callFrame.functionName +
      ":" +
      n.callFrame.lineNumber +
      ":" +
      n.callFrame.columnNumber;

    const nodeID = n.uId;

    nodeIdToUId[n.id] = nodeID;

    if (callTree[nodeID]) {
      if (n.children) {
        n.children.reduce((s, e) => s.add(e), callTree[nodeID]);
      }
      continue;
    } else if (n.children) {
      callTree[nodeID] = new Set(n.children);
    } else {
      callTree[nodeID] = new Set();
    }

    if (
      n.callFrame.url &&
      n.callFrame.url.indexOf("chrome-extension://") > -1
    ) {
      continue;
    }
    const color = getColor(n.callFrame.url);
    let name = "";
    if (n.callFrame) {
      name =
        n.callFrame.functionName +
        " from " +
        n.callFrame.url +
        " at " +
        n.callFrame.lineNumber +
        ":" +
        n.callFrame.columnNumber;
    }
    if (name == "") {
      name = "(anonymous)";
    }
    let scriptId = 0;
    if (n.callFrame) {
      scriptId = n.callFrame.scriptId;
    }
    const p = position(index, n);
    s.graph.addNode({
      id: "n" + nodeID,
      label: name,
      x: p.x,
      y: p.y,
      size: 10,
      color: color,
    });
  }
  for (let nodeID in callTree) {
    for (let childrenId of [...callTree[nodeID]].sort()) {
      s.graph.addEdge({
        id: "e" + nodeID + "" + childrenId + Math.random(),
        source: "n" + nodeID,
        target: "n" + nodeIdToUId[childrenId],
        color: "#ccc",
      });
    }
  }

  // s.startNoverlap();
  s.configForceAtlas2({
    // linLogMode: true,
    // adjustSizes: true,
    // scalingRatio: 150,
    barnesHutTheta: 0.3,
    slowDown: 0.33,
    gravity: 0,
    startingIterations: 10,
    iterationsPerRender: 1,
  });
  s.startForceAtlas2();
  s.refresh();

  setTimeout(function () {
    for (let n of s.graph.nodes()) {
      knownPosition[n.id.substring(1)] = {
        x: n.x,
        y: n.y,
      };
    }
    s.killForceAtlas2();
  }, 500);
  return s;
}
