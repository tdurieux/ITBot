
export chrome='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

now=$(date +'%m-%d-%Y:%H:%M')

npm run ts  bing${now} crawling_experiment/bing.steps
sleep 5m
pkill chrome

