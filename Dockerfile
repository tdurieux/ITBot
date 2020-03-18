FROM ubuntu:18.04
MAINTAINER javierca@kth.se

RUN apt-get update && apt-get -y install cron git npm nodejs chromium-browser

# Copy hello-cron file to the cron.d directory
COPY hello-cron /etc/cron.d/hello-cron

# Give execution rights on the cron job
RUN chmod 0644 /etc/cron.d/hello-cron

# Apply cron job
RUN crontab /etc/cron.d/hello-cron

# Create the log file to be able to run tail
RUN touch /var/log/cron.log

# Copy ITBOT
RUN git clone https://github.com/Jacarte/ITBot

WORKDIR ITBot

RUN npm i

ENV chrome 'chromium-browser'

RUN chmod +x crawling_experiment/run.sh

# Run the command on container startup
CMD cron && tail -f /var/log/cron.log