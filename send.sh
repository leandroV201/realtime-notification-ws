#!/bin/bash

docker build -t notif-backend:latest .
k3d image import notif-backend:latest -c notif
kubectl rollout restart deployment backend -n notif
