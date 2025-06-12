FROM erlang:26-slim

RUN apt-get update && apt-get install -y erlang gnuplot libtemplate-perl wget gcc erlang-dev erlang-eunit make

RUN wget http://tsung.erlang-projects.org/dist/tsung-1.8.0.tar.gz && \
    tar zxvf tsung-1.8.0.tar.gz && \
    cd tsung-1.8.0 && \
    ./configure && \
    make && \
    make install

WORKDIR /tsung

COPY ./*.xml ./scenarios/

CMD ["tail", "-f", "/dev/null"]