# Масштабирование

## Задание

- Вертикальное масштабирование
- Горизонтальное масштабирование
- Балансировка нагрузки
- Анализ результатов

## Ход работы

### Вертикальное масштабирование

Исходя из результатов ЛР4, сервис нуждающийся в оптимизации - `rule-engine` - именно для него и будет применяться
вертикальное и горизонтальное масштабирование.

Ограничим ресурсы используя возможности `docker compose`, проведем нагрузочнео тестирование по
сценарию `high-rpc-many-users` с различными параметрами ресурса `cpus` и `memory`.

### `cpus=1` `memory=1G`

![](img/5/vertical-scaling/cpus-1-memory-1g/grafana.png)
![](img/5/vertical-scaling/cpus-1-memory-1g/tsung.png)

### `cpus=1.5` `memory=1.5g`

![](img/5/vertical-scaling/cpus-1-5-memory-1-5g/grafana.png)
![](img/5/vertical-scaling/cpus-1-5-memory-1-5g/tsung.png)

При увеличении доступных ресурсов до `cpus=1.5` в серднем был получен прирост производительности на 19% (Mean Rate =
254/sec vs 302/sec), однако доступные 1.5 ресурса процессора не были использованы полностью. Это связано с GIL (Global
Interpreter Lock) интерпретатора `Python`, который предотвращает параллельное выполнение `pure-Python` (однако некоторые
библиотечные вызовы освобождают GIL => отсюда использование выше 100%), в связи с чем можно сделать вывод, что
дальнейшее увеличение ресурсов не будет давать результатов и ограничение в `cpus=1.5` является оптимальным.

Также убедимся, что изменение ресурсов для других сервисов не сыграет роли на общей производительности системы,
установим:

- `metrics-api`: `cpus=1.5` `memory=1.5g`
- `metrics-db`: `cpus=1.5` `memory=1.5g`
- `rabbitmq`: `cpus=1.5` `memory=1.5g`
- `redis`: `cpus=1.5` `memory=1.5g`
  ![](img/5/vertical-scaling/cpus-1-5-memory-1-5g-for-all/grafana.png)
  ![](img/5/vertical-scaling/cpus-1-5-memory-1-5g-for-all/tsung.png)

Получилсь те же самые значения.

### Горизонтальное масштабирование

Исходя из результатов вертикального масштабирования оставим следующую конфигурацию ресурсов
для `metrics-api`: `cpus=1.5` `memory=1.5g`

### `replicas=2`

![](img/5/horizontal-scaling/replicas-2/grafana.png)
![](img/5/horizontal-scaling/replicas-2/tsung.png)

### `replicas=3`

![](img/5/horizontal-scaling/replicas-3/grafana.png)
![](img/5/horizontal-scaling/replicas-3/tsung.png)

### `replicas=4`

![](img/5/horizontal-scaling/replicas-4/grafana.png)
![](img/5/horizontal-scaling/replicas-4/tsung.png)

### `replicas=5`

![](img/5/horizontal-scaling/replicas-5/grafana.png)
![](img/5/horizontal-scaling/replicas-5/tsung.png)

### `replicas=6`

![](img/5/horizontal-scaling/replicas-6/grafana.png)
![](img/5/horizontal-scaling/replicas-6/tsung.png)

Отрезюмируем полученные результаты, результат для одной реплики взят из пункта вертикальное масштабирование

| replicas | Mean Rate, req/sec | request highest 10sec mean, sec | productibity gain, % |
|:--------:|--------------------|---------------------------------|----------------------|
|    1     | 302.63             | 4.88                            | -                    |
|    2     | 370.56             | 3.61                            | 22                   |
|    3     | 460.56             | 2.98                            | 24                   |
|    4     | 483.99             | 2.38                            | 4                    |     
|    5     | 483.50             | 2.42                            | -0.1                 |
|    6     | 480.91             | 2.19                            | -0.53                |

Увеличение количества реплик до 5 и до 6 не дало прироста производительности. Однако при 5 репликах потребление CPU
всегда находилось ниже treshhold'a (<80%).

Отсюда можно сделать вывод, что 5 реплик - оптимальное число.

Однако, поскольку требования по производительности все еще не выполнены, узкое место в системе все еще присутствует,
скорее всего дело в разделяемом между сервисами ресурсе - базе данных.

### Балансировка нагрузки

Для сравнения различных методов распределения трафика будет использоваться конфигурация из `replicas=5` и `cpus=1.5`

### `round-robin`

- `high-rpc-few-users`

  ![](img/5/balancing/round-robin/high-rpc-few-users/grafana.png)
  ![](img/5/balancing/round-robin/high-rpc-few-users/tsung.png)
- `low-rpc-many-users`

  ![](img/5/balancing/round-robin/low-rpc-many-users/grafana.png)
  ![](img/5/balancing/round-robin/low-rpc-many-users/tsung.png)
- `high-rpc-many-users`

  см. пункт Горизонтальное масштабирование `replicas=5`

### `least-conn`

- `high-rpc-few-users`

  ![](img/5/balancing/least-conn/high-rpc-few-users/grafana.png)
  ![](img/5/balancing/least-conn/high-rpc-few-users/tsung.png)
- `low-rpc-many-users`

  ![](img/5/balancing/least-conn/low-rpc-many-users/grafana.png)
  ![](img/5/balancing/least-conn/low-rpc-many-users/tsung.png)
- `high-rpc-many-users`

  ![](img/5/balancing/least-conn/high-rpc-many-users/grafana.png)
  ![](img/5/balancing/least-conn/high-rpc-many-users/tsung.png)

### `random`

- `high-rpc-few-users`

  ![](img/5/balancing/random/high-rpc-few-users/grafana.png)
  ![](img/5/balancing/random/high-rpc-few-users/tsung.png)
- `low-rpc-many-users`

  ![](img/5/balancing/random/low-rpc-many-users/grafana.png)
  ![](img/5/balancing/random/low-rpc-many-users/tsung.png)
- `high-rpc-many-users`

  ![](img/5/balancing/random/high-rpc-many-users/grafana.png)
  ![](img/5/balancing/random/high-rpc-many-users/tsung.png)

| balancing method | test-name           | mean request time, sec |
|------------------|---------------------|------------------------|
| round-robin      | high-rpc-few-users  | 0.00525                |
| least-conn       |                     | 0.00815                |
| random           |                     | 0.00837                |
| round-robin      | low-rpc-many-users  | 0.00732                |
| least-conn       |                     | 0.01361                |
| random           |                     | 0.00919                |
| round-robin      | high-rpc-many-users | 1.38                   |
| least-conn       |                     | 1.65                   |
| random           |                     | 1.93                   |

Исходя из полученных результатов, можно сделать вывод, что метод `round-robin` является наиболее оптимальный для данной
системы при любых видах входных нагрузок.

### Анализ результатов

По результатам проведенных тестов были определены оптимальные значения для ресурсов (`cpus=1.5`), а также для количества
реплик (`replicas=5`) сервиса `metrics-api`, а также выбран наиболее подходящий метод для балансировки запросов - `
round-robin`.