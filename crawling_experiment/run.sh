export chrome=chromium-browser
now=$(date +'%m-%d-%Y:%H:%M')
pkill chromium-browse


npm run ts  google${now} /ITBot/crawling_experiment/google.steps &
sleep 5m
pkill chromium-browse
rm -rf /ITBot/temp


npm run ts  bing${now} /ITBot/crawling_experiment/bing.steps &
sleep 5m
pkill chromium-browse
rm -rf /ITBot/temp


npm run ts  yahoo${now} /ITBot/crawling_experiment/yahoo.steps &
sleep 5m
pkill chromium-browse
rm -rf /ITBot/temp


npm run ts  wikipedia${now} /ITBot/crawling_experiment/wikipedia.steps &
sleep 5m
pkill chromium-browse
rm -rf /ITBot/temp


npm run ts  duckduck${now} /ITBot/crawling_experiment/duckduckgo.steps &
sleep 5m
pkill chromium-browse
rm -rf /ITBot/temp


