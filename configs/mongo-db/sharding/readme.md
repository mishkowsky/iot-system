[src](https://github.com/minhhungit/mongodb-cluster-docker-compose)

### Step 1
```bash
docker-compose up -d
```

### Step 2

```bash
docker-compose exec metrics-db-configsvr sh -c "mongosh < /scripts/init-configserver.sh"

docker-compose exec metrics-db-shard01-a sh -c "mongosh < /scripts/init-shard01.sh"
docker-compose exec metrics-db-shard02-a sh -c "mongosh < /scripts/init-shard02.sh"
```

### Step 3
>Note: Wait a bit for the config server and shards to elect their primaries before initializing the router

```bash
docker-compose exec metrics-db sh -c "mongosh < /scripts/init-router.sh"
```

### Step 4
```bash
docker-compose exec metrics-db mongosh --port 27017
db.articles.getShardDistribution();
// Enable sharding for database `metrics_db`
sh.enableSharding("metrics_db")

// Setup shardingKey for collection
db.adminCommand( { shardCollection: "metrics_db.metrics", key: { device_id: 1 } } )

```

### Verify the status of the sharded cluster

```bash
docker-compose exec metrics-db mongosh --port 27017
sh.status()
```

### Verify status of replica set for each shard
> Output like 1 PRIMARY, 2 SECONDARY

```bash
docker exec -it metrics-db-shard-01-a-1 bash -c "echo 'rs.status()' | mongosh --port 27017" 
docker exec -it metrics-db-shard-02-a-1 bash -c "echo 'rs.status()' | mongosh --port 27017" 
```

### Check database status
```bash
docker-compose exec metrics-db mongosh --port 27017
use metrics_db
db.stats()
db.MyCollection.getShardDistribution()
```

### More commands 

```bash
docker exec -it metrics-db-configsvr-1 bash -c "echo 'rs.status()' | mongosh --port 27017"

docker exec -it metrics-db-shard01-a-1 bash -c "echo 'rs.help()' | mongosh --port 27017"
docker exec -it metrics-db-shard01-a-1 bash -c "echo 'rs.status()' | mongosh --port 27017" 
docker exec -it metrics-db-shard01-a-1 bash -c "echo 'rs.printReplicationInfo()' | mongosh --port 27017" 
docker exec -it metrics-db-shard01-a-1 bash -c "echo 'rs.printSlaveReplicationInfo()' | mongosh --port 27017"
```

### Updating chunksize (default is 128 Mb) [ref](https://www.mongodb.com/docs/manual/tutorial/modify-chunk-size-in-sharded-cluster/#std-label-tutorial-modifying-range-size)
```bash
db.settings.updateOne({ _id: "chunksize" }, { $set: { _id: "chunksize", value: <sizeInMB> } }, { upsert: true })
```
