#!/bin/bash
echo "Esperando a que Elasticsearch esté listo..."
until curl -s http://localhost:9200/_cluster/health | grep -q '"status":"green"\|"status":"yellow"'; do
  sleep 2
done
echo "Configurando watermarks de disco para Elasticsearch..."
curl -X PUT "http://localhost:9200/_cluster/settings?pretty" \
  -H 'Content-Type: application/json' \
  -d'{
    "persistent": {
      "cluster.routing.allocation.disk.watermark.low": "90%",
      "cluster.routing.allocation.disk.watermark.high": "92%",
      "cluster.routing.allocation.disk.watermark.flood_stage": "94%"
    }
  }'
echo "Watermarks configurados correctamente."
