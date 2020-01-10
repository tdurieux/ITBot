
export chrome='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

now=$(date +'%m-%d-%Y:%H:%M')


npm run ts  google${now} crawling_experiment/google.steps
sleep 5m
pkill chrome


npm run ts  bing${now} crawling_experiment/bing.steps
sleep 5m
pkill chrome


npm run ts  yahoo${now} crawling_experiment/yahoo.steps
sleep 5m
pkill chrome


npm run ts  wikipedia${now} crawling_experiment/wikipedia.steps
sleep 5m
pkill chrome


npm run ts  duckduck${now} crawling_experiment/duckduckgo.steps
sleep 5m
pkill chrome


