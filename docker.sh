#! /bin/bash

docker build -t rebel-mintor-ui --build-arg VITE_API_URL=http://localhost:3000/ .