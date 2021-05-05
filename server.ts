import * as express from "express";
import * as fs from "fs";
import { join, resolve } from "path";
import * as compression from "compression";

const app = express();
app.use(compression());

const OUTPUT_PATH = "./out";
const api = express.Router();
app.use("/api", api);

api.get("/sites", async (req, res) => {
  const files = await fs.promises.readdir(OUTPUT_PATH);
  res.json(files);
});

api.get("/site/:site/visits", async (req, res) => {
  const files = await fs.promises.readdir(join(OUTPUT_PATH, req.params.site));
  res.json(files);
});

async function extractCoverage(path) {
  if (!fs.existsSync(path)) {
    return null;
  }
  const minPath = path.replace("coverage.json", "coverage.min.json");
  if (fs.existsSync(minPath)) {
    return JSON.parse(
      await (await fs.promises.readFile(minPath)).toString("utf-8")
    );
  }
  const data = JSON.parse(
    await (await fs.promises.readFile(path)).toString("utf-8")
  );
  const output = [];
  for (let script of data) {
    for (let func of script.functions) {
      for (let range of func.ranges) {
        output.push([range.endOffset - range.startOffset, range.count]);
      }
    }
  }
  await fs.promises.writeFile(minPath, JSON.stringify(output));
  return output;
}

api.get("/site/:site/coverages/js", async (req, res) => {
  const files = await fs.promises.readdir(join(OUTPUT_PATH, req.params.site));
  const promises = [];
  for (let visit of files) {
    promises.push(
      extractCoverage(
        join(OUTPUT_PATH, req.params.site, visit, "coverage.json")
      )
    );
  }
  const coverages = await Promise.all(promises);
  const output = {};
  for (let index = 0; index < files.length; index++) {
    const visit = files[index];
    const coverage = coverages[index];
    if (coverage == null) {
      continue;
    }
    output[visit] = coverage;
  }
  res.json(output);
});

api.get("/site/:site/:visit/coverage/js", async (req, res) => {
  res.json(
    await extractCoverage(
      join(OUTPUT_PATH, req.params.site, req.params.visit, "coverage.json")
    )
  );
});

async function extractCSSCoverage(path) {
  if (!fs.existsSync(path)) {
    return null;
  }
  const minPath = path.replace("css_coverage.json", "css_coverage.min.json");
  if (fs.existsSync(minPath)) {
    return JSON.parse(
      await (await fs.promises.readFile(minPath)).toString("utf-8")
    );
  }

  const data = JSON.parse(
    await (await fs.promises.readFile(path)).toString("utf-8")
  );
  const output = [];
  for (let range of data) {
    output.push(range.endOffset - range.startOffset);
  }
  await fs.promises.writeFile(minPath, JSON.stringify(output));
  return output;
}

api.get("/site/:site/coverages/css", async (req, res) => {
  const files = await fs.promises.readdir(join(OUTPUT_PATH, req.params.site));
  const promises = [];
  for (let visit of files) {
    promises.push(
      extractCSSCoverage(
        join(OUTPUT_PATH, req.params.site, visit, "css_coverage.json")
      )
    );
  }
  const coverages = await Promise.all(promises);
  const output = {};
  for (let index = 0; index < files.length; index++) {
    const visit = files[index];
    const coverage = coverages[index];
    if (coverage == null) {
      continue;
    }
    output[visit] = coverage;
  }
  res.json(output);
});

api.get("/site/:site/:visit/coverage/css", async (req, res) => {
  res.json(
    await extractCSSCoverage(
      join(OUTPUT_PATH, req.params.site, req.params.visit, "css_coverage.json")
    )
  );
});

api.get("/site/:site/:visit/screenshot", async (req, res) => {
  const screenshotPath = join(
    OUTPUT_PATH,
    req.params.site,
    req.params.visit,
    "screenshots"
  );
  const files = await fs.promises.readdir(screenshotPath);
  if (files.length == 0) {
    return res.sendStatus(404);
  }
  try {
    res.sendFile(resolve(join(screenshotPath, files[files.length - 1])));
  } catch (error) {
    return res.sendStatus(404);
  }
});

api.get("/site/:site/:visit/network", async (req, res) => {
  const networkPath = join(
    OUTPUT_PATH,
    req.params.site,
    req.params.visit,
    "network.raw.json"
  );
  try {
    res.sendFile(resolve(networkPath));
  } catch (error) {
    return res.sendStatus(404);
  }
});

api.get("/site/:site/:visit/profile", async (req, res) => {
  const networkPath = join(
    OUTPUT_PATH,
    req.params.site,
    req.params.visit,
    "profile.json"
  );
  try {
    res.sendFile(resolve(networkPath));
  } catch (error) {
    return res.sendStatus(404);
  }
});

api.get("/site/:site/:visit/request/:id", async (req, res) => {
  const requestPath = join(
    OUTPUT_PATH,
    req.params.site,
    req.params.visit,
    "requests",
    req.params.id
  );
  try {
    res.sendFile(resolve(requestPath));
  } catch (error) {
    return res.sendStatus(404);
  }
});

api.get("/site/:site/:visit/html", async (req, res) => {
  const snapshotPath = join(
    OUTPUT_PATH,
    req.params.site,
    req.params.visit,
    "snapshots"
  );
  const files = await fs.promises.readdir(snapshotPath);
  for (let f of files) {
  }
  try {
    res.sendFile(resolve(snapshotPath));
  } catch (error) {
    return res.sendStatus(404);
  }
});

app.listen(8080, () => {});
