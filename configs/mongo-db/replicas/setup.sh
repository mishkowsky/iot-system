#!/bin/bash
sleep 10

mongosh --host metrics-db1:27017 <<EOF
  var cfg = {
    "_id": "rs0",
    "version": 1,
    "members": [
      {
        "_id": 0,
        "host": "metrics-db1:27017",
        "priority": 2
      },
      {
        "_id": 1,
        "host": "metrics-db2:27017",
        "priority": 0
      },
      {
        "_id": 2,
        "host": "metrics-db3:27017",
        "priority": 0
      }
    ]
  };
  rs.initiate(cfg);
EOF