
export chrome='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

now=$(date +'%m-%d-%Y:%H:%M')

npm run ts  ${now}google crawling_experiment/google.steps
npm run ts  ${now}bing crawling_experiment/bing.steps
npm run ts  ${now}yahoo crawling_experiment/yahoo.steps
npm run ts  ${now}wikipedia crawling_experiment/wikipedia.steps
npm run ts  ${now}github crawling_experiment/github.steps
