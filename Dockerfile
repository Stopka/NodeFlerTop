FROM node:14-stretch
ENV USERNAME='' \
    PASSWORD='' \
    MAIL_HOST='' \
    MAIL_PORT=587 \
    MAIL_USER='' \
    MAIL_PASSWORD='' \
    MAIL_FROM='' \
    MAIL_TO=''
RUN \
    apt-get update -y && \
    apt-get install -y --no-install-recommends \
        chromium \
        supervisor \
        cron && \
    apt-get clean -y && \
    apt-get autoclean -y && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/* /var/lib/log/* /tmp/* /var/tmp/*

WORKDIR /srv

ADD ./docker/supervisor /etc/supervisor
ADD ./docker/entry.sh /usr/sbin/
ADD ./docker/generate_envfile.sh /usr/sbin/
ADD ./docker/cron/app /etc/cron.d/

ADD ./application /srv

RUN \
	yarn install && \
    chmod u+x /srv/cron.sh /usr/sbin/entry.sh /usr/sbin/generate_envfile.sh

CMD ["entry.sh"]
