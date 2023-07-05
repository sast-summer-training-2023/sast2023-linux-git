FROM ubuntu:jammy
RUN echo 'sast2023{|)_()_(_|<_E_|2_file}'

ARG DEBIAN_FRONTEND=noninteractive
ENV TZ=Asia/Shanghai

COPY files/sources.list /etc/apt/sources.list
COPY files/install.sh /root/install.sh

RUN apt update\
    && apt install -y apt-utils openssh-server sudo zsh htop vim nano inetutils-ping python3 gcc g++ curl wget tmux unzip git mysql-server mysql-client nginx man language-pack-zh-hans file tldr \
    && echo "y\ny" | unminimize\
    && mkdir /run/sshd\
    && /root/install.sh

# Add user, config shell, set file permission
RUN useradd -m train\
    && useradd -m -G sudo nana\
    && useradd sast2023{WANDERING-USER}\
    && echo 'train:sast2023' | chpasswd\
    && echo 'nana:KawaiiNana_123' | chpasswd\
    && echo 'sast2023{WANDERING-USER}:a1b2c3d4f5' | chpasswd

COPY files/hostname /etc/hostname
COPY files/mysqld.cnf /etc/mysql/mysql.conf.d/mysqld.cnf
COPY home /home

RUN chsh train -s /usr/bin/zsh\
    && chsh nana -s /usr/bin/zsh\
    && chsh root -s /usr/bin/zsh\
    && USER=train HOME=/home/train /root/install.sh\
    && USER=nana HOME=/home/nana /root/install.sh\
    && chown nana:nana -R /home/nana\
    && chown train:train -R /home/train\
    && chmod -R 750 /home/nana\
    && nginx -c /etc/nginx/nginx.conf\
    && nginx -s reload\
    && nginx -s stop\
    && service mysql start\
    && service mysql stop\
    && usermod -d /var/lib/mysql/ mysql\
    && chmod -R 777 /var/run/mysqld/



# Listen to sshd
CMD ["/usr/sbin/sshd", "-D", "-o", "ListenAddress=0.0.0.0"]

EXPOSE 22
EXPOSE 80
EXPOSE 443
EXPOSE 3306
EXPOSE 10001
EXPOSE 10002
